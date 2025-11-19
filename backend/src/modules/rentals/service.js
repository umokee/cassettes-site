const Rental = require('../../models/Rental')
const Cassette = require('../../models/Cassette')
const Client = require('../../models/Client')
const Tariff = require('../../models/Tariff')
const ActivityLogger = require('../../shared/activityLogger')

class RentalsService {
  async getRentals({ page, limit, status, client, search }) {
    const skip = (page - 1) * limit

    const query = {}

    if (status) {
      query.status = status
    }

    if (client) {
      query.client = client
    }

    if (search) {
      const clients = await Client.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id')

      query.client = { $in: clients.map(c => c._id) }
    }

    const [rentals, total, stats] = await Promise.all([
      Rental.find(query)
        .populate('client', 'fullName phone')
        .populate('employee', 'fullName')
        .populate({
          path: 'cassette',
          populate: { path: 'movie', select: 'title year' }
        })
        .populate('tariff', 'name basePricePerDay')
        .sort({ rentalDate: -1 })
        .skip(skip)
        .limit(limit),
      Rental.countDocuments(query),
      this.getStats()
    ])

    return {
      rentals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      stats
    }
  }

  async getStats() {
    const [active, completed, overdue] = await Promise.all([
      Rental.countDocuments({ status: 'active' }),
      Rental.countDocuments({ status: 'returned' }),
      Rental.countDocuments({ status: 'overdue' })
    ])

    return { active, completed, overdue }
  }
  
  async getOverdueRentals() {
    const now = new Date()
    
    const rentals = await Rental.find({
      status: 'active',
      plannedReturnDate: { $lt: now }
    })
      .populate('client', 'fullName phone')
      .populate({
        path: 'cassette',
        populate: { path: 'movie', select: 'title' }
      })
      .sort({ plannedReturnDate: 1 })

    await Promise.all(
      rentals.map(rental => {
        rental.status = 'overdue'
        return rental.save()
      })
    )
    
    return rentals
  }
  
  async getRentalById(id) {
    const rental = await Rental.findById(id)
      .populate('client', 'fullName phone email')
      .populate('employee', 'fullName')
      .populate({
        path: 'cassette',
        populate: { path: 'movie' }
      })
      .populate('tariff')
    
    if (!rental) {
      throw new Error('Аренда не найдена')
    }
    
    return rental
  }
  
  async createRental(data, ip = 'unknown', userAgent = 'unknown') {
    const { clientId, cassetteId, tariffId, days, employee } = data
    const client = clientId
    const cassette = cassetteId
    const tariff = tariffId

    if (!client || !cassette || !tariff || !days) {
      throw new Error('Заполните все обязательные поля')
    }

    const cassetteDoc = await Cassette.findById(cassette).populate({
      path: 'movie',
      populate: { path: 'genres' }
    })
    if (!cassetteDoc) {
      throw new Error('Кассета не найдена')
    }

    if (cassetteDoc.status !== 'available') {
      throw new Error('Кассета недоступна для аренды')
    }

    const tariffDoc = await Tariff.findById(tariff)
    if (!tariffDoc) {
      throw new Error('Тариф не найден')
    }

    const costData = tariffDoc.calculateRentalCost(days, cassetteDoc.movie.genres)

    const rentalDate = new Date()
    const plannedReturnDate = new Date()
    plannedReturnDate.setDate(plannedReturnDate.getDate() + days)

    const rental = new Rental({
      client,
      cassette,
      tariff,
      employee,
      rentalDate,
      plannedReturnDate,
      days,
      pricePerDay: costData.pricePerDay,
      totalCost: costData.totalCost,
      conditionBefore: cassetteDoc.condition,
      status: 'active'
    })
    
    await rental.save()

    cassetteDoc.status = 'rented'
    await cassetteDoc.save()

    const populatedRental = await rental.populate([
      { path: 'client', select: 'fullName phone' },
      { path: 'cassette', populate: { path: 'movie', select: 'title' } },
      { path: 'tariff', select: 'name basePricePerDay' }
    ])

    try {
      await ActivityLogger.rentalCreate(
        employee,
        rental._id,
        populatedRental.cassette.movie.title,
        populatedRental.client.fullName,
        ip,
        userAgent
      );
    } catch (logError) {
      console.error('Ошибка логирования создания аренды:', logError.message);
    }

    return populatedRental
  }
  
  async returnCassette(id, data, ip = 'unknown', userAgent = 'unknown') {
    const { employee, condition, notes } = data

    const rental = await Rental.findById(id)
      .populate('cassette')
      .populate('tariff')

    if (!rental) {
      throw new Error('Аренда не найдена')
    }

    if (rental.status === 'returned') {
      throw new Error('Кассета уже возвращена')
    }

    const actualReturnDate = new Date()
    rental.actualReturnDate = actualReturnDate
    rental.conditionAfter = condition || rental.conditionBefore
    rental.status = 'returned'

    let fines = []

    const overdueDays = rental.overdueDays
    if (overdueDays > 0) {
      const overdueFine = rental.tariff.calculateOverdueFine(
        overdueDays,
        rental.pricePerDay
      )
      fines.push({
        type: 'overdue',
        amount: overdueFine,
        details: `Просрочка ${overdueDays} дней`
      })
    }

    const damageFine = rental.tariff.calculateDamageFine(
      rental.conditionBefore,
      rental.conditionAfter,
      rental.cassette.purchasePrice
    )

    if (damageFine > 0) {
      fines.push({
        type: 'damage',
        amount: damageFine,
        details: `Ухудшение: ${rental.conditionBefore} → ${rental.conditionAfter}`
      })
    }

    const totalFines = fines.reduce((sum, f) => sum + f.amount, 0)

    if (notes) {
      rental.notes = notes
    }

    await rental.save()

    const cassette = rental.cassette
    cassette.status = condition === 'poor' ? 'damaged' : 'available'
    cassette.condition = condition || cassette.condition

    await cassette.save()

    await rental.populate([
      { path: 'client', select: 'fullName phone' },
      { path: 'cassette', populate: { path: 'movie', select: 'title' } },
      { path: 'tariff', select: 'name' },
      { path: 'employee', select: 'fullName' }
    ])

    try {
      await ActivityLogger.rentalReturn(
        employee,
        rental._id,
        rental.cassette.movie.title,
        ip,
        userAgent
      );
    } catch (logError) {
      console.error('Ошибка логирования возврата аренды:', logError.message);
    }

    return {
      rental,
      fines,
      totalFines,
      summary: {
        rentalCost: rental.totalCost,
        fines: totalFines,
        total: rental.totalCost + totalFines,
        overdueDays
      }
    }
  }

  async deleteRental(id, employeeId, ip, userAgent) {
    const rental = await this.getRentalById(id)

    if (rental.status !== 'active') {
      throw new Error('Можно удалить только активные аренды')
    }

    if (rental.cassette) {
      await Cassette.findByIdAndUpdate(rental.cassette._id, {
        status: 'available'
      })
    }

    await Rental.findByIdAndDelete(id)

    try {
      await ActivityLogger.log(
        employeeId,
        'rental_deleted',
        'rentals',
        id,
        `Удалена аренда #${rental._id}`,
        ip,
        userAgent
      )
    } catch (logError) {
      console.error('Ошибка логирования удаления аренды:', logError.message)
    }

    return { message: 'Аренда удалена' }
  }
}

module.exports = new RentalsService()


const Cassette = require('../../models/Cassette')
const Movie = require('../../models/Movie')
const Rental = require('../../models/Rental')
const ActivityLogger = require('../../shared/activityLogger')

class CassettesService {
  async getCassettes({ page, limit, movie, status, available, search }) {
    const skip = (page - 1) * limit

    const query = {}

    if (search) {
      const movies = await Movie.find({
        title: { $regex: search, $options: 'i' }
      }).select('_id')

      const movieIds = movies.map(m => m._id)

      const searchConditions = [
        { serialNumber: { $regex: search, $options: 'i' } },
        { movie: { $in: movieIds } }
      ]

      if (movie) {
        query.$and = [
          { $or: searchConditions },
          { movie: movie }
        ]
      } else {
        query.$or = searchConditions
      }
    } else if (movie) {
      query.movie = movie
    }

    if (status) {
      query.status = status
    }

    if (available) {
      query.status = 'available'
    }

    const [cassettes, total] = await Promise.all([
      Cassette.find(query)
        .populate('movie', 'title year')
        .sort({ inventoryNumber: 1 })
        .skip(skip)
        .limit(limit),
      Cassette.countDocuments(query)
    ])

    return {
      cassettes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  }
  
  async getCassetteById(id) {
    const cassette = await Cassette.findById(id)
      .populate('movie')
    
    if (!cassette) {
      throw new Error('Кассета не найдена')
    }

    const rentals = await Rental.find({ cassette: id })
      .populate('client', 'fullName phone')
      .sort({ rentalDate: -1 })
      .limit(10)
    
    return {
      ...cassette.toObject(),
      rentals
    }
  }
  
  async createCassette(data, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const { movie } = data

    if (!movie) {
      throw new Error('Укажите фильм')
    }

    const movieExists = await Movie.findById(movie)
    if (!movieExists) {
      throw new Error('Фильм не найден')
    }

    const cassette = new Cassette({
      movie,
      status: data.status || 'available',
      condition: data.condition || 'good',
      format: data.format || 'VHS',
      purchaseDate: data.purchaseDate || new Date(),
      purchasePrice: data.purchasePrice,
      notes: data.notes
    })

    const savedCassette = await cassette.save()
    const populatedCassette = await savedCassette.populate('movie', 'title')

    try {
      await ActivityLogger.cassetteCreate(
        employeeId,
        savedCassette._id,
        populatedCassette.movie.title,
        savedCassette.serialNumber,
        ip,
        userAgent
      );
    } catch (logError) {
      console.error('Ошибка логирования создания кассеты:', logError.message);
    }

    return populatedCassette
  }
  
  async updateCassette(id, data, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const allowedUpdates = ['status', 'condition', 'format', 'purchaseDate', 'purchasePrice', 'notes']

    const updates = {}
    Object.keys(data).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = data[key]
      }
    })

    const cassette = await Cassette.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('movie', 'title')

    if (!cassette) {
      throw new Error('Кассета не найдена')
    }

    try {
      await ActivityLogger.cassetteUpdate(
        employeeId,
        cassette._id,
        cassette.serialNumber,
        ip,
        userAgent
      );
    } catch (logError) {
      console.error('Ошибка логирования обновления кассеты:', logError.message);
    }

    return cassette
  }

  async deleteCassette(id, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const activeRentals = await Rental.countDocuments({
      cassette: id,
      status: { $in: ['active', 'overdue'] }
    })

    if (activeRentals > 0) {
      throw new Error('Нельзя удалить кассету с активными арендами')
    }

    const cassette = await Cassette.findByIdAndDelete(id)

    if (!cassette) {
      throw new Error('Кассета не найдена')
    }

    try {
      await ActivityLogger.cassetteDelete(
        employeeId,
        cassette._id,
        cassette.serialNumber,
        ip,
        userAgent
      );
    } catch (logError) {
      console.error('Ошибка логирования удаления кассеты:', logError.message);
    }

    return cassette
  }
}

module.exports = new CassettesService()


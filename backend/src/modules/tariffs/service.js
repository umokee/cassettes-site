const Tariff = require('../../models/Tariff')
const Rental = require('../../models/Rental')
const ActivityLogger = require('../../shared/activityLogger')

class TariffsService {
  async getTariffs(activeOnly = false) {
    const query = activeOnly ? { isActive: true } : {}
    
    const tariffs = await Tariff.find(query).sort({ basePricePerDay: 1 })
    
    return tariffs
  }
  
  async getDefaultTariff() {
    const tariff = await Tariff.findOne({ isDefault: true, isActive: true })

    if (!tariff) {
      const firstTariff = await Tariff.findOne({ isActive: true }).sort({ basePricePerDay: 1 })
      
      if (!firstTariff) {
        throw new Error('Нет активных тарифов')
      }
      
      return firstTariff
    }
    
    return tariff
  }
  
  async calculateCost(tariffId, days, movieId) {
    if (!tariffId || !days || days < 1) {
      throw new Error('Укажите тариф и количество дней')
    }

    const tariff = await Tariff.findById(tariffId)

    if (!tariff) {
      throw new Error('Тариф не найден')
    }

    let movieGenres = []
    if (movieId) {
      const Movie = require('../../models/Movie')
      const movie = await Movie.findById(movieId)
      if (!movie) {
        throw new Error('Фильм не найден')
      }
      movieGenres = movie.genres
    }

    const costData = tariff.calculateRentalCost(days, movieGenres)

    return {
      tariff: {
        id: tariff._id,
        name: tariff.name,
        basePricePerDay: tariff.basePricePerDay
      },
      days,
      pricePerDay: costData.pricePerDay,
      totalCost: costData.totalCost,
      discount: costData.discount
    }
  }
  
  async getTariffById(id) {
    const tariff = await Tariff.findById(id)
    
    if (!tariff) {
      throw new Error('Тариф не найден')
    }

    const rentalsCount = await Rental.countDocuments({ tariff: id })
    
    return {
      ...tariff.toObject(),
      rentalsCount
    }
  }
  
  async createTariff(data, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const { name, basePricePerDay } = data

    if (!name || !basePricePerDay) {
      throw new Error('Укажите название и цену за день')
    }

    if (basePricePerDay < 0) {
      throw new Error('Цена не может быть отрицательной')
    }

    if (data.isDefault) {
      await Tariff.updateMany({}, { isDefault: false })
    }

    const durationDiscounts = (data.durationDiscounts || [])
      .filter(d => d.minDays && d.discount)
      .map(d => ({ minDays: Number(d.minDays), discount: Number(d.discount) }))

    const tariff = new Tariff({
      name,
      basePricePerDay,
      description: data.description,
      allowedGenres: data.allowedGenres || [],
      durationDiscounts,
      overdueMultiplier: data.overdueMultiplier || 2,
      damageMultipliers: data.damageMultipliers || {
        excellent: 0,
        good: 0,
        fair: 0.5,
        poor: 1
      },
      isActive: data.isActive !== undefined ? data.isActive : true,
      isDefault: data.isDefault || false
    })

    const savedTariff = await tariff.save()

    try {
      await ActivityLogger.tariffCreate(employeeId, savedTariff._id, savedTariff.name, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования создания тарифа:', logError.message);
    }

    return savedTariff
  }
  
  async updateTariff(id, data, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const allowedUpdates = [
      'name',
      'description',
      'basePricePerDay',
      'allowedGenres',
      'durationDiscounts',
      'overdueMultiplier',
      'damageMultipliers',
      'isActive',
      'isDefault'
    ]

    const updates = {}
    Object.keys(data).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = data[key]
      }
    })

    if (updates.durationDiscounts) {
      updates.durationDiscounts = updates.durationDiscounts
        .filter(d => d.minDays && d.discount)
        .map(d => ({ minDays: Number(d.minDays), discount: Number(d.discount) }))
    }

    if (updates.isDefault === true) {
      await Tariff.updateMany({ _id: { $ne: id } }, { isDefault: false })
    }

    const tariff = await Tariff.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )

    if (!tariff) {
      throw new Error('Тариф не найден')
    }

    try {
      await ActivityLogger.tariffUpdate(employeeId, tariff._id, tariff.name, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования обновления тарифа:', logError.message);
    }

    return tariff
  }

  async deleteTariff(id, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const tariff = await Tariff.findById(id)

    if (!tariff) {
      throw new Error('Тариф не найден')
    }

    const activeTariffsCount = await Tariff.countDocuments({ isActive: true })

    if (activeTariffsCount === 1 && tariff.isActive) {
      throw new Error('Нельзя удалить последний активный тариф')
    }

    const activeRentals = await Rental.countDocuments({
      tariff: id,
      status: { $in: ['active', 'overdue'] }
    })

    if (activeRentals > 0) {
      throw new Error('Нельзя удалить тариф с активными арендами')
    }

    await Tariff.findByIdAndDelete(id)

    try {
      await ActivityLogger.tariffDelete(employeeId, tariff._id, tariff.name, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования удаления тарифа:', logError.message);
    }

    return tariff
  }
}

module.exports = new TariffsService()


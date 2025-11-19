const Genre = require('../../models/Genre')
const Movie = require('../../models/Movie')
const ActivityLogger = require('../../shared/activityLogger')

class GenresService {
  async getGenres(activeOnly = false) {
    const query = activeOnly ? { isActive: true } : {}

    const genres = await Genre.find(query).sort({ name: 1 }).lean()

    const genreIds = genres.map(g => g._id)

    const movieCounts = await Movie.aggregate([
      { $match: { genres: { $in: genreIds } } },
      { $unwind: '$genres' },
      { $match: { genres: { $in: genreIds } } },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 }
        }
      }
    ])

    const countsMap = movieCounts.reduce((map, item) => {
      map[item._id.toString()] = item.count
      return map
    }, {})

    const genresWithCount = genres.map(genre => ({
      ...genre,
      moviesCount: countsMap[genre._id.toString()] || 0
    }))

    return genresWithCount
  }
  
  async getGenreById(id) {
    const genre = await Genre.findById(id)
    
    if (!genre) {
      throw new Error('Жанр не найден')
    }

    const movies = await Movie.find({ genres: id })
      .select('title releaseYear')
      .sort({ title: 1 })
    
    return {
      ...genre.toObject(),
      movies
    }
  }
  
  async createGenre(data, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const { name, description } = data

    if (!name) {
      throw new Error('Укажите название жанра')
    }

    const existingGenre = await Genre.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    })

    if (existingGenre) {
      throw new Error('Жанр с таким названием уже существует')
    }

    const genre = new Genre({
      name,
      description,
      isActive: data.isActive !== undefined ? data.isActive : true
    })

    const savedGenre = await genre.save()

    try {
      await ActivityLogger.genreCreate(employeeId, savedGenre._id, savedGenre.name, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования создания жанра:', logError.message);
    }

    return savedGenre
  }
  
  async updateGenre(id, data, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const allowedUpdates = ['name', 'description', 'isActive']

    const updates = {}
    Object.keys(data).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = data[key]
      }
    })

    if (updates.name) {
      const existingGenre = await Genre.findOne({
        name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
        _id: { $ne: id }
      })

      if (existingGenre) {
        throw new Error('Жанр с таким названием уже существует')
      }
    }

    const genre = await Genre.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )

    if (!genre) {
      throw new Error('Жанр не найден')
    }

    try {
      await ActivityLogger.genreUpdate(employeeId, genre._id, genre.name, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования обновления жанра:', logError.message);
    }

    return genre
  }

  async deleteGenre(id, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const moviesCount = await Movie.countDocuments({ genres: id })

    if (moviesCount > 0) {
      throw new Error('Нельзя удалить жанр, у которого есть фильмы')
    }

    const genre = await Genre.findByIdAndDelete(id)

    if (!genre) {
      throw new Error('Жанр не найден')
    }

    try {
      await ActivityLogger.genreDelete(employeeId, genre._id, genre.name, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования удаления жанра:', logError.message);
    }

    return genre
  }
}

module.exports = new GenresService()


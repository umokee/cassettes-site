const Movie = require('../../models/Movie')
const Cassette = require('../../models/Cassette')
const ActivityLogger = require('../../shared/activityLogger')

class MoviesService {
  async getMovies({ page, limit, search, genre, year, sortBy = 'title' }) {
    const skip = (page - 1) * limit
    
    const query = {}
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (genre) {
      query.genres = genre
    }
    
    if (year) {
      query.year = year
    }
    
    const sort = {}
    if (sortBy === 'year') {
      sort.year = -1
    } else if (sortBy === 'rating') {
      sort.rating = -1
    } else {
      sort.title = 1
    }
    
    const [movies, total] = await Promise.all([
      Movie.find(query)
        .populate('genres', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Movie.countDocuments(query)
    ])

    const movieIds = movies.map(m => m._id)

    const cassetteCounts = await Cassette.aggregate([
      { $match: { movie: { $in: movieIds } } },
      {
        $group: {
          _id: '$movie',
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          }
        }
      }
    ])

    const countsMap = cassetteCounts.reduce((map, item) => {
      map[item._id.toString()] = { total: item.total, available: item.available }
      return map
    }, {})

    const moviesWithAvailability = movies.map(movie => {
      const counts = countsMap[movie._id.toString()] || { total: 0, available: 0 }
      return {
        ...movie,
        cassettesCount: counts.total,
        availableCount: counts.available
      }
    })
    
    return {
      movies: moviesWithAvailability,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  }
  
  async getMovieById(id) {
    const movie = await Movie.findById(id).populate('genres', 'name')
    
    if (!movie) {
      throw new Error('Фильм не найден')
    }
    
    const cassettes = await Cassette.find({ movie: id })
    
    return {
      ...movie.toObject(),
      cassettes
    }
  }
  
  async createMovie(data, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const { title, year, genres } = data

    if (!title || !year || !genres) {
      throw new Error('Укажите название, год и жанр')
    }

    const movie = new Movie(data)
    const savedMovie = await movie.save()

    try {
      await ActivityLogger.movieCreate(employeeId, savedMovie._id, savedMovie.title, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования создания фильма:', logError.message);
    }

    return savedMovie
  }
  
  async updateMovie(id, data, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const movie = await Movie.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    ).populate('genres', 'name')

    if (!movie) {
      throw new Error('Фильм не найден')
    }

    try {
      await ActivityLogger.movieUpdate(employeeId, movie._id, movie.title, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования обновления фильма:', logError.message);
    }

    return movie
  }
  
  async deleteMovie(id, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const cassettesCount = await Cassette.countDocuments({ movie: id })

    if (cassettesCount > 0) {
      throw new Error('Нельзя удалить фильм, у которого есть кассеты')
    }

    const movie = await Movie.findByIdAndDelete(id)

    if (!movie) {
      throw new Error('Фильм не найден')
    }

    try {
      await ActivityLogger.movieDelete(employeeId, movie._id, movie.title, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования удаления фильма:', logError.message);
    }

    return movie
  }
}

module.exports = new MoviesService()


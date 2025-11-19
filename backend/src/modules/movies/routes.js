const express = require('express')
const router = express.Router()
const authMiddleware = require('../auth/middleware')
const roleCheck = require('../../shared/roleCheck')
const getClientInfo = require('../../shared/getClientInfo')
const moviesService = require('./service')

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, genre, year, sortBy } = req.query

    const result = await moviesService.getMovies({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      genre,
      year: year ? parseInt(year) : undefined,
      sortBy
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const movie = await moviesService.getMovieById(req.params.id)
    res.json(movie)
  } catch (error) {
    next(error)
  }
})

router.post('/', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const movie = await moviesService.createMovie(req.body, req.user._id, ip, userAgent)
    res.status(201).json(movie)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const movie = await moviesService.updateMovie(req.params.id, req.body, req.user._id, ip, userAgent)
    res.json(movie)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    await moviesService.deleteMovie(req.params.id, req.user._id, ip, userAgent)
    res.json({ message: 'Фильм удалён' })
  } catch (error) {
    next(error)
  }
})

module.exports = router


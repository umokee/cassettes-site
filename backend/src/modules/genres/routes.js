const express = require('express')
const router = express.Router()
const authMiddleware = require('../auth/middleware')
const roleCheck = require('../../shared/roleCheck')
const getClientInfo = require('../../shared/getClientInfo')
const genresService = require('./service')

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    const { active } = req.query
    const genres = await genresService.getGenres(active === 'true')
    res.json({ genres })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const genre = await genresService.getGenreById(req.params.id)
    res.json(genre)
  } catch (error) {
    next(error)
  }
})

router.post('/', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const genre = await genresService.createGenre(req.body, req.user._id, ip, userAgent)
    res.status(201).json(genre)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const genre = await genresService.updateGenre(req.params.id, req.body, req.user._id, ip, userAgent)
    res.json(genre)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    await genresService.deleteGenre(req.params.id, req.user._id, ip, userAgent)
    res.json({ message: 'Жанр удалён' })
  } catch (error) {
    next(error)
  }
})

module.exports = router


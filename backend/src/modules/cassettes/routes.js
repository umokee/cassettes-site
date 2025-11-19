const express = require('express')
const router = express.Router()
const authMiddleware = require('../auth/middleware')
const roleCheck = require('../../shared/roleCheck')
const getClientInfo = require('../../shared/getClientInfo')
const cassettesService = require('./service')

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, movie, status, available, search } = req.query

    const result = await cassettesService.getCassettes({
      page: parseInt(page),
      limit: parseInt(limit),
      movie,
      status,
      available: available === 'true',
      search
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const cassette = await cassettesService.getCassetteById(req.params.id)
    res.json(cassette)
  } catch (error) {
    next(error)
  }
})

router.post('/', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const cassette = await cassettesService.createCassette(req.body, req.user._id, ip, userAgent)
    res.status(201).json(cassette)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const cassette = await cassettesService.updateCassette(req.params.id, req.body, req.user._id, ip, userAgent)
    res.json(cassette)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    await cassettesService.deleteCassette(req.params.id, req.user._id, ip, userAgent)
    res.json({ message: 'Кассета удалена' })
  } catch (error) {
    next(error)
  }
})

module.exports = router


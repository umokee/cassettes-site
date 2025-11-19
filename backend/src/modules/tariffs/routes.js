const express = require('express')
const router = express.Router()
const authMiddleware = require('../auth/middleware')
const roleCheck = require('../../shared/roleCheck')
const getClientInfo = require('../../shared/getClientInfo')
const tariffsService = require('./service')

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    const { active } = req.query
    const tariffs = await tariffsService.getTariffs(active === 'true')
    res.json({ tariffs })
  } catch (error) {
    next(error)
  }
})

router.get('/default', async (req, res, next) => {
  try {
    const tariff = await tariffsService.getDefaultTariff()
    res.json(tariff)
  } catch (error) {
    next(error)
  }
})

router.post('/calculate', async (req, res, next) => {
  try {
    const { tariffId, days, movieId } = req.body
    const cost = await tariffsService.calculateCost(tariffId, days, movieId)
    res.json(cost)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const tariff = await tariffsService.getTariffById(req.params.id)
    res.json(tariff)
  } catch (error) {
    next(error)
  }
})

router.post('/', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const tariff = await tariffsService.createTariff(req.body, req.user._id, ip, userAgent)
    res.status(201).json(tariff)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const tariff = await tariffsService.updateTariff(req.params.id, req.body, req.user._id, ip, userAgent)
    res.json(tariff)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    await tariffsService.deleteTariff(req.params.id, req.user._id, ip, userAgent)
    res.json({ message: 'Тариф удалён' })
  } catch (error) {
    next(error)
  }
})

module.exports = router


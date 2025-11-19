const express = require('express')
const router = express.Router()
const authMiddleware = require('../auth/middleware')
const getClientInfo = require('../../shared/getClientInfo')
const rentalsService = require('./service')

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, client, search } = req.query

    const result = await rentalsService.getRentals({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      client,
      search
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/overdue', async (req, res, next) => {
  try {
    const overdueRentals = await rentalsService.getOverdueRentals()
    res.json(overdueRentals)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const rental = await rentalsService.getRentalById(req.params.id)
    res.json(rental)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const rental = await rentalsService.createRental({
      ...req.body,
      employee: req.user._id
    }, ip, userAgent)
    res.status(201).json(rental)
  } catch (error) {
    next(error)
  }
})

router.post('/:id/return', async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const result = await rentalsService.returnCassette(req.params.id, {
      employee: req.user._id,
      condition: req.body.condition,
      notes: req.body.notes
    }, ip, userAgent)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const result = await rentalsService.deleteRental(
      req.params.id,
      req.user._id,
      ip,
      userAgent
    )
    res.json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = router


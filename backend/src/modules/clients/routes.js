const express = require('express')
const router = express.Router()
const authMiddleware = require('../auth/middleware')
const roleCheck = require('../../shared/roleCheck')
const getClientInfo = require('../../shared/getClientInfo')
const clientsService = require('./service')

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder } = req.query

    const result = await clientsService.getClients({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const client = await clientsService.getClientById(req.params.id)
    res.json(client)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const client = await clientsService.createClient(req.body, req.user._id, ip, userAgent)
    res.status(201).json(client)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const client = await clientsService.updateClient(req.params.id, req.body, req.user._id, ip, userAgent)
    res.json(client)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    await clientsService.deleteClient(req.params.id, req.user._id, ip, userAgent)
    res.json({ message: 'Клиент удалён' })
  } catch (error) {
    next(error)
  }
})

module.exports = router

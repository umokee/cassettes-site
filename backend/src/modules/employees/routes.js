const express = require('express')
const router = express.Router()
const authMiddleware = require('../auth/middleware')
const roleCheck = require('../../shared/roleCheck')
const getClientInfo = require('../../shared/getClientInfo')
const employeesService = require('./service')

router.use(authMiddleware)

router.get('/', roleCheck('admin'), async (req, res, next) => {
  try {
    const { page, limit, role, active, search } = req.query
    const result = await employeesService.getEmployees({
      page,
      limit,
      role,
      active,
      search
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const employee = await employeesService.getEmployeeById(req.params.id)
    res.json(employee)
  } catch (error) {
    next(error)
  }
})

router.post('/', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const employee = await employeesService.createEmployee(req.body, req.user._id, ip, userAgent)
    res.status(201).json(employee)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    const employee = await employeesService.updateEmployee(req.params.id, req.body, req.user._id, ip, userAgent)
    res.json(employee)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', roleCheck('admin'), async (req, res, next) => {
  try {
    const { ip, userAgent } = getClientInfo(req)
    await employeesService.deleteEmployee(req.params.id, req.user._id, ip, userAgent)
    res.json({ message: 'Сотрудник удалён' })
  } catch (error) {
    next(error)
  }
})

module.exports = router

const express = require('express')
const router = express.Router()
const authMiddleware = require('../auth/middleware')
const statsService = require('./service')

router.use(authMiddleware)

router.get('/dashboard', async (req, res, next) => {
  try {
    const stats = await statsService.getDashboardStats()
    res.json(stats)
  } catch (error) {
    next(error)
  }
})

router.get('/activity', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query
    const isAdmin = req.user.role === 'admin'
    const activities = await statsService.getRecentActivity(
      req.user._id,
      isAdmin,
      parseInt(limit)
    )
    res.json(activities)
  } catch (error) {
    next(error)
  }
})

module.exports = router

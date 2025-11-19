const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware')
const profileService = require('./service')

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user._id)
    res.json(profile)
  } catch (error) {
    next(error)
  }
})

router.patch('/', async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(req.user._id, req.body)
    res.json(profile)
  } catch (error) {
    next(error)
  }
})

router.post('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const result = await profileService.changePassword(
      req.user._id,
      currentPassword,
      newPassword
    )
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/statistics', async (req, res, next) => {
  try {
    const { period } = req.query
    const stats = await profileService.getStatistics(req.user._id, period)
    res.json(stats)
  } catch (error) {
    next(error)
  }
})

router.get('/recent-activity', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const activity = await profileService.getRecentActivity(req.user._id, limit)
    res.json(activity)
  } catch (error) {
    next(error)
  }
})

router.get('/login-history', async (req, res, next) => {
  try {
    const history = await profileService.getLoginHistory(req.user._id)
    res.json(history)
  } catch (error) {
    next(error)
  }
})

module.exports = router

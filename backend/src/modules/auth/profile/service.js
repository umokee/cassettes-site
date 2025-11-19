const Employee = require('../../../models/Employee')
const Rental = require('../../../models/Rental')

class ProfileService {
  async getProfile(userId) {
    const employee = await Employee.findById(userId).select('-password')
    
    if (!employee) {
      throw new Error('Сотрудник не найден')
    }
    
    const rentalsProcessed = await Rental.countDocuments({ employee: userId })
    const returnsProcessed = await Rental.countDocuments({ 
      employee: userId,
      status: 'returned'
    })
    
    employee.stats.totalRentalsProcessed = rentalsProcessed
    employee.stats.totalReturnsProcessed = returnsProcessed
    
    return employee
  }
  
  async updateProfile(userId, data) {
    const allowedUpdates = [
      'fullName', 'email', 'phone', 'avatar', 'bio', 'birthDate'
    ]
    
    const updates = {}
    Object.keys(data).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = data[key]
      }
    })
    
    const employee = await Employee.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!employee) {
      throw new Error('Сотрудник не найден')
    }
    
    return employee
  }
  
  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new Error('Укажите текущий и новый пароль')
    }
    
    if (newPassword.length < 6) {
      throw new Error('Пароль должен быть минимум 6 символов')
    }
    
    const employee = await Employee.findById(userId)
    
    const isMatch = await employee.comparePassword(currentPassword)
    if (!isMatch) {
      throw new Error('Неверный текущий пароль')
    }
    
    employee.password = newPassword
    await employee.save()
    
    return { message: 'Пароль успешно изменён' }
  }
  
  async getStatistics(userId, period) {
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }
    
    const rentals = await Rental.find({
      employee: userId,
      createdAt: { $gte: startDate, $lte: now }
    })
    
    return {
      totalRentals: rentals.length,
      activeRentals: rentals.filter(r => r.status === 'active').length,
      completedRentals: rentals.filter(r => r.status === 'returned').length,
      overdueRentals: rentals.filter(r => r.status === 'overdue').length,
      totalRevenue: rentals.reduce((sum, r) => sum + r.totalCost, 0),
      averageRentalDays: rentals.length > 0 
        ? (rentals.reduce((sum, r) => sum + r.days, 0) / rentals.length).toFixed(1)
        : 0
    }
  }
  
  async getRecentActivity(userId, limit) {
    return await Rental.find({ employee: userId })
      .populate('client', 'fullName phone')
      .populate({
        path: 'cassette',
        populate: { path: 'movie', select: 'title' }
      })
      .sort({ rentalDate: -1 })
      .limit(limit)
  }
  
  async getLoginHistory(userId) {
    const ActivityLog = require('../../../models/ActivityLog')

    const history = await ActivityLog.find({
      employee: userId,
      type: 'login'
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('ip userAgent createdAt')
      .lean()

    const formattedHistory = history.map(log => ({
      timestamp: log.createdAt,
      ip: log.ip,
      userAgent: log.userAgent
    }))

    return {
      history: formattedHistory,
      total: formattedHistory.length
    }
  }
}

module.exports = new ProfileService()

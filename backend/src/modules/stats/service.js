const Client = require('../../models/Client')
const Rental = require('../../models/Rental')
const ActivityLog = require('../../models/ActivityLog')
const Movie = require('../../models/Movie')

class StatsService {
  async getDashboardStats() {
    const [
      totalClients,
      activeRentals,
      overdueRentals,
      totalMovies
    ] = await Promise.all([
      Client.countDocuments(),
      Rental.countDocuments({ status: 'active' }),
      Rental.countDocuments({ status: 'overdue' }),
      Movie.countDocuments()
    ])

    return {
      totalClients,
      activeRentals,
      overdueRentals,
      totalMovies
    }
  }

  async getRecentActivity(employeeId, isAdmin, limit = 10) {
    const query = isAdmin ? {} : { employee: employeeId }

    const activities = await ActivityLog
      .find(query)
      .populate('employee', 'fullName role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return activities
  }
}

module.exports = new StatsService()

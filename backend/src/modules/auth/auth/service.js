const Employee = require("../../../models/Employee");
const jwt = require("jsonwebtoken");
const ActivityLogger = require('../../../shared/activityLogger');
const ActivityLog = require('../../../models/ActivityLog');

class AuthService {
  async login(login, password, ip, userAgent) {
    const employee = await Employee.findOne({ login, isActive: true });
    if (!employee) {
      throw new Error("Неверный логин или пароль");
    }

    const isValidPassword = await employee.comparePassword(password);
    if (!isValidPassword) {
      throw new Error("Неверный логин или пароль");
    }

    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    try {
      await ActivityLogger.login(employee._id, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования входа:', logError.message);
    }

    return {
      token,
      employee: {
        id: employee._id,
        login: employee.login,
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        lastLogin: employee.lastLogin
      },
    };
  }

  async getCurrentUser(userId) {
    const employee = await Employee.findById(userId).select("-password");
    if (!employee) {
      throw new Error("Пользователь не найден");
    }
    return employee;
  }

  async updateProfile(userId, data) {
    const { fullName, email, phone } = data;

    const employee = await Employee.findByIdAndUpdate(
      userId,
      { fullName, email, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!employee) {
      throw new Error("Пользователь не найден");
    }

    return employee;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const employee = await Employee.findById(userId);

    if (!employee) {
      throw new Error("Пользователь не найден");
    }

    const isValidPassword = await employee.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error("Неверный текущий пароль");
    }

    employee.password = newPassword;
    await employee.save();

    return { message: "Пароль успешно изменён" };
  }

  async getUserStatistics(userId, period = "month") {
    const Rental = require("../../../models/Rental");

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const rentals = await Rental.find({
      employee: userId,
      createdAt: { $gte: startDate, $lte: now },
    }).populate("tariff");

    const totalRevenue = rentals.reduce((sum, rental) => {
      return sum + (rental.totalCost || 0);
    }, 0);

    const completedRentals = rentals.filter(
      (r) => r.status === "returned"
    ).length;

    const uniqueClients = new Set(rentals.map((r) => r.client.toString())).size;

    const workDays = await this.calculateWorkDays(userId, startDate, now);

    return {
      totalRevenue,
      completedRentals,
      newClients: uniqueClients,
      workDays,
    };
  }

  async calculateWorkDays(userId, startDate, endDate) {
    const Rental = require("../../../models/Rental");

    const rentals = await Rental.find({
      employee: userId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).select("createdAt");

    const workDaysSet = new Set(
      rentals.map((r) => r.createdAt.toISOString().split("T")[0])
    );

    return workDaysSet.size;
  }

  async getActivityLogs(user, query) {
    const {
      limit = 20,
      page = 1,
      type,
      employeeId
    } = query;

    const filters = {};

    if (user.role === 'admin' && employeeId) {
      filters.employee = employeeId;
    } else if (user.role === 'cashier') {
      filters.employee = user._id;
    }

    if (type) {
      filters.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(filters)
        .populate({
          path: 'employee',
          select: 'fullName avatar role'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(filters)
    ]);

    const formattedLogs = logs.map(log => ({
      id: log._id,
      employee: {
        id: log.employee._id,
        name: log.employee.fullName,
        avatar: log.employee.avatar || '/images/default-avatar.png',
        role: log.employee.role
      },
      type: log.type,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      timestamp: log.timestamp,
      details: log.details
    }));

    return {
      logs: formattedLogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }
}

module.exports = new AuthService();

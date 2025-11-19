const Employee = require('../../models/Employee')
const Rental = require('../../models/Rental')
const ActivityLogger = require('../../shared/activityLogger')

class EmployeesService {
  async getEmployees({ page = 1, limit = 20, role, active, search } = {}) {
    const query = {}

    if (role) query.role = role
    if (active !== undefined) query.isActive = active === 'true'

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { login: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const employees = await Employee
      .find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await Employee.countDocuments(query)

    const employeesWithStats = await Promise.all(
      employees.map(async (employee) => {
        const employeeObj = employee.toObject()

        const [rentalsProcessed, returnsProcessed] = await Promise.all([
          Rental.countDocuments({ employee: employee._id }),
          Rental.countDocuments({
            employee: employee._id,
            status: 'returned'
          })
        ])

        employeeObj.stats = {
          totalRentalsProcessed: rentalsProcessed,
          totalReturnsProcessed: returnsProcessed
        }

        return employeeObj
      })
    )

    return {
      employees: employeesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  }
  
  async getEmployeeById(id) {
    const employee = await Employee.findById(id).select('-password')

    if (!employee) {
      throw new Error('Сотрудник не найден')
    }

    const employeeObj = employee.toObject()

    const [rentalsProcessed, returnsProcessed] = await Promise.all([
      Rental.countDocuments({ employee: employee._id }),
      Rental.countDocuments({
        employee: employee._id,
        status: 'returned'
      })
    ])

    employeeObj.stats = {
      totalRentalsProcessed: rentalsProcessed,
      totalReturnsProcessed: returnsProcessed
    }

    return employeeObj
  }
  
  async createEmployee(data, creatorId, ip = 'unknown', userAgent = 'unknown') {
    const { fullName, login, email, password, role } = data
    
    if (!fullName || !login || !password) {
      throw new Error('Укажите ФИО, логин и пароль')
    }

    const existingEmployee = await Employee.findOne({ login })
    if (existingEmployee) {
      throw new Error('Сотрудник с таким логином уже существует')
    }

    if (email) {
      const existingEmail = await Employee.findOne({ email })
      if (existingEmail) {
        throw new Error('Сотрудник с таким email уже существует')
      }
    }
    
    const employee = new Employee({
      fullName,
      login,
      email,
      password,
      role: role || 'cashier',
      isActive: data.isActive !== undefined ? data.isActive : true
    })
    
    const savedEmployee = await employee.save()

    try {
      await ActivityLogger.employeeCreate(creatorId, savedEmployee._id, savedEmployee.fullName, ip, userAgent)
    } catch (logError) {
      console.error('Ошибка логирования создания сотрудника:', logError.message)
    }
    
    return savedEmployee
  }
  
  async updateEmployee(id, data, updaterId, ip = 'unknown', userAgent = 'unknown') {
    const allowedUpdates = ['fullName', 'email', 'role', 'isActive', 'bio', 'birthDate']
    
    const updates = {}
    Object.keys(data).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = data[key]
      }
    })

    if (updates.email) {
      const existingEmployee = await Employee.findOne({
        email: updates.email,
        _id: { $ne: id }
      })
      
      if (existingEmployee) {
        throw new Error('Сотрудник с таким email уже существует')
      }
    }
    
    const employee = await Employee.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!employee) {
      throw new Error('Сотрудник не найден')
    }

    try {
      await ActivityLogger.employeeUpdate(updaterId, employee._id, employee.fullName, ip, userAgent)
    } catch (logError) {
      console.error('Ошибка логирования обновления сотрудника:', logError.message)
    }
    
    return employee
  }
  
  async deleteEmployee(id, deleterId, ip = 'unknown', userAgent = 'unknown') {
    const employee = await Employee.findById(id)
    
    if (!employee) {
      throw new Error('Сотрудник не найден')
    }

    if (employee._id.toString() === deleterId.toString()) {
      throw new Error('Нельзя удалить самого себя')
    }

    if (employee.role === 'admin' && employee.isActive) {
      const activeAdminsCount = await Employee.countDocuments({
        role: 'admin',
        isActive: true
      })
      
      if (activeAdminsCount === 1) {
        throw new Error('Нельзя удалить последнего активного администратора')
      }
    }
    
    await Employee.findByIdAndDelete(id)

    try {
      await ActivityLogger.employeeDelete(deleterId, employee._id, employee.fullName, ip, userAgent)
    } catch (logError) {
      console.error('Ошибка логирования удаления сотрудника:', logError.message)
    }
    
    return employee
  }
}

module.exports = new EmployeesService()

const jwt = require('jsonwebtoken')
const Employee = require('../../models/Employee')

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Не авторизован' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const employee = await Employee.findById(decoded.id).select('-password')
    
    if (!employee) {
      return res.status(401).json({ message: 'Пользователь не найден' })
    }
    
    req.user = employee
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Неверный токен' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токен истёк' })
    }
    res.status(401).json({ message: 'Ошибка авторизации' })
  }
}

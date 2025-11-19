const errorHandler = (err, req, res, next) => {
  console.error('Ошибка:', err.message);
  console.error('Стек:', err.stack);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      message: `${field} '${value}' уже существует`
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      message: 'Ошибка валидации',
      errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Некорректный ID'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Неверный токен'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Токен истёк'
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Внутренняя ошибка сервера'
  });
};

module.exports = errorHandler;
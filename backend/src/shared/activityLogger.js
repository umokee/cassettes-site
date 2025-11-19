const ActivityLog = require('../models/ActivityLog')

async function logActivity({
  employeeId,
  type,
  action,
  entityType = null,
  entityId = null,
  details = {},
  ip = 'unknown',
  userAgent = 'unknown'
}) {
  try {
    if (!employeeId || !type || !action) {
      console.warn('ActivityLogger: Пропущены обязательные параметры')
      return
    }

    const logData = {
      employee: employeeId,
      type,
      action,
      details,
      ip,
      userAgent
    }

    if (entityType) {
      logData.entityType = entityType
    }

    if (entityId) {
      logData.entityId = entityId
    }

    const activityLog = new ActivityLog(logData)
    await activityLog.save()

    console.log(`ActivityLog: ${action} - Сотрудник: ${employeeId}`)
  } catch (error) {
    console.error('Ошибка ActivityLogger:', error.message)
  }
}

const ActivityLogger = {
  log: logActivity,

  login: (employeeId, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'login',
      action: 'Вошёл в систему',
      entityType: 'auth',
      ip,
      userAgent
    }),

  clientCreate: (employeeId, clientId, clientName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'client_create',
      action: `Создал клиента ${clientName}`,
      entityType: 'client',
      entityId: clientId,
      details: { clientName },
      ip,
      userAgent
    }),

  clientUpdate: (employeeId, clientId, clientName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'client_update',
      action: `Обновил клиента ${clientName}`,
      entityType: 'client',
      entityId: clientId,
      details: { clientName },
      ip,
      userAgent
    }),

  clientDelete: (employeeId, clientId, clientName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'client_delete',
      action: `Удалил клиента ${clientName}`,
      entityType: 'client',
      entityId: clientId,
      details: { clientName },
      ip,
      userAgent
    }),

  rentalCreate: (employeeId, rentalId, movieTitle, clientName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'rental_create',
      action: `Оформил аренду "${movieTitle}" для ${clientName}`,
      entityType: 'rental',
      entityId: rentalId,
      details: { movieTitle, clientName },
      ip,
      userAgent
    }),

  rentalReturn: (employeeId, rentalId, movieTitle, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'rental_return',
      action: `Принял возврат "${movieTitle}"`,
      entityType: 'rental',
      entityId: rentalId,
      details: { movieTitle },
      ip,
      userAgent
    }),

  movieCreate: (employeeId, movieId, movieTitle, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'movie_create',
      action: `Добавил фильм "${movieTitle}"`,
      entityType: 'movie',
      entityId: movieId,
      details: { movieTitle },
      ip,
      userAgent
    }),

  movieUpdate: (employeeId, movieId, movieTitle, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'movie_update',
      action: `Обновил фильм "${movieTitle}"`,
      entityType: 'movie',
      entityId: movieId,
      details: { movieTitle },
      ip,
      userAgent
    }),

  movieDelete: (employeeId, movieId, movieTitle, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'movie_delete',
      action: `Удалил фильм "${movieTitle}"`,
      entityType: 'movie',
      entityId: movieId,
      details: { movieTitle },
      ip,
      userAgent
    }),

  cassetteCreate: (employeeId, cassetteId, movieTitle, cassetteNumber, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'cassette_create',
      action: `Добавил кассету "${movieTitle}"`,
      entityType: 'cassette',
      entityId: cassetteId,
      details: { movieTitle, cassetteNumber },
      ip,
      userAgent
    }),

  cassetteUpdate: (employeeId, cassetteId, cassetteNumber, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'cassette_update',
      action: `Обновил кассету №${cassetteNumber}`,
      entityType: 'cassette',
      entityId: cassetteId,
      details: { cassetteNumber },
      ip,
      userAgent
    }),

  cassetteDelete: (employeeId, cassetteId, cassetteNumber, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'cassette_delete',
      action: `Удалил кассету №${cassetteNumber}`,
      entityType: 'cassette',
      entityId: cassetteId,
      details: { cassetteNumber },
      ip,
      userAgent
    }),

  genreCreate: (employeeId, genreId, genreName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'genre_create',
      action: `Создал жанр "${genreName}"`,
      entityType: 'genre',
      entityId: genreId,
      details: { genreName },
      ip,
      userAgent
    }),

  genreDelete: (employeeId, genreId, genreName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'genre_delete',
      action: `Удалил жанр "${genreName}"`,
      entityType: 'genre',
      entityId: genreId,
      details: { genreName },
      ip,
      userAgent
    }),

  genreUpdate: (employeeId, genreId, genreName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'genre_update',
      action: `Обновил жанр "${genreName}"`,
      entityType: 'genre',
      entityId: genreId,
      details: { genreName },
      ip,
      userAgent
    }),

  tariffCreate: (employeeId, tariffId, tariffName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'tariff_create',
      action: `Создал тариф "${tariffName}"`,
      entityType: 'tariff',
      entityId: tariffId,
      details: { tariffName },
      ip,
      userAgent
    }),

  tariffUpdate: (employeeId, tariffId, tariffName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'tariff_update',
      action: `Обновил тариф "${tariffName}"`,
      entityType: 'tariff',
      entityId: tariffId,
      details: { tariffName },
      ip,
      userAgent
    }),

  tariffDelete: (employeeId, tariffId, tariffName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'tariff_delete',
      action: `Удалил тариф "${tariffName}"`,
      entityType: 'tariff',
      entityId: tariffId,
      details: { tariffName },
      ip,
      userAgent
    }),

  employeeCreate: (employeeId, newEmployeeId, employeeName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'employee_create',
      action: `Создал сотрудника "${employeeName}"`,
      entityType: 'employee',
      entityId: newEmployeeId,
      details: { employeeName },
      ip,
      userAgent
    }),

  employeeUpdate: (employeeId, targetEmployeeId, employeeName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'employee_update',
      action: `Обновил сотрудника "${employeeName}"`,
      entityType: 'employee',
      entityId: targetEmployeeId,
      details: { employeeName },
      ip,
      userAgent
    }),

  employeeDelete: (employeeId, targetEmployeeId, employeeName, ip, userAgent) =>
    logActivity({
      employeeId,
      type: 'employee_delete',
      action: `Удалил сотрудника "${employeeName}"`,
      entityType: 'employee',
      entityId: targetEmployeeId,
      details: { employeeName },
      ip,
      userAgent
    })
}

module.exports = ActivityLogger
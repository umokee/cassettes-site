function getClientInfo(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
    || req.socket.remoteAddress
    || req.ip
    || 'unknown'
  const userAgent = req.get('user-agent') || 'unknown'
  return { ip, userAgent }
}

module.exports = getClientInfo

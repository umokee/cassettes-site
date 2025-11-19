module.exports = {
  routes: {
    auth: require('./auth/routes'),
    profile: require('./profile/routes')
  },
  middleware: require('./middleware'),
  service: require('./auth/service')
}

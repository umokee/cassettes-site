const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'login',
      'client_create', 'client_update', 'client_view', 'client_delete',
      'rental_create', 'rental_return',
      'movie_create', 'movie_update', 'movie_view', 'movie_delete',
      'cassette_create', 'cassette_update', 'cassette_delete',
      'genre_create', 'genre_update', 'genre_delete',
      'tariff_create', 'tariff_update', 'tariff_delete',
      'employee_create', 'employee_update', 'employee_delete'
    ]
  },
  action: {
    type: String,
    required: true,
    maxlength: 500
  },
  entityType: {
    type: String,
    enum: ['client', 'rental', 'movie', 'cassette', 'genre', 'tariff', 'employee', 'auth'],
    required: function() {
      return this.type !== 'login'
    }
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() {
      return this.type !== 'login'
    }
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 31536000
  }
}, {
  timestamps: false
})

activityLogSchema.index({ employee: 1, createdAt: -1 })
activityLogSchema.index({ type: 1 })
activityLogSchema.index({ createdAt: -1 })
activityLogSchema.index({ entityType: 1, entityId: 1 })

activityLogSchema.virtual('timestamp').get(function() {
  return this.createdAt.toISOString()
})

activityLogSchema.set('toJSON', { virtuals: true })
activityLogSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('ActivityLog', activityLogSchema)
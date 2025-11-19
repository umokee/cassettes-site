const mongoose = require('mongoose');

const cassetteSchema = new mongoose.Schema({
  movie: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie',
    required: [true, 'Фильм обязателен']
  },
  serialNumber: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },
  format: {
    type: String,
    enum: ['VHS', 'Betamax', 'Video8', 'Hi8'],
    default: 'VHS'
  },
  condition: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'damaged', 'lost'],
    default: 'available'
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: { 
    type: Date, 
    default: Date.now 
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  rentalCount: {
    type: Number,
    default: 0
  },
  lastRentalDate: Date
}, {
  timestamps: true
});

cassetteSchema.index({ status: 1 });
cassetteSchema.index({ movie: 1 });
cassetteSchema.index({ serialNumber: 1 });
cassetteSchema.index({ status: 1, movie: 1 });

cassetteSchema.virtual('isAvailable').get(function() {
  return this.status === 'available';
});

cassetteSchema.virtual('inventoryNumber').get(function() {
  return this.serialNumber;
});

cassetteSchema.set('toJSON', { virtuals: true });
cassetteSchema.set('toObject', { virtuals: true });

cassetteSchema.pre('save', async function(next) {
  if (!this.serialNumber) {
    const count = await this.constructor.countDocuments();
    this.serialNumber = `CAS-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Cassette', cassetteSchema);

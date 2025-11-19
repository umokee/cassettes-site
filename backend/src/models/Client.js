const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, 'ФИО обязательно'],
    trim: true
  },
  phone: { 
    type: String, 
    required: [true, 'Телефон обязателен'],
    unique: true,
    trim: true,
    match: [/^\+?[\d\s\-()]+$/, 'Некорректный номер телефона']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Некорректный email']
  },
  status: { 
    type: String, 
    enum: ['active', 'blocked', 'pending'],
    default: 'active' 
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  totalRentals: {
    type: Number,
    default: 0
  },
  activeRentals: {
    type: Number,
    default: 0
  },
  lastRentalDate: Date,
  registrationDate: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

clientSchema.index({ fullName: 'text', phone: 'text', email: 'text' });
clientSchema.index({ phone: 1 });
clientSchema.index({ status: 1 });

clientSchema.virtual('rentals', {
  ref: 'Rental',
  localField: '_id',
  foreignField: 'client'
});

module.exports = mongoose.model('Client', clientSchema);

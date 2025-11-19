const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, 'ФИО обязательно'],
    trim: true
  },
  login: { 
    type: String, 
    required: [true, 'Логин обязателен'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3
  },
  password: { 
    type: String, 
    required: [true, 'Пароль обязателен'],
    minlength: 6
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Некорректный email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\d\s\-\+\(\)]+$/, 'Некорректный номер телефона']
  },
  role: {
    type: String,
    enum: ['admin', 'cashier'],
    required: true,
    default: 'cashier'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  birthDate: Date,
  hireDate: {
    type: Date,
    default: Date.now
  },
  stats: {
    totalRentalsProcessed: { type: Number, default: 0 },
    totalReturnsProcessed: { type: Number, default: 0 }
  },
}, {
  timestamps: true
});

employeeSchema.index({ login: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ role: 1, isActive: 1 });

employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

employeeSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

employeeSchema.virtual('rentals', {
  ref: 'Rental',
  localField: '_id',
  foreignField: 'employee'
});

module.exports = mongoose.model('Employee', employeeSchema);

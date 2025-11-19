const mongoose = require('mongoose');

const tariffSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Название тарифа обязательно'],
    unique: true,
    trim: true
  },
  description: String,
  basePricePerDay: {
    type: Number,
    required: [true, 'Базовая цена обязательна'],
    min: [0, 'Цена не может быть отрицательной']
  },
  allowedGenres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre'
  }],
  durationDiscounts: [{
    minDays: Number,
    discount: Number
  }],
  overdueMultiplier: {
    type: Number,
    default: 2,
    min: 1
  },
  damageMultipliers: {
    excellent: { type: Number, default: 0 },
    good: { type: Number, default: 0 },
    fair: { type: Number, default: 0.5 },
    poor: { type: Number, default: 1 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

tariffSchema.index({ isActive: 1 });
tariffSchema.index({ isDefault: 1 });

tariffSchema.methods.calculateRentalCost = function(days, movieGenres) {
  let pricePerDay = this.basePricePerDay;
  let totalCost = pricePerDay * days;

  const applicableDiscount = this.durationDiscounts
    .filter(dd => days >= dd.minDays)
    .sort((a, b) => b.minDays - a.minDays)[0];

  if (applicableDiscount) {
    totalCost *= (1 - applicableDiscount.discount / 100);
  }

  return {
    pricePerDay: Math.round(pricePerDay * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    discount: applicableDiscount?.discount || 0
  };
};

tariffSchema.methods.calculateOverdueFine = function(overdueDays, pricePerDay) {
  return Math.round(overdueDays * pricePerDay * this.overdueMultiplier * 100) / 100;
};

tariffSchema.methods.calculateDamageFine = function(conditionBefore, conditionAfter, purchasePrice) {
  if (conditionBefore === conditionAfter) return 0;
  
  const conditionLevels = ['excellent', 'good', 'fair', 'poor'];
  const beforeIndex = conditionLevels.indexOf(conditionBefore);
  const afterIndex = conditionLevels.indexOf(conditionAfter);
  
  if (afterIndex <= beforeIndex) return 0;
  
  const multiplier = this.damageMultipliers[conditionAfter] || 0;
  return Math.round(purchasePrice * multiplier * 100) / 100;
};

module.exports = mongoose.model('Tariff', tariffSchema);

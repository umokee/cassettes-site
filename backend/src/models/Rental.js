const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client',
    required: [true, 'Клиент обязателен']
  },
  cassette: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cassette',
    required: [true, 'Кассета обязательна']
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Сотрудник обязателен']
  },
  tariff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tariff'
  },
  rentalDate: { 
    type: Date, 
    default: Date.now 
  },
  plannedReturnDate: {
    type: Date,
    required: [true, 'Дата возврата обязательна']
  },
  actualReturnDate: Date,
  days: { 
    type: Number, 
    required: [true, 'Количество дней обязательно'],
    min: 1
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  totalCost: { 
    type: Number, 
    required: [true, 'Стоимость обязательна']
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'cancelled'],
    default: 'active'
  },
  conditionBefore: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor']
  },
  conditionAfter: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

rentalSchema.index({ status: 1 });
rentalSchema.index({ client: 1 });
rentalSchema.index({ cassette: 1 });
rentalSchema.index({ rentalDate: -1 });
rentalSchema.index({ plannedReturnDate: 1 });
rentalSchema.index({ status: 1, plannedReturnDate: 1 });

rentalSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'active') return false;
  return new Date() > this.plannedReturnDate;
});

rentalSchema.virtual('overdueDays').get(function() {
  if (!this.isOverdue) return 0;
  const now = this.actualReturnDate || new Date();
  const diff = now - this.plannedReturnDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

rentalSchema.pre('save', function(next) {
  if (this.isModified('actualReturnDate') && this.actualReturnDate) {
    this.status = 'returned';
  } else if (this.status === 'active' && new Date() > this.plannedReturnDate) {
    this.status = 'overdue';
  }
  next();
});

rentalSchema.post('save', async function(doc) {
  const Client = mongoose.model('Client');
  const activeCount = await mongoose.model('Rental').countDocuments({
    client: doc.client,
    status: { $in: ['active', 'overdue'] }
  });
  
  await Client.findByIdAndUpdate(doc.client, {
    lastRentalDate: doc.rentalDate,
    activeRentals: activeCount,
    $inc: { totalRentals: 1 }
  });
});

module.exports = mongoose.model('Rental', rentalSchema);

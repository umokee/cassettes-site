const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Название жанра обязательно'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

genreSchema.index({ name: 1 });
genreSchema.index({ isActive: 1 });

module.exports = mongoose.model('Genre', genreSchema);

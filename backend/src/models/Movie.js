const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Название фильма обязательно'],
    trim: true
  },
  genres: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Genre',
    required: [true, 'Минимум один жанр обязателен']
  }],
  director: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  duration: {
    type: Number,
    min: 1
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  coverUrl: {
    type: String,
    default: '/images/default-cover.jpg'
  },
  rating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'Не указан'],
    default: 'Не указан'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

movieSchema.index({ title: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ year: -1 });
movieSchema.index({ title: 'text', description: 'text' });

movieSchema.virtual('cassettes', {
  ref: 'Cassette',
  localField: '_id',
  foreignField: 'movie'
});

movieSchema.pre('save', function(next) {
  if (!this.genres || this.genres.length === 0) {
    next(new Error('Фильм должен иметь хотя бы один жанр'));
  }
  next();
});

module.exports = mongoose.model('Movie', movieSchema);

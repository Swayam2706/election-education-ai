const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'current', 'completed'],
    default: 'upcoming'
  },
  importance: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  details: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  requirements: [String],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['link', 'document', 'video', 'form']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timeline', timelineSchema);
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  completed: {
    type: Boolean,
    default: false
  }
}, {
    timestamps: true
  });

module.exports = mongoose.model('Task', schema, 'tasks');
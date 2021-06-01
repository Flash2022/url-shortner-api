const mongoose = require('mongoose')


const shortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true
  },
  short: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
    default: 0
  },
  datetime: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastseen: {
    type: Date,
    required: true,
    default: Date.now
  }
})

module.exports = mongoose.model('ShortUrl', shortUrlSchema);
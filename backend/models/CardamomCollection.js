const mongoose = require('mongoose');

const cardamomCollectionSchema = new mongoose.Schema({
  plantationName: {
    type: String,
    required: true,
  },
  rawQuantityKG: {
    type: Number,
    required: true,
  },
  dryQuantityKG: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('CardamomCollection', cardamomCollectionSchema);

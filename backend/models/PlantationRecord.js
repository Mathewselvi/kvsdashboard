const mongoose = require('mongoose');

const plantationRecordSchema = new mongoose.Schema({
  plantationName: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('PlantationRecord', plantationRecordSchema);

const mongoose = require('mongoose');

const resortIncomeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  source: {
    type: String, // e.g., 'Daily', 'Weekly', 'Monthly', 'Booking #123'
    required: true,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('ResortIncome', resortIncomeSchema);

const mongoose = require('mongoose');

const storeSalarySchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  period: {
    type: String, // e.g. "Week 1 - Oct"
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('StoreSalary', storeSalarySchema);

const mongoose = require('mongoose');

const farmExpenseSchema = new mongoose.Schema({
  plantationName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('FarmExpense', farmExpenseSchema);

const mongoose = require('mongoose');

const otherExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('OtherExpense', otherExpenseSchema);

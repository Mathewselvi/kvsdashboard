const mongoose = require('mongoose');

const medicineExpenseSchema = new mongoose.Schema({
  plantationName: {
    type: String,
    required: true,
  },
  medicineName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  cost: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('MedicineExpense', medicineExpenseSchema);

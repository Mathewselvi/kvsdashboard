const mongoose = require('mongoose');

const staffSalarySchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: true,
  },
  salaryAmount: {
    type: Number,
    required: true,
  },
  paidDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('StaffSalary', staffSalarySchema);

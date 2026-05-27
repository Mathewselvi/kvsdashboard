const mongoose = require('mongoose');

const utilityBillSchema = new mongoose.Schema({
  billType: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
  },
  receiptUrl: {
    type: String, // URL to cloudinary or local upload
  },
}, { timestamps: true });

module.exports = mongoose.model('UtilityBill', utilityBillSchema);

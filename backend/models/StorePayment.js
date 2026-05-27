const mongoose = require('mongoose');

const storePaymentSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  advancePayment: {
    type: Number,
    default: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  totalDue: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Partial'],
    default: 'Pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('StorePayment', storePaymentSchema);

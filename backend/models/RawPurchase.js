const mongoose = require('mongoose');

const rawPurchaseSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  rawWeightKG: {
    type: Number,
    required: true,
  },
  ratePerKG: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
  },
  dryingCost: {
    type: Number,
  },
  advancePayment: {
    type: Number,
    default: 0,
  },
  remainingPaid: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

rawPurchaseSchema.pre('save', async function () {
  this.totalAmount = this.rawWeightKG * this.ratePerKG;
  this.dryingCost = this.rawWeightKG * 12;
});

module.exports = mongoose.model('RawPurchase', rawPurchaseSchema);

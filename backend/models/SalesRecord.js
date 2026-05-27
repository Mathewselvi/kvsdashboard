const mongoose = require('mongoose');

const salesRecordSchema = new mongoose.Schema({
  plantationName: {
    type: String,
    default: 'General',
  },
  buyerDetails: {
    type: String,
    required: true,
  },
  sellingQuantityKG: {
    type: Number,
    required: true,
  },
  sellingPricePerKG: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

salesRecordSchema.pre('save', async function () {
  this.totalAmount = this.sellingQuantityKG * this.sellingPricePerKG;
});

module.exports = mongoose.model('SalesRecord', salesRecordSchema);

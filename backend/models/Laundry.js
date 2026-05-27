const mongoose = require('mongoose');

const laundrySchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
  },
  items: {
    towels: { type: Number, default: 0 },
    handTowels: { type: Number, default: 0 },
    bedSheets: { type: Number, default: 0 },
    pillowCovers: { type: Number, default: 0 },
    duvets: { type: Number, default: 0 },
    blankets: { type: Number, default: 0 },
  },
  totalQuantity: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Sent', 'Received'],
    default: 'Sent',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

laundrySchema.pre('save', async function () {
  if (this.items) {
    this.totalQuantity =
      (this.items.towels || 0) +
      (this.items.handTowels || 0) +
      (this.items.bedSheets || 0) +
      (this.items.pillowCovers || 0) +
      (this.items.duvets || 0) +
      (this.items.blankets || 0);
  }
});

module.exports = mongoose.model('Laundry', laundrySchema);

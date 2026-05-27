const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  sellerName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
  },
  season: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Seller', sellerSchema);

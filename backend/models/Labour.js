const mongoose = require('mongoose');

const labourSchema = new mongoose.Schema({
  workerName: {
    type: String,
    default: 'Group Labour',
  },
  plantationName: {
    type: String,
    required: true,
  },
  numberOfWorkers: {
    type: Number,
    required: true,
    default: 1,
  },
  perHeadAmount: {
    type: Number,
    required: true,
  },
  totalWage: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

labourSchema.pre('save', async function () {
  this.totalWage = (this.numberOfWorkers || 1) * (this.perHeadAmount || 0);
});

module.exports = mongoose.model('Labour', labourSchema);

const mongoose = require('mongoose');

const labourSchema = new mongoose.Schema({
  workerName: {
    type: String,
    required: true,
  },
  plantationName: {
    type: String,
  },
  dailyWage: {
    type: Number,
    required: true,
  },
  daysWorked: {
    type: Number,
    default: 1,
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
  this.totalWage = this.dailyWage * this.daysWorked;
});

module.exports = mongoose.model('Labour', labourSchema);

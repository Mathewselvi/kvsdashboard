const mongoose = require('mongoose');
const Laundry = require('./models/Laundry.js');

mongoose.connect('mongodb://127.0.0.1:27017/kvs_dashboard')
  .then(async () => {
    try {
      await Laundry.create({ vendorName: 'Test', items: { towels: 2 } });
      console.log('Success');
    } catch (e) {
      console.error('Error:', e.message);
    }
    process.exit();
  });

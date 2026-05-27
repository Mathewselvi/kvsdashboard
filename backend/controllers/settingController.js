const Setting = require('../models/Setting');

const DEFAULT_SETTINGS = {
  plantations: ['English Medium', 'Nellikad', '10 Acre', '20 Acre'],
  bookingSources: ['OTA / Booking.com', 'Airbnb', 'Walk-in', 'Direct Web'],
  utilityTypes: ['Electricity', 'Water', 'Internet', 'Other'],
  cardamomGrades: ['8mm+', '7.5mm', '7mm', 'Split', 'Bulk'],
  storeExpenseCategories: ['Electricity', 'Diesel', 'Maintenance', 'Miscellaneous'],
  standardLaborWage: 450,
  otherExpenseCategories: ['Maintenance', 'Food', 'Miscellaneous', 'Other'],
  farmExpenseCategories: ['Transport', 'Equipment', 'Miscellaneous'],
  medicineExpenseCategories: ['Fertilizer', 'Plant Medicine', 'Other'],
  laundryRates: [{ item: 'Standard Item', rate: 12 }]
};

// @desc    Get all settings merged with default fallback values
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const dbSettings = await Setting.find({});
    const settingsMap = {};
    
    dbSettings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    const mergedSettings = {};
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      mergedSettings[key] = settingsMap[key] !== undefined ? settingsMap[key] : DEFAULT_SETTINGS[key];
    });

    res.json(mergedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings (partial updates supported)
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    for (const key of Object.keys(updates)) {
      if (DEFAULT_SETTINGS[key] !== undefined) {
        await Setting.findOneAndUpdate(
          { key },
          { value: updates[key] },
          { upsert: true, new: true }
        );
      }
    }

    // Retrieve and return fresh merged settings
    const dbSettings = await Setting.find({});
    const settingsMap = {};
    dbSettings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    const mergedSettings = {};
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      mergedSettings[key] = settingsMap[key] !== undefined ? settingsMap[key] : DEFAULT_SETTINGS[key];
    });

    res.json({ message: 'Settings updated successfully', settings: mergedSettings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset database (delete all collections except admins and settings)
// @route   POST /api/settings/reset
// @access  Private
const resetDatabase = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      const name = collection.collectionName;
      if (name === 'admins' || name === 'settings') {
        console.log(`Skipping protected collection: ${name}`);
        continue;
      }
      console.log(`Clearing collection: ${name}`);
      await collection.deleteMany({});
    }

    res.json({ message: 'All transactional data cleared successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset database: ' + error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetDatabase,
};

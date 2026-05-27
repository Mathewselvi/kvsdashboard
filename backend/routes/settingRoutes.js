const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, resetDatabase } = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSettings)
  .put(protect, updateSettings);

router.post('/reset', protect, resetDatabase);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getReports, exportReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getReports);
router.get('/export', protect, exportReport);

module.exports = router;

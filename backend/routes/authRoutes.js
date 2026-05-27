const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile, setupAdmin, updateAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.post('/setup', setupAdmin);
router.route('/profile')
  .get(protect, getAdminProfile)
  .put(protect, updateAdminProfile);

module.exports = router;

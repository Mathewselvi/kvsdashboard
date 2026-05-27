const express = require('express');
const router = express.Router();
const c = require('../controllers/thottamController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/collections')
  .get(c.getCollections)
  .post(c.addCollection);
router.route('/collections/:id')
  .put(c.updateCollection)
  .delete(c.deleteCollection);

router.route('/sales')
  .get(c.getSales)
  .post(c.addSale);
router.route('/sales/:id')
  .put(c.updateSale)
  .delete(c.deleteSale);

router.route('/labour')
  .get(c.getLabours)
  .post(c.addLabour);
router.route('/labour/:id')
  .put(c.updateLabour)
  .delete(c.deleteLabour);

router.route('/medicine')
  .get(c.getMedicineExpenses)
  .post(c.addMedicineExpense);
router.route('/medicine/:id')
  .put(c.updateMedicineExpense)
  .delete(c.deleteMedicineExpense);

router.route('/farm-expense')
  .get(c.getFarmExpenses)
  .post(c.addFarmExpense);
router.route('/farm-expense/:id')
  .put(c.updateFarmExpense)
  .delete(c.deleteFarmExpense);

module.exports = router;

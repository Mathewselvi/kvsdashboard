const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/sellers')
  .get(storeController.getSellers)
  .post(storeController.addSeller);

router.route('/sellers/:id')
  .put(storeController.updateSeller)
  .delete(storeController.deleteSeller);

router.route('/purchases')
  .get(storeController.getPurchases)
  .post(storeController.addPurchase);

router.route('/purchases/:id')
  .put(storeController.updatePurchase)
  .delete(storeController.deletePurchase);

router.route('/expenses')
  .get(storeController.getExpenses)
  .post(storeController.addExpense);

router.route('/expenses/:id')
  .delete(storeController.deleteExpense);

router.route('/salaries')
  .get(storeController.getSalaries)
  .post(storeController.addSalary);

router.route('/salaries/:id')
  .put(storeController.updateSalary)
  .delete(storeController.deleteSalary);

module.exports = router;

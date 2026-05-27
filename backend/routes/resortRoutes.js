const express = require('express');
const router = express.Router();
const resortController = require('../controllers/resortController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Resort Income
router.route('/income')
  .get(resortController.getIncomes)
  .post(resortController.addIncome);
router.route('/income/:id')
  .put(resortController.updateIncome)
  .delete(resortController.deleteIncome);

// Staff Salary
router.route('/salary')
  .get(resortController.getSalaries)
  .post(resortController.addSalary);
router.route('/salary/:id')
  .put(resortController.updateSalary)
  .delete(resortController.deleteSalary);

// Laundry
router.route('/laundry')
  .get(resortController.getLaundry)
  .post(resortController.addLaundry);
router.route('/laundry/:id')
  .put(resortController.updateLaundry)
  .delete(resortController.deleteLaundry);

// Utility Bills
router.route('/utility')
  .get(resortController.getUtilityBills)
  .post(resortController.addUtilityBill);
router.route('/utility/:id')
  .put(resortController.updateUtilityBill)
  .delete(resortController.deleteUtilityBill);

// Other Expenses
router.route('/expense')
  .get(resortController.getOtherExpenses)
  .post(resortController.addOtherExpense);
router.route('/expense/:id')
  .put(resortController.updateOtherExpense)
  .delete(resortController.deleteOtherExpense);

module.exports = router;

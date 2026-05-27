const ResortIncome = require('../models/ResortIncome');
const StaffSalary = require('../models/StaffSalary');
const Laundry = require('../models/Laundry');
const UtilityBill = require('../models/UtilityBill');
const OtherExpense = require('../models/OtherExpense');

// --- RESORT INCOME ---
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await ResortIncome.find().sort({ date: -1 });
    res.json(incomes);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addIncome = async (req, res) => {
  try {
    const income = await ResortIncome.create(req.body);
    res.status(201).json(income);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateIncome = async (req, res) => {
  try {
    const income = await ResortIncome.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(income);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteIncome = async (req, res) => {
  try {
    await ResortIncome.findByIdAndDelete(req.params.id);
    res.json({ message: 'Income deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- STAFF SALARY ---
exports.getSalaries = async (req, res) => {
  try {
    const salaries = await StaffSalary.find().sort({ createdAt: -1 });
    res.json(salaries);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addSalary = async (req, res) => {
  try {
    const salary = await StaffSalary.create(req.body);
    res.status(201).json(salary);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateSalary = async (req, res) => {
  try {
    const salary = await StaffSalary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(salary);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteSalary = async (req, res) => {
  try {
    await StaffSalary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Salary deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- LAUNDRY ---
exports.getLaundry = async (req, res) => {
  try {
    const laundry = await Laundry.find().sort({ date: -1 });
    res.json(laundry);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addLaundry = async (req, res) => {
  try {
    const laundry = await Laundry.create(req.body);
    res.status(201).json(laundry);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateLaundry = async (req, res) => {
  try {
    const laundry = await Laundry.findById(req.params.id);
    if (!laundry) return res.status(404).json({ message: 'Record not found' });
    Object.assign(laundry, req.body);
    await laundry.save();
    res.json(laundry);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteLaundry = async (req, res) => {
  try {
    await Laundry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Laundry record deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- UTILITY BILLS ---
exports.getUtilityBills = async (req, res) => {
  try {
    const bills = await UtilityBill.find().sort({ dueDate: -1 });
    res.json(bills);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addUtilityBill = async (req, res) => {
  try {
    const bill = await UtilityBill.create(req.body);
    res.status(201).json(bill);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateUtilityBill = async (req, res) => {
  try {
    const bill = await UtilityBill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bill);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteUtilityBill = async (req, res) => {
  try {
    await UtilityBill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utility bill deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- OTHER EXPENSES ---
exports.getOtherExpenses = async (req, res) => {
  try {
    const expenses = await OtherExpense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addOtherExpense = async (req, res) => {
  try {
    const expense = await OtherExpense.create(req.body);
    res.status(201).json(expense);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateOtherExpense = async (req, res) => {
  try {
    const expense = await OtherExpense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteOtherExpense = async (req, res) => {
  try {
    await OtherExpense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

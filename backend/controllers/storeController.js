const Seller = require('../models/Seller');
const RawPurchase = require('../models/RawPurchase');
const StorePayment = require('../models/StorePayment');
const StoreExpense = require('../models/StoreExpense');
const StoreSalary = require('../models/StoreSalary');

// --- SELLERS ---
exports.getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });
    res.json(sellers);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.addSeller = async (req, res) => {
  try {
    const seller = await Seller.create(req.body);
    res.status(201).json(seller);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updateSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(seller);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteSeller = async (req, res) => {
  try {
    await Seller.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- RAW PURCHASE ---
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await RawPurchase.find().populate('seller').sort({ date: -1 });
    res.json(purchases);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.addPurchase = async (req, res) => {
  try {
    const purchase = await RawPurchase.create(req.body);
    res.status(201).json(purchase);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updatePurchase = async (req, res) => {
  try {
    const purchase = await RawPurchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(purchase);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deletePurchase = async (req, res) => {
  try {
    await RawPurchase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- PAYMENTS ---
exports.getPayments = async (req, res) => {
  try {
    const payments = await StorePayment.find().populate('seller').sort({ date: -1 });
    res.json(payments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.addPayment = async (req, res) => {
  try {
    const payment = await StorePayment.create(req.body);
    res.status(201).json(payment);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updatePayment = async (req, res) => {
  try {
    const payment = await StorePayment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(payment);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- STORE EXPENSES ---
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await StoreExpense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.addExpense = async (req, res) => {
  try {
    const expense = await StoreExpense.create(req.body);
    res.status(201).json(expense);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteExpense = async (req, res) => {
  try {
    await StoreExpense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- STORE SALARIES ---
exports.getSalaries = async (req, res) => {
  try {
    const salaries = await StoreSalary.find().sort({ date: -1 });
    res.json(salaries);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.addSalary = async (req, res) => {
  try {
    const salary = await StoreSalary.create(req.body);
    res.status(201).json(salary);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updateSalary = async (req, res) => {
  try {
    const salary = await StoreSalary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(salary);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteSalary = async (req, res) => {
  try {
    await StoreSalary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const PlantationRecord = require('../models/PlantationRecord');
const CardamomCollection = require('../models/CardamomCollection');
const SalesRecord = require('../models/SalesRecord');
const Labour = require('../models/Labour');
const MedicineExpense = require('../models/MedicineExpense');
const FarmExpense = require('../models/FarmExpense');

// --- CARDAMOM COLLECTION ---
exports.getCollections = async (req, res) => {
  try {
    const collections = await CardamomCollection.find().sort({ date: -1 });
    res.json(collections);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.addCollection = async (req, res) => {
  try {
    const collection = await CardamomCollection.create(req.body);
    res.status(201).json(collection);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updateCollection = async (req, res) => {
  try {
    const collection = await CardamomCollection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(collection);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteCollection = async (req, res) => {
  try {
    await CardamomCollection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- SALES RECORD ---
exports.getSales = async (req, res) => {
  try {
    const sales = await SalesRecord.find().sort({ date: -1 });
    res.json(sales);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.addSale = async (req, res) => {
  try {
    const sale = await SalesRecord.create(req.body);
    res.status(201).json(sale);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updateSale = async (req, res) => {
  try {
    const sale = await SalesRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sale);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteSale = async (req, res) => {
  try {
    await SalesRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- LABOUR ---
exports.getLabours = async (req, res) => {
  try {
    const labours = await Labour.find().sort({ date: -1 });
    res.json(labours);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.addLabour = async (req, res) => {
  try {
    const labour = await Labour.create(req.body);
    res.status(201).json(labour);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updateLabour = async (req, res) => {
  try {
    const labour = await Labour.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(labour);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteLabour = async (req, res) => {
  try {
    await Labour.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- MEDICINE EXPENSES ---
exports.getMedicineExpenses = async (req, res) => {
  try {
    const expenses = await MedicineExpense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.addMedicineExpense = async (req, res) => {
  try {
    const expense = await MedicineExpense.create(req.body);
    res.status(201).json(expense);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updateMedicineExpense = async (req, res) => {
  try {
    const expense = await MedicineExpense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteMedicineExpense = async (req, res) => {
  try {
    await MedicineExpense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- FARM EXPENSES ---
exports.getFarmExpenses = async (req, res) => {
  try {
    const expenses = await FarmExpense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.addFarmExpense = async (req, res) => {
  try {
    const expense = await FarmExpense.create(req.body);
    res.status(201).json(expense);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updateFarmExpense = async (req, res) => {
  try {
    const expense = await FarmExpense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteFarmExpense = async (req, res) => {
  try {
    await FarmExpense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

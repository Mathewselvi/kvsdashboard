const ResortIncome       = require('../models/ResortIncome');
const OtherExpense       = require('../models/OtherExpense');
const UtilityBill        = require('../models/UtilityBill');
const StaffSalary        = require('../models/StaffSalary');
const Laundry            = require('../models/Laundry');
const StoreExpense       = require('../models/StoreExpense');
const StoreSalary        = require('../models/StoreSalary');
const SalesRecord        = require('../models/SalesRecord');
const RawPurchase        = require('../models/RawPurchase');
const Labour             = require('../models/Labour');
const MedicineExpense    = require('../models/MedicineExpense');
const FarmExpense        = require('../models/FarmExpense');
const CardamomCollection = require('../models/CardamomCollection');

const sum = (arr, field) => arr.reduce((acc, r) => acc + (r[field] || 0), 0);

const getDashboardSummary = async (req, res) => {
  try {
    const [
      resortIncomes, otherExpenses, utilityBills, staffSalaries, laundries,
      storeExpenses, storeSalaries, salesRecords, rawPurchases,
      labours, medicineExpenses, farmExpenses, collections,
    ] = await Promise.all([
      ResortIncome.find(),
      OtherExpense.find(),
      UtilityBill.find(),
      StaffSalary.find(),
      Laundry.find(),
      StoreExpense.find(),
      StoreSalary.find(),
      SalesRecord.find(),
      RawPurchase.find(),
      Labour.find(),
      MedicineExpense.find(),
      FarmExpense.find(),
      CardamomCollection.find(),
    ]);

    // ── INCOME ────────────────────────────────────────────────────────────────
    const resortIncome = sum(resortIncomes, 'amount');
    const storeSalesIncome = sum(salesRecords, 'totalAmount');
    const dryingIncome = sum(rawPurchases, 'totalAmount');
    const totalIncome  = resortIncome + storeSalesIncome + dryingIncome;

    // ── EXPENSES ──────────────────────────────────────────────────────────────
    const resortExpenses =
      sum(otherExpenses, 'amount') +
      sum(utilityBills,  'amount') +
      sum(staffSalaries, 'salaryAmount') +
      sum(laundries,     'cost');

    const storeExpensesTotal =
      sum(storeExpenses, 'amount') +
      sum(storeSalaries, 'amount');

    const thottamExpenses =
      sum(labours,          'totalWage') +
      sum(medicineExpenses, 'cost') +
      sum(farmExpenses,     'amount');

    const totalExpenses = resortExpenses + storeExpensesTotal + thottamExpenses;

    // ── PENDING ───────────────────────────────────────────────────────────────
    const pendingPayments = rawPurchases.reduce((acc, p) => {
      if (p.paymentStatus === 'Paid') return acc;
      return acc + Math.max(0, (p.totalAmount || 0) - (p.advancePayment || 0) - (p.remainingPaid || 0));
    }, 0);

    const pendingSalaries =
      sum(staffSalaries.filter(s => s.status === 'Pending'), 'salaryAmount') +
      sum(storeSalaries.filter(s => s.status === 'Pending'), 'amount') +
      sum(labours.filter(l => l.status === 'Pending'),       'totalWage');

    // ── MODULE BREAKDOWN ──────────────────────────────────────────────────────
    const beyondHeaven = {
      income:   resortIncome,
      expenses: resortExpenses,
      profit:   resortIncome - resortExpenses,
    };

    const store = {
      income:            storeSalesIncome,
      rawPurchasesTotal: dryingIncome,
      expenses:          storeExpensesTotal,
      pendingPayments,
    };

    const thottam = {
      expenses:      thottamExpenses,
      totalRawKG:    sum(collections, 'rawQuantityKG'),
      totalDryKG:    collections.reduce((a, c) => a + (c.dryQuantityKG || 0), 0),
      labourPending: sum(labours.filter(l => l.status === 'Pending'), 'totalWage'),
    };

    // ── MONTHLY TREND (last 12 months) ────────────────────────────────────────
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString('en-IN', { month: 'short' }).toUpperCase(),
      };
    });

    const inMonth = (date, year, month) => {
      const d = new Date(date);
      return d.getFullYear() === year && d.getMonth() === month;
    };

    const monthlyData = months.map(({ year, month, label }) => {
      const income =
        resortIncomes.filter(r => inMonth(r.date, year, month)).reduce((a, c) => a + c.amount, 0) +
        salesRecords.filter(r  => inMonth(r.date, year, month)).reduce((a, c) => a + (c.totalAmount || 0), 0) +
        rawPurchases.filter(r  => inMonth(r.date, year, month)).reduce((a, c) => a + (c.totalAmount || 0), 0);

      const expenses =
        otherExpenses.filter(r    => inMonth(r.date, year, month)).reduce((a, c) => a + c.amount, 0) +
        storeExpenses.filter(r    => inMonth(r.date, year, month)).reduce((a, c) => a + c.amount, 0) +
        storeSalaries.filter(r    => inMonth(r.date, year, month)).reduce((a, c) => a + c.amount, 0) +
        laundries.filter(r        => inMonth(r.date, year, month)).reduce((a, c) => a + (c.cost || 0), 0) +
        labours.filter(r          => inMonth(r.date, year, month)).reduce((a, c) => a + (c.totalWage || 0), 0) +
        medicineExpenses.filter(r => inMonth(r.date, year, month)).reduce((a, c) => a + c.cost, 0) +
        farmExpenses.filter(r     => inMonth(r.date, year, month)).reduce((a, c) => a + c.amount, 0);

      return { label, income, expenses, profit: income - expenses };
    });

    // ── RECENT ACTIVITY ───────────────────────────────────────────────────────
    const recentTransactions = [
      ...resortIncomes.map(r    => ({ type: 'Income',  module: 'Beyond Heaven', amount: r.amount,       date: r.date,      desc: r.source })),
      ...salesRecords.map(r     => ({ type: 'Income',  module: 'Store',         amount: r.totalAmount,  date: r.date,      desc: `Sale — ${r.buyerDetails}` })),
      ...rawPurchases.map(r     => ({ type: 'Income',  module: 'Store',         amount: r.totalAmount,  date: r.date,      desc: `Drying — ${r.sellerName}` })),
      ...otherExpenses.map(r    => ({ type: 'Expense', module: 'Beyond Heaven', amount: r.amount,       date: r.date,      desc: r.category })),
      ...utilityBills.map(r     => ({ type: 'Expense', module: 'Beyond Heaven', amount: r.amount,       date: r.createdAt, desc: `${r.billType} Bill` })),
      ...staffSalaries.map(r    => ({ type: 'Expense', module: 'Beyond Heaven', amount: r.salaryAmount, date: r.createdAt, desc: `Salary — ${r.employeeName}` })),
      ...laundries.map(r        => ({ type: 'Expense', module: 'Beyond Heaven', amount: r.cost,         date: r.date,      desc: `Laundry — ${r.vendorName}` })),
      ...storeExpenses.map(r    => ({ type: 'Expense', module: 'Store',         amount: r.amount,       date: r.date,      desc: r.category })),
      ...storeSalaries.map(r    => ({ type: 'Expense', module: 'Store',         amount: r.amount,       date: r.date,      desc: `Salary — ${r.employeeName}` })),
      ...labours.map(r          => ({ type: 'Expense', module: 'Thottam',       amount: r.totalWage,    date: r.date,      desc: `Labour — ${r.plantationName} (${r.numberOfWorkers} workers)` })),
      ...medicineExpenses.map(r => ({ type: 'Expense', module: 'Thottam',       amount: r.cost,         date: r.date,      desc: r.medicineName })),
      ...farmExpenses.map(r     => ({ type: 'Expense', module: 'Thottam',       amount: r.amount,       date: r.date,      desc: r.category })),
    ]
      .filter(tx => tx.amount > 0 && tx.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      totalIncome,
      totalExpenses,
      currentProfit: totalIncome - totalExpenses,
      pendingPayments,
      pendingSalaries,
      beyondHeaven,
      store,
      thottam,
      monthlyData,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardSummary };

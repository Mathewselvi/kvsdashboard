const ResortIncome = require('../models/ResortIncome');
const OtherExpense = require('../models/OtherExpense');
const UtilityBill = require('../models/UtilityBill');
const StaffSalary = require('../models/StaffSalary');
const Laundry = require('../models/Laundry');
const StoreExpense = require('../models/StoreExpense');
const StoreSalary = require('../models/StoreSalary');
const SalesRecord = require('../models/SalesRecord');
const RawPurchase = require('../models/RawPurchase');
const StorePayment = require('../models/StorePayment');
const Seller = require('../models/Seller');
const Labour = require('../models/Labour');
const MedicineExpense = require('../models/MedicineExpense');
const FarmExpense = require('../models/FarmExpense');
const CardamomCollection = require('../models/CardamomCollection');
const dayjs = require('dayjs');

const getReportData = async (filters) => {
  const { type, business, startDate, endDate, plantation } = filters;

  // Build date query
  let start, end;
  const now = dayjs();
  
  if (startDate && endDate) {
    start = dayjs(startDate).startOf('day').toDate();
    end = dayjs(endDate).endOf('day').toDate();
  } else {
    if (type === 'weekly') start = now.startOf('week').toDate();
    else if (type === 'monthly') start = now.startOf('month').toDate();
    else if (type === 'yearly') start = now.startOf('year').toDate();
    else start = now.startOf('month').toDate();
    end = now.toDate();
  }

  const query = { $gte: start, $lte: end };
  const flexQuery = {
    $or: [
      { date: query },
      { dueDate: query },
      { paidDate: query },
      { createdAt: query }
    ]
  };

  const fetchResort = business === 'all' || business === 'resort';
  const fetchStore = business === 'all' || business === 'store';
  const fetchThottam = business === 'all' || business === 'thottam';

  const promises = [];

  if (fetchResort) {
    promises.push(
      ResortIncome.find(flexQuery).lean(),
      OtherExpense.find(flexQuery).lean(),
      UtilityBill.find(flexQuery).lean(),
      StaffSalary.find(flexQuery).lean(),
      Laundry.find(flexQuery).lean()
    );
  } else {
    promises.push(Promise.resolve([]), Promise.resolve([]), Promise.resolve([]), Promise.resolve([]), Promise.resolve([]));
  }

  if (fetchStore) {
    promises.push(
      SalesRecord.find(flexQuery).lean(),
      StoreExpense.find(flexQuery).lean(),
      StoreSalary.find(flexQuery).lean(),
      RawPurchase.find(flexQuery).populate('seller').lean(),
      StorePayment.find(flexQuery).populate('seller').lean()
    );
  } else {
    promises.push(Promise.resolve([]), Promise.resolve([]), Promise.resolve([]), Promise.resolve([]), Promise.resolve([]));
  }

  if (fetchThottam) {
    const thottamQuery = { ...flexQuery };
    if (plantation && plantation !== 'all') {
      thottamQuery.plantationName = plantation;
    }
    promises.push(
      Labour.find(thottamQuery).lean(),
      MedicineExpense.find(thottamQuery).lean(),
      FarmExpense.find(thottamQuery).lean(),
      CardamomCollection.find(thottamQuery).lean()
    );
  } else {
    promises.push(Promise.resolve([]), Promise.resolve([]), Promise.resolve([]), Promise.resolve([]));
  }

  const [
    resortIncomes, otherExpenses, utilityBills, staffSalaries, laundries,
    salesRecords, storeExpenses, storeSalaries, rawPurchases, storePayments,
    labours, medicineExpenses, farmExpenses, collections
  ] = await Promise.all(promises);

  // Process Transactions
  const transactions = [
    ...resortIncomes.map(i => ({ date: i.date || i.createdAt, business: 'Resort', category: 'Income', description: i.source, amount: i.amount || 0, status: 'Completed' })),
    ...otherExpenses.map(i => ({ date: i.date || i.createdAt, business: 'Resort', category: 'Expense', description: i.category, amount: i.amount || 0, status: 'Completed' })),
    ...utilityBills.map(i => ({ date: i.dueDate || i.createdAt, business: 'Resort', category: 'Expense', description: `${i.billType} Bill`, amount: i.amount || 0, status: i.status })),
    ...staffSalaries.map(i => ({ date: i.paidDate || i.createdAt, business: 'Resort', category: 'Salary', description: `Salary - ${i.employeeName}`, amount: i.salaryAmount || 0, status: i.status })),
    ...laundries.map(i => ({ date: i.date || i.createdAt, business: 'Resort', category: 'Expense', description: `Laundry - ${i.vendorName}`, amount: i.cost || 0, status: i.status })),
    
    ...salesRecords.map(i => ({ date: i.date || i.createdAt, business: 'Store', category: 'Income', description: `Sale - ${i.buyerDetails}`, amount: i.totalAmount || 0, status: 'Completed' })),
    ...storeExpenses.map(i => ({ date: i.date || i.createdAt, business: 'Store', category: 'Expense', description: i.category, amount: i.amount || 0, status: 'Completed' })),
    ...storeSalaries.map(i => ({ date: i.date || i.createdAt, business: 'Store', category: 'Salary', description: `Salary - ${i.employeeName}`, amount: i.amount || 0, status: i.status })),
    ...rawPurchases.map(i => ({ date: i.date || i.createdAt, business: 'Store', category: 'Purchase', description: `Purchase - ${i.seller?.sellerName || 'Unknown'}`, amount: i.totalAmount || 0, status: i.paymentStatus })),
    ...storePayments.map(i => ({ date: i.date || i.createdAt, business: 'Store', category: 'Expense', description: `Payment to ${i.seller?.sellerName || 'Unknown'}`, amount: i.paidAmount || 0, status: i.status })),

    ...labours.map(i => ({ date: i.date || i.createdAt, business: 'Thottam', category: 'Salary', description: `Labour - ${i.workerName}`, amount: i.totalWage || 0, status: i.status })),
    ...medicineExpenses.map(i => ({ date: i.date || i.createdAt, business: 'Thottam', category: 'Expense', description: i.medicineName, amount: i.cost || 0, status: 'Completed' })),
    ...farmExpenses.map(i => ({ date: i.date || i.createdAt, business: 'Thottam', category: 'Expense', description: i.category, amount: i.amount || 0, status: 'Completed' }))
  ].filter(t => t.date).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate Summaries
  const totalRevenue = transactions.filter(t => t.category === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.category !== 'Income').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const pendingDues = transactions.filter(t => ['Pending', 'Partial'].includes(t.status)).reduce((sum, t) => sum + t.amount, 0);
  const paidSettlements = transactions.filter(t => ['Completed', 'Paid', 'Paid'].includes(t.status)).reduce((sum, t) => sum + t.amount, 0);

  // Group by Date for Charts
  const chartData = {};
  transactions.forEach(t => {
    const d = dayjs(t.date).format('YYYY-MM-DD');
    if (!chartData[d]) chartData[d] = { date: d, revenue: 0, expenses: 0, profit: 0 };
    if (t.category === 'Income') chartData[d].revenue += t.amount;
    else chartData[d].expenses += t.amount;
    chartData[d].profit = chartData[d].revenue - chartData[d].expenses;
  });

  const dailyTrends = Object.values(chartData).sort((a, b) => a.date.localeCompare(b.date));

  // Business Comparison
  const businessComparison = [
    { name: 'Resort', revenue: transactions.filter(t => t.business === 'Resort' && t.category === 'Income').reduce((s, t) => s + t.amount, 0), expenses: transactions.filter(t => t.business === 'Resort' && t.category !== 'Income').reduce((s, t) => s + t.amount, 0) },
    { name: 'Store', revenue: transactions.filter(t => t.business === 'Store' && t.category === 'Income').reduce((s, t) => s + t.amount, 0), expenses: transactions.filter(t => t.business === 'Store' && t.category !== 'Income').reduce((s, t) => s + t.amount, 0) },
    { name: 'Thottam', revenue: 0, expenses: transactions.filter(t => t.business === 'Thottam' && t.category !== 'Income').reduce((s, t) => s + t.amount, 0) }
  ];

  return {
    summary: { totalRevenue, totalExpenses, netProfit, pendingDues, paidSettlements },
    transactions,
    dailyTrends,
    businessComparison,
    raw: {
      resortIncomes, otherExpenses, utilityBills, staffSalaries, laundries,
      salesRecords, storeExpenses, storeSalaries, rawPurchases, storePayments,
      labours, medicineExpenses, farmExpenses, collections
    }
  };
};

module.exports = { getReportData };

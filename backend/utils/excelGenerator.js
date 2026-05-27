const ExcelJS = require('exceljs');
const dayjs = require('dayjs');

// Helper to apply professional styling to a sheet
const styleTableSheet = (sheet, headerColorHex) => {
  // Style the header row (row 1)
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell(cell => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColorHex } };
    cell.alignment = { vertical: 'middle', horizontal: cell.alignment?.horizontal || 'left', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF1E293B' } },
      bottom: { style: 'medium', color: { argb: 'FF1E293B' } }
    };
  });

  // Style data rows
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    
    // Check if it's a double-underline row (e.g. Net Profit or Totals)
    const isDoubleUnderline = row.getCell(1).border && row.getCell(1).border.bottom && row.getCell(1).border.bottom.style === 'double';
    
    if (!isDoubleUnderline) {
      row.height = 20;
    } else {
      row.height = 22;
    }

    const isEven = rowNumber % 2 === 0;
    const rowBgColor = isEven ? 'F8FAFC' : 'FFFFFF';

    row.eachCell((cell) => {
      cell.font = { 
        name: 'Segoe UI', 
        size: cell.font?.size || 9.5, 
        bold: cell.font?.bold,
        color: cell.font?.color
      };
      
      // Preserve custom colors/fills if already set, otherwise apply zebra striping
      if (!cell.fill || cell.fill.type !== 'pattern') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + rowBgColor } };
      }
      
      // Keep existing border if set (like double bottom underline), otherwise standard thin border
      if (!cell.border) {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      }

      if (!cell.alignment) {
        cell.alignment = { vertical: 'middle' };
      } else {
        cell.alignment.vertical = 'middle';
      }
    });
  });

  // Adjust column widths dynamically
  sheet.columns.forEach(column => {
    let maxLen = column.header ? column.header.toString().length : 12;
    column.eachCell({ includeEmpty: false }, cell => {
      if (cell.value !== null && cell.value !== undefined) {
        let valStr = '';
        if (typeof cell.value === 'object') {
          valStr = JSON.stringify(cell.value);
        } else if (typeof cell.value === 'number') {
          valStr = '₹' + Math.round(cell.value).toLocaleString('en-IN');
        } else {
          valStr = cell.value.toString();
        }
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      }
    });
    column.width = Math.min(Math.max(maxLen + 4, 14), 45);
  });
};

const generateExcelReport = async (data, filters) => {
  const workbook = new ExcelJS.Workbook();
  const { type, business, plantation } = filters;
  const timestamp = dayjs().format('MMM-YYYY');
  
  let filename = `KVS-${business.toUpperCase()}-${type.toUpperCase()}-REPORT-${timestamp}.xlsx`;
  if (business === 'thottam' && plantation && plantation !== 'all') {
    filename = `KVS-THOTTAM-${plantation.replace(/\s+/g, '_').toUpperCase()}-${type.toUpperCase()}-REPORT-${timestamp}.xlsx`;
  }

  // ── SHEET 1: OVERVIEW SUMMARY ──
  const summarySheet = workbook.addWorksheet('Overview Summary');
  summarySheet.columns = [
    { header: 'Business Overview', key: 'metric', width: 30, style: { alignment: { horizontal: 'left' } } },
    { header: 'Amount', key: 'value', width: 22, style: { numFmt: '"₹"#,##0.00', alignment: { horizontal: 'right' } } },
  ];

  summarySheet.addRow({ metric: 'TOTAL REVENUE', value: data.summary.totalRevenue || 0 });
  summarySheet.addRow({ metric: 'TOTAL EXPENSES', value: data.summary.totalExpenses || 0 });
  
  const profitRow = summarySheet.addRow({ metric: 'NET PROFIT', value: data.summary.netProfit || 0 });
  summarySheet.addRow({ metric: 'TOTAL PENDING DUES', value: data.summary.pendingDues || 0 });
  summarySheet.addRow({ metric: 'TOTAL SETTLED CAPITAL', value: data.summary.paidSettlements || 0 });

  // Apply styling to Overview Summary
  styleTableSheet(summarySheet, 'FF1E293B'); // Slate Dark Blue

  // Highlight Net Profit Row
  const netProfitValue = data.summary.netProfit || 0;
  profitRow.eachCell((cell, colNum) => {
    cell.font = { 
      name: 'Segoe UI', 
      size: 9.5, 
      bold: true, 
      color: { argb: colNum === 2 ? (netProfitValue >= 0 ? 'FF15803D' : 'FFB91C1C') : 'FF1E293B' } 
    };
    cell.fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: netProfitValue >= 0 ? 'FFE8F5E9' : 'FFFFEBEE' } 
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'double', color: { argb: 'FF1E293B' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  });

  // ── SHEET 2: CONSOLIDATED LEDGER (only for business === 'all') ──
  if (business === 'all') {
    const ledgerSheet = workbook.addWorksheet('Consolidated Ledger');
    ledgerSheet.columns = [
      { header: 'Date', key: 'date', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Business Unit', key: 'business', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Category', key: 'category', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Description / Details', key: 'description', width: 35, style: { alignment: { horizontal: 'left' } } },
      { header: 'Amount', key: 'amount', width: 18, style: { numFmt: '"₹"#,##0.00', alignment: { horizontal: 'right' } } },
      { header: 'Status', key: 'status', width: 15, style: { alignment: { horizontal: 'center' } } },
    ];

    if (data.transactions && data.transactions.length > 0) {
      data.transactions.forEach(t => {
        ledgerSheet.addRow({
          date: dayjs(t.date || t.createdAt).format('YYYY-MM-DD'),
          business: t.business,
          category: t.category,
          description: t.description,
          amount: t.amount || 0,
          status: t.status
        });
      });
    } else {
      const placeholderRow = ledgerSheet.addRow({ description: 'No transactions found in this period' });
      placeholderRow.getCell(4).font = { italic: true };
    }

    styleTableSheet(ledgerSheet, 'FF475569'); // Steel Blue
  }

  // ── SHEET 3: RESORT DETAILS ──
  if (business === 'all' || business === 'resort') {
    const sheet = workbook.addWorksheet('Resort Details');
    sheet.columns = [
      { header: 'Type', key: 'type', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Date', key: 'date', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Source / Employee / Vendor', key: 'name', width: 25, style: { alignment: { horizontal: 'left' } } },
      { header: 'Description / Details', key: 'desc', width: 35, style: { alignment: { horizontal: 'left' } } },
      { header: 'Amount', key: 'amount', width: 18, style: { numFmt: '"₹"#,##0.00', alignment: { horizontal: 'right' } } },
      { header: 'Status', key: 'status', width: 15, style: { alignment: { horizontal: 'center' } } },
    ];

    let rowCount = 0;
    // Income
    if (data.raw.resortIncomes && data.raw.resortIncomes.length > 0) {
      data.raw.resortIncomes.forEach(i => {
        sheet.addRow({ type: 'INCOME', date: dayjs(i.date || i.createdAt).format('YYYY-MM-DD'), name: i.source, desc: i.notes || 'Room Booking/Revenue', amount: i.amount || 0, status: 'Completed' });
        rowCount++;
      });
    }
    // Salaries
    if (data.raw.staffSalaries && data.raw.staffSalaries.length > 0) {
      data.raw.staffSalaries.forEach(s => {
        sheet.addRow({ type: 'SALARY', date: dayjs(s.paidDate || s.createdAt).format('YYYY-MM-DD'), name: s.employeeName, desc: `Staff Salary`, amount: s.salaryAmount || 0, status: s.status });
        rowCount++;
      });
    }
    // Laundry
    if (data.raw.laundries && data.raw.laundries.length > 0) {
      data.raw.laundries.forEach(l => {
        sheet.addRow({ type: 'LAUNDRY', date: dayjs(l.date || l.createdAt).format('YYYY-MM-DD'), name: l.vendorName, desc: `Qty: ${l.totalQuantity} items`, amount: l.cost || 0, status: l.status });
        rowCount++;
      });
    }
    // Utilities
    if (data.raw.utilityBills && data.raw.utilityBills.length > 0) {
      data.raw.utilityBills.forEach(u => {
        sheet.addRow({ type: 'UTILITY', date: dayjs(u.dueDate || u.createdAt).format('YYYY-MM-DD'), name: u.billType, desc: `Utility Bill`, amount: u.amount || 0, status: u.status || 'Paid' });
        rowCount++;
      });
    }
    // Other Expenses
    if (data.raw.otherExpenses && data.raw.otherExpenses.length > 0) {
      data.raw.otherExpenses.forEach(e => {
        sheet.addRow({ type: 'EXPENSE', date: dayjs(e.date || e.createdAt).format('YYYY-MM-DD'), name: e.category, desc: e.description || 'General Expense', amount: e.amount || 0, status: 'Completed' });
        rowCount++;
      });
    }

    if (rowCount === 0) {
      const placeholderRow = sheet.addRow({ desc: 'No resort transactions found in this period' });
      placeholderRow.getCell(4).font = { italic: true };
    }

    styleTableSheet(sheet, 'FF4F46E5'); // Indigo
  }

  // ── SHEET 4: CARDAMOM STORE DETAILS ──
  if (business === 'all' || business === 'store') {
    const sheet = workbook.addWorksheet('Store Details');
    sheet.columns = [
      { header: 'Type', key: 'type', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Date', key: 'date', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Party Name (Seller/Buyer)', key: 'name', width: 25, style: { alignment: { horizontal: 'left' } } },
      { header: 'Transaction Details', key: 'desc', width: 40, style: { alignment: { horizontal: 'left' } } },
      { header: 'Total Value', key: 'amount', width: 18, style: { numFmt: '"₹"#,##0.00', alignment: { horizontal: 'right' } } },
      { header: 'Paid/Recv', key: 'paid', width: 18, style: { numFmt: '"₹"#,##0.00', alignment: { horizontal: 'right' } } },
      { header: 'Balance', key: 'bal', width: 18, style: { numFmt: '"₹"#,##0.00', alignment: { horizontal: 'right' } } },
      { header: 'Status', key: 'status', width: 15, style: { alignment: { horizontal: 'center' } } },
    ];

    let rowCount = 0;
    // Purchases
    if (data.raw.rawPurchases && data.raw.rawPurchases.length > 0) {
      data.raw.rawPurchases.forEach(p => {
        const pending = (p.totalAmount || 0) - (p.advancePayment || 0) - (p.remainingPaid || 0);
        sheet.addRow({ 
          type: 'PURCHASE', 
          date: dayjs(p.date || p.createdAt).format('YYYY-MM-DD'), 
          name: p.seller?.sellerName || 'Unknown', 
          desc: `Weight: ${p.rawWeightKG}kg @ ₹${p.ratePerKG}/kg`, 
          amount: p.totalAmount || 0, 
          paid: (p.advancePayment || 0) + (p.remainingPaid || 0), 
          bal: pending, 
          status: p.paymentStatus 
        });
        rowCount++;
      });
    }
    // Sales
    if (data.raw.salesRecords && data.raw.salesRecords.length > 0) {
      data.raw.salesRecords.forEach(s => {
        sheet.addRow({ type: 'SALE', date: dayjs(s.date || s.createdAt).format('YYYY-MM-DD'), name: s.buyerDetails, desc: 'Cardamom Sale', amount: s.totalAmount || 0, paid: s.totalAmount || 0, bal: 0, status: 'Paid' });
        rowCount++;
      });
    }
    // Expenses
    if (data.raw.storeExpenses && data.raw.storeExpenses.length > 0) {
      data.raw.storeExpenses.forEach(e => {
        sheet.addRow({ type: 'EXPENSE', date: dayjs(e.date || e.createdAt).format('YYYY-MM-DD'), name: e.category, desc: e.description || 'Store Expense', amount: e.amount || 0, paid: e.amount || 0, bal: 0, status: 'Completed' });
        rowCount++;
      });
    }
    // Salaries
    if (data.raw.storeSalaries && data.raw.storeSalaries.length > 0) {
      data.raw.storeSalaries.forEach(s => {
        sheet.addRow({ type: 'SALARY', date: dayjs(s.date || s.createdAt).format('YYYY-MM-DD'), name: s.employeeName, desc: 'Store Staff Salary', amount: s.amount || 0, paid: s.status === 'Paid' ? (s.amount || 0) : 0, bal: s.status === 'Pending' ? (s.amount || 0) : 0, status: s.status });
        rowCount++;
      });
    }

    if (rowCount === 0) {
      const placeholderRow = sheet.addRow({ desc: 'No store transactions found in this period' });
      placeholderRow.getCell(4).font = { italic: true };
    }

    styleTableSheet(sheet, 'FFD97706'); // Amber
  }

  // ── SHEET 5: THOTTAM DETAILS ──
  if (business === 'all' || business === 'thottam') {
    const sheetTitle = plantation && plantation !== 'all' ? `Thottam - ${plantation}` : 'Thottam Details';
    const sheet = workbook.addWorksheet(sheetTitle.substring(0, 31));
    sheet.columns = [
      { header: 'Type', key: 'type', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Date', key: 'date', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Worker / Item', key: 'name', width: 25, style: { alignment: { horizontal: 'left' } } },
      { header: 'Details', key: 'desc', width: 35, style: { alignment: { horizontal: 'left' } } },
      { header: 'Yield (KG)', key: 'yield', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Cost', key: 'amount', width: 18, style: { numFmt: '"₹"#,##0.00', alignment: { horizontal: 'right' } } },
      { header: 'Status', key: 'status', width: 15, style: { alignment: { horizontal: 'center' } } },
    ];

    let rowCount = 0;
    // Labour
    if (data.raw.labours && data.raw.labours.length > 0) {
      data.raw.labours.forEach(l => {
        sheet.addRow({ type: 'LABOUR', date: dayjs(l.date || l.createdAt).format('YYYY-MM-DD'), name: l.workerName, desc: `Wages`, yield: '-', amount: l.totalWage || 0, status: l.status });
        rowCount++;
      });
    }
    // Yield (Collections)
    if (data.raw.collections && data.raw.collections.length > 0) {
      data.raw.collections.forEach(c => {
        sheet.addRow({ type: 'YIELD', date: dayjs(c.date || c.createdAt).format('YYYY-MM-DD'), name: 'Collection', desc: `Raw: ${c.rawQuantityKG}kg, Dry: ${c.dryQuantityKG}kg`, yield: c.dryQuantityKG, amount: 0, status: 'Recorded' });
        rowCount++;
      });
    }
    // Medicine
    if (data.raw.medicineExpenses && data.raw.medicineExpenses.length > 0) {
      data.raw.medicineExpenses.forEach(m => {
        sheet.addRow({ type: 'MEDICINE', date: dayjs(m.date || m.createdAt).format('YYYY-MM-DD'), name: m.medicineName, desc: m.category || 'Medicine Application', yield: '-', amount: m.cost || 0, status: 'Paid' });
        rowCount++;
      });
    }
    // Farm Expense
    if (data.raw.farmExpenses && data.raw.farmExpenses.length > 0) {
      data.raw.farmExpenses.forEach(f => {
        sheet.addRow({ type: 'FARM EXP', date: dayjs(f.date || f.createdAt).format('YYYY-MM-DD'), name: f.category, desc: f.description || 'Farm Maintenance', yield: '-', amount: f.amount || 0, status: 'Paid' });
        rowCount++;
      });
    }

    if (rowCount === 0) {
      const placeholderRow = sheet.addRow({ desc: 'No thottam transactions found in this period' });
      placeholderRow.getCell(4).font = { italic: true };
    }

    styleTableSheet(sheet, 'FF059669'); // Emerald
  }

  return { workbook, filename };
};

module.exports = { generateExcelReport };

const reportService = require('../services/reportService');
const excelGenerator = require('../utils/excelGenerator');

const getReports = async (req, res) => {
  try {
    const { type, business, startDate, endDate, plantation } = req.query;
    const data = await reportService.getReportData({
      type: type || 'monthly',
      business: business || 'all',
      startDate,
      endDate,
      plantation
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportReport = async (req, res) => {
  try {
    const { type, business, startDate, endDate, plantation } = req.query;
    const data = await reportService.getReportData({
      type: type || 'monthly',
      business: business || 'all',
      startDate,
      endDate,
      plantation
    });

    const { workbook, filename } = await excelGenerator.generateExcelReport(data, {
      type: type || 'monthly',
      business: business || 'all',
      plantation
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + filename
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReports,
  exportReport
};

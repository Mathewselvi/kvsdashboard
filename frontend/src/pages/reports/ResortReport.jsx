import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Hotel, FileDown, Calendar, Search, ChevronLeft, ChevronRight, 
  TrendingUp, Users, Waves, Receipt, Wallet, ArrowLeft
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n = 0) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const ResortReport = () => {
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (reportType !== 'custom' || (startDate && endDate)) {
      fetchReport();
    }
  }, [reportType, startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/reports?type=${reportType}&business=resort`;
      if (reportType === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch resort reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const token = localStorage.getItem('token');
    let url = `${api.defaults.baseURL}/reports/export?type=${reportType}&business=resort&token=${token}`;
    if (reportType === 'custom' && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    window.open(url, '_blank');
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-genesis-primary" />
      </div>
    );
  }

  const { summary, transactions = [], dailyTrends = [] } = data || {};
  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderMobileCard = (tx, i) => (
    <div key={i} className="p-4 space-y-2.5 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-genesis-textMain text-[14px]">{tx.description}</p>
          <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{new Date(tx.date).toLocaleDateString()}</p>
        </div>
        <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${
          tx.category === 'Income' ? 'bg-genesis-success/10 text-genesis-success' : 'bg-genesis-error/10 text-genesis-error'
        }`}>
          {tx.category}
        </span>
      </div>
      <div className="flex justify-between text-[13px]">
        <span className="text-genesis-textSub">Amount</span>
        <span className={`font-mono font-bold ${tx.category === 'Income' ? 'text-genesis-success' : 'text-genesis-error'}`}>
          {tx.category === 'Income' ? '+' : '-'}{fmt(tx.amount)}
        </span>
      </div>
      <div className="flex justify-between text-[13px]">
        <span className="text-genesis-textSub">Status</span>
        <span className="text-[11px] font-bold text-genesis-textSub uppercase tracking-wider">{tx.status}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link to="/reports" className="flex items-center gap-2 text-[12px] font-bold text-genesis-textSub hover:text-genesis-primary transition-colors mb-4">
            <ArrowLeft size={14} /> Back to Reports Hub
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Hotel size={20} />
            </div>
            <h1 className="text-[28px] font-display font-bold text-genesis-textMain tracking-tight">Beyond Heaven Resort</h1>
          </div>
          <p className="text-[14px] text-genesis-textSub">In-depth analysis of booking revenue, laundry, and operations.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-white border border-genesis-border rounded-xl p-1 flex flex-wrap justify-center sm:flex-nowrap">
            {['weekly', 'monthly', 'yearly', 'custom'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[12px] font-bold capitalize transition-all ${
                  reportType === type ? 'bg-genesis-primary text-white shadow-md' : 'text-genesis-textSub hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {reportType === 'custom' && (
            <div className="flex flex-col xs:flex-row items-center gap-2 bg-white border border-genesis-border rounded-xl px-3 py-1.5 xs:py-1 animate-in fade-in duration-200 w-full xs:w-auto">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="px-2 py-0.5 text-[12px] bg-transparent border-none focus:outline-none font-bold text-genesis-textMain w-full xs:w-auto text-center" 
              />
              <span className="text-genesis-textSub text-[12px]">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="px-2 py-0.5 text-[12px] bg-transparent border-none focus:outline-none font-bold text-genesis-textMain w-full xs:w-auto text-center" 
              />
            </div>
          )}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-lg transition-all hover:-translate-y-0.5"
          >
            <FileDown size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Resort Specific KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Booking Revenue</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-display font-bold text-genesis-textMain">{fmt(summary?.totalRevenue)}</h3>
            <span className="text-[11px] font-bold text-genesis-success mb-1 flex items-center gap-0.5">
              <TrendingUp size={12} /> Live
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Laundry Costs</p>
          <h3 className="text-2xl font-display font-bold text-genesis-textMain">{fmt(transactions.filter(t => t.description.toLowerCase().includes('laundry')).reduce((s, t) => s + t.amount, 0))}</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Staff Payroll</p>
          <h3 className="text-2xl font-display font-bold text-genesis-textMain">{fmt(transactions.filter(t => t.category === 'Salary').reduce((s, t) => s + t.amount, 0))}</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Total Expenses</p>
          <h3 className="text-2xl font-display font-bold text-genesis-textMain text-genesis-error">{fmt(summary?.totalExpenses)}</h3>
        </div>
      </div>

      {/* Resort Charts */}
      <div className="bg-white p-8 rounded-[32px] border border-genesis-border shadow-sm">
        <h4 className="text-[17px] font-bold text-genesis-textMain mb-8 flex items-center gap-2">
          <Waves size={18} className="text-indigo-500" /> Revenue Flow
        </h4>
        <div className="h-[250px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrends}>
              <defs>
                <linearGradient id="resortColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F4" />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                formatter={(v) => fmt(v)}
              />
              <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fillOpacity={1} fill="url(#resortColor)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-[24px] border border-genesis-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-genesis-border flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gray-50/30">
          <h3 className="text-[17px] font-bold text-genesis-textMain">Resort Audit Log</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-genesis-textSub" size={16} />
            <input 
              type="text" 
              placeholder="Search bookings, salary..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-genesis-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 w-full"
            />
          </div>
        </div>
        {/* Mobile View */}
        <div className="md:hidden divide-y divide-genesis-border">
          {currentTransactions.length > 0 ? (
            currentTransactions.map(renderMobileCard)
          ) : (
            <div className="py-12 text-center text-genesis-textSub text-[14px]">No transactions match your search.</div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-genesis-textSub font-bold border-b border-genesis-border">
                <th className="py-4 px-8">Date</th>
                <th className="py-4 px-8">Category</th>
                <th className="py-4 px-8">Description</th>
                <th className="py-4 px-8">Amount</th>
                <th className="py-4 px-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-genesis-border">
              {currentTransactions.map((tx, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-8 text-[13px] font-mono text-genesis-textSub">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-4 px-8">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tx.category === 'Income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-4 px-8 text-[13px] font-medium text-genesis-textMain">{tx.description}</td>
                  <td className="py-4 px-8 font-mono font-bold text-[13px]">{tx.category === 'Income' ? '+' : '-'}{fmt(tx.amount)}</td>
                  <td className="py-4 px-8">
                    <span className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider">{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination logic here (similar to previous) */}
      </div>
    </div>
  );
};

export default ResortReport;

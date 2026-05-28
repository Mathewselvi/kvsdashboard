import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Store, FileDown, Calendar, Search, ChevronLeft, ChevronRight, 
  TrendingUp, ShoppingCart, Tag, UserCheck, ArrowLeft, Package
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fmt = (n = 0) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const StoreReport = () => {
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
      let url = `/reports?type=${reportType}&business=store`;
      if (reportType === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch store reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const token = localStorage.getItem('token');
    let url = `${api.defaults.baseURL}/reports/export?type=${reportType}&business=store&token=${token}`;
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
  const totalCardamomKG = data?.raw?.rawPurchases?.reduce((s, p) => s + (p.rawWeightKG || 0), 0) || 0;

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          ['Income', 'Drying'].includes(tx.category) ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
        }`}>
          {tx.category === 'Income' ? 'SALE' : (tx.category === 'Drying' ? 'DRYING' : 'EXPENSE')}
        </span>
      </div>
      <div className="flex justify-between text-[13px]">
        <span className="text-genesis-textSub">Amount</span>
        <span className={`font-mono font-bold ${['Income', 'Drying'].includes(tx.category) ? 'text-genesis-success' : 'text-genesis-error'}`}>
          {['Income', 'Drying'].includes(tx.category) ? '+' : '-'}{fmt(tx.amount)}
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link to="/reports" className="flex items-center gap-2 text-[12px] font-bold text-genesis-textSub hover:text-genesis-primary transition-colors mb-4">
            <ArrowLeft size={14} /> Back to Reports Hub
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Store size={20} />
            </div>
            <h1 className="text-[28px] font-display font-bold text-genesis-textMain tracking-tight">Cardamom Store Audit</h1>
          </div>
          <p className="text-[14px] text-genesis-textSub">Tracking purchases, sales volumes, and seller balance settlements.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-white border border-genesis-border rounded-xl p-1 flex flex-wrap justify-center sm:flex-nowrap">
            {['weekly', 'monthly', 'yearly', 'custom'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[12px] font-bold capitalize transition-all ${
                  reportType === type ? 'bg-amber-500 text-white shadow-md' : 'text-genesis-textSub hover:bg-gray-50'
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

      {/* Store KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Total Revenue</p>
          <h3 className="text-2xl font-display font-bold text-genesis-textMain">{fmt(summary?.totalRevenue)}</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Drying Income</p>
          <h3 className="text-2xl font-display font-bold text-genesis-textMain">{fmt(transactions.filter(t => t.category === 'Drying').reduce((s, t) => s + t.amount, 0))}</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Cardamom Dried</p>
          <h3 className="text-2xl font-display font-bold text-emerald-600">{totalCardamomKG.toLocaleString('en-IN')} KG</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Pending Settlements</p>
          <h3 className="text-2xl font-display font-bold text-amber-600">{fmt(summary?.pendingDues)}</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Net Margin</p>
          <h3 className="text-2xl font-display font-bold text-genesis-primary">{fmt(summary?.netProfit)}</h3>
        </div>
      </div>

      {/* Store Charts */}
      <div className="bg-white p-8 rounded-[32px] border border-genesis-border shadow-sm">
        <h4 className="text-[17px] font-bold text-genesis-textMain mb-8 flex items-center gap-2">
          <Package size={18} className="text-amber-500" /> Inventory Movement (Value)
        </h4>
        <div className="h-[250px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F4" />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                formatter={(v) => fmt(v)}
              />
              <Bar dataKey="revenue" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Sales" />
              <Bar dataKey="expenses" fill="#EF4444" radius={[6, 6, 0, 0]} name="Purchases" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-[24px] border border-genesis-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-genesis-border flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gray-50/30">
          <h3 className="text-[17px] font-bold text-genesis-textMain">Inventory & Cash Flow Log</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-genesis-textSub" size={16} />
            <input 
              type="text" 
              placeholder="Search party, item..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-genesis-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-500/10 w-full"
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
                <th className="py-4 px-8">Type</th>
                <th className="py-4 px-8">Party / Description</th>
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
                      ['Income', 'Drying'].includes(tx.category) ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {tx.category === 'Income' ? 'Sale' : (tx.category === 'Drying' ? 'Drying' : tx.category)}
                    </span>
                  </td>
                  <td className="py-4 px-8 text-[13px] font-medium text-genesis-textMain">{tx.description}</td>
                  <td className="py-4 px-8 font-mono font-bold text-[13px]">{['Income', 'Drying'].includes(tx.category) ? '+' : '-'}{fmt(tx.amount)}</td>
                  <td className="py-4 px-8">
                    <span className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider">{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreReport;

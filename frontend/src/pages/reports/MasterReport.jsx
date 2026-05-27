import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Landmark, FileDown, Calendar, Search, ChevronLeft, ChevronRight, 
  TrendingUp, BarChart4, PieChart, Activity, ArrowLeft, Globe
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fmt = (n = 0) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const MasterReport = () => {
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reportType !== 'custom' || (startDate && endDate)) {
      fetchReport();
    }
  }, [reportType, startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/reports?type=${reportType}&business=all`;
      if (reportType === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch master reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const token = localStorage.getItem('token');
    let url = `${api.defaults.baseURL}/reports/export?type=${reportType}&business=all&token=${token}`;
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

  const { summary, businessComparison = [] } = data || {};

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link to="/reports" className="flex items-center gap-2 text-[12px] font-bold text-genesis-textSub hover:text-genesis-primary transition-colors mb-4">
            <ArrowLeft size={14} /> Back to Reports Hub
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg">
              <Landmark size={20} />
            </div>
            <h1 className="text-[28px] font-display font-bold text-genesis-textMain tracking-tight">Master Financial Audit</h1>
          </div>
          <p className="text-[14px] text-genesis-textSub">Consolidated Profit & Loss across all business subsidiaries.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-white border border-genesis-border rounded-xl p-1 flex flex-wrap justify-center sm:flex-nowrap">
            {['weekly', 'monthly', 'yearly', 'custom'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[12px] font-bold capitalize transition-all ${
                  reportType === type ? 'bg-gray-900 text-white shadow-md' : 'text-genesis-textSub hover:bg-gray-50'
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
            className="flex items-center justify-center gap-2 bg-genesis-primary hover:bg-genesis-primaryHover text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-lg transition-all hover:-translate-y-0.5"
          >
            <FileDown size={18} />
            Master Export
          </button>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-genesis-border shadow-sm">
          <p className="text-[11px] font-bold text-genesis-textSub uppercase tracking-widest mb-2">Total Group Revenue</p>
          <h3 className="text-3xl font-display font-bold text-genesis-textMain">{fmt(summary?.totalRevenue)}</h3>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-genesis-border shadow-sm">
          <p className="text-[11px] font-bold text-genesis-textSub uppercase tracking-widest mb-2">Total Group Expenses</p>
          <h3 className="text-3xl font-display font-bold text-genesis-error">{fmt(summary?.totalExpenses)}</h3>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-genesis-border shadow-sm border-b-4 border-b-genesis-primary">
          <p className="text-[11px] font-bold text-genesis-textSub uppercase tracking-widest mb-2">Net Group Profit</p>
          <h3 className="text-3xl font-display font-bold text-genesis-primary">{fmt(summary?.netProfit)}</h3>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-genesis-border shadow-sm">
          <p className="text-[11px] font-bold text-genesis-textSub uppercase tracking-widest mb-2">Settled Capital</p>
          <h3 className="text-3xl font-display font-bold text-genesis-success">{fmt(summary?.paidSettlements)}</h3>
        </div>
      </div>

      {/* Business Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-genesis-border shadow-sm">
          <h4 className="text-[17px] font-bold text-genesis-textMain mb-8 flex items-center gap-2">
            <BarChart4 size={18} className="text-genesis-primary" /> Revenue by Business Unit
          </h4>
          <div className="h-[250px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={businessComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} formatter={(v) => fmt(v)} />
                <Bar dataKey="revenue" fill="#6366F1" radius={[8, 8, 0, 0]}>
                  {businessComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4F46E5' : index === 1 ? '#F59E0B' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-genesis-border shadow-sm">
          <h4 className="text-[17px] font-bold text-genesis-textMain mb-8 flex items-center gap-2">
            <PieChart size={18} className="text-genesis-error" /> Expense Distribution
          </h4>
          <div className="h-[250px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={businessComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F1F4" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} formatter={(v) => fmt(v)} />
                <Bar dataKey="expenses" fill="#EF4444" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterReport;

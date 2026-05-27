import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Leaf, FileDown, Calendar, Search, ChevronLeft, ChevronRight, 
  TrendingUp, Users, FlaskConical, Hammer, ArrowLeft, Droplets, MapPin
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n = 0) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const PLANTATIONS = [
  {
    name: 'English Medium',
    subtitle: 'English Medium Valley',
    desc: 'Main valley plantation specializing in high-grade cardamom yield.',
    stats: 'Premium Grade Cardamom'
  },
  {
    name: 'Nellikad',
    subtitle: 'Nellikad Hillside',
    desc: 'Sloped terrain plantation with rich organic cardamom output.',
    stats: 'Organic Cultivation'
  },
  {
    name: '10 Acre',
    subtitle: '10 Acre Plot',
    desc: 'Medium-sized tract optimized for intensive irrigation and high yield.',
    stats: 'Irrigated Cultivation'
  },
  {
    name: '20 Acre',
    subtitle: '20 Acre Plot',
    desc: 'Largest plantation segment for high-volume cardamom collections.',
    stats: 'High-Volume Tract'
  }
];

const ThottamReport = () => {
  const [selectedPlantation, setSelectedPlantation] = useState(null);
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (selectedPlantation) {
      if (reportType !== 'custom' || (startDate && endDate)) {
        fetchReport();
      }
    }
  }, [selectedPlantation, reportType, startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/reports?type=${reportType}&business=thottam&plantation=${selectedPlantation}`;
      if (reportType === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      setData(res.data);
      setCurrentPage(1); // Reset page on data load
    } catch (err) {
      console.error('Failed to fetch thottam reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const token = localStorage.getItem('token');
    let url = `${api.defaults.baseURL}/reports/export?type=${reportType}&business=thottam&plantation=${selectedPlantation}&token=${token}`;
    if (reportType === 'custom' && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    window.open(url, '_blank');
  };

  // Plantation Selection Screen
  if (!selectedPlantation) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div>
          <Link to="/reports" className="flex items-center gap-2 text-[12px] font-bold text-genesis-textSub hover:text-genesis-primary transition-colors mb-4">
            <ArrowLeft size={14} /> Back to Reports Hub
          </Link>
          <p className="text-[11px] font-display font-bold text-emerald-600 uppercase tracking-widest mb-1">Agricultural Performance</p>
          <h1 className="text-[32px] font-display font-bold text-genesis-textMain leading-tight tracking-[-0.02em]">Thottam Plantation Reports</h1>
          <p className="text-[15px] text-genesis-textSub font-body mt-2">Select a specific plantation sector below to view detailed operational audits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANTATIONS.map((p, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedPlantation(p.name)}
              className="group text-left bg-white border border-genesis-border rounded-[24px] p-8 hover:shadow-2xl hover:shadow-emerald-600/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-emerald-50 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Leaf size={28} />
                </div>
                <div className="bg-gray-50 px-3 py-1 rounded-full border border-genesis-border flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-600" />
                  <span className="text-[11px] font-bold text-genesis-textSub uppercase tracking-wider">{p.stats}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-genesis-textMain flex items-center gap-2">
                  {p.name}
                  <ChevronRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-emerald-600" />
                </h3>
                <p className="text-sm text-genesis-textSub leading-relaxed pr-8">
                  {p.desc}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-genesis-border flex items-center justify-between">
                <span className="text-[12px] font-bold text-emerald-600">View Auditing Report</span>
                <span className="text-[11px] text-genesis-textSub font-mono uppercase tracking-wider">{p.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Loading Screen for Report Data
  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const { transactions = [], dailyTrends = [], raw = {} } = data || {};

  // Custom Calculations
  const labourWages = transactions.filter(t => t.category === 'Salary').reduce((sum, t) => sum + t.amount, 0);
  const dryYield = raw.collections?.reduce((sum, c) => sum + (c.dryQuantityKG || 0), 0) || 0;
  const maintenanceExpenses = transactions.filter(t => t.category === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = labourWages + maintenanceExpenses;

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
          <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{new Date(tx.date).toLocaleDateString('en-IN')}</p>
        </div>
        <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${
          tx.category === 'Salary' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {tx.category === 'Salary' ? 'LABOUR WAGE' : 'MAINTENANCE'}
        </span>
      </div>
      <div className="flex justify-between text-[13px]">
        <span className="text-genesis-textSub">Cost</span>
        <span className="font-mono font-bold text-genesis-error text-[13px]">{fmt(tx.amount)}</span>
      </div>
      <div className="flex justify-between text-[13px]">
        <span className="text-genesis-textSub">Status</span>
        <span className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider">{tx.status}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <button 
            onClick={() => { setSelectedPlantation(null); setData(null); }} 
            className="flex items-center gap-2 text-[12px] font-bold text-genesis-textSub hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Plantation Selection
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Leaf size={20} />
            </div>
            <div>
              <h1 className="text-[28px] font-display font-bold text-genesis-textMain tracking-tight">Thottam: {selectedPlantation}</h1>
            </div>
            
            {/* Quick Switch Dropdown */}
            <select
              value={selectedPlantation}
              onChange={(e) => {
                setSelectedPlantation(e.target.value);
                setData(null);
              }}
              className="ml-4 bg-white border border-genesis-border rounded-xl px-3 py-1.5 text-[12px] font-bold text-genesis-textMain focus:outline-none focus:ring-[3px] focus:ring-emerald-500/10 focus:border-emerald-600 transition-all cursor-pointer"
            >
              {PLANTATIONS.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <p className="text-[14px] text-genesis-textSub">Monitoring dry yield, medicine applications, and labour wages for {selectedPlantation}.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-white border border-genesis-border rounded-xl p-1 flex flex-wrap justify-center sm:flex-nowrap">
            {['weekly', 'monthly', 'yearly', 'custom'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[12px] font-bold capitalize transition-all ${
                  reportType === type ? 'bg-emerald-600 text-white shadow-md' : 'text-genesis-textSub hover:bg-gray-50'
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

      {/* Thottam KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Dry Yield (KG)</p>
          <h3 className="text-2xl font-display font-bold text-emerald-600">{dryYield.toLocaleString()} kg</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Labour Wages</p>
          <h3 className="text-2xl font-display font-bold text-genesis-textMain">{fmt(labourWages)}</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Maintenance Expenses</p>
          <h3 className="text-2xl font-display font-bold text-genesis-textMain">{fmt(maintenanceExpenses)}</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-genesis-border shadow-sm">
          <p className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider mb-1">Total Plantation Cost</p>
          <h3 className="text-2xl font-display font-bold text-genesis-error">{fmt(totalExpenses)}</h3>
        </div>
      </div>

      {/* Thottam Charts */}
      <div className="bg-white p-8 rounded-[32px] border border-genesis-border shadow-sm">
        <h4 className="text-[17px] font-bold text-genesis-textMain mb-8 flex items-center gap-2">
          <Droplets size={18} className="text-emerald-500" /> Operational Cost Trend
        </h4>
        <div className="h-[250px] sm:h-[350px]">
          {dailyTrends && dailyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="thottamColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F4" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                  formatter={(v) => fmt(v)}
                />
                <Area type="monotone" dataKey="expenses" stroke="#059669" fillOpacity={1} fill="url(#thottamColor)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full text-genesis-textSub text-sm">No transaction trend data in this period.</div>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-[24px] border border-genesis-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-genesis-border flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gray-50/30">
          <h3 className="text-[17px] font-bold text-genesis-textMain">Labour & Field Log</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-genesis-textSub" size={16} />
            <input 
              type="text" 
              placeholder="Search workers, medicine..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-genesis-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/10 w-full"
            />
          </div>
        </div>
        {/* Mobile View */}
        <div className="md:hidden divide-y divide-genesis-border">
          {currentTransactions.length > 0 ? (
            currentTransactions.map(renderMobileCard)
          ) : (
            <div className="py-12 text-center text-genesis-textSub text-sm">
              No transactions match your query in this period.
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-genesis-textSub font-bold border-b border-genesis-border">
                <th className="py-4 px-8">Date</th>
                <th className="py-4 px-8">Activity</th>
                <th className="py-4 px-8">Details</th>
                <th className="py-4 px-8">Cost</th>
                <th className="py-4 px-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-genesis-border">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-8 text-[13px] font-mono text-genesis-textSub">{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-4 px-8">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tx.category === 'Salary' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {tx.category === 'Salary' ? 'LABOUR WAGE' : 'MAINTENANCE'}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-[13px] font-medium text-genesis-textMain">{tx.description}</td>
                    <td className="py-4 px-8 font-mono font-bold text-[13px] text-genesis-error">{fmt(tx.amount)}</td>
                    <td className="py-4 px-8">
                      <span className="text-[10px] font-bold text-genesis-textSub uppercase tracking-wider">{tx.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-genesis-textSub text-sm">
                    No transactions match your query in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-genesis-border flex items-center justify-between bg-gray-50/20">
            <span className="text-[13px] text-genesis-textSub">
              Showing page <strong className="text-genesis-textMain">{currentPage}</strong> of <strong className="text-genesis-textMain">{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-genesis-border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-genesis-border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThottamReport;

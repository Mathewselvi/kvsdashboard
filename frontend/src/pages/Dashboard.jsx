import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, Hotel, Store, Leaf,
  Clock, AlertCircle, IndianRupee,
} from 'lucide-react';

const fmt = (n = 0) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
  : n >= 1000  ? `₹${(n / 1000).toFixed(1)}K`
  : `₹${Math.round(n).toLocaleString('en-IN')}`;

const fmtFull = (n = 0) =>
  `₹${Math.round(n).toLocaleString('en-IN')}`;

const MODULE_BADGE = {
  'Beyond Heaven': 'bg-indigo-50 text-genesis-primary',
  'Store':         'bg-amber-50 text-genesis-warning',
  'Thottam':       'bg-green-50 text-genesis-success',
};

const Dashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-genesis-primary" />
      </div>
    );
  }

  const {
    totalIncome = 0, totalExpenses = 0, currentProfit = 0,
    pendingPayments = 0, pendingSalaries = 0,
    beyondHeaven = {}, store = {}, thottam = {},
    monthlyData = [], recentTransactions = [],
  } = data || {};

  const totalPending = pendingPayments + pendingSalaries;
  const maxIncome    = Math.max(...monthlyData.map(d => d.income), 1);

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-display font-bold text-genesis-primary uppercase tracking-widest mb-2">
            Business Overview
          </p>
          <h1 className="text-[32px] md:text-[40px] font-display font-bold text-genesis-textMain leading-none mb-3 tracking-[-0.03em]">
            KVS Dashboard
          </h1>
          <p className="text-[14px] md:text-[15px] text-genesis-textSub font-body max-w-xl">
            Live summary across{' '}
            <span className="font-semibold text-genesis-textMain">Beyond Heaven</span>,{' '}
            <span className="font-semibold text-genesis-textMain">Cardamom Store</span> &amp;{' '}
            <span className="font-semibold text-genesis-textMain">Thottam</span>.
          </p>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-genesis-surface p-6 rounded-xl border border-genesis-border hover:-translate-y-0.5 hover:shadow-genesis transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <ArrowUpRight size={16} className="text-genesis-success" />
            </div>
            <span className="text-[11px] font-display font-bold text-genesis-textSub uppercase tracking-wider">Total Income</span>
          </div>
          <h3 className="text-3xl font-display font-bold text-genesis-textMain tracking-tight">{fmt(totalIncome)}</h3>
          <p className="text-[12px] text-genesis-textSub mt-1">All modules combined</p>
        </div>

        <div className="bg-genesis-surface p-6 rounded-xl border border-genesis-border hover:-translate-y-0.5 hover:shadow-genesis transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <ArrowDownRight size={16} className="text-genesis-error" />
            </div>
            <span className="text-[11px] font-display font-bold text-genesis-textSub uppercase tracking-wider">Total Expenses</span>
          </div>
          <h3 className="text-3xl font-display font-bold text-genesis-textMain tracking-tight">{fmt(totalExpenses)}</h3>
          <p className="text-[12px] text-genesis-textSub mt-1">All modules combined</p>
        </div>

        <div className="bg-genesis-surface p-6 rounded-xl border border-genesis-border hover:-translate-y-0.5 hover:shadow-genesis transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Clock size={16} className="text-genesis-warning" />
            </div>
            <span className="text-[11px] font-display font-bold text-genesis-textSub uppercase tracking-wider">Pending Dues</span>
          </div>
          <h3 className={`text-3xl font-display font-bold tracking-tight ${totalPending > 0 ? 'text-genesis-warning' : 'text-genesis-textMain'}`}>
            {fmt(totalPending)}
          </h3>
          <p className="text-[12px] text-genesis-textSub mt-1">Payments &amp; salaries</p>
        </div>

        {/* Net Profit — highlighted primary card */}
        <div className="bg-genesis-primary p-6 rounded-xl shadow-btn hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
              <TrendingUp size={16} />
            </div>
            <span className="text-[11px] font-display font-bold text-indigo-100 uppercase tracking-wider">Net Profit</span>
          </div>
          <h3 className="text-3xl font-display font-bold text-white tracking-tight relative z-10">{fmt(currentProfit)}</h3>
          <p className="text-[12px] text-indigo-200 mt-1 relative z-10">Income minus all expenses</p>
        </div>

      </div>

      {/* ── Module Breakdown ────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5">

        <div className="flex-1 bg-genesis-surface p-4 rounded-xl border border-genesis-border hover:-translate-y-0.5 hover:shadow-genesis transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <Hotel size={15} className="text-genesis-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-genesis-textMain text-[13px] leading-tight">Beyond Heaven</p>
              <p className="text-[11px] text-genesis-textSub">Resort</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-genesis-textSub">Revenue</span>
              <span className="text-[12.5px] font-bold text-genesis-success">{fmtFull(beyondHeaven.income)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-genesis-textSub">Expenses</span>
              <span className="text-[12.5px] font-semibold text-genesis-textMain">{fmtFull(beyondHeaven.expenses)}</span>
            </div>
            <div className="h-px bg-genesis-border" />
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-semibold text-genesis-textSub">Net Profit</span>
              <span className={`text-[12.5px] font-bold ${(beyondHeaven.profit || 0) >= 0 ? 'text-genesis-success' : 'text-genesis-error'}`}>
                {fmtFull(beyondHeaven.profit)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-genesis-surface p-4 rounded-xl border border-genesis-border hover:-translate-y-0.5 hover:shadow-genesis transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <Store size={15} className="text-genesis-warning" />
            </div>
            <div>
              <p className="font-display font-bold text-genesis-textMain text-[13px] leading-tight">Cardamom Store</p>
              <p className="text-[11px] text-genesis-textSub">KVS Store</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-genesis-textSub">Cardamom Sales</span>
              <span className="text-[12.5px] font-bold text-genesis-success">{fmtFull(store.income)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-genesis-textSub">Drying Income</span>
              <span className="text-[12.5px] font-bold text-genesis-success">{fmtFull(store.rawPurchasesTotal)}</span>
            </div>
            <div className="h-px bg-genesis-border" />
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-semibold text-genesis-textSub">Pending Drying Dues</span>
              <span className={`text-[12.5px] font-bold ${(store.pendingPayments || 0) > 0 ? 'text-genesis-warning' : 'text-genesis-textSub'}`}>
                {fmtFull(store.pendingPayments)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-genesis-surface p-4 rounded-xl border border-genesis-border hover:-translate-y-0.5 hover:shadow-genesis transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Leaf size={15} className="text-genesis-success" />
            </div>
            <div>
              <p className="font-display font-bold text-genesis-textMain text-[13px] leading-tight">Thottam</p>
              <p className="text-[11px] text-genesis-textSub">Plantation</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-genesis-textSub">Dry Yield</span>
              <span className="text-[12.5px] font-semibold text-genesis-textMain">{(thottam.totalDryKG || 0).toFixed(1)} KG</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-genesis-textSub">Total Expenses</span>
              <span className="text-[12.5px] font-semibold text-genesis-textMain">{fmtFull(thottam.expenses)}</span>
            </div>
            <div className="h-px bg-genesis-border" />
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-semibold text-genesis-textSub">Labour Pending</span>
              <span className={`text-[12.5px] font-bold ${(thottam.labourPending || 0) > 0 ? 'text-genesis-warning' : 'text-genesis-textSub'}`}>
                {fmtFull(thottam.labourPending)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Chart + Pending Panel ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-genesis-surface p-8 rounded-xl border border-genesis-border hover:shadow-genesis transition-all duration-300">
          <div className="mb-6">
            <h3 className="text-[20px] font-display font-bold text-genesis-textMain">Monthly Income</h3>
            <p className="text-[13px] text-genesis-textSub mt-1">Last 12 months across all modules</p>
          </div>

          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-genesis-border">
            <div className="min-w-[480px] flex flex-col gap-2">
              <div className="flex items-end gap-1.5 h-[200px]">
                {monthlyData.map((item, i) => {
                  const isActive = i === monthlyData.length - 1;
                  const barH = item.income > 0
                    ? Math.max(Math.round((item.income / maxIncome) * 180), 6)
                    : 4;
                  return (
                    <div
                      key={i}
                      title={fmtFull(item.income)}
                      className="flex-1 rounded-t-sm transition-all duration-150 cursor-default"
                      style={{
                        height: barH,
                        background: isActive ? '#6366F1' : '#E0E1FA',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = isActive ? '#4F46E5' : '#C7D2FE'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isActive ? '#6366F1' : '#E0E1FA'; }}
                    />
                  );
                })}
              </div>

              <div className="h-px bg-[#E8E8EC]" />

              <div className="flex gap-1.5">
                {monthlyData.map((item, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-[9px] font-mono font-semibold"
                    style={{
                      color: i === monthlyData.length - 1 ? '#6366F1' : '#9C9C9C',
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Summary */}
        <div className="bg-genesis-primary text-white p-8 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <AlertCircle size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-display font-bold text-indigo-200 uppercase tracking-widest mb-3">Outstanding</p>
            <h3 className="text-2xl font-display font-bold leading-tight mb-2">Pending Overview</h3>
            <p className="text-[14px] text-indigo-100 leading-relaxed opacity-90 mb-6">
              Uncleared dues across all three divisions that need your attention.
            </p>
          </div>
          <div className="relative z-10 space-y-3">
            <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-0.5">
                <IndianRupee size={13} className="text-indigo-200" />
                <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">Drying Dues</p>
              </div>
              <p className="text-[20px] font-display font-bold text-white">{fmtFull(pendingPayments)}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-0.5">
                <Clock size={13} className="text-indigo-200" />
                <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">Salary Dues</p>
              </div>
              <p className="text-[20px] font-display font-bold text-white">{fmtFull(pendingSalaries)}</p>
            </div>
            <div className="border-t border-white/20 pt-3 flex justify-between items-center">
              <span className="text-[12px] font-bold text-indigo-200 uppercase tracking-wider">Total</span>
              <span className="text-[22px] font-display font-bold text-white">{fmtFull(totalPending)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Recent Activity ──────────────────────────────────────────────────── */}
      <div className="bg-genesis-surface rounded-xl border border-genesis-border overflow-hidden hover:shadow-genesis transition-all duration-300">
        <div className="p-6 border-b border-genesis-border flex justify-between items-center bg-white">
          <h3 className="text-[18px] font-display font-bold text-genesis-textMain">Recent Activity</h3>
          <p className="text-[12px] text-genesis-textSub">Latest entries across all modules</p>
        </div>
        <div className="divide-y divide-genesis-border">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-[14px] text-genesis-textSub">No recent activity found.</div>
          ) : recentTransactions.map((tx, i) => (
            <div key={i} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${tx.type === 'Income' ? 'bg-genesis-success' : 'bg-genesis-error'}`} />
                <div className="min-w-0">
                  <p className="font-display font-bold text-genesis-textMain text-[14px] truncate">{tx.desc}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${MODULE_BADGE[tx.module] || 'bg-gray-100 text-genesis-textSub'}`}>
                      {tx.module}
                    </span>
                    <span className="text-[11px] font-mono text-genesis-textSub">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-4">
                <p className={`font-mono font-semibold text-[14px] ${tx.type === 'Income' ? 'text-genesis-success' : 'text-genesis-textMain'}`}>
                  {tx.type === 'Income' ? '+' : '–'}{fmtFull(tx.amount)}
                </p>
                <span className={`px-2 py-[2px] rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  tx.type === 'Income' ? 'bg-genesis-success/10 text-genesis-success' : 'bg-gray-100 text-genesis-textSub'
                }`}>
                  {tx.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>



    </div>
  );
};

export default Dashboard;

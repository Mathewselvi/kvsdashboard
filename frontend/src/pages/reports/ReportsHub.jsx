import { Link } from 'react-router-dom';
import { Hotel, Store, Leaf, FilePieChart, ArrowRight, BarChart3, PieChart, Landmark } from 'lucide-react';

const ReportsHub = () => {
  const reportCards = [
    {
      title: 'Beyond Heaven Resort',
      description: 'Analyze booking revenue, laundry costs, and staff payroll.',
      icon: Hotel,
      path: '/reports/resort',
      color: 'bg-indigo-600',
      stats: 'Revenue, Laundry, Salaries',
      trend: 'Detailed resort auditing'
    },
    {
      title: 'Cardamom Store',
      description: 'Track inventory purchases, sales records, and seller balances.',
      icon: Store,
      path: '/reports/store',
      color: 'bg-amber-500',
      stats: 'Sales, Purchases, Balances',
      trend: 'Supply chain analytics'
    },
    {
      title: 'Thottam Plantation',
      description: 'Monitor labour wages, medicine expenses, and dry yield.',
      icon: Leaf,
      path: '/reports/thottam',
      color: 'bg-emerald-600',
      stats: 'Yield, Labour, Maintenance',
      trend: 'Agricultural performance'
    },
    {
      title: 'Master Consolidated',
      description: 'Full financial overview across all business units.',
      icon: Landmark,
      path: '/reports/master',
      color: 'bg-gray-900',
      stats: 'Global Profit/Loss',
      trend: 'Executive summary'
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <p className="text-[11px] font-display font-bold text-genesis-primary uppercase tracking-widest mb-1">Central Reporting System</p>
        <h1 className="text-[32px] font-display font-bold text-genesis-textMain leading-tight tracking-[-0.02em]">Reports Hub</h1>
        <p className="text-[15px] text-genesis-textSub font-body mt-2">Select a business unit to generate detailed audit reports.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((card, i) => (
          <Link 
            key={i} 
            to={card.path}
            className="group relative bg-white border border-genesis-border rounded-[24px] p-8 hover:shadow-2xl hover:shadow-genesis-primary/5 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={28} />
              </div>
              <div className="bg-gray-50 px-3 py-1 rounded-full border border-genesis-border">
                <span className="text-[11px] font-bold text-genesis-textSub uppercase tracking-wider">{card.trend}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-genesis-textMain flex items-center gap-2">
                {card.title}
                <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-genesis-primary" />
              </h3>
              <p className="text-sm text-genesis-textSub leading-relaxed pr-8">
                {card.description}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-genesis-border flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-genesis-textSub uppercase tracking-widest">Key Metrics</span>
                <span className="text-[13px] font-bold text-genesis-textMain">{card.stats}</span>
              </div>
              <button className="h-10 w-10 rounded-full border border-genesis-border flex items-center justify-center group-hover:bg-genesis-primary group-hover:border-genesis-primary group-hover:text-white transition-all duration-300">
                <BarChart3 size={18} />
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Action Info */}
      <div className="bg-gray-50 border border-dashed border-genesis-border rounded-2xl p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-genesis-primary border border-genesis-border">
          <FilePieChart size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-genesis-textMain">Need a quick summary?</p>
          <p className="text-[13px] text-genesis-textSub">All reports can be exported to Excel with high-fidelity formatting for legal or accounting purposes.</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsHub;

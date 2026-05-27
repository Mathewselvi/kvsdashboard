import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Hotel, Store, Leaf, Settings, LogOut, Bell, HelpCircle, Search, Menu, X, BarChart4 } from 'lucide-react';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Beyond Heaven', path: '/beyond-heaven', icon: Hotel },
    { name: 'Cardamom Store', path: '/store', icon: Store },
    { name: 'Thottam', path: '/thottam', icon: Leaf },
    { name: 'Reports', path: '/reports', icon: BarChart4 },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-genesis-bg flex font-body text-genesis-textMain">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[260px] bg-genesis-surface flex-col z-20 sticky top-0 h-screen border-r border-genesis-border shrink-0">
        <div className="p-6 pt-8 pb-10 flex flex-col gap-1">
          <h2 className="text-xl font-display font-bold text-genesis-textMain leading-tight">KVS Spices</h2>
          <p className="text-[13px] text-genesis-textSub">Owner Dashboard</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? 'bg-genesis-primary/10 text-genesis-primary shadow-[inset_3px_0_0_0_#6366F1]' 
                    : 'text-genesis-textSub hover:bg-gray-50 hover:text-genesis-textMain'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
          
          <div className="pt-8 pb-2 px-4">
            <p className="text-xs font-display text-genesis-textSub uppercase tracking-wider font-semibold">Settings</p>
          </div>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? 'bg-genesis-primary/10 text-genesis-primary shadow-[inset_3px_0_0_0_#6366F1]' 
                  : 'text-genesis-textSub hover:bg-gray-50 hover:text-genesis-textMain'
              }`
            }
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-genesis-border">
          <div className="bg-gray-50 p-4 rounded-xl border border-genesis-border mb-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-genesis-primary text-white rounded-full flex items-center justify-center font-display font-bold text-sm shadow-sm">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-genesis-textMain truncate">{user?.email || 'admin@kvs.com'}</p>
              <p className="text-[12px] text-genesis-textSub">Administrator</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-transparent border border-genesis-error text-genesis-error hover:bg-red-50 p-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-genesis-surface flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pt-8 pb-10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-display font-bold text-genesis-textMain leading-tight">KVS Spices</h2>
            <p className="text-[13px] text-genesis-textSub">Owner Dashboard</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-genesis-textSub hover:bg-gray-50 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? 'bg-genesis-primary/10 text-genesis-primary shadow-[inset_3px_0_0_0_#6366F1]' 
                    : 'text-genesis-textSub hover:bg-gray-50 hover:text-genesis-textMain'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
          
          <div className="pt-8 pb-2 px-4">
            <p className="text-xs font-display text-genesis-textSub uppercase tracking-wider font-semibold">Settings</p>
          </div>
          
          <NavLink
            to="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? 'bg-genesis-primary/10 text-genesis-primary shadow-[inset_3px_0_0_0_#6366F1]' 
                  : 'text-genesis-textSub hover:bg-gray-50 hover:text-genesis-textMain'
              }`
            }
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-genesis-border">
          <div className="bg-gray-50 p-4 rounded-xl border border-genesis-border mb-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-genesis-primary text-white rounded-full flex items-center justify-center font-display font-bold text-sm shadow-sm">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-genesis-textMain truncate">{user?.email || 'admin@kvs.com'}</p>
              <p className="text-[12px] text-genesis-textSub">Administrator</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-transparent border border-genesis-error text-genesis-error hover:bg-red-50 p-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="bg-genesis-surface/80 backdrop-blur-md border-b border-genesis-border px-4 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-10 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 -ml-2 text-genesis-textSub hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-genesis-textSub" size={16} />
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className="pl-9 pr-12 py-2 bg-gray-50 border border-genesis-border rounded-xl text-sm focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary w-full transition-all font-body text-genesis-textMain"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] text-genesis-textSub font-mono font-medium">
                <span className="bg-white border border-genesis-border px-1.5 py-0.5 rounded">⌘</span>
                <span className="bg-white border border-genesis-border px-1.5 py-0.5 rounded">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <button className="text-genesis-textSub hover:text-genesis-textMain transition-colors p-1">
              <Bell size={20} />
            </button>
            <button className="hidden sm:block text-genesis-textSub hover:text-genesis-textMain transition-colors p-1">
              <HelpCircle size={20} />
            </button>
            <span className="text-sm font-medium text-genesis-primary cursor-pointer hover:text-genesis-primaryHover transition-colors hidden xs:block">Dashboard</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="max-w-[1280px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};


export default Layout;


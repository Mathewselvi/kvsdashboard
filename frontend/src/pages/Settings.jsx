import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, Key, Hotel, Store, Leaf, 
  CheckCircle2, AlertCircle, Mail, Lock, ShieldCheck, IndianRupee, Trash2
} from 'lucide-react';

const TagList = ({ tags = [], onAdd, onRemove, placeholder, title, colorClass }) => {
  const [inputVal, setInputVal] = useState('');
  
  const handleAdd = (e) => {
    e.preventDefault();
    if (inputVal.trim() && !tags.includes(inputVal.trim())) {
      onAdd(inputVal.trim());
      setInputVal('');
    }
  };

  return (
    <div className="space-y-3 bg-white border border-genesis-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-sm font-display font-bold text-genesis-textMain">{title}</h3>
      <div className="flex flex-wrap gap-2 min-h-[48px] p-2 bg-gray-50 border border-genesis-border rounded-xl items-center">
        {tags.map((tag, idx) => (
          <span 
            key={idx} 
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all hover:scale-[1.03] ${colorClass}`}
          >
            {tag}
            <button 
              type="button" 
              onClick={() => onRemove(tag)} 
              className="hover:bg-black/10 rounded-full w-4 h-4 inline-flex items-center justify-center text-[11px] leading-none transition-colors"
            >
              ×
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-[12px] text-genesis-textSub italic px-2">No items configured</span>
        )}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input 
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={placeholder || 'Add new item...'}
          className="flex-grow px-3.5 py-2 bg-white border border-genesis-border rounded-xl text-xs focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all text-genesis-textMain font-body"
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
        >
          Add
        </button>
      </form>
    </div>
  );
};

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Profile fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Reset database states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(5);
  const [timerActive, setTimerActive] = useState(false);

  // Alerts
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Timer countdown hook
  useEffect(() => {
    let interval = null;
    if (timerActive && resetCountdown > 0) {
      interval = setInterval(() => {
        setResetCountdown(prev => prev - 1);
      }, 1000);
    } else if (resetCountdown === 0) {
      setTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, resetCountdown]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get settings
      const settingsRes = await api.get('/settings');
      setSettings(settingsRes.data);

      // Get profile
      const profileRes = await api.get('/auth/profile');
      setEmail(profileRes.data.email);
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      showNotification('error', 'Passwords do not match');
      return;
    }

    setUpdating(true);
    try {
      const payload = { email };
      if (password) payload.password = password;

      const res = await api.put('/auth/profile', payload);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      setPassword('');
      setConfirmPassword('');
      showNotification('success', 'Profile updated successfully');
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const saveSettingsField = async (fieldKey, newValue) => {
    setUpdating(true);
    try {
      const updatedData = { ...settings, [fieldKey]: newValue };
      const res = await api.put('/settings', { [fieldKey]: newValue });
      setSettings(res.data.settings || updatedData);
      showNotification('success', 'Configuration updated successfully');
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update configuration');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddListItem = (fieldKey, item) => {
    const currentList = settings[fieldKey] || [];
    if (!currentList.includes(item)) {
      saveSettingsField(fieldKey, [...currentList, item]);
    }
  };

  const handleRemoveListItem = (fieldKey, item) => {
    const currentList = settings[fieldKey] || [];
    saveSettingsField(fieldKey, currentList.filter(i => i !== item));
  };

  const handleOpenResetModal = () => {
    setShowResetModal(true);
    setResetCountdown(5);
    setTimerActive(true);
  };

  const handleExecuteReset = async () => {
    setUpdating(true);
    try {
      const res = await api.post('/settings/reset');
      showNotification('success', res.data.message || 'All data cleared successfully');
      setShowResetModal(false);
      setTimeout(() => {
        window.location.href = '/'; // Redirect to home
      }, 1500);
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to clear data');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-genesis-primary" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile & Security', icon: Key },
    { id: 'resort', name: 'Resort Config', icon: Hotel },
    { id: 'store', name: 'Cardamom Store', icon: Store },
    { id: 'thottam', name: 'Thottam Plantation', icon: Leaf },
    { id: 'reset', name: 'Database Reset', icon: AlertCircle },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <p className="text-[11px] font-display font-bold text-genesis-primary uppercase tracking-widest mb-1">System Control Panel</p>
        <h1 className="text-[28px] font-display font-bold text-genesis-textMain leading-tight tracking-[-0.02em] flex items-center gap-2.5">
          <SettingsIcon className="text-genesis-primary animate-spin-[spin_3s_linear_infinite]" size={26} />
          Settings
        </h1>
        <p className="text-[14px] text-genesis-textSub font-body mt-2">Manage security profiles and business operation rules.</p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-genesis border text-sm font-semibold animate-in slide-in-from-bottom duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-genesis-success' 
              : 'bg-red-50 border-red-200 text-genesis-error'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 bg-white p-2 rounded-2xl border border-genesis-border shadow-sm h-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 w-full ${
                activeTab === tab.id 
                  ? (tab.id === 'reset' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-900 text-white shadow-md')
                  : (tab.id === 'reset' ? 'text-red-500 hover:bg-red-50 font-bold' : 'text-genesis-textSub hover:bg-gray-50 hover:text-genesis-textMain')
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 bg-white border border-genesis-border rounded-[24px] p-6 md:p-8 shadow-sm min-h-[400px]">
          
          {/* TAB 1: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-display font-bold text-genesis-textMain flex items-center gap-2">
                  <ShieldCheck size={20} className="text-gray-900" />
                  Profile Security
                </h2>
                <p className="text-xs text-genesis-textSub mt-1">Update administrative logins and update standard encryption passwords.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-md">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-genesis-textSub">Login Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-genesis-textSub" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-genesis-border rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all text-genesis-textMain font-body"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-genesis-textSub">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-genesis-textSub" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-genesis-border rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all text-genesis-textMain font-body"
                    />
                  </div>
                  <p className="text-[11px] text-genesis-textSub">Leave blank to keep current password.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-genesis-textSub">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-genesis-textSub" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-genesis-border rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all text-genesis-textMain font-body"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={updating}
                  className="px-6 py-2.5 bg-genesis-primary hover:bg-genesis-primaryHover text-white rounded-xl text-xs font-bold shadow-btn hover:-translate-y-px transition-all disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: RESORT CONFIG */}
          {activeTab === 'resort' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-display font-bold text-genesis-textMain flex items-center gap-2">
                  <Hotel size={20} className="text-indigo-600" />
                  Beyond Heaven Resort Settings
                </h2>
                <p className="text-xs text-genesis-textSub mt-1">Configure sources of income and utility categorizations for resort bookings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TagList 
                  title="Booking / Income Sources"
                  tags={settings.bookingSources}
                  onAdd={(item) => handleAddListItem('bookingSources', item)}
                  onRemove={(item) => handleRemoveListItem('bookingSources', item)}
                  placeholder="e.g., Agoda"
                  colorClass="bg-indigo-50 text-indigo-700 border border-indigo-150"
                />

                <TagList 
                  title="Utility Bill Categories"
                  tags={settings.utilityTypes}
                  onAdd={(item) => handleAddListItem('utilityTypes', item)}
                  onRemove={(item) => handleRemoveListItem('utilityTypes', item)}
                  placeholder="e.g., Gas, Waste"
                  colorClass="bg-indigo-50 text-indigo-700 border border-indigo-150"
                />
              </div>
            </div>
          )}

          {/* TAB 3: CARDAMOM STORE */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-display font-bold text-genesis-textMain flex items-center gap-2">
                  <Store size={20} className="text-amber-600" />
                  Cardamom Store Settings
                </h2>
                <p className="text-xs text-genesis-textSub mt-1">Configure purchase grades and standard operational expense categories.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TagList 
                  title="Cardamom Quality Grades"
                  tags={settings.cardamomGrades}
                  onAdd={(item) => handleAddListItem('cardamomGrades', item)}
                  onRemove={(item) => handleRemoveListItem('cardamomGrades', item)}
                  placeholder="e.g., AGEB, AGB"
                  colorClass="bg-amber-50 text-amber-700 border border-amber-150"
                />

                <TagList 
                  title="Store Expense Categories"
                  tags={settings.storeExpenseCategories}
                  onAdd={(item) => handleAddListItem('storeExpenseCategories', item)}
                  onRemove={(item) => handleRemoveListItem('storeExpenseCategories', item)}
                  placeholder="e.g., Packaging, Firewood"
                  colorClass="bg-amber-50 text-amber-700 border border-amber-150"
                />
              </div>
            </div>
          )}

          {/* TAB 4: THOTTAM */}
          {activeTab === 'thottam' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-display font-bold text-genesis-textMain flex items-center gap-2">
                  <Leaf size={20} className="text-emerald-600" />
                  Thottam Plantation Settings
                </h2>
                <p className="text-xs text-genesis-textSub mt-1">Configure land holdings and base wages for agricultural laborers.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-genesis-border p-6 rounded-2xl shadow-sm max-w-md space-y-4">
                  <h3 className="text-sm font-display font-bold text-genesis-textMain flex items-center gap-1.5">
                    <IndianRupee size={15} className="text-emerald-600" />
                    Standard Daily wage (₹)
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={settings.standardLaborWage || ''}
                      onChange={(e) => setSettings({ ...settings, standardLaborWage: Number(e.target.value) })}
                      placeholder="450"
                      className="flex-grow px-3.5 py-2 bg-gray-50 border border-genesis-border rounded-xl text-sm focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all text-genesis-textMain font-body"
                    />
                    <button 
                      type="button" 
                      onClick={() => saveSettingsField('standardLaborWage', settings.standardLaborWage)}
                      disabled={updating}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      Save Wage
                    </button>
                  </div>
                </div>

                <TagList 
                  title="Active Plantations / Land Divisions"
                  tags={settings.plantations}
                  onAdd={(item) => handleAddListItem('plantations', item)}
                  onRemove={(item) => handleRemoveListItem('plantations', item)}
                  placeholder="e.g., 30 Acre Plot"
                  colorClass="bg-emerald-50 text-emerald-700 border border-emerald-150"
                />
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE RESET */}
          {activeTab === 'reset' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-display font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-600" />
                  Danger Zone - System Reset
                </h2>
                <p className="text-xs text-genesis-textSub mt-1">Erase transactional logs across resort, store, and plantation modules.</p>
              </div>

              <div className="bg-red-50 border border-red-200 p-6 rounded-[20px] space-y-4 max-w-2xl">
                <h3 className="text-sm font-display font-bold text-red-800 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Irreversible Administrative Action
                </h3>
                <p className="text-[13px] text-red-700 leading-relaxed">
                  Resetting the database will delete **all transaction records, incomes, expenses, salaries, collections, laundry requests, and sales logs**.
                </p>
                <p className="text-[13px] text-red-700 font-semibold leading-relaxed">
                  Your administrator profile login credentials and settings configuration parameters (such as plantation names, wages, and categories) will be preserved.
                </p>
                
                <button
                  type="button"
                  onClick={handleOpenResetModal}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 hover:-translate-y-0.5 mt-2"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Safety Countdown Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-genesis-textMain/20 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white border border-genesis-border rounded-[24px] shadow-genesis w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-genesis-border flex justify-between items-center bg-red-50">
              <h3 className="text-[16px] font-display font-bold text-red-700 flex items-center gap-2">
                <AlertCircle size={18} />
                Critical Confirmation Required
              </h3>
              <button 
                onClick={() => { setShowResetModal(false); setTimerActive(false); }} 
                className="text-genesis-textSub hover:text-genesis-textMain text-xl leading-none"
                disabled={updating}
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <p className="text-[13.5px] text-genesis-textSub leading-relaxed">
                You are about to wipe the database. All collections except admin credentials and configuration definitions will be permanently cleared.
              </p>
              
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest block mb-1">Safety Countdown Lock</span>
                {resetCountdown > 0 ? (
                  <p className="text-[15px] font-mono font-bold text-red-600 animate-pulse">
                    Please read warning ({resetCountdown}s)
                  </p>
                ) : (
                  <p className="text-[15px] font-display font-bold text-green-600">
                    Lock Released - Ready to Proceed
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end border-t border-genesis-border pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowResetModal(false); setTimerActive(false); }} 
                  disabled={updating}
                  className="h-[38px] px-4 rounded-xl border border-genesis-border bg-transparent text-genesis-textMain font-medium text-[13px] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleExecuteReset}
                  disabled={resetCountdown > 0 || updating}
                  className="h-[38px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:-translate-y-px active:scale-95"
                >
                  {updating ? 'Erasing...' : 'Yes, Erase All Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  Plus, Edit, Trash2, Search, Users, ShoppingCart,
  Receipt, Wallet, Package, Scale, TrendingDown, Clock, CheckCircle
} from 'lucide-react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const inputClass = "w-full p-2 border border-genesis-border rounded-md text-[14px] bg-gray-50 focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all text-genesis-textMain";
const labelClass = "block text-[13px] font-medium text-genesis-textSub mb-1.5";

const TABS = [
  { id: 'sellers',   label: 'Sellers',       icon: Users },
  { id: 'purchases', label: 'Raw Purchases',  icon: ShoppingCart },
  { id: 'expenses',  label: 'Store Expenses', icon: Receipt },
  { id: 'salaries',  label: 'Salaries',       icon: Wallet },
];

const SEASONS = ['2024-Mains', '2024-Second', '2025-Mains', '2025-Second', '2026-Mains'];
const EXPENSE_CATS = ['Electricity', 'Diesel', 'Maintenance', 'Miscellaneous'];

const StatusBadge = ({ status }) => {
  const map = {
    Paid:    'bg-genesis-success/10 text-genesis-success',
    Pending: 'bg-genesis-warning/10 text-genesis-warning',
    Partial: 'bg-blue-50 text-blue-600',
  };
  return (
    <span className={`px-3 py-1 text-[11px] rounded-full font-bold uppercase tracking-wider ${map[status] || 'bg-gray-100 text-genesis-textSub'}`}>
      {status}
    </span>
  );
};

const CardamomStore = () => {
  const [activeTab, setActiveTab]   = useState('sellers');
  const [data, setData]             = useState([]);
  const [sellers, setSellers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  
  const [expenseCats, setExpenseCats] = useState(['Electricity', 'Diesel', 'Maintenance', 'Miscellaneous']);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data.storeExpenseCategories) setExpenseCats(res.data.storeExpenseCategories);
      })
      .catch(err => console.error('Failed to load settings in CardamomStore', err));
  }, []);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [formData, setFormData]             = useState({});
  const [receiveModal, setReceiveModal]     = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [receiveAmount, setReceiveAmount]   = useState('');
  const [deleteTarget, setDeleteTarget]     = useState(null);

  // ── API helpers ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/store/${activeTab}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchSellers = useCallback(async () => {
    try {
      const res = await api.get('/store/sellers');
      setSellers(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (activeTab !== 'sellers') fetchSellers();
  }, [fetchData, fetchSellers, activeTab]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/store/${activeTab}/${formData._id}`, formData);
      } else {
        await api.post(`/store/${activeTab}`, formData);
      }
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving record');
    }
  };

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    try {
      await api.delete(`/store/${activeTab}/${deleteTarget}`);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(receiveAmount);
    if (!amount || amount <= 0) return;
    const newRemaining = (selectedPurchase.remainingPaid || 0) + amount;
    const balance = (selectedPurchase.totalAmount || 0) - (selectedPurchase.advancePayment || 0) - newRemaining;
    const paymentStatus = balance <= 0 ? 'Paid' : 'Partial';
    try {
      await api.put(`/store/purchases/${selectedPurchase._id}`, { remainingPaid: newRemaining, paymentStatus });
      setReceiveModal(false);
      setSelectedPurchase(null);
      setReceiveAmount('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating payment');
    }
  };

  const openAdd  = ()    => { setFormData({}); setIsModalOpen(true); };
  const openEdit = (row) => { setFormData(row); setIsModalOpen(true); };

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Filtered data ──────────────────────────────────────────────────────────
  const resolveSellerName = (id) => {
    if (typeof id === 'object' && id?.sellerName) return id.sellerName;
    return sellers.find(s => s._id === id)?.sellerName || '';
  };

  const filteredData = data.filter(row => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const match = (...fields) => fields.some(f => f != null && String(f).toLowerCase().includes(q));

    switch (activeTab) {
      case 'sellers':
        return match(row.sellerName, row.contactNumber, row.season, row.address);
      case 'purchases':
        return match(
          resolveSellerName(row.seller),
          row.rawWeightKG,
          row.ratePerKG,
          row.totalAmount,
          row.advancePayment,
          row.remainingPaid,
          row.paymentStatus,
          row.date ? new Date(row.date).toLocaleDateString('en-IN') : ''
        );
      case 'expenses':
        return match(row.category, row.amount, row.description, row.date ? new Date(row.date).toLocaleDateString('en-IN') : '');
      case 'salaries':
        return match(row.employeeName, row.period, row.amount, row.status, row.date ? new Date(row.date).toLocaleDateString('en-IN') : '');
      default:
        return true;
    }
  });

  // ── Table headers ──────────────────────────────────────────────────────────
  const tableHeaders = {
    sellers:   ['Seller Name', 'Contact', 'Season', 'Address', 'Actions'],
    purchases: ['Date', 'Seller', 'Raw Wt (KG)', 'Rate/KG', 'Total', 'Advance', 'Balance Due', 'Status', 'Actions'],
    expenses:  ['Date', 'Category', 'Amount', 'Description', 'Actions'],
    salaries:  ['Employee', 'Period', 'Amount', 'Status', 'Date', 'Actions'],
  };

  // ── Table rows ─────────────────────────────────────────────────────────────
  const renderRow = (item) => {
    const fmt = (n) => `₹${Number(n || 0).toLocaleString()}`;
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
    const sellerName = (id) => {
      if (typeof id === 'object' && id?.sellerName) return id.sellerName;
      const found = sellers.find(s => s._id === id);
      return found ? found.sellerName : '—';
    };

    const actions = (
      <div className="flex gap-2 justify-end">
        <button onClick={() => openEdit(item)} className="text-genesis-textSub hover:text-genesis-primary transition-colors">
          <Edit size={16} />
        </button>
        <button onClick={() => handleDelete(item._id)} className="text-genesis-textSub hover:text-genesis-error transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    );

    const cell = (content, cls = '') => (
      <td className={`py-4 px-6 text-[14px] ${cls}`}>{content}</td>
    );

    switch (activeTab) {
      case 'sellers':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50 transition-colors">
            {cell(<span className="font-semibold text-genesis-textMain">{item.sellerName}</span>)}
            {cell(item.contactNumber || '—', 'font-mono text-genesis-textSub')}
            {cell(<span className="px-2.5 py-1 text-[11px] rounded-full bg-genesis-primary/8 text-genesis-primary font-bold">{item.season}</span>)}
            {cell(item.address || '—', 'text-genesis-textSub')}
            <td className="py-4 px-6">{actions}</td>
          </tr>
        );

      case 'purchases': {
        const balance = (item.totalAmount || 0) - (item.advancePayment || 0) - (item.remainingPaid || 0);
        const status  = item.paymentStatus || 'Pending';
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50 transition-colors">
            {cell(fmtDate(item.date), 'font-mono text-genesis-textSub')}
            {cell(<span className="font-medium text-genesis-textMain">{sellerName(item.seller)}</span>)}
            {cell(<span className="font-bold text-genesis-textMain flex items-center gap-1"><Scale size={13} className="text-genesis-textSub"/>{item.rawWeightKG} KG</span>)}
            {cell(fmt(item.ratePerKG) + '/kg', 'text-genesis-textSub')}
            {cell(<span className="font-bold text-genesis-success">{fmt(item.totalAmount)}</span>)}
            {cell(<span className="font-medium text-genesis-textSub">{fmt(item.advancePayment || 0)}</span>)}
            {cell(
              <span className={`font-bold ${balance > 0 ? 'text-genesis-error' : 'text-genesis-success'}`}>
                {fmt(Math.max(0, balance))}
              </span>
            )}
            <td className="py-4 px-6"><StatusBadge status={status} /></td>
            <td className="py-4 px-6">
              <div className="flex gap-2 justify-end">
                {balance > 0 && (
                  <button
                    onClick={() => { setSelectedPurchase(item); setReceiveAmount(''); setReceiveModal(true); }}
                    className="text-genesis-textSub hover:text-genesis-success transition-colors"
                    title="Record Payment"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                <button onClick={() => openEdit(item)} className="text-genesis-textSub hover:text-genesis-primary transition-colors"><Edit size={16} /></button>
                <button onClick={() => handleDelete(item._id)} className="text-genesis-textSub hover:text-genesis-error transition-colors"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        );
      }

      case 'expenses':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50 transition-colors">
            {cell(fmtDate(item.date), 'font-mono text-genesis-textSub')}
            {cell(<span className="font-medium text-genesis-textMain">{item.category}</span>)}
            {cell(<span className="font-bold text-genesis-error">{fmt(item.amount)}</span>)}
            {cell(item.description || '—', 'text-genesis-textSub')}
            <td className="py-4 px-6">{actions}</td>
          </tr>
        );

      case 'salaries':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50 transition-colors">
            {cell(<span className="font-semibold text-genesis-textMain">{item.employeeName}</span>)}
            {cell(item.period || '—', 'text-genesis-textSub text-[13px]')}
            {cell(<span className="font-bold text-genesis-textMain">{fmt(item.amount)}</span>)}
            <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
            {cell(fmtDate(item.date), 'font-mono text-genesis-textSub')}
            <td className="py-4 px-6">{actions}</td>
          </tr>
        );

      default:
        return null;
    }
  };

  const renderMobileCard = (item) => {
    const fmt = (n) => `₹${Number(n || 0).toLocaleString()}`;
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
    const sellerName = (id) => {
      if (typeof id === 'object' && id?.sellerName) return id.sellerName;
      const found = sellers.find(s => s._id === id);
      return found ? found.sellerName : '—';
    };

    const actions = (
      <div className="flex gap-3 justify-end pt-2 border-t border-genesis-border mt-2">
        <button onClick={() => openEdit(item)} className="text-genesis-textSub hover:text-genesis-primary flex items-center gap-1 text-[13px] font-medium transition-colors">
          <Edit size={15} /> Edit
        </button>
        <button onClick={() => handleDelete(item._id)} className="text-genesis-textSub hover:text-genesis-error flex items-center gap-1 text-[13px] font-medium transition-colors">
          <Trash2 size={15} /> Delete
        </button>
      </div>
    );

    switch (activeTab) {
      case 'sellers':
        return (
          <div key={item._id} className="p-4 space-y-2 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.sellerName}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{item.contactNumber || '—'}</p>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] rounded-full bg-genesis-primary/8 text-genesis-primary font-bold">
                {item.season}
              </span>
            </div>
            {item.address && <p className="text-[13px] text-genesis-textSub bg-gray-50 p-2.5 rounded-lg border border-genesis-border">{item.address}</p>}
            {actions}
          </div>
        );

      case 'purchases': {
        const balance = (item.totalAmount || 0) - (item.advancePayment || 0) - (item.remainingPaid || 0);
        const status  = item.paymentStatus || 'Pending';
        return (
          <div key={item._id} className="p-4 space-y-2.5 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{sellerName(item.seller)}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{fmtDate(item.date)}</p>
              </div>
              <StatusBadge status={status} />
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Weight & Rate</span>
              <span className="font-bold text-genesis-textMain">{item.rawWeightKG} KG @ {fmt(item.ratePerKG)}/kg</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Total Amount</span>
              <span className="font-bold text-genesis-success">{fmt(item.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Advance</span>
              <span className="font-medium text-genesis-textSub">{fmt(item.advancePayment)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Balance Due</span>
              <span className={`font-bold ${balance > 0 ? 'text-genesis-error' : 'text-genesis-success'}`}>
                {fmt(Math.max(0, balance))}
              </span>
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-genesis-border mt-2">
              {balance > 0 && (
                <button
                  onClick={() => { setSelectedPurchase(item); setReceiveAmount(''); setReceiveModal(true); }}
                  className="text-genesis-success hover:text-green-700 flex items-center gap-1 text-[13px] font-medium transition-colors"
                >
                  <CheckCircle size={15} /> Pay Balance
                </button>
              )}
              <button onClick={() => openEdit(item)} className="text-genesis-textSub hover:text-genesis-primary flex items-center gap-1 text-[13px] font-medium transition-colors"><Edit size={15} /> Edit</button>
              <button onClick={() => handleDelete(item._id)} className="text-genesis-textSub hover:text-genesis-error flex items-center gap-1 text-[13px] font-medium transition-colors"><Trash2 size={15} /> Delete</button>
            </div>
          </div>
        );
      }

      case 'expenses':
        return (
          <div key={item._id} className="p-4 space-y-2 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.category}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{fmtDate(item.date)}</p>
              </div>
              <span className="font-bold text-genesis-error text-[16px]">{fmt(item.amount)}</span>
            </div>
            {item.description && <p className="text-[13px] text-genesis-textSub bg-gray-50 p-2.5 rounded-lg border border-genesis-border">{item.description}</p>}
            {actions}
          </div>
        );

      case 'salaries':
        return (
          <div key={item._id} className="p-4 space-y-2.5 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.employeeName}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{fmtDate(item.date)}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Period</span>
              <span className="font-medium text-genesis-textMain">{item.period}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Amount</span>
              <span className="font-bold text-genesis-textMain">{fmt(item.amount)}</span>
            </div>
            {actions}
          </div>
        );

      default:
        return null;
    }
  };

  // ── Summary bar ────────────────────────────────────────────────────────────
  const SummaryBar = () => {
    if (activeTab === 'sellers') {
      return (
        <div className="flex gap-2 items-center text-[13px] text-genesis-textSub">
          <Users size={14} />
          <span><strong className="text-genesis-textMain">{data.length}</strong> registered sellers</span>
        </div>
      );
    }
    if (activeTab === 'purchases') {
      const totalKG   = data.reduce((s, r) => s + (r.rawWeightKG || 0), 0);
      const totalAmt  = data.reduce((s, r) => s + (r.totalAmount || 0), 0);
      const totalAdv  = data.reduce((s, r) => s + (r.advancePayment || 0), 0);
      const totalRemPaid = data.reduce((s, r) => s + (r.remainingPaid || 0), 0);
      const totalRem  = totalAmt - totalAdv - totalRemPaid;
      return (
        <div className="flex gap-5 text-[13px]">
          <span className="text-genesis-textSub flex items-center gap-1.5"><Package size={13}/><strong className="text-genesis-textMain">{totalKG.toLocaleString()} KG</strong></span>
          <span className="text-genesis-textSub flex items-center gap-1.5"><TrendingDown size={13}/><strong className="text-genesis-success">₹{totalAmt.toLocaleString()}</strong> total</span>
          <span className="text-genesis-textSub flex items-center gap-1.5"><Clock size={13} className="text-genesis-error"/><strong className="text-genesis-error">₹{totalRem.toLocaleString()}</strong> remaining</span>
        </div>
      );
    }
    if (activeTab === 'expenses') {
      const total = data.reduce((s, r) => s + (r.amount || 0), 0);
      return <span className="text-[13px] text-genesis-textSub">Total: <strong className="text-genesis-error">₹{total.toLocaleString()}</strong></span>;
    }
    if (activeTab === 'salaries') {
      const pending = data.filter(r => r.status === 'Pending').length;
      const total   = data.reduce((s, r) => s + (r.amount || 0), 0);
      return (
        <div className="flex gap-6 text-[13px]">
          <span className="text-genesis-textSub">Total paid out: <strong className="text-genesis-textMain">₹{total.toLocaleString()}</strong></span>
          {pending > 0 && <span className="text-genesis-warning font-semibold">{pending} pending</span>}
        </div>
      );
    }
    return null;
  };

  // ── Modal form fields ──────────────────────────────────────────────────────
  const renderFormFields = () => {
    const SellerSelect = () => (
      <div>
        <label className={labelClass}>Seller</label>
        <select name="seller" value={formData.seller?._id || formData.seller || ''} required onChange={handleChange} className={inputClass}>
          <option value="">Select Seller</option>
          {sellers.map(s => <option key={s._id} value={s._id}>{s.sellerName} — {s.season}</option>)}
        </select>
      </div>
    );

    switch (activeTab) {
      case 'sellers':
        return (
          <>
            <div><label className={labelClass}>Seller Name</label><input type="text" name="sellerName" value={formData.sellerName || ''} required onChange={handleChange} className={inputClass} placeholder="e.g. Rajan KV" /></div>
            <div><label className={labelClass}>Contact Number</label><input type="tel" name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} className={inputClass} placeholder="+91 98765 43210" /></div>
            <div>
              <label className={labelClass}>Season</label>
              <select name="season" value={formData.season || ''} required onChange={handleChange} className={inputClass}>
                <option value="">Select Season</option>
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Address</label><textarea name="address" value={formData.address || ''} onChange={handleChange} rows={2} className={inputClass} placeholder="Village, District..." /></div>
          </>
        );

      case 'purchases': {
        const totalAmt  = (formData.rawWeightKG || 0) * (formData.ratePerKG || 0);
        const advance   = Number(formData.advancePayment || 0);
        const remaining = totalAmt - advance;
        return (
          <>
            <SellerSelect />
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              <div><label className={labelClass}>Raw Weight (KG)</label><input type="number" name="rawWeightKG" value={formData.rawWeightKG || ''} required step="0.01" onChange={handleChange} className={inputClass} placeholder="0.00" /></div>
              <div><label className={labelClass}>Rate per KG (₹)</label><input type="number" name="ratePerKG" value={formData.ratePerKG || ''} required step="0.01" onChange={handleChange} className={inputClass} placeholder="0.00" /></div>
            </div>
            <div><label className={labelClass}>Advance Payment (₹)</label><input type="number" name="advancePayment" value={formData.advancePayment || ''} onChange={handleChange} className={inputClass} placeholder="0" /></div>
            {totalAmt > 0 && (
              <div className="bg-gray-50 border border-genesis-border rounded-lg p-4 grid grid-cols-1 xs:grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-genesis-textSub uppercase font-mono tracking-wider mb-0.5">Total</p>
                  <p className="text-[15px] font-bold text-genesis-success">₹{totalAmt.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-genesis-textSub uppercase font-mono tracking-wider mb-0.5">Advance</p>
                  <p className="text-[15px] font-bold text-genesis-textSub">₹{advance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-genesis-textSub uppercase font-mono tracking-wider mb-0.5">Remaining</p>
                  <p className={`text-[15px] font-bold ${remaining > 0 ? 'text-genesis-error' : 'text-genesis-success'}`}>
                    ₹{remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            <div><label className={labelClass}>Date</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleChange} className={inputClass} /></div>
          </>
        );
      }

      case 'expenses':
        return (
          <>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={formData.category || ''} required onChange={handleChange} className={inputClass}>
                <option value="">Select Category</option>
                {expenseCats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Amount (₹)</label><input type="number" name="amount" value={formData.amount || ''} required onChange={handleChange} className={inputClass} placeholder="0" /></div>
            <div><label className={labelClass}>Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className={inputClass} placeholder="Brief description..." /></div>
            <div><label className={labelClass}>Date</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleChange} className={inputClass} /></div>
          </>
        );

      case 'salaries':
        return (
          <>
            <div><label className={labelClass}>Employee Name</label><input type="text" name="employeeName" value={formData.employeeName || ''} required onChange={handleChange} className={inputClass} placeholder="e.g. Suresh" /></div>
            <div><label className={labelClass}>Period</label><input type="text" name="period" value={formData.period || ''} onChange={handleChange} className={inputClass} placeholder="e.g. Week 1 - May 2025" /></div>
            <div><label className={labelClass}>Amount (₹)</label><input type="number" name="amount" value={formData.amount || ''} required onChange={handleChange} className={inputClass} placeholder="0" /></div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={formData.status || 'Pending'} onChange={handleChange} className={inputClass}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div><label className={labelClass}>Date</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleChange} className={inputClass} /></div>
          </>
        );

      default:
        return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4">
        <div>
          <p className="text-[11px] font-display font-bold text-genesis-primary uppercase tracking-widest mb-1">Store Management</p>
          <h1 className="text-[28px] md:text-[32px] font-display font-bold text-genesis-textMain leading-none tracking-[-0.02em]">Cardamom Store</h1>
          <p className="text-[14px] text-genesis-textSub font-body mt-2">Track sellers, purchases, payments, expenses and salaries</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-genesis-primary hover:bg-genesis-primaryHover hover:-translate-y-px hover:shadow-btn text-white h-[38px] px-4 rounded-md flex items-center justify-center gap-2 text-[13px] font-medium transition-all duration-200 w-full sm:w-auto"
        >
          <Plus size={16} />
          Add Record
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-genesis-border overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium text-[13px] md:text-[14px] transition-colors border-b-[3px] whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-genesis-primary text-genesis-primary font-bold'
                  : 'border-transparent text-genesis-textSub hover:text-genesis-textMain'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data table */}
      <div className="bg-genesis-surface border border-genesis-border rounded-xl hover:shadow-genesis transition-all duration-300 overflow-hidden">
        {/* Table toolbar */}
        <div className="p-4 px-6 border-b border-genesis-border flex flex-col md:flex-row justify-between md:items-center bg-white gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1 w-full">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-genesis-textSub" size={16} />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-genesis-border rounded-lg text-[13px] focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary w-full font-body transition-all"
              />
            </div>
            <div className="overflow-x-auto w-full md:w-auto py-1 scrollbar-hide">
              <SummaryBar />
            </div>
          </div>
          <p className="text-[13px] text-genesis-textSub font-mono uppercase tracking-wider shrink-0">Total: {filteredData.length}</p>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-genesis-border">
          {loading ? (
            <div className="py-12 text-center text-genesis-textSub text-[14px]">Loading data...</div>
          ) : filteredData.length > 0 ? (
            filteredData.map(renderMobileCard)
          ) : (
            <div className="py-16 text-center text-genesis-textSub text-[14px]">No records match your search.</div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-genesis-border">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 text-genesis-textSub font-mono text-[11px] uppercase tracking-wider border-b border-genesis-border">
                {tableHeaders[activeTab].map((h, i) => (
                  <th key={i} className={`py-3 px-4 md:px-6 font-semibold ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="py-12 text-center text-genesis-textSub text-[14px]">Loading data...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map(renderRow)
              ) : (
                <tr><td colSpan="10" className="py-16 text-center text-genesis-textSub text-[14px]">No records match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Receive payment modal */}
      {receiveModal && selectedPurchase && (
        <div className="fixed inset-0 bg-genesis-textMain/20 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-genesis-surface border border-genesis-border rounded-xl shadow-genesis w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-genesis-border flex justify-between items-center bg-white">
              <h3 className="text-[16px] font-display font-bold text-genesis-textMain">Record Payment</h3>
              <button onClick={() => { setReceiveModal(false); setSelectedPurchase(null); setReceiveAmount(''); }} className="text-genesis-textSub hover:text-genesis-textMain transition-colors">&times;</button>
            </div>
            <form onSubmit={handleReceiveSubmit} className="p-6 space-y-4">
              <p className="text-[14px] text-genesis-textSub mb-2">
                Recording payment for <strong className="text-genesis-textMain font-medium">
                  {typeof selectedPurchase.seller === 'object' ? selectedPurchase.seller?.sellerName : sellers.find(s => s._id === selectedPurchase.seller)?.sellerName || '—'}
                </strong>. Balance due: <strong className="text-genesis-error">
                  ₹{Math.max(0, (selectedPurchase.totalAmount || 0) - (selectedPurchase.advancePayment || 0) - (selectedPurchase.remainingPaid || 0)).toLocaleString()}
                </strong>
              </p>
              <div>
                <label className="block text-[13px] font-medium text-genesis-textSub mb-1.5">Amount Received (₹)</label>
                <input
                  type="number"
                  value={receiveAmount}
                  required
                  min="1"
                  onChange={(e) => setReceiveAmount(e.target.value)}
                  className="w-full p-2 border border-genesis-border rounded-md text-[14px] bg-gray-50 focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all"
                  autoFocus
                />
              </div>
              {receiveAmount > 0 && (
                <p className="text-[13px] text-genesis-textSub">
                  New balance:{' '}
                  <strong className={Math.max(0, (selectedPurchase.totalAmount || 0) - (selectedPurchase.advancePayment || 0) - (selectedPurchase.remainingPaid || 0) - Number(receiveAmount)) > 0 ? 'text-genesis-error' : 'text-genesis-success'}>
                    ₹{Math.max(0, (selectedPurchase.totalAmount || 0) - (selectedPurchase.advancePayment || 0) - (selectedPurchase.remainingPaid || 0) - Number(receiveAmount)).toLocaleString()}
                  </strong>
                </p>
              )}
              <div className="pt-6 flex gap-3 justify-end border-t border-genesis-border mt-6">
                <button type="button" onClick={() => { setReceiveModal(false); setSelectedPurchase(null); setReceiveAmount(''); }} className="h-[38px] px-4 rounded-md border border-genesis-border bg-transparent text-genesis-textMain font-medium text-[13px] hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="h-[38px] px-4 rounded-md bg-genesis-success text-white font-medium text-[13px] hover:shadow-btn transition-shadow">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-genesis-textMain/20 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-genesis-surface border border-genesis-border rounded-xl shadow-genesis w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-genesis-border flex justify-between items-center bg-white">
              <h3 className="text-[16px] font-display font-bold text-genesis-textMain">{formData._id ? 'Edit Record' : 'Add New Record'}</h3>
              <button onClick={() => { setIsModalOpen(false); setFormData({}); }} className="text-genesis-textSub hover:text-genesis-textMain transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {renderFormFields()}
              <div className="pt-6 flex gap-3 justify-end border-t border-genesis-border mt-6">
                <button type="button" onClick={() => { setIsModalOpen(false); setFormData({}); }} className="h-[38px] px-4 rounded-md border border-genesis-border bg-transparent text-genesis-textMain font-medium text-[13px] hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="h-[38px] px-4 rounded-md bg-genesis-primary text-white font-medium text-[13px] hover:shadow-btn transition-shadow">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default CardamomStore;

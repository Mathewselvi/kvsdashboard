import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, Search, Leaf, TrendingUp, Users, FlaskConical, Truck, IndianRupee } from 'lucide-react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const DEFAULT_PLANTATIONS = ['English Medium', 'Nellikad', '10 Acre', '20 Acre'];
const DEFAULT_MEDICINE_CATS = ['Fertilizer', 'Plant Medicine', 'Other'];
const DEFAULT_FARM_CATS = ['Transport', 'Equipment', 'Miscellaneous'];

const TAB_ENDPOINT = {
  collections: 'collections',
  sales:       'sales',
  labour:      'labour',
  medicine:    'medicine',
  farmexpense: 'farm-expense',
};

const tabs = [
  { id: 'collections', label: 'Collections',    icon: Leaf },
  { id: 'sales',       label: 'Sales',           icon: TrendingUp },
  { id: 'labour',      label: 'Labour',          icon: Users },
  { id: 'medicine',    label: 'Medicine',        icon: FlaskConical },
  { id: 'farmexpense', label: 'Farm Expenses',   icon: Truck },
];

const StatusBadge = ({ status }) => {
  const map = {
    Paid:    'bg-genesis-success/10 text-genesis-success',
    Pending: 'bg-genesis-warning/10 text-genesis-warning',
  };
  return (
    <span className={`px-3 py-1 text-[11px] rounded-full font-bold uppercase tracking-wider ${map[status] || 'bg-gray-100 text-genesis-textSub'}`}>
      {status}
    </span>
  );
};

const Thottam = () => {
  const [activeTab, setActiveTab]   = useState('collections');
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData]     = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Settings states
  const [plantations, setPlantations] = useState(DEFAULT_PLANTATIONS);
  const [medicineCats, setMedicineCats] = useState(DEFAULT_MEDICINE_CATS);
  const [farmCats, setFarmCats] = useState(DEFAULT_FARM_CATS);
  const [defaultWage, setDefaultWage] = useState(450);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data.plantations) setPlantations(res.data.plantations);
        if (res.data.medicineExpenseCategories) setMedicineCats(res.data.medicineExpenseCategories);
        if (res.data.farmExpenseCategories) setFarmCats(res.data.farmExpenseCategories);
        if (res.data.standardLaborWage) setDefaultWage(res.data.standardLaborWage);
      })
      .catch(err => console.error('Failed to load settings in Thottam', err));
  }, []);

  const endpoint = TAB_ENDPOINT[activeTab];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/thottam/${endpoint}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    try {
      await api.delete(`/thottam/${endpoint}/${deleteTarget}`);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleInputChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/thottam/${endpoint}/${formData._id}`, formData);
      } else {
        await api.post(`/thottam/${endpoint}`, formData);
      }
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving record');
    }
  };

  const openAddModal  = ()     => { 
    if (activeTab === 'labour') {
      setFormData({ dailyWage: defaultWage, status: 'Pending' });
    } else {
      setFormData({});
    }
    setIsModalOpen(true); 
  };
  const openEditModal = (item) => { setFormData(item); setIsModalOpen(true); };

  // ── Search ─────────────────────────────────────────────────────────────────
  const filteredData = data.filter(row => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const match = (...fields) => fields.some(f => f != null && String(f).toLowerCase().includes(q));
    const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '';
    switch (activeTab) {
      case 'collections':
        return match(row.plantationName, row.rawQuantityKG, row.dryQuantityKG, fmtD(row.date));
      case 'sales':
        return match(row.plantationName, row.buyerDetails, row.sellingQuantityKG, row.sellingPricePerKG, row.totalAmount, fmtD(row.date));
      case 'labour':
        return match(row.workerName, row.plantationName, row.dailyWage, row.daysWorked, row.totalWage, row.status, fmtD(row.date));
      case 'medicine':
        return match(row.plantationName, row.medicineName, row.category, row.cost, fmtD(row.date));
      case 'farmexpense':
        return match(row.plantationName, row.category, row.amount, row.description, fmtD(row.date));
      default:
        return true;
    }
  });

  // ── Table headers ──────────────────────────────────────────────────────────
  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'collections': return ['Date', 'Plantation', 'Raw (KG)', 'Dry (KG)', 'Actions'];
      case 'sales':       return ['Date', 'Plantation', 'Buyer', 'Qty (KG)', 'Rate/KG', 'Total', 'Actions'];
      case 'labour':      return ['Date', 'Worker', 'Plantation', 'Days', 'Wage/Day', 'Total Wage', 'Status', 'Actions'];
      case 'medicine':    return ['Date', 'Plantation', 'Medicine', 'Category', 'Cost', 'Actions'];
      case 'farmexpense': return ['Date', 'Plantation', 'Category', 'Amount', 'Description', 'Actions'];
      default:            return [];
    }
  };

  // ── Table rows ─────────────────────────────────────────────────────────────
  const renderTableRow = (item) => {
    const fmt     = (n) => `₹${Number(n || 0).toLocaleString()}`;
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

    const actionButtons = (
      <div className="flex gap-2 justify-end">
        <button onClick={() => openEditModal(item)} className="text-genesis-textSub hover:text-genesis-primary transition-colors"><Edit size={16} /></button>
        <button onClick={() => handleDelete(item._id)} className="text-genesis-textSub hover:text-genesis-error transition-colors"><Trash2 size={16} /></button>
      </div>
    );

    switch (activeTab) {
      case 'collections':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50">
            <td className="py-4 px-6 text-[14px] font-mono text-genesis-textSub">{fmtDate(item.date)}</td>
            <td className="py-4 px-6 text-[14px] font-medium text-genesis-textMain">{item.plantationName}</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-textMain">{item.rawQuantityKG} KG</td>
            <td className="py-4 px-6 text-[14px]">
              {item.dryQuantityKG
                ? <span className="font-bold text-genesis-success">{item.dryQuantityKG} KG</span>
                : <span className="text-genesis-textSub italic text-[13px]">Pending</span>}
            </td>
            <td className="py-4 px-6">{actionButtons}</td>
          </tr>
        );

      case 'sales':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50">
            <td className="py-4 px-6 text-[14px] font-mono text-genesis-textSub">{fmtDate(item.date)}</td>
            <td className="py-4 px-6 text-[14px] font-medium text-genesis-textMain">{item.plantationName}</td>
            <td className="py-4 px-6 text-[14px] text-genesis-textMain">{item.buyerDetails}</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-textMain">{item.sellingQuantityKG} KG</td>
            <td className="py-4 px-6 text-[14px] text-genesis-textSub">{fmt(item.sellingPricePerKG)}/kg</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-success">{fmt(item.totalAmount)}</td>
            <td className="py-4 px-6">{actionButtons}</td>
          </tr>
        );

      case 'labour':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50">
            <td className="py-4 px-6 text-[14px] font-mono text-genesis-textSub">{fmtDate(item.date)}</td>
            <td className="py-4 px-6 text-[14px] font-medium text-genesis-textMain">{item.workerName}</td>
            <td className="py-4 px-6 text-[14px] text-genesis-textSub">{item.plantationName || '—'}</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-textMain">{item.daysWorked}</td>
            <td className="py-4 px-6 text-[14px] text-genesis-textSub">{fmt(item.dailyWage)}</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-textMain">{fmt(item.totalWage)}</td>
            <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
            <td className="py-4 px-6">{actionButtons}</td>
          </tr>
        );

      case 'medicine':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50">
            <td className="py-4 px-6 text-[14px] font-mono text-genesis-textSub">{fmtDate(item.date)}</td>
            <td className="py-4 px-6 text-[14px] text-genesis-textSub">{item.plantationName}</td>
            <td className="py-4 px-6 text-[14px] font-medium text-genesis-textMain">{item.medicineName}</td>
            <td className="py-4 px-6 text-[14px] text-genesis-textSub">{item.category}</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-error">{fmt(item.cost)}</td>
            <td className="py-4 px-6">{actionButtons}</td>
          </tr>
        );

      case 'farmexpense':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50">
            <td className="py-4 px-6 text-[14px] font-mono text-genesis-textSub">{fmtDate(item.date)}</td>
            <td className="py-4 px-6 text-[14px] text-genesis-textSub">{item.plantationName}</td>
            <td className="py-4 px-6 text-[14px] font-medium text-genesis-textMain">{item.category}</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-error">{fmt(item.amount)}</td>
            <td className="py-4 px-6 text-[14px] text-genesis-textSub">{item.description || '—'}</td>
            <td className="py-4 px-6">{actionButtons}</td>
          </tr>
        );

      default: return null;
    }
  };

  const renderMobileCard = (item) => {
    const fmt = (n) => `₹${Number(n || 0).toLocaleString()}`;
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

    const actionButtons = (
      <div className="flex gap-3 justify-end pt-2 border-t border-genesis-border mt-2">
        <button onClick={() => openEditModal(item)} className="text-genesis-textSub hover:text-genesis-primary flex items-center gap-1 text-[13px] font-medium transition-colors">
          <Edit size={15} /> Edit
        </button>
        <button onClick={() => handleDelete(item._id)} className="text-genesis-textSub hover:text-genesis-error flex items-center gap-1 text-[13px] font-medium transition-colors">
          <Trash2 size={15} /> Delete
        </button>
      </div>
    );

    switch (activeTab) {
      case 'collections':
        return (
          <div key={item._id} className="p-4 space-y-2 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.plantationName}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{fmtDate(item.date)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-genesis-textMain text-[14px]">{item.rawQuantityKG} KG (Raw)</p>
                {item.dryQuantityKG ? (
                  <p className="font-bold text-genesis-success text-[14px] mt-0.5">{item.dryQuantityKG} KG (Dry)</p>
                ) : (
                  <p className="text-genesis-textSub italic text-[12px] mt-0.5">Drying Pending</p>
                )}
              </div>
            </div>
            {actionButtons}
          </div>
        );

      case 'sales':
        return (
          <div key={item._id} className="p-4 space-y-2.5 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.plantationName}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{fmtDate(item.date)}</p>
              </div>
              <span className="font-bold text-genesis-success text-[16px]">{fmt(item.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Buyer</span>
              <span className="font-medium text-genesis-textMain">{item.buyerDetails}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Quantity</span>
              <span className="font-bold text-genesis-textMain">{item.sellingQuantityKG} KG @ {fmt(item.sellingPricePerKG)}/kg</span>
            </div>
            {actionButtons}
          </div>
        );

      case 'labour':
        return (
          <div key={item._id} className="p-4 space-y-2.5 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.workerName}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{fmtDate(item.date)}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Plantation</span>
              <span className="font-medium text-genesis-textMain">{item.plantationName || '—'}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Wages</span>
              <span className="font-medium text-genesis-textMain">{item.daysWorked} days @ {fmt(item.dailyWage)}/day</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Total Wage</span>
              <span className="font-bold text-genesis-textMain">{fmt(item.totalWage)}</span>
            </div>
            {actionButtons}
          </div>
        );

      case 'medicine':
        return (
          <div key={item._id} className="p-4 space-y-2 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.medicineName}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{fmtDate(item.date)}</p>
              </div>
              <span className="font-bold text-genesis-error text-[16px]">{fmt(item.cost)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Plantation & Category</span>
              <span className="font-medium text-genesis-textMain">{item.plantationName} ({item.category})</span>
            </div>
            {actionButtons}
          </div>
        );

      case 'farmexpense':
        return (
          <div key={item._id} className="p-4 space-y-2 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.category}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{fmtDate(item.date)}</p>
              </div>
              <span className="font-bold text-genesis-error text-[16px]">{fmt(item.amount)}</span>
            </div>
            <div className="flex justify-between text-[13px] mb-2">
              <span className="text-genesis-textSub">Plantation</span>
              <span className="font-medium text-genesis-textMain">{item.plantationName}</span>
            </div>
            {item.description && <p className="text-[13px] text-genesis-textSub bg-gray-50 p-2.5 rounded-lg border border-genesis-border">{item.description}</p>}
            {actionButtons}
          </div>
        );

      default:
        return null;
    }
  };

  // ── Summary bar ────────────────────────────────────────────────────────────
  const SummaryBar = () => {
    const fmt = (n) => `₹${Number(n || 0).toLocaleString()}`;
    switch (activeTab) {
      case 'collections': {
        const totalRaw = data.reduce((s, r) => s + (r.rawQuantityKG || 0), 0);
        const totalDry = data.reduce((s, r) => s + (r.dryQuantityKG || 0), 0);
        return (
          <div className="flex gap-6 text-[13px]">
            <span className="text-genesis-textSub">Raw collected: <strong className="text-genesis-textMain">{totalRaw.toLocaleString()} KG</strong></span>
            <span className="text-genesis-textSub">Dry yield: <strong className="text-genesis-success">{totalDry.toLocaleString()} KG</strong></span>
          </div>
        );
      }
      case 'sales': {
        const totalQty = data.reduce((s, r) => s + (r.sellingQuantityKG || 0), 0);
        const totalRev = data.reduce((s, r) => s + (r.totalAmount || 0), 0);
        return (
          <div className="flex gap-6 text-[13px]">
            <span className="text-genesis-textSub">Sold: <strong className="text-genesis-textMain">{totalQty.toLocaleString()} KG</strong></span>
            <span className="text-genesis-textSub">Revenue: <strong className="text-genesis-success">{fmt(totalRev)}</strong></span>
          </div>
        );
      }
      case 'labour': {
        const total   = data.reduce((s, r) => s + (r.totalWage || 0), 0);
        const pending = data.filter(r => r.status === 'Pending').length;
        return (
          <div className="flex gap-6 text-[13px]">
            <span className="text-genesis-textSub">Total wages: <strong className="text-genesis-textMain">{fmt(total)}</strong></span>
            {pending > 0 && <span className="text-genesis-warning font-semibold">{pending} pending</span>}
          </div>
        );
      }
      case 'medicine': {
        const total = data.reduce((s, r) => s + (r.cost || 0), 0);
        return <span className="text-[13px] text-genesis-textSub">Total: <strong className="text-genesis-error">{fmt(total)}</strong></span>;
      }
      case 'farmexpense': {
        const total = data.reduce((s, r) => s + (r.amount || 0), 0);
        return <span className="text-[13px] text-genesis-textSub">Total: <strong className="text-genesis-error">{fmt(total)}</strong></span>;
      }
      default: return null;
    }
  };

  // ── Form fields ────────────────────────────────────────────────────────────
  const renderFormFields = () => {
    const inputClass = "w-full p-2 border border-genesis-border rounded-md text-[14px] bg-gray-50 focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all text-genesis-textMain";
    const labelClass = "block text-[13px] font-medium text-genesis-textSub mb-1.5";

    const PlantationSelect = () => (
      <div>
        <label className={labelClass}>Plantation</label>
        <select name="plantationName" value={formData.plantationName || ''} required onChange={handleInputChange} className={inputClass}>
          <option value="">Select Plantation</option>
          {plantations.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    );

    switch (activeTab) {
      case 'collections':
        return (
          <>
            <PlantationSelect />
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Raw Quantity (KG)</label>
                <input type="number" name="rawQuantityKG" value={formData.rawQuantityKG || ''} required step="0.01" onChange={handleInputChange} className={inputClass} placeholder="0.00" />
              </div>
              <div>
                <label className={labelClass}>Dry Quantity (KG)</label>
                <input type="number" name="dryQuantityKG" value={formData.dryQuantityKG || ''} step="0.01" onChange={handleInputChange} className={inputClass} placeholder="After drying..." />
              </div>
            </div>
            <div><label className={labelClass}>Date</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleInputChange} className={inputClass} /></div>
          </>
        );

      case 'sales': {
        const totalAmt = (formData.sellingQuantityKG || 0) * (formData.sellingPricePerKG || 0);
        return (
          <>
            <PlantationSelect />
            <div><label className={labelClass}>Buyer Details</label><input type="text" name="buyerDetails" value={formData.buyerDetails || ''} required onChange={handleInputChange} className={inputClass} placeholder="Buyer name / company" /></div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              <div><label className={labelClass}>Quantity (KG)</label><input type="number" name="sellingQuantityKG" value={formData.sellingQuantityKG || ''} required step="0.01" onChange={handleInputChange} className={inputClass} placeholder="0.00" /></div>
              <div><label className={labelClass}>Price per KG (₹)</label><input type="number" name="sellingPricePerKG" value={formData.sellingPricePerKG || ''} required step="0.01" onChange={handleInputChange} className={inputClass} placeholder="0.00" /></div>
            </div>
            {totalAmt > 0 && (
              <div className="bg-gray-50 border border-genesis-border rounded-lg p-4">
                <p className="text-[11px] text-genesis-textSub uppercase font-mono tracking-wider mb-0.5">Total Sale Value</p>
                <p className="text-[18px] font-bold text-genesis-success">₹{totalAmt.toLocaleString()}</p>
              </div>
            )}
            <div><label className={labelClass}>Date</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleInputChange} className={inputClass} /></div>
          </>
        );
      }

      case 'labour': {
        const totalWage = (formData.dailyWage || 0) * (formData.daysWorked || 0);
        return (
          <>
            <div><label className={labelClass}>Worker Name</label><input type="text" name="workerName" value={formData.workerName || ''} required onChange={handleInputChange} className={inputClass} placeholder="e.g. Rajan" /></div>
            <PlantationSelect />
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              <div><label className={labelClass}>Daily Wage (₹)</label><input type="number" name="dailyWage" value={formData.dailyWage || ''} required onChange={handleInputChange} className={inputClass} placeholder="0" /></div>
              <div><label className={labelClass}>Days Worked</label><input type="number" name="daysWorked" value={formData.daysWorked || ''} required min="1" onChange={handleInputChange} className={inputClass} placeholder="1" /></div>
            </div>
            {totalWage > 0 && (
              <div className="bg-gray-50 border border-genesis-border rounded-lg p-4">
                <p className="text-[11px] text-genesis-textSub uppercase font-mono tracking-wider mb-0.5">Total Wage</p>
                <p className="text-[18px] font-bold text-genesis-textMain">₹{totalWage.toLocaleString()}</p>
              </div>
            )}
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={formData.status || 'Pending'} onChange={handleInputChange} className={inputClass}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div><label className={labelClass}>Date</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleInputChange} className={inputClass} /></div>
          </>
        );
      }

      case 'medicine':
        return (
          <>
            <PlantationSelect />
            <div><label className={labelClass}>Medicine / Input Name</label><input type="text" name="medicineName" value={formData.medicineName || ''} required onChange={handleInputChange} className={inputClass} placeholder="e.g. Urea, Bordeaux Mix" /></div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={formData.category || ''} onChange={handleInputChange} className={inputClass}>
                <option value="">Select Category</option>
                {medicineCats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Cost (₹)</label><input type="number" name="cost" value={formData.cost || ''} required onChange={handleInputChange} className={inputClass} placeholder="0" /></div>
            <div><label className={labelClass}>Date</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleInputChange} className={inputClass} /></div>
          </>
        );

      case 'farmexpense':
        return (
          <>
            <PlantationSelect />
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={formData.category || ''} required onChange={handleInputChange} className={inputClass}>
                <option value="">Select Category</option>
                {farmCats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Amount (₹)</label><input type="number" name="amount" value={formData.amount || ''} required onChange={handleInputChange} className={inputClass} placeholder="0" /></div>
            <div><label className={labelClass}>Description</label><textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={2} className={inputClass} placeholder="Brief description..." /></div>
            <div><label className={labelClass}>Date</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleInputChange} className={inputClass} /></div>
          </>
        );

      default: return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4">
        <div>
          <p className="text-[11px] font-display font-bold text-genesis-primary uppercase tracking-widest mb-1">Plantation Management</p>
          <h1 className="text-[28px] md:text-[32px] font-display font-bold text-genesis-textMain leading-none tracking-[-0.02em]">Thottam</h1>
          <p className="text-[14px] text-genesis-textSub font-body mt-2">Track collections, sales, labour, medicine and farm expenses</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-genesis-primary hover:bg-genesis-primaryHover hover:-translate-y-px hover:shadow-btn text-white h-[38px] px-4 rounded-md flex items-center justify-center gap-2 text-[13px] font-medium transition-all duration-200 w-full sm:w-auto"
        >
          <Plus size={16} />
          Add Record
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-genesis-border overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
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

      {/* Data Table */}
      <div className="bg-genesis-surface border border-genesis-border rounded-xl hover:shadow-genesis transition-all duration-300 overflow-hidden">
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
                {renderTableHeaders().map((header, i) => (
                  <th key={i} className={`py-3 px-4 md:px-6 font-semibold ${header === 'Actions' ? 'text-right' : ''}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="py-12 text-center text-genesis-textSub text-[14px]">Loading data...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map(renderTableRow)
              ) : (
                <tr><td colSpan="10" className="py-16 text-center text-genesis-textSub text-[14px]">No records match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Add/Edit Modal */}
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

export default Thottam;

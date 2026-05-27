import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit, IndianRupee, Users, Shirt, Zap, Receipt, Search, CheckCircle } from 'lucide-react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const BeyondHeaven = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [receiveCost, setReceiveCost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Settings states
  const [utilityTypes, setUtilityTypes] = useState(['Electricity', 'Water', 'Internet', 'Other']);
  const [otherExpenseCategories, setOtherExpenseCategories] = useState(['Maintenance', 'Food', 'Miscellaneous', 'Other']);
  const [bookingSources, setBookingSources] = useState(['Direct', 'Booking.com', 'Airbnb', 'Walk-in']);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data.utilityTypes) setUtilityTypes(res.data.utilityTypes);
        if (res.data.otherExpenseCategories) setOtherExpenseCategories(res.data.otherExpenseCategories);
        if (res.data.bookingSources) setBookingSources(res.data.bookingSources);
      })
      .catch(err => console.error('Failed to load settings in BeyondHeaven', err));
  }, []);

  const tabs = [
    { id: 'income', label: 'Income', icon: IndianRupee },
    { id: 'salary', label: 'Staff Salary', icon: Users },
    { id: 'laundry', label: 'Laundry', icon: Shirt },
    { id: 'utility', label: 'Utility Bills', icon: Zap },
    { id: 'expense', label: 'Other Expenses', icon: Receipt },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/resort/${activeTab}`);
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
      await api.delete(`/resort/${activeTab}/${deleteTarget}`);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (item, delta) => {
    setFormData(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [item]: Math.max(0, (prev.items?.[item] || 0) + delta)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (formData._id) {
        await api.put(`/resort/${activeTab}/${formData._id}`, payload);
      } else {
        await api.post(`/resort/${activeTab}`, payload);
      }
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving record');
    }
  };

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/resort/laundry/${selectedRecord._id}`, { status: 'Received', cost: Number(receiveCost) });
      setReceiveModalOpen(false);
      setSelectedRecord(null);
      setReceiveCost('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setFormData({});
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(item).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(q)
    );
  });

  // Render Table Columns based on active tab
  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'income':
        return ['Date', 'Source', 'Amount', 'Notes', 'Actions'];
      case 'salary':
        return ['Employee', 'Status', 'Amount', 'Paid Date', 'Actions'];
      case 'laundry':
        return ['Date', 'Vendor', 'Total Qty', 'Status', 'Cost', 'Actions'];
      case 'utility':
        return ['Due Date', 'Type', 'Amount', 'Status', 'Actions'];
      case 'expense':
        return ['Date', 'Category', 'Amount', 'Description', 'Actions'];
      default:
        return [];
    }
  };

  const renderTableRow = (item) => {
    const actionButtons = (
      <div className="flex gap-2 justify-end">
        <button onClick={() => openEditModal(item)} className="text-genesis-textSub hover:text-genesis-primary transition-colors"><Edit size={16} /></button>
        <button onClick={() => handleDelete(item._id)} className="text-genesis-textSub hover:text-genesis-error transition-colors"><Trash2 size={16} /></button>
      </div>
    );

    switch (activeTab) {
      case 'income':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50">
            <td className="py-4 px-6 text-[14px] text-genesis-textSub font-mono">{new Date(item.date).toLocaleDateString()}</td>
            <td className="py-4 px-6 text-[14px] font-medium text-genesis-textMain">{item.source}</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-success">₹{item.amount?.toLocaleString()}</td>
            <td className="py-4 px-6 text-[14px] text-genesis-textSub">{item.notes || '-'}</td>
            <td className="py-4 px-6">{actionButtons}</td>
          </tr>
        );
      case 'salary':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50">
            <td className="py-4 px-6 text-[14px] font-medium text-genesis-textMain">{item.employeeName}</td>
            <td className="py-4 px-6">
              <span className={`px-3 py-1 text-[11px] rounded-full font-bold uppercase tracking-wider ${item.status === 'Paid' ? 'bg-genesis-success/10 text-genesis-success' : 'bg-genesis-warning/10 text-genesis-warning'}`}>
                {item.status}
              </span>
            </td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-textMain">₹{item.salaryAmount?.toLocaleString()}</td>
            <td className="py-4 px-6 text-[14px] font-mono text-genesis-textSub">{item.paidDate ? new Date(item.paidDate).toLocaleDateString() : '-'}</td>
            <td className="py-4 px-6">{actionButtons}</td>
          </tr>
        );
      case 'laundry':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50">
            <td className="py-4 px-6 text-[14px] font-mono text-genesis-textSub">{new Date(item.date).toLocaleDateString()}</td>
            <td className="py-4 px-6 text-[14px] font-medium text-genesis-textMain">{item.vendorName}</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-textMain">{item.totalQuantity || 0} items</td>
            <td className="py-4 px-6">
              <span className={`px-3 py-1 text-[11px] rounded-full font-bold uppercase tracking-wider ${item.status === 'Received' ? 'bg-genesis-success/10 text-genesis-success' : 'bg-genesis-warning/10 text-genesis-warning'}`}>
                {item.status || 'Sent'}
              </span>
            </td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-textMain">
              {item.status === 'Received' ? `₹${item.cost?.toLocaleString()}` : '-'}
            </td>
            <td className="py-4 px-6">
              <div className="flex gap-2 justify-end">
                {item.status !== 'Received' && (
                  <button 
                    onClick={() => { setSelectedRecord(item); setReceiveCost(''); setReceiveModalOpen(true); }} 
                    className="text-genesis-textSub hover:text-genesis-success transition-colors" title="Mark as Received"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                <button onClick={() => openEditModal(item)} className="text-genesis-textSub hover:text-genesis-primary transition-colors"><Edit size={16} /></button>
                <button onClick={() => handleDelete(item._id)} className="text-genesis-textSub hover:text-genesis-error transition-colors"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        );
      case 'utility':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50">
            <td className="py-4 px-6 text-[14px] font-mono text-genesis-textSub">{new Date(item.dueDate).toLocaleDateString()}</td>
            <td className="py-4 px-6 text-[14px] font-medium text-genesis-textMain">{item.billType}</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-textMain">₹{item.amount?.toLocaleString()}</td>
            <td className="py-4 px-6">
              <span className={`px-3 py-1 text-[11px] rounded-full font-bold uppercase tracking-wider ${item.status === 'Paid' ? 'bg-genesis-success/10 text-genesis-success' : 'bg-genesis-error/10 text-genesis-error'}`}>
                {item.status}
              </span>
            </td>
            <td className="py-4 px-6">{actionButtons}</td>
          </tr>
        );
      case 'expense':
        return (
          <tr key={item._id} className="border-b border-genesis-border hover:bg-gray-50/50">
            <td className="py-4 px-6 text-[14px] font-mono text-genesis-textSub">{new Date(item.date).toLocaleDateString()}</td>
            <td className="py-4 px-6 text-[14px] font-medium text-genesis-textMain">{item.category}</td>
            <td className="py-4 px-6 text-[14px] font-bold text-genesis-error">₹{item.amount?.toLocaleString()}</td>
            <td className="py-4 px-6 text-[14px] text-genesis-textSub">{item.description || '-'}</td>
            <td className="py-4 px-6">{actionButtons}</td>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderMobileCard = (item) => {
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
      case 'income':
        return (
          <div key={item._id} className="p-4 space-y-2 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.source}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{new Date(item.date).toLocaleDateString()}</p>
              </div>
              <span className="font-bold text-genesis-success text-[16px]">₹{item.amount?.toLocaleString()}</span>
            </div>
            {item.notes && <p className="text-[13px] text-genesis-textSub bg-gray-50 p-2.5 rounded-lg border border-genesis-border">{item.notes}</p>}
            {actionButtons}
          </div>
        );
      case 'salary':
        return (
          <div key={item._id} className="p-4 space-y-2.5 bg-white">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-genesis-textMain text-[15px]">{item.employeeName}</p>
              <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${item.status === 'Paid' ? 'bg-genesis-success/10 text-genesis-success' : 'bg-genesis-warning/10 text-genesis-warning'}`}>
                {item.status}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Salary Amount</span>
              <span className="font-bold text-genesis-textMain">₹{item.salaryAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Paid Date</span>
              <span className="font-mono text-genesis-textMain">{item.paidDate ? new Date(item.paidDate).toLocaleDateString() : '—'}</span>
            </div>
            {actionButtons}
          </div>
        );
      case 'laundry':
        return (
          <div key={item._id} className="p-4 space-y-2.5 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.vendorName}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{new Date(item.date).toLocaleDateString()}</p>
              </div>
              <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${item.status === 'Received' ? 'bg-genesis-success/10 text-genesis-success' : 'bg-genesis-warning/10 text-genesis-warning'}`}>
                {item.status || 'Sent'}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Total Quantity</span>
              <span className="font-bold text-genesis-textMain">{item.totalQuantity || 0} items</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Cost</span>
              <span className="font-bold text-genesis-textMain">{item.status === 'Received' ? `₹${item.cost?.toLocaleString()}` : '—'}</span>
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-genesis-border mt-2">
              {item.status !== 'Received' && (
                <button 
                  onClick={() => { setSelectedRecord(item); setReceiveCost(''); setReceiveModalOpen(true); }} 
                  className="text-genesis-success hover:text-green-700 flex items-center gap-1 text-[13px] font-medium transition-colors"
                >
                  <CheckCircle size={15} /> Receive
                </button>
              )}
              <button onClick={() => openEditModal(item)} className="text-genesis-textSub hover:text-genesis-primary flex items-center gap-1 text-[13px] font-medium transition-colors"><Edit size={15} /> Edit</button>
              <button onClick={() => handleDelete(item._id)} className="text-genesis-textSub hover:text-genesis-error flex items-center gap-1 text-[13px] font-medium transition-colors"><Trash2 size={15} /> Delete</button>
            </div>
          </div>
        );
      case 'utility':
        return (
          <div key={item._id} className="p-4 space-y-2.5 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.billType}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
              </div>
              <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${item.status === 'Paid' ? 'bg-genesis-success/10 text-genesis-success' : 'bg-genesis-error/10 text-genesis-error'}`}>
                {item.status}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-genesis-textSub">Amount</span>
              <span className="font-bold text-genesis-textMain">₹{item.amount?.toLocaleString()}</span>
            </div>
            {actionButtons}
          </div>
        );
      case 'expense':
        return (
          <div key={item._id} className="p-4 space-y-2 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-genesis-textMain text-[15px]">{item.category}</p>
                <p className="text-[12px] font-mono text-genesis-textSub mt-0.5">{new Date(item.date).toLocaleDateString()}</p>
              </div>
              <span className="font-bold text-genesis-error text-[16px]">₹{item.amount?.toLocaleString()}</span>
            </div>
            {item.description && <p className="text-[13px] text-genesis-textSub bg-gray-50 p-2.5 rounded-lg border border-genesis-border">{item.description}</p>}
            {actionButtons}
          </div>
        );
      default:
        return null;
    }
  };

  const renderFormFields = () => {
    const inputClass = "w-full p-2 border border-genesis-border rounded-md text-[14px] bg-gray-50 focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all text-genesis-textMain";
    const labelClass = "block text-[13px] font-medium text-genesis-textSub mb-1.5";

    switch (activeTab) {
      case 'income':
        return (
          <>
            <div>
              <label className={labelClass}>Source</label>
              <select name="source" value={formData.source || ''} required onChange={handleInputChange} className={inputClass}>
                <option value="">Select Source</option>
                {bookingSources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Amount (₹)</label><input type="number" name="amount" value={formData.amount || ''} required onChange={handleInputChange} className={inputClass} /></div>
            <div><label className={labelClass}>Date</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleInputChange} className={inputClass} /></div>
            <div><label className={labelClass}>Notes</label><textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} className={inputClass}></textarea></div>
          </>
        );
      case 'salary':
        return (
          <>
            <div><label className={labelClass}>Employee Name</label><input type="text" name="employeeName" value={formData.employeeName || ''} required onChange={handleInputChange} className={inputClass} /></div>
            <div><label className={labelClass}>Salary Amount (₹)</label><input type="number" name="salaryAmount" value={formData.salaryAmount || ''} required onChange={handleInputChange} className={inputClass} /></div>
            <div><label className={labelClass}>Status</label><select name="status" value={formData.status || 'Pending'} onChange={handleInputChange} className={inputClass}><option value="Pending">Pending</option><option value="Paid">Paid</option></select></div>
            {formData.status === 'Paid' && <div><label className={labelClass}>Paid Date</label><input type="date" name="paidDate" value={formData.paidDate ? formData.paidDate.split('T')[0] : ''} onChange={handleInputChange} className={inputClass} /></div>}
          </>
        );
      case 'laundry': {
        const itemsList = [
          { key: 'towels', label: 'Towels' },
          { key: 'handTowels', label: 'Hand Towels' },
          { key: 'bedSheets', label: 'Bed Sheets' },
          { key: 'pillowCovers', label: 'Pillow Covers' },
          { key: 'duvets', label: 'Duvets' },
          { key: 'blankets', label: 'Blankets' }
        ];
        return (
          <>
            <div><label className={labelClass}>Vendor Name</label><input type="text" name="vendorName" value={formData.vendorName || ''} required onChange={handleInputChange} className={inputClass} /></div>
            
            <div className="border border-genesis-border rounded-xl p-4 bg-white mt-2">
              <label className="block text-[14px] font-bold text-genesis-textMain mb-3 border-b border-genesis-border pb-2">Laundry Items</label>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                {itemsList.map(item => (
                  <div key={item.key} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-genesis-border">
                    <span className="text-[13px] font-medium text-genesis-textMain">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleItemChange(item.key, -1)} className="w-7 h-7 rounded border border-genesis-border bg-white hover:bg-gray-50 flex items-center justify-center font-bold text-genesis-textMain transition-colors">-</button>
                      <span className="w-4 text-center text-[14px] font-bold text-genesis-textMain">{formData.items?.[item.key] || 0}</span>
                      <button type="button" onClick={() => handleItemChange(item.key, 1)} className="w-7 h-7 rounded bg-genesis-primary text-white hover:bg-genesis-primaryHover flex items-center justify-center font-bold transition-colors">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div><label className={labelClass}>Date Sent</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleInputChange} className={inputClass} /></div>
            </div>
          </>
        );
      }
      case 'utility':
        return (
          <>
            <div>
              <label className={labelClass}>Bill Type</label>
              <select name="billType" value={formData.billType || ''} onChange={handleInputChange} className={inputClass}>
                <option value="">Select Type</option>
                {utilityTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Amount (₹)</label><input type="number" name="amount" value={formData.amount || ''} required onChange={handleInputChange} className={inputClass} /></div>
            <div><label className={labelClass}>Due Date</label><input type="date" name="dueDate" value={formData.dueDate ? formData.dueDate.split('T')[0] : ''} required onChange={handleInputChange} className={inputClass} /></div>
            <div><label className={labelClass}>Status</label><select name="status" value={formData.status || 'Pending'} onChange={handleInputChange} className={inputClass}><option value="Pending">Pending</option><option value="Paid">Paid</option></select></div>
          </>
        );
      case 'expense':
        return (
          <>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={formData.category || ''} onChange={handleInputChange} className={inputClass}>
                <option value="">Select Category</option>
                {otherExpenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Amount (₹)</label><input type="number" name="amount" value={formData.amount || ''} required onChange={handleInputChange} className={inputClass} /></div>
            <div><label className={labelClass}>Description</label><textarea name="description" value={formData.description || ''} onChange={handleInputChange} className={inputClass}></textarea></div>
          </>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4">
        <div>
          <p className="text-[11px] font-display font-bold text-genesis-primary uppercase tracking-widest mb-1">Resort Management</p>
          <h1 className="text-[28px] md:text-[32px] font-display font-bold text-genesis-textMain leading-none tracking-[-0.02em]">Beyond Heaven</h1>
          <p className="text-[14px] text-genesis-textSub font-body mt-2">Manage resort operations, incomes, and expenses</p>
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
              onClick={() => setActiveTab(tab.id)}
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

      {/* Data Table Container */}
      <div className="bg-genesis-surface border border-genesis-border rounded-xl hover:shadow-genesis transition-all duration-300 overflow-hidden">
        <div className="p-4 px-6 border-b border-genesis-border flex flex-col md:flex-row justify-between md:items-center bg-white gap-4">
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
          <p className="text-[13px] text-genesis-textSub font-mono uppercase tracking-wider">Total: {filteredData.length}</p>
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
          <table className="w-full text-left border-collapse min-w-[600px]">
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
                <tr><td colSpan="6" className="py-12 text-center text-genesis-textSub text-[14px]">Loading data...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map(renderTableRow)
              ) : (
                <tr><td colSpan="6" className="py-16 text-center text-genesis-textSub text-[14px]">No records match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Add/Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-genesis-textMain/20 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-genesis-surface border border-genesis-border rounded-xl shadow-genesis w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-genesis-border flex justify-between items-center bg-white">
              <h3 className="text-[16px] font-display font-bold text-genesis-textMain">{formData._id ? 'Edit Record' : 'Add New Record'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-genesis-textSub hover:text-genesis-textMain transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {renderFormFields()}
              <div className="pt-6 flex gap-3 justify-end border-t border-genesis-border mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="h-[38px] px-4 rounded-md border border-genesis-border bg-transparent text-genesis-textMain font-medium text-[13px] hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="h-[38px] px-4 rounded-md bg-genesis-primary text-white font-medium text-[13px] hover:shadow-btn transition-shadow">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Laundry Modal */}
      {receiveModalOpen && (
        <div className="fixed inset-0 bg-genesis-textMain/20 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-genesis-surface border border-genesis-border rounded-xl shadow-genesis w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-genesis-border flex justify-between items-center bg-white">
              <h3 className="text-[16px] font-display font-bold text-genesis-textMain">Receive Laundry</h3>
              <button onClick={() => setReceiveModalOpen(false)} className="text-genesis-textSub hover:text-genesis-textMain transition-colors">&times;</button>
            </div>
            <form onSubmit={handleReceiveSubmit} className="p-6 space-y-4">
              <p className="text-[14px] text-genesis-textSub mb-4">Enter the final cost paid to <strong className="text-genesis-textMain font-medium">{selectedRecord?.vendorName}</strong>.</p>
              <div>
                <label className="block text-[13px] font-medium text-genesis-textSub mb-1.5">Final Cost (₹)</label>
                <input 
                  type="number" 
                  value={receiveCost} 
                  required 
                  onChange={(e) => setReceiveCost(e.target.value)} 
                  className="w-full p-2 border border-genesis-border rounded-md text-[14px] bg-gray-50 focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all" 
                  autoFocus
                />
              </div>
              <div className="pt-6 flex gap-3 justify-end border-t border-genesis-border mt-6">
                <button type="button" onClick={() => setReceiveModalOpen(false)} className="h-[38px] px-4 rounded-md border border-genesis-border bg-transparent text-genesis-textMain font-medium text-[13px] hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="h-[38px] px-4 rounded-md bg-genesis-success text-white font-medium text-[13px] hover:shadow-btn transition-shadow">Confirm Received</button>
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

export default BeyondHeaven;

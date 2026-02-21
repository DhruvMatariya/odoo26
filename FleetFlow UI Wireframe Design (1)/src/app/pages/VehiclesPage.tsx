import React, { useState } from 'react';
import { Plus, Search, Filter, ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useApp, Vehicle } from '../context/AppContext';
import { StatusPill } from '../components/StatusPill';
import { Modal, FormField, inputCls, selectCls } from '../components/Modal';

const DARK_CSS = `
  .ff-pg-card { background:#0D1017; border:1px solid #1E2330; border-radius:12px; }
  .ff-pg-table { width:100%; border-collapse:collapse; }
  .ff-pg-thead tr { background:#0A0C10; border-bottom:1px solid #1E2330; }
  .ff-pg-th { padding:11px 20px; text-align:left; font-family:'Poppins',sans-serif; font-size:10px; font-weight:600; color:#334155; text-transform:uppercase; letter-spacing:.08em; white-space:nowrap; }
  .ff-pg-tbody tr { border-bottom:1px solid #111318; transition:background 140ms; }
  .ff-pg-tbody tr:last-child { border-bottom:none; }
  .ff-pg-tbody tr:hover { background:rgba(30,42,62,.35); }
  .ff-pg-td { padding:13px 20px; font-family:'Poppins',sans-serif; font-size:13px; color:#94A3B8; }
  .ff-pg-search { background:#0A0C10; border:1px solid #1E2330; border-radius:10px; color:#F1F5F9; font-family:'Poppins',sans-serif; font-size:13px; padding:9px 14px 9px 36px; outline:none; width:100%; transition:border-color 200ms,box-shadow 200ms; }
  .ff-pg-search::placeholder { color:#334155; }
  .ff-pg-search:focus { border-color:rgba(59,130,246,.45); box-shadow:0 0 0 3px rgba(59,130,246,.08); }
  .ff-pg-select { background:#0A0C10; border:1px solid #1E2330; border-radius:8px; color:#F1F5F9; font-family:'Poppins',sans-serif; font-size:13px; padding:8px 12px; outline:none; transition:border-color 180ms; }
  .ff-pg-select:focus { border-color:rgba(59,130,246,.4); }
  .ff-pg-tabs { display:flex; gap:3px; background:#0D1017; border:1px solid #1E2330; border-radius:10px; padding:4px; flex-wrap:wrap; }
  .ff-pg-tab { padding:6px 14px; border-radius:7px; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; color:#64748B; cursor:pointer; background:transparent; border:1px solid transparent; transition:all 160ms; white-space:nowrap; }
  .ff-pg-tab.active { background:#1E2A3E; color:#3B82F6; border-color:rgba(59,130,246,.25); }
  .ff-pg-tab:not(.active):hover { color:#94A3B8; }
  .ff-pg-btn-primary { display:flex; align-items:center; gap:6px; padding:9px 16px; background:#3B82F6; border:none; border-radius:8px; color:#fff; font-family:'Poppins',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:background 180ms,box-shadow 180ms; white-space:nowrap; }
  .ff-pg-btn-primary:hover { background:#2563EB; box-shadow:0 4px 16px rgba(59,130,246,.35); }
  .ff-pg-btn-ghost { display:flex; align-items:center; gap:6px; padding:9px 14px; background:transparent; border:1px solid #1E2330; border-radius:8px; color:#64748B; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:border-color 160ms,color 160ms; }
  .ff-pg-btn-ghost:hover { border-color:#334155; color:#94A3B8; }
  .ff-pg-row-action { font-family:'Poppins',sans-serif; font-size:11px; font-weight:500; padding:4px 10px; border-radius:6px; cursor:pointer; border:none; transition:background 150ms,color 150ms; }
  .ff-badge { display:inline-block; font-family:'Poppins',sans-serif; font-size:11px; font-weight:500; padding:3px 9px; border-radius:6px; background:rgba(255,255,255,.05); color:#64748B; border:1px solid #1A2030; }
  /* Responsive table wrapper — scrolls horizontally when sidebar narrows the view */
  .ff-table-wrap { overflow-x:auto; transition:width 260ms ease; }
`;

const EMPTY_FORM = {
  model: '', plate: '',
  type: 'Van' as Vehicle['type'],
  capacity: '', purchaseDate: '',
  status: 'Available' as Vehicle['status'],
  odometer: '',
};

export function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicleStatus } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = vehicles.filter(v => {
    const ms = v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase());
    const mt = filterType === 'All' || v.type === filterType;
    const ms2 = filterStatus === 'All' || v.status === filterStatus;
    return ms && mt && ms2;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.model || !form.plate || !form.capacity) { setError('Please fill all required fields.'); return; }
    setSubmitting(true);
    setError('');
    const result = await addVehicle({
      model: form.model,
      plate: form.plate,
      type: form.type,
      capacity: Number(form.capacity),
      purchaseDate: form.purchaseDate,
      status: form.status,
      odometer: Number(form.odometer) || 0,
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Failed to add vehicle.');
      return;
    }
    setForm(EMPTY_FORM);
    setShowModal(false);
    toast.success('Vehicle added to fleet.');
  };

  const handleStatusChange = async (v: Vehicle, newStatus: Vehicle['status']) => {
    const result = await updateVehicleStatus(v.id, newStatus);
    if (result.success) {
      toast.success(newStatus === 'Retired' ? 'Vehicle retired.' : 'Vehicle restored.');
    } else {
      toast.error(result.error || 'Failed to update status.');
    }
  };

  const field = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const statusCounts: Record<string, number> = {
    All: vehicles.length,
    Available: vehicles.filter(v => v.status === 'Available').length,
    'On Trip': vehicles.filter(v => v.status === 'On Trip').length,
    'In Shop': vehicles.filter(v => v.status === 'In Shop').length,
    Retired: vehicles.filter(v => v.status === 'Retired').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{DARK_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Vehicle Registry</h1>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>
            Manage your fleet assets — {vehicles.length} total vehicles
          </p>
        </div>
        <button className="ff-pg-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Vehicle
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="ff-pg-tabs" style={{ width: 'fit-content' }}>
        {Object.entries(statusCounts).map(([s, count]) => (
          <button key={s} className={`ff-pg-tab${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s} <span style={{ opacity: .55, fontSize: 11 }}>({count})</span>
          </button>
        ))}
      </div>

      {/* Search + Type filter */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
          <input className="ff-pg-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by model, plate, ID..." />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={13} style={{ color: '#334155' }} />
          <select className="ff-pg-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option>All</option><option>Truck</option><option>Van</option><option>Bike</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="ff-pg-card" style={{ overflow: 'hidden' }}>
        <div className="ff-table-wrap">
          <table className="ff-pg-table">
            <thead className="ff-pg-thead">
              <tr>
                {['Vehicle ID', 'Model', 'Plate', 'Type', 'Capacity (kg)', 'Status', 'Odometer (km)', 'Purchase Date', 'Actions'].map(col => (
                  <th key={col} className="ff-pg-th">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="ff-pg-tbody">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px 20px', textAlign: 'center', fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#334155' }}>
                    No vehicles found matching your filters.
                  </td>
                </tr>
              ) : filtered.map(v => (
                <tr key={v.id}>
                  <td className="ff-pg-td" style={{ color: '#3B82F6', fontWeight: 600 }}>{v.id}</td>
                  <td className="ff-pg-td" style={{ color: '#F1F5F9', fontWeight: 500 }}>{v.model}</td>
                  <td className="ff-pg-td" style={{ fontFamily: 'monospace', color: '#94A3B8' }}>{v.plate}</td>
                  <td className="ff-pg-td"><span className="ff-badge">{v.type}</span></td>
                  <td className="ff-pg-td">{v.capacity.toLocaleString()}</td>
                  <td className="ff-pg-td"><StatusPill status={v.status} /></td>
                  <td className="ff-pg-td">{v.odometer.toLocaleString()}</td>
                  <td className="ff-pg-td" style={{ color: '#64748B' }}>{v.purchaseDate}</td>
                  <td className="ff-pg-td">
                    <div style={{ display: 'flex', gap: 4 }}>
                      {v.status !== 'Retired' ? (
                        <button className="ff-pg-row-action" onClick={() => handleStatusChange(v, 'Retired')}
                          style={{ background: 'rgba(239,68,68,.08)', color: '#EF4444' }}>
                          <ToggleLeft size={12} style={{ display: 'inline', marginRight: 3 }} />Retire
                        </button>
                      ) : (
                        <button className="ff-pg-row-action" onClick={() => handleStatusChange(v, 'Available')}
                          style={{ background: 'rgba(16,185,129,.08)', color: '#10B981' }}>
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 20px', borderTop: '1px solid #111318' }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#334155', margin: 0 }}>
            Showing {filtered.length} of {vehicles.length} vehicles
          </p>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}
        title="Add New Vehicle" subtitle="Register a new asset to the fleet">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Model / Name" required>
              <input value={form.model} onChange={e => field('model', e.target.value)} placeholder="e.g. Toyota Hiace" className={inputCls} />
            </FormField>
            <FormField label="Registration Plate" required>
              <input value={form.plate} onChange={e => field('plate', e.target.value)} placeholder="e.g. KCA 001A" className={inputCls} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Vehicle Type" required>
              <select value={form.type} onChange={e => field('type', e.target.value)} className={selectCls}>
                <option>Truck</option><option>Van</option><option>Bike</option>
              </select>
            </FormField>
            <FormField label="Max Capacity (kg)" required>
              <input type="number" value={form.capacity} onChange={e => field('capacity', e.target.value)} placeholder="e.g. 5000" className={inputCls} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Purchase Date">
              <input type="date" value={form.purchaseDate} onChange={e => field('purchaseDate', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Initial Odometer (km)">
              <input type="number" value={form.odometer} onChange={e => field('odometer', e.target.value)} placeholder="0" className={inputCls} />
            </FormField>
          </div>
          <FormField label="Initial Status">
            <select value={form.status} onChange={e => field('status', e.target.value)} className={selectCls}>
              <option>Available</option><option>In Shop</option><option>Retired</option>
            </select>
          </FormField>
          {error && (
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px', margin: 0 }}>
              {error}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="submit" className="ff-pg-btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Vehicle'}
            </button>
            <button type="button" className="ff-pg-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
import React, { useState } from 'react';
import { Plus, Search, AlertTriangle, CheckCircle2, Wrench } from 'lucide-react';
import { useApp, MaintenanceLog } from '../context/AppContext';
import { StatusPill } from '../components/StatusPill';
import { Modal, FormField, inputCls, selectCls } from '../components/Modal';
import { toast } from 'sonner';

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
  .ff-pg-tabs { display:flex; gap:3px; background:#0D1017; border:1px solid #1E2330; border-radius:10px; padding:4px; flex-wrap:wrap; }
  .ff-pg-tab { padding:6px 14px; border-radius:7px; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; color:#64748B; cursor:pointer; background:transparent; border:1px solid transparent; transition:all 160ms; white-space:nowrap; }
  .ff-pg-tab.active { background:#1E2A3E; color:#3B82F6; border-color:rgba(59,130,246,.25); }
  .ff-pg-tab:not(.active):hover { color:#94A3B8; }
  .ff-pg-btn-primary { display:flex; align-items:center; gap:6px; padding:9px 16px; background:#3B82F6; border:none; border-radius:8px; color:#fff; font-family:'Poppins',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:background 180ms,box-shadow 180ms; white-space:nowrap; }
  .ff-pg-btn-primary:hover { background:#2563EB; box-shadow:0 4px 16px rgba(59,130,246,.35); }
  .ff-pg-btn-ghost { display:flex; align-items:center; gap:6px; padding:9px 14px; background:transparent; border:1px solid #1E2330; border-radius:8px; color:#64748B; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:border-color 160ms,color 160ms; }
  .ff-pg-btn-ghost:hover { border-color:#334155; color:#94A3B8; }
`;

const EMPTY_FORM = {
  vehicleId: '', issue: '', serviceDate: '', cost: '',
  status: 'Scheduled' as MaintenanceLog['status'],
};

export function MaintenancePage() {
  const { maintenance, vehicles, addMaintenanceLog, updateMaintenanceStatus, getVehicleById } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = maintenance.filter(log => {
    const v = getVehicleById(log.vehicleId);
    const ms = log.id.toLowerCase().includes(search.toLowerCase()) ||
      log.issue.toLowerCase().includes(search.toLowerCase()) ||
      v?.model.toLowerCase().includes(search.toLowerCase()) ||
      log.vehicleId.toLowerCase().includes(search.toLowerCase());
    return ms && (filterStatus === 'All' || log.status === filterStatus);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.issue || !form.serviceDate) { setError('Please fill all required fields.'); return; }
    setSubmitting(true);
    try {
      const result = await addMaintenanceLog({ vehicleId: form.vehicleId, issue: form.issue, serviceDate: form.serviceDate, cost: Number(form.cost) || 0, status: form.status });
      if (result.success) {
        toast.success('Maintenance log created successfully.');
        setForm(EMPTY_FORM); setShowModal(false); setError('');
      } else {
        setError(result.error || 'Failed to create log.');
      }
    } catch {
      setError('Unexpected error.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const totalCost = maintenance.reduce((s, l) => s + l.cost, 0);
  const inShopVehicles = vehicles.filter(v => v.status === 'In Shop');

  const summaryCards = [
    { label: 'Total Maintenance Cost', value: `KES ${totalCost.toLocaleString()}`, sub: 'Across all service logs', color: '#F1F5F9', accent: 'rgba(59,130,246,0.1)', accentColor: '#3B82F6' },
    { label: 'Vehicles In Shop', value: String(inShopVehicles.length), sub: 'Removed from dispatch queue', color: '#F59E0B', accent: 'rgba(245,158,11,0.1)', accentColor: '#F59E0B' },
    { label: 'Open Logs', value: String(maintenance.filter(m => m.status !== 'Completed').length), sub: 'Scheduled + In Progress', color: '#3B82F6', accent: 'rgba(59,130,246,0.1)', accentColor: '#3B82F6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{DARK_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Maintenance & Service Logs</h1>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>
            Track vehicle health — {maintenance.length} logs
          </p>
        </div>
        <button className="ff-pg-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Log Service
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {summaryCards.map(card => (
          <div key={card.label} className="ff-pg-card" style={{ padding: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: card.accent, border: `1px solid ${card.accentColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: card.accentColor }} />
            </div>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>{card.label}</p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 700, color: card.color, margin: '0 0 2px' }}>{card.value}</p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: 0 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* In Shop alert */}
      {inShopVehicles.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#F59E0B', margin: 0 }}>
            <strong>Vehicles in shop:</strong>{' '}
            {inShopVehicles.map(v => `${v.id.slice(0, 8)} (${v.model})`).join(', ')} — hidden from dispatcher.
          </p>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
          <input className="ff-pg-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs, vehicles, issues..." />
        </div>
        <div className="ff-pg-tabs">
          {['All', 'Scheduled', 'In Progress', 'Completed'].map(s => (
            <button key={s} className={`ff-pg-tab${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="ff-pg-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ff-pg-table">
            <thead className="ff-pg-thead">
              <tr>
                {['Log ID', 'Vehicle', 'Issue / Service', 'Service Date', 'Cost (KES)', 'Status', 'Actions'].map(col => (
                  <th key={col} className="ff-pg-th">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="ff-pg-tbody">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#334155' }}>No maintenance logs found.</td></tr>
              ) : filtered.map(log => {
                const vehicle = getVehicleById(log.vehicleId);
                return (
                  <tr key={log.id}>
                    <td className="ff-pg-td" style={{ color: '#3B82F6', fontWeight: 600 }}>{log.id.slice(0, 8)}</td>
                    <td className="ff-pg-td">
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#F1F5F9', fontWeight: 500, margin: 0 }}>{vehicle?.model ?? log.vehicleId.slice(0, 8)}</p>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: '2px 0 0' }}>{log.vehicleId.slice(0, 8)} · {vehicle?.plate}</p>
                    </td>
                    <td className="ff-pg-td" style={{ color: '#F1F5F9' }}>{log.issue}</td>
                    <td className="ff-pg-td">{log.serviceDate}</td>
                    <td className="ff-pg-td" style={{ fontWeight: 600, color: '#F1F5F9' }}>{log.cost.toLocaleString()}</td>
                    <td className="ff-pg-td"><StatusPill status={log.status} /></td>
                    <td className="ff-pg-td">
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                        {log.status === 'Scheduled' && (
                          <button className="ff-pg-row-action" onClick={async () => {
                            const r = await updateMaintenanceStatus(log.id, 'In Progress');
                            r.success ? toast.success('Log moved to In Progress.') : toast.error(r.error || 'Failed.');
                          }}
                            style={{ background: 'rgba(59,130,246,.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px', borderRadius: 6, border: 'none', fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <Wrench size={11} />Start
                          </button>
                        )}
                        {(log.status === 'Scheduled' || log.status === 'In Progress') && (
                          <button className="ff-pg-row-action" onClick={async () => {
                            const r = await updateMaintenanceStatus(log.id, 'Completed');
                            r.success ? toast.success('Maintenance completed.') : toast.error(r.error || 'Failed.');
                          }}
                            style={{ background: 'rgba(16,185,129,.1)', color: '#10B981', display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px', borderRadius: 6, border: 'none', fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <CheckCircle2 size={11} />Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 20px', borderTop: '1px solid #111318' }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#334155', margin: 0 }}>
            Showing {filtered.length} of {maintenance.length} logs
            {filtered.length > 0 && <span style={{ marginLeft: 8, color: '#1E2330' }}>· Total: KES {filtered.reduce((s, l) => s + l.cost, 0).toLocaleString()}</span>}
          </p>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}
        title="Log New Service" subtitle="Adding a vehicle automatically sets status to In Shop">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="Vehicle" required>
            <select value={form.vehicleId} onChange={e => field('vehicleId', e.target.value)} className={selectCls}>
              <option value="">— Select vehicle —</option>
              {vehicles.filter(v => v.status !== 'Retired').map(v => (
                <option key={v.id} value={v.id}>{v.id.slice(0, 8)} – {v.model} · {v.plate} ({v.status})</option>
              ))}
            </select>
          </FormField>
          <FormField label="Issue / Service Description" required>
            <input value={form.issue} onChange={e => field('issue', e.target.value)} placeholder="e.g. Engine oil change, brake pad replacement..." className={inputCls} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Service Date" required>
              <input type="date" value={form.serviceDate} onChange={e => field('serviceDate', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Estimated Cost (KES)">
              <input type="number" value={form.cost} onChange={e => field('cost', e.target.value)} placeholder="e.g. 15000" className={inputCls} />
            </FormField>
          </div>
          <FormField label="Status">
            <select value={form.status} onChange={e => field('status', e.target.value)} className={selectCls}>
              <option>Scheduled</option><option>In Progress</option><option>Completed</option>
            </select>
          </FormField>
          <div style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.18)', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#F59E0B', fontWeight: 500, margin: 0 }}>
              ⚠ Auto-logic: Vehicle will be set to "In Shop" and removed from the dispatcher queue.
            </p>
          </div>
          {error && (
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px', margin: 0 }}>{error}</p>
          )}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="submit" className="ff-pg-btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>{submitting ? 'Saving...' : 'Create Log'}</button>
            <button type="button" className="ff-pg-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

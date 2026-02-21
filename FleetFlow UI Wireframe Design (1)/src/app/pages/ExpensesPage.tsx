import React, { useState } from 'react';
import { Plus, Search, Download, Fuel, DollarSign, TrendingUp, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
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
  .ff-pg-btn-primary { display:flex; align-items:center; gap:6px; padding:9px 16px; background:#3B82F6; border:none; border-radius:8px; color:#fff; font-family:'Poppins',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:background 180ms,box-shadow 180ms; white-space:nowrap; }
  .ff-pg-btn-primary:hover { background:#2563EB; box-shadow:0 4px 16px rgba(59,130,246,.35); }
  .ff-pg-btn-ghost { display:flex; align-items:center; gap:6px; padding:9px 14px; background:transparent; border:1px solid #1E2330; border-radius:8px; color:#64748B; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:border-color 160ms,color 160ms; }
  .ff-pg-btn-ghost:hover { border-color:#334155; color:#94A3B8; }
`;

const EMPTY_FORM = {
  tripId: '', fuelAmount: '', fuelCost: '', otherExpense: '', expenseNote: '',
  date: new Date().toISOString().split('T')[0],
};

export function ExpensesPage() {
  const { expenses, trips, addExpense, deleteExpense, getVehicleById, getDriverById } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const completedTrips = trips.filter(t => t.status === 'Completed' || t.status === 'Dispatched');
  const filtered = expenses.filter(e =>
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.tripId.toLowerCase().includes(search.toLowerCase()) ||
    e.expenseNote.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tripId || !form.date) { setError('Please select a trip and date.'); return; }
    setSubmitting(true);
    try {
      const result = await addExpense({ tripId: form.tripId, fuelAmount: Number(form.fuelAmount) || 0, fuelCost: Number(form.fuelCost) || 0, otherExpense: Number(form.otherExpense) || 0, expenseNote: form.expenseNote, date: form.date });
      if (result.success) {
        toast.success('Expense entry created successfully.');
        setForm(EMPTY_FORM); setShowModal(false); setError('');
      } else {
        setError(result.error || 'Failed to create expense.');
      }
    } catch {
      setError('Unexpected error.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const totalFuel = expenses.reduce((s, e) => s + e.fuelCost, 0);
  const totalOther = expenses.reduce((s, e) => s + e.otherExpense, 0);
  const grandTotal = totalFuel + totalOther;

  const summaryCards = [
    { label: 'Total Fuel Cost', value: `KES ${totalFuel.toLocaleString()}`, sub: `${expenses.reduce((s, e) => s + e.fuelAmount, 0).toLocaleString()} liters total`, icon: Fuel, accent: 'rgba(59,130,246,0.1)', iconColor: '#3B82F6' },
    { label: 'Other Expenses', value: `KES ${totalOther.toLocaleString()}`, sub: 'Tolls, parking, misc.', icon: DollarSign, accent: 'rgba(245,158,11,0.1)', iconColor: '#F59E0B' },
    { label: 'Total Operational', value: `KES ${grandTotal.toLocaleString()}`, sub: 'Fuel + all other expenses', icon: TrendingUp, accent: 'rgba(16,185,129,0.1)', iconColor: '#10B981' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{DARK_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Expense & Fuel Tracking</h1>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>
            Financial tracking per trip and asset — {expenses.length} entries
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ff-pg-btn-ghost"><Download size={14} /> Export CSV</button>
          <button className="ff-pg-btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Expense</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {summaryCards.map(card => (
          <div key={card.label} className="ff-pg-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: card.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={16} style={{ color: card.iconColor }} />
              </div>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#64748B', margin: 0 }}>{card.label}</p>
            </div>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9', margin: '0 0 3px' }}>{card.value}</p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: 0 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 340 }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
        <input className="ff-pg-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by entry ID, trip, note..." />
      </div>

      {/* Table */}
      <div className="ff-pg-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ff-pg-table">
            <thead className="ff-pg-thead">
              <tr>
                {['Entry ID', 'Trip ID', 'Driver', 'Vehicle', 'Fuel (L)', 'Fuel Cost', 'Other Expense', 'Note', 'Total Cost', 'Date', ''].map(col => (
                  <th key={col} className="ff-pg-th">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="ff-pg-tbody">
              {filtered.length === 0 ? (
                <tr><td colSpan={11} style={{ padding: '48px 20px', textAlign: 'center', fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#334155' }}>No expense entries found.</td></tr>
              ) : filtered.map(entry => {
                const trip = trips.find(t => t.id === entry.tripId);
                const vehicle = trip ? getVehicleById(trip.vehicleId) : undefined;
                const driver = trip ? getDriverById(trip.driverId) : undefined;
                const total = entry.fuelCost + entry.otherExpense;
                return (
                  <tr key={entry.id}>
                    <td className="ff-pg-td" style={{ color: '#3B82F6', fontWeight: 600 }}>{entry.id.slice(0, 8)}</td>
                    <td className="ff-pg-td" style={{ color: '#F1F5F9', fontWeight: 500 }}>{entry.tripId.slice(0, 8)}</td>
                    <td className="ff-pg-td">{driver?.name ?? '—'}</td>
                    <td className="ff-pg-td">{vehicle?.model ?? '—'}</td>
                    <td className="ff-pg-td">{entry.fuelAmount} L</td>
                    <td className="ff-pg-td">KES {entry.fuelCost.toLocaleString()}</td>
                    <td className="ff-pg-td">KES {entry.otherExpense.toLocaleString()}</td>
                    <td className="ff-pg-td" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748B' }}>{entry.expenseNote || '—'}</td>
                    <td className="ff-pg-td" style={{ color: '#F1F5F9', fontWeight: 600 }}>KES {total.toLocaleString()}</td>
                    <td className="ff-pg-td" style={{ color: '#64748B', whiteSpace: 'nowrap' }}>{entry.date}</td>
                    <td className="ff-pg-td">
                      <button onClick={async () => {
                        const r = await deleteExpense(entry.id);
                        r.success ? toast.success('Expense deleted.') : toast.error(r.error || 'Failed.');
                      }}
                        style={{ background: 'rgba(239,68,68,.08)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px', borderRadius: 6, border: 'none', fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        <Trash2 size={11} />Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 20px', borderTop: '1px solid #111318', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#334155', margin: 0 }}>
            Showing {filtered.length} of {expenses.length} entries
          </p>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#64748B', margin: 0, fontWeight: 600 }}>
            Visible: KES {filtered.reduce((s, e) => s + e.fuelCost + e.otherExpense, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}
        title="Add Expense Entry" subtitle="Record fuel and operational costs for a trip">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="Trip" required>
            <select value={form.tripId} onChange={e => field('tripId', e.target.value)} className={selectCls}>
              <option value="">— Select trip —</option>
              {completedTrips.map(t => {
                const d = getDriverById(t.driverId);
                return <option key={t.id} value={t.id}>{t.id.slice(0, 8)} — {t.origin} → {t.destination} ({d?.name ?? '?'})</option>;
              })}
            </select>
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Fuel Amount (Liters)">
              <input type="number" value={form.fuelAmount} onChange={e => field('fuelAmount', e.target.value)} placeholder="e.g. 80" className={inputCls} />
            </FormField>
            <FormField label="Fuel Cost (KES)">
              <input type="number" value={form.fuelCost} onChange={e => field('fuelCost', e.target.value)} placeholder="e.g. 12000" className={inputCls} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Other Expense (KES)">
              <input type="number" value={form.otherExpense} onChange={e => field('otherExpense', e.target.value)} placeholder="Tolls, parking, etc." className={inputCls} />
            </FormField>
            <FormField label="Date" required>
              <input type="date" value={form.date} onChange={e => field('date', e.target.value)} className={inputCls} />
            </FormField>
          </div>
          <FormField label="Expense Note">
            <input value={form.expenseNote} onChange={e => field('expenseNote', e.target.value)} placeholder="Brief description..." className={inputCls} />
          </FormField>
          {(form.fuelCost || form.otherExpense) && (
            <div style={{ background: '#0A0C10', border: '1px solid #1E2330', borderRadius: 8, padding: '12px 14px' }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#64748B', margin: '0 0 3px' }}>Calculated Total</p>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 16, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                KES {((Number(form.fuelCost) || 0) + (Number(form.otherExpense) || 0)).toLocaleString()}
              </p>
            </div>
          )}
          {error && (
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px', margin: 0 }}>{error}</p>
          )}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="submit" className="ff-pg-btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>{submitting ? 'Saving...' : 'Save Entry'}</button>
            <button type="button" className="ff-pg-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

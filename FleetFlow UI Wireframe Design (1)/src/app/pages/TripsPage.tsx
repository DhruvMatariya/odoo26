import React, { useState } from 'react';
import { Plus, Search, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useApp, Trip } from '../context/AppContext';
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
  .ff-pg-tabs { display:flex; gap:3px; background:#0D1017; border:1px solid #1E2330; border-radius:10px; padding:4px; flex-wrap:wrap; }
  .ff-pg-tab { padding:6px 14px; border-radius:7px; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; color:#64748B; cursor:pointer; background:transparent; border:1px solid transparent; transition:all 160ms; white-space:nowrap; }
  .ff-pg-tab.active { background:#1E2A3E; color:#3B82F6; border-color:rgba(59,130,246,.25); }
  .ff-pg-tab:not(.active):hover { color:#94A3B8; }
  .ff-pg-btn-primary { display:flex; align-items:center; gap:6px; padding:9px 16px; background:#3B82F6; border:none; border-radius:8px; color:#fff; font-family:'Poppins',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:background 180ms,box-shadow 180ms; white-space:nowrap; }
  .ff-pg-btn-primary:hover { background:#2563EB; box-shadow:0 4px 16px rgba(59,130,246,.35); }
  .ff-pg-btn-ghost { display:flex; align-items:center; gap:6px; padding:9px 14px; background:transparent; border:1px solid #1E2330; border-radius:8px; color:#64748B; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:border-color 160ms,color 160ms; }
  .ff-pg-btn-ghost:hover { border-color:#334155; color:#94A3B8; }
  .ff-pg-row-action { font-family:'Poppins',sans-serif; font-size:11px; font-weight:500; padding:4px 10px; border-radius:6px; cursor:pointer; border:none; transition:background 150ms,color 150ms; display:inline-flex; align-items:center; gap:3px; }
`;

const EMPTY_FORM = {
  vehicleId: '', driverId: '', origin: '', destination: '',
  departureTime: '', eta: '', cargoWeight: '', estimatedCost: '',
};

export function TripsPage() {
  const { trips, vehicles, drivers, addTrip, updateTripStatus, getVehicleById, getDriverById, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');
  const [capacityWarning, setCapacityWarning] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canCreate = ['Admin', 'Fleet Manager', 'Dispatcher'].includes(currentUser?.role ?? '');
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status !== 'Suspended' && new Date(d.licenseExpiry) > new Date());

  const filtered = trips.filter(t => {
    const v = getVehicleById(t.vehicleId);
    const d = getDriverById(t.driverId);
    const ms = t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.origin.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase()) ||
      v?.model.toLowerCase().includes(search.toLowerCase()) ||
      d?.name.toLowerCase().includes(search.toLowerCase());
    return ms && (filterStatus === 'All' || t.status === filterStatus);
  });

  const field = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'cargoWeight' || key === 'vehicleId') {
      const vid = key === 'vehicleId' ? value : form.vehicleId;
      const w = key === 'cargoWeight' ? Number(value) : Number(form.cargoWeight);
      const veh = vehicles.find(v => v.id === vid);
      setCapacityWarning(veh && w > veh.capacity
        ? `⚠ Cargo (${w} kg) exceeds vehicle capacity (${veh.capacity} kg).` : '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.driverId || !form.origin || !form.destination) { setError('Please fill all required fields.'); return; }
    const veh = vehicles.find(v => v.id === form.vehicleId);
    if (veh && Number(form.cargoWeight) > veh.capacity) { setError(`Cargo exceeds vehicle max capacity (${veh.capacity} kg).`); return; }
    setSubmitting(true);
    setError('');
    const result = await addTrip({
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      origin: form.origin,
      destination: form.destination,
      departureTime: form.departureTime,
      eta: form.eta,
      cargoWeight: Number(form.cargoWeight) || 0,
      estimatedCost: Number(form.estimatedCost) || 0,
      status: 'Draft',
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Failed to create trip.');
      return;
    }
    setForm(EMPTY_FORM); setShowModal(false); setError(''); setCapacityWarning('');
    toast.success('Trip created successfully.');
  };

  const statusTabs = ['All', 'Draft', 'Dispatched', 'Completed', 'Cancelled'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{DARK_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Trip Dispatcher</h1>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>
            Manage and dispatch fleet trips — {trips.length} total
          </p>
        </div>
        {canCreate && (
          <button className="ff-pg-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Create Trip
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="ff-pg-tabs" style={{ width: 'fit-content' }}>
        {statusTabs.map(s => (
          <button key={s} className={`ff-pg-tab${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s} <span style={{ opacity: .55, fontSize: 11 }}>({s === 'All' ? trips.length : trips.filter(t => t.status === s).length})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 340 }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
        <input className="ff-pg-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trips, vehicles, drivers..." />
      </div>

      {/* Table */}
      <div className="ff-pg-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ff-pg-table">
            <thead className="ff-pg-thead">
              <tr>
                {['Trip ID', 'Vehicle', 'Driver', 'Origin', 'Destination', 'Cargo (kg)', 'Est. Cost', 'Status', 'ETA', 'Actions'].map(col => (
                  <th key={col} className="ff-pg-th">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="ff-pg-tbody">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: '48px 20px', textAlign: 'center', fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#334155' }}>No trips found.</td></tr>
              ) : filtered.map(trip => {
                const vehicle = getVehicleById(trip.vehicleId);
                const driver = getDriverById(trip.driverId);
                return (
                  <tr key={trip.id}>
                    <td className="ff-pg-td" style={{ color: '#3B82F6', fontWeight: 600 }}>{trip.id.slice(0, 8)}</td>
                    <td className="ff-pg-td" style={{ color: '#F1F5F9' }}>{vehicle?.model ?? trip.vehicleId.slice(0, 8)}</td>
                    <td className="ff-pg-td">{driver?.name ?? trip.driverId.slice(0, 8)}</td>
                    <td className="ff-pg-td">{trip.origin}</td>
                    <td className="ff-pg-td">{trip.destination}</td>
                    <td className="ff-pg-td">{trip.cargoWeight.toLocaleString()}</td>
                    <td className="ff-pg-td">KES {trip.estimatedCost.toLocaleString()}</td>
                    <td className="ff-pg-td"><StatusPill status={trip.status} /></td>
                    <td className="ff-pg-td" style={{ color: '#64748B', whiteSpace: 'nowrap' }}>{trip.eta.split(' ')[0]}</td>
                    <td className="ff-pg-td">
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                        {trip.status === 'Draft' && (
                          <button className="ff-pg-row-action" onClick={async () => {
                            const r = await updateTripStatus(trip.id, 'Dispatched');
                            r.success ? toast.success('Trip dispatched.') : toast.error(r.error || 'Failed.');
                          }}
                            style={{ background: 'rgba(59,130,246,.1)', color: '#3B82F6' }}>Dispatch</button>
                        )}
                        {trip.status === 'Dispatched' && (
                          <button className="ff-pg-row-action" onClick={async () => {
                            const r = await updateTripStatus(trip.id, 'Completed');
                            r.success ? toast.success('Trip completed.') : toast.error(r.error || 'Failed.');
                          }}
                            style={{ background: 'rgba(16,185,129,.1)', color: '#10B981' }}>
                            <CheckCircle2 size={11} />Complete
                          </button>
                        )}
                        {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                          <button className="ff-pg-row-action" onClick={async () => {
                            const r = await updateTripStatus(trip.id, 'Cancelled');
                            r.success ? toast.success('Trip cancelled.') : toast.error(r.error || 'Failed.');
                          }}
                            style={{ background: 'rgba(239,68,68,.08)', color: '#EF4444' }}>
                            <XCircle size={11} />Cancel
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
            Showing {filtered.length} of {trips.length} trips
          </p>
        </div>
      </div>

      {/* Create Trip Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(''); setCapacityWarning(''); setForm(EMPTY_FORM); }}
        title="Create New Trip" subtitle="Assign vehicle and driver to a route" width="lg">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Select Vehicle" required>
              <select value={form.vehicleId} onChange={e => field('vehicleId', e.target.value)} className={selectCls}>
                <option value="">— Select available vehicle —</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} – {v.model} ({v.type}, {v.capacity.toLocaleString()} kg)</option>
                ))}
              </select>
              {availableVehicles.length === 0 && (
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#F59E0B', marginTop: 4 }}>No available vehicles.</p>
              )}
            </FormField>
            <FormField label="Select Driver" required>
              <select value={form.driverId} onChange={e => field('driverId', e.target.value)} className={selectCls}>
                <option value="">— Select available driver —</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
                ))}
              </select>
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Origin Address" required>
              <input value={form.origin} onChange={e => field('origin', e.target.value)} placeholder="e.g. Nairobi CBD" className={inputCls} />
            </FormField>
            <FormField label="Destination" required>
              <input value={form.destination} onChange={e => field('destination', e.target.value)} placeholder="e.g. Mombasa Port" className={inputCls} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Departure Time">
              <input type="datetime-local" value={form.departureTime} onChange={e => field('departureTime', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="ETA">
              <input type="datetime-local" value={form.eta} onChange={e => field('eta', e.target.value)} className={inputCls} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Cargo Weight (kg)">
              <input type="number" value={form.cargoWeight} onChange={e => field('cargoWeight', e.target.value)} placeholder="e.g. 5000" className={inputCls} />
            </FormField>
            <FormField label="Estimated Fuel Cost (KES)">
              <input type="number" value={form.estimatedCost} onChange={e => field('estimatedCost', e.target.value)} placeholder="e.g. 25000" className={inputCls} />
            </FormField>
          </div>
          {capacityWarning && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 8, padding: '10px 14px' }}>
              <AlertCircle size={15} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#F59E0B', margin: 0 }}>{capacityWarning}</p>
            </div>
          )}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px' }}>
              <AlertCircle size={15} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#EF4444', margin: 0 }}>{error}</p>
            </div>
          )}
          <div style={{ background: 'rgba(59,130,246,.07)', border: '1px solid rgba(59,130,246,.18)', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#3B82F6', fontWeight: 600, margin: '0 0 2px' }}>Workflow: Draft → Dispatched → Completed</p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#64748B', margin: 0 }}>Trip is saved as Draft. Use "Dispatch" to activate.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="submit" className="ff-pg-btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>{submitting ? 'Saving...' : 'Confirm & Save Trip'}</button>
            <button type="button" className="ff-pg-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setShowModal(false); setError(''); setCapacityWarning(''); setForm(EMPTY_FORM); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

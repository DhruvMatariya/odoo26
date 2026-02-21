import React, { useState } from 'react';
import { Plus, Search, ShieldCheck, ShieldAlert, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { StatusPill } from '../components/StatusPill';
import { Modal, FormField, inputCls } from '../components/Modal';

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
  .ff-pg-row-action { font-family:'Poppins',sans-serif; font-size:11px; font-weight:500; padding:4px 10px; border-radius:6px; cursor:pointer; border:none; transition:background 150ms,color 150ms; }
  .ff-pg-btn-primary { display:flex; align-items:center; gap:6px; padding:9px 16px; background:#3B82F6; border:none; border-radius:8px; color:#fff; font-family:'Poppins',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:background 180ms,box-shadow 180ms; white-space:nowrap; }
  .ff-pg-btn-primary:hover { background:#2563EB; box-shadow:0 4px 16px rgba(59,130,246,.35); }
  .ff-pg-btn-ghost { display:flex; align-items:center; gap:6px; padding:9px 14px; background:transparent; border:1px solid #1E2330; border-radius:8px; color:#64748B; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:border-color 160ms,color 160ms; }
  .ff-pg-btn-ghost:hover { border-color:#334155; color:#94A3B8; }
  .ff-badge { display:inline-block; font-family:'Poppins',sans-serif; font-size:11px; font-weight:500; padding:3px 9px; border-radius:6px; background:rgba(255,255,255,.05); color:#64748B; border:1px solid #1A2030; }
  .ff-score-track { height:5px; background:#1E2330; border-radius:3px; overflow:hidden; width:72px; }
  .ff-score-bar { height:100%; border-radius:3px; transition:width .4s ease; }
`;

function isExpired(expiry: string) { return expiry && new Date(expiry) < new Date(); }
function isExpiringSoon(expiry: string) {
  if (!expiry) return false;
  const diff = new Date(expiry).getTime() - Date.now();
  return diff > 0 && diff < 90 * 86400000;
}

const EMPTY_FORM = {
  name: '',
  phone: '',
  licenseNumber: '',
  licenseExpiry: '',
};

export function DriversPage() {
  const { drivers, trips, updateDriverStatus, addDriver } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = drivers.filter(d => {
    const ms = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.license.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase());
    return ms && (filterStatus === 'All' || d.status === filterStatus);
  });

  const expiredCount = drivers.filter(d => d.licenseExpiry && isExpired(d.licenseExpiry)).length;
  const expiringSoon = drivers.filter(d => d.licenseExpiry && isExpiringSoon(d.licenseExpiry)).length;
  const onDuty = drivers.filter(d => d.status === 'On Duty').length;
  const avgScore = drivers.length > 0 ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length) : 0;

  const summaryCards = [
    { label: 'Total Drivers', value: drivers.length, sub: `${onDuty} currently on duty`, Icon: Users, color: '#3B82F6', accent: 'rgba(59,130,246,0.1)', alert: false },
    { label: 'Avg Safety Score', value: avgScore, sub: 'Out of 100', Icon: ShieldCheck, color: '#10B981', accent: 'rgba(16,185,129,0.1)', alert: false },
    { label: 'Expired Licenses', value: expiredCount, sub: 'Blocked from assignment', Icon: ShieldAlert, color: expiredCount > 0 ? '#EF4444' : '#334155', accent: expiredCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', alert: expiredCount > 0 },
    { label: 'Expiring Soon', value: expiringSoon, sub: 'Within 90 days', Icon: Clock, color: expiringSoon > 0 ? '#F59E0B' : '#334155', accent: expiringSoon > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)', alert: expiringSoon > 0 },
  ];

  const field = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.licenseNumber) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await addDriver({
      name: form.name,
      phone: form.phone,
      licenseNumber: form.licenseNumber,
      licenseExpiry: form.licenseExpiry || undefined,
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Failed to add driver.');
      return;
    }
    setForm(EMPTY_FORM);
    setShowModal(false);
    toast.success('Driver added successfully.');
  };

  const handleStatusChange = async (driverId: string, newStatus: 'On Duty' | 'Off Duty' | 'Suspended') => {
    const result = await updateDriverStatus(driverId, newStatus);
    if (result.success) {
      toast.success(`Driver status updated to ${newStatus}.`);
    } else {
      toast.error(result.error || 'Failed to update status.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{DARK_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Driver Performance & Safety</h1>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>
            Compliance monitoring and performance profiles — {drivers.length} drivers
          </p>
        </div>
        <button className="ff-pg-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Driver
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {summaryCards.map(card => (
          <div key={card.label} className="ff-pg-card" style={{ padding: 18, borderColor: card.alert ? `${card.color}33` : '#1E2330' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <card.Icon size={15} style={{ color: card.color }} />
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#64748B', margin: 0 }}>{card.label}</p>
            </div>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 26, fontWeight: 700, color: card.color, margin: '0 0 2px' }}>{card.value}</p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: 0 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
          <input className="ff-pg-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, license, ID..." />
        </div>
        <div className="ff-pg-tabs">
          {['All', 'On Duty', 'Off Duty', 'Suspended'].map(s => (
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
                {['Driver', 'Phone', 'License No.', 'License Expiry', 'Safety Score', 'Trips Done', 'Compliance', 'Status', 'Actions'].map(col => (
                  <th key={col} className="ff-pg-th">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="ff-pg-tbody">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: '48px 20px', textAlign: 'center', fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#334155' }}>No drivers found.</td></tr>
              ) : filtered.map(driver => {
                const expired = isExpired(driver.licenseExpiry);
                const expiring = isExpiringSoon(driver.licenseExpiry);
                const scoreColor = driver.safetyScore >= 90 ? '#10B981' : driver.safetyScore >= 75 ? '#F59E0B' : '#EF4444';

                return (
                  <tr key={driver.id}>
                    <td className="ff-pg-td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A3E,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 700, color: '#fff' }}>
                          {driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#F1F5F9', fontWeight: 500, margin: 0 }}>{driver.name}</p>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: '1px 0 0' }}>{driver.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="ff-pg-td" style={{ color: '#F1F5F9' }}>{driver.phone || '—'}</td>
                    <td className="ff-pg-td" style={{ fontFamily: 'monospace', fontSize: 12 }}>{driver.license}</td>
                    <td className="ff-pg-td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: expired ? '#EF4444' : expiring ? '#F59E0B' : '#94A3B8', fontWeight: expired ? 600 : 400 }}>
                          {driver.licenseExpiry || '—'}
                        </span>
                        {(expired || expiring) && (
                          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: expired ? 'rgba(239,68,68,.12)' : 'rgba(245,158,11,.12)', color: expired ? '#EF4444' : '#F59E0B' }}>
                            {expired ? 'EXPIRED' : 'SOON'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="ff-pg-td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="ff-score-track">
                          <div className="ff-score-bar" style={{ width: `${driver.safetyScore}%`, background: scoreColor }} />
                        </div>
                        <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: scoreColor, fontWeight: 600 }}>{driver.safetyScore}</span>
                      </div>
                    </td>
                    <td className="ff-pg-td" style={{ color: '#F1F5F9' }}>{driver.tripsCompleted}</td>
                    <td className="ff-pg-td"><StatusPill status={expired ? 'Expired' : 'Valid'} /></td>
                    <td className="ff-pg-td"><StatusPill status={driver.status} /></td>
                    <td className="ff-pg-td">
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                        {driver.status !== 'On Duty' && (
                          <button className="ff-pg-row-action" onClick={() => handleStatusChange(driver.id, 'On Duty')}
                            style={{ background: 'rgba(16,185,129,.1)', color: '#10B981' }}>Activate</button>
                        )}
                        {driver.status !== 'Off Duty' && (
                          <button className="ff-pg-row-action" onClick={() => handleStatusChange(driver.id, 'Off Duty')}
                            style={{ background: 'rgba(255,255,255,.05)', color: '#64748B' }}>Off Duty</button>
                        )}
                        {driver.status !== 'Suspended' && (
                          <button className="ff-pg-row-action" onClick={() => handleStatusChange(driver.id, 'Suspended')}
                            style={{ background: 'rgba(239,68,68,.08)', color: '#EF4444' }}>Suspend</button>
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
            Showing {filtered.length} of {drivers.length} drivers
          </p>
        </div>
      </div>

      {/* Compliance Alert */}
      {expiredCount > 0 && (
        <div style={{ background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <ShieldAlert size={15} style={{ color: '#EF4444' }} />
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, fontWeight: 600, color: '#EF4444', margin: 0 }}>Compliance Alert</p>
          </div>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#94A3B8', margin: 0 }}>
            {expiredCount} driver{expiredCount > 1 ? 's have' : ' has'} an expired license and{' '}
            {expiredCount > 1 ? 'are' : 'is'} automatically blocked from trip assignment. Renew license before enabling for dispatch.
          </p>
        </div>
      )}

      {/* Add Driver Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}
        title="Add New Driver" subtitle="Register a new driver to the fleet">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="Driver Name" required>
            <input value={form.name} onChange={e => field('name', e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
          </FormField>
          <FormField label="Phone Number" required>
            <input value={form.phone} onChange={e => field('phone', e.target.value)} placeholder="e.g. +254 700 000000" className={inputCls} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="License Number" required>
              <input value={form.licenseNumber} onChange={e => field('licenseNumber', e.target.value)} placeholder="e.g. DL-TRK-2024-001" className={inputCls} />
            </FormField>
            <FormField label="License Expiry">
              <input type="date" value={form.licenseExpiry} onChange={e => field('licenseExpiry', e.target.value)} className={inputCls} />
            </FormField>
          </div>
          {error && (
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px', margin: 0 }}>
              {error}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="submit" className="ff-pg-btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Driver'}
            </button>
            <button type="button" className="ff-pg-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

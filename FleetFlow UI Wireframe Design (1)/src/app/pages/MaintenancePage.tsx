import React, { useState } from 'react';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { useApp, MaintenanceLog } from '../context/AppContext';
import { StatusPill } from '../components/StatusPill';
import { Modal, FormField, inputCls, selectCls } from '../components/Modal';

const EMPTY_FORM = {
  vehicleId: '',
  issue: '',
  serviceDate: '',
  cost: '',
  status: 'Scheduled' as MaintenanceLog['status'],
};

export function MaintenancePage() {
  const { maintenance, vehicles, addMaintenanceLog, getVehicleById } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');

  const filtered = maintenance.filter(log => {
    const v = getVehicleById(log.vehicleId);
    const matchSearch = log.id.toLowerCase().includes(search.toLowerCase()) ||
      log.issue.toLowerCase().includes(search.toLowerCase()) ||
      v?.model.toLowerCase().includes(search.toLowerCase()) ||
      log.vehicleId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || log.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.issue || !form.serviceDate) { setError('Please fill all required fields.'); return; }
    addMaintenanceLog({
      vehicleId: form.vehicleId,
      issue: form.issue,
      serviceDate: form.serviceDate,
      cost: Number(form.cost) || 0,
      status: form.status,
    });
    setForm(EMPTY_FORM);
    setShowModal(false);
    setError('');
  };

  const field = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const totalCost = maintenance.reduce((sum, log) => sum + log.cost, 0);
  const inShopVehicles = vehicles.filter(v => v.status === 'In Shop');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Maintenance & Service Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track preventative and reactive vehicle health — {maintenance.length} logs</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Log Service
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Maintenance Cost</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">KES {totalCost.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Across all service logs</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Vehicles In Shop</p>
          <p className="text-2xl font-semibold text-amber-600 mt-1">{inShopVehicles.length}</p>
          <p className="text-xs text-gray-400 mt-1">Removed from dispatch queue</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Open Logs</p>
          <p className="text-2xl font-semibold text-blue-600 mt-1">
            {maintenance.filter(m => m.status !== 'Completed').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Scheduled + In Progress</p>
        </div>
      </div>

      {/* In Shop Alert */}
      {inShopVehicles.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-medium">Vehicles in shop:</span>{' '}
            {inShopVehicles.map(v => `${v.id} (${v.model})`).join(', ')} — hidden from dispatcher.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs, vehicles, issues..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['All', 'Scheduled', 'In Progress', 'Completed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterStatus === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Log ID', 'Vehicle', 'Issue / Service', 'Service Date', 'Cost (KES)', 'Status'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No maintenance logs found.</td></tr>
              ) : filtered.map(log => {
                const vehicle = getVehicleById(log.vehicleId);
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-blue-600">{log.id}</td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vehicle?.model ?? log.vehicleId}</p>
                        <p className="text-xs text-gray-400">{log.vehicleId} · {vehicle?.plate}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{log.issue}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{log.serviceDate}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{log.cost.toLocaleString()}</td>
                    <td className="px-5 py-3.5"><StatusPill status={log.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {filtered.length} of {maintenance.length} logs
            {filtered.length > 0 && (
              <span className="ml-2 text-gray-400">
                · Total shown: KES {filtered.reduce((s, l) => s + l.cost, 0).toLocaleString()}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Log Service Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}
        title="Log New Service" subtitle="Adding a vehicle automatically sets status to In Shop">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Vehicle" required>
            <select value={form.vehicleId} onChange={e => field('vehicleId', e.target.value)} className={selectCls}>
              <option value="">— Select vehicle —</option>
              {vehicles.filter(v => v.status !== 'Retired').map(v => (
                <option key={v.id} value={v.id}>{v.id} – {v.model} · {v.plate} ({v.status})</option>
              ))}
            </select>
          </FormField>

          <FormField label="Issue / Service Description" required>
            <input value={form.issue} onChange={e => field('issue', e.target.value)} placeholder="e.g. Engine oil change, brake pad replacement..." className={inputCls} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Service Date" required>
              <input type="date" value={form.serviceDate} onChange={e => field('serviceDate', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Estimated Cost (KES)">
              <input type="number" value={form.cost} onChange={e => field('cost', e.target.value)} placeholder="e.g. 15000" className={inputCls} />
            </FormField>
          </div>

          <FormField label="Status">
            <select value={form.status} onChange={e => field('status', e.target.value)} className={selectCls}>
              <option>Scheduled</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </FormField>

          <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
            <p className="text-xs text-amber-700 font-medium">⚠ Auto-logic: Vehicle will be set to "In Shop" status and removed from dispatcher queue.</p>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Create Log
            </button>
            <button type="button" onClick={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Search, Filter, ToggleLeft } from 'lucide-react';
import { useApp, Vehicle } from '../context/AppContext';
import { StatusPill } from '../components/StatusPill';
import { Modal, FormField, inputCls, selectCls } from '../components/Modal';

const EMPTY_FORM = {
  model: '',
  plate: '',
  type: 'Van' as Vehicle['type'],
  capacity: '',
  purchaseDate: '',
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

  const filtered = vehicles.filter(v => {
    const matchSearch = v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.plate.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || v.type === filterType;
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.model || !form.plate || !form.capacity) { setError('Please fill all required fields.'); return; }
    addVehicle({
      model: form.model,
      plate: form.plate,
      type: form.type,
      capacity: Number(form.capacity),
      purchaseDate: form.purchaseDate,
      status: form.status,
      odometer: Number(form.odometer) || 0,
    });
    setForm(EMPTY_FORM);
    setShowModal(false);
    setError('');
  };

  const field = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const statusCounts = {
    All: vehicles.length,
    Available: vehicles.filter(v => v.status === 'Available').length,
    'On Trip': vehicles.filter(v => v.status === 'On Trip').length,
    'In Shop': vehicles.filter(v => v.status === 'In Shop').length,
    Retired: vehicles.filter(v => v.status === 'Retired').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Vehicle Registry</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your fleet assets — {vehicles.length} total vehicles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filterStatus === status ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status} <span className="ml-1 text-xs text-gray-400">({count})</span>
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by model, plate, ID..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            <option>Truck</option>
            <option>Van</option>
            <option>Bike</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Vehicle ID', 'Model', 'Plate', 'Type', 'Capacity (kg)', 'Status', 'Odometer (km)', 'Purchase Date', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                    No vehicles found matching your filters.
                  </td>
                </tr>
              ) : filtered.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-blue-600">{v.id}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{v.model}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 font-mono">{v.plate}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">{v.type}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{v.capacity.toLocaleString()}</td>
                  <td className="px-5 py-3.5"><StatusPill status={v.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{v.odometer.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{v.purchaseDate}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {v.status !== 'Retired' ? (
                        <button
                          onClick={() => updateVehicleStatus(v.id, 'Retired')}
                          title="Mark as Retired"
                          className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                        >
                          <ToggleLeft size={13} /> Retire
                        </button>
                      ) : (
                        <button
                          onClick={() => updateVehicleStatus(v.id, 'Available')}
                          className="text-xs text-gray-500 hover:text-green-600 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                        >
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
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {filtered.length} of {vehicles.length} vehicles</p>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}
        title="Add New Vehicle"
        subtitle="Register a new asset to the fleet"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Model / Name" required>
              <input value={form.model} onChange={e => field('model', e.target.value)} placeholder="e.g. Toyota Hiace" className={inputCls} />
            </FormField>
            <FormField label="Registration Plate" required>
              <input value={form.plate} onChange={e => field('plate', e.target.value)} placeholder="e.g. KCA 001A" className={inputCls} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Vehicle Type" required>
              <select value={form.type} onChange={e => field('type', e.target.value)} className={selectCls}>
                <option>Truck</option>
                <option>Van</option>
                <option>Bike</option>
              </select>
            </FormField>
            <FormField label="Max Capacity (kg)" required>
              <input type="number" value={form.capacity} onChange={e => field('capacity', e.target.value)} placeholder="e.g. 5000" className={inputCls} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Purchase Date">
              <input type="date" value={form.purchaseDate} onChange={e => field('purchaseDate', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Initial Odometer (km)">
              <input type="number" value={form.odometer} onChange={e => field('odometer', e.target.value)} placeholder="0" className={inputCls} />
            </FormField>
          </div>

          <FormField label="Initial Status">
            <select value={form.status} onChange={e => field('status', e.target.value)} className={selectCls}>
              <option>Available</option>
              <option>In Shop</option>
              <option>Retired</option>
            </select>
          </FormField>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Save Vehicle
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
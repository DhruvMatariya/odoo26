import React, { useState } from 'react';
import { Plus, Search, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useApp, Trip } from '../context/AppContext';
import { StatusPill } from '../components/StatusPill';
import { Modal, FormField, inputCls, selectCls } from '../components/Modal';

const EMPTY_FORM = {
  vehicleId: '',
  driverId: '',
  origin: '',
  destination: '',
  departureTime: '',
  eta: '',
  cargoWeight: '',
  estimatedCost: '',
};

export function TripsPage() {
  const { trips, vehicles, drivers, addTrip, updateTripStatus, getVehicleById, getDriverById, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');
  const [capacityWarning, setCapacityWarning] = useState('');

  const isDispatcher = currentUser?.role === 'Dispatcher';

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d =>
    d.status !== 'Suspended' && new Date(d.licenseExpiry) > new Date()
  );

  const filtered = trips.filter(t => {
    const v = getVehicleById(t.vehicleId);
    const d = getDriverById(t.driverId);
    const matchSearch = t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.origin.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase()) ||
      v?.model.toLowerCase().includes(search.toLowerCase()) ||
      d?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const field = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Validate cargo weight against vehicle capacity
    if (key === 'cargoWeight' || key === 'vehicleId') {
      const vehicleId = key === 'vehicleId' ? value : form.vehicleId;
      const weight = key === 'cargoWeight' ? Number(value) : Number(form.cargoWeight);
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle && weight > vehicle.capacity) {
        setCapacityWarning(`⚠ Cargo weight (${weight} kg) exceeds vehicle capacity (${vehicle.capacity} kg). Trip cannot be dispatched.`);
      } else {
        setCapacityWarning('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.driverId || !form.origin || !form.destination) {
      setError('Please fill all required fields.'); return;
    }
    const vehicle = vehicles.find(v => v.id === form.vehicleId);
    if (vehicle && Number(form.cargoWeight) > vehicle.capacity) {
      setError(`Cargo weight exceeds vehicle max capacity (${vehicle.capacity} kg). Cannot create trip.`); return;
    }
    addTrip({
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
    setForm(EMPTY_FORM);
    setShowModal(false);
    setError('');
    setCapacityWarning('');
  };

  const statusTabs = ['All', 'Draft', 'Dispatched', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Trip Dispatcher</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and dispatch fleet trips — {trips.length} total</p>
        </div>
        {(isDispatcher || currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Create Trip
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {statusTabs.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filterStatus === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s}
            <span className="ml-1 text-xs text-gray-400">
              ({s === 'All' ? trips.length : trips.filter(t => t.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search trips, vehicles, drivers..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Trip ID', 'Vehicle', 'Driver', 'Origin', 'Destination', 'Cargo (kg)', 'Est. Cost', 'Status', 'ETA', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-gray-400">No trips found.</td></tr>
              ) : filtered.map(trip => {
                const vehicle = getVehicleById(trip.vehicleId);
                const driver = getDriverById(trip.driverId);
                return (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-blue-600">{trip.id}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">{vehicle?.model ?? trip.vehicleId}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{driver?.name ?? trip.driverId}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{trip.origin}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{trip.destination}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{trip.cargoWeight.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">KES {trip.estimatedCost.toLocaleString()}</td>
                    <td className="px-5 py-3.5"><StatusPill status={trip.status} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{trip.eta.split(' ')[0]}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {trip.status === 'Draft' && (
                          <button
                            onClick={() => updateTripStatus(trip.id, 'Dispatched')}
                            className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors font-medium"
                          >
                            Dispatch
                          </button>
                        )}
                        {trip.status === 'Dispatched' && (
                          <button
                            onClick={() => updateTripStatus(trip.id, 'Completed')}
                            className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors font-medium flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Complete
                          </button>
                        )}
                        {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                          <button
                            onClick={() => updateTripStatus(trip.id, 'Cancelled')}
                            className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                          >
                            <XCircle size={12} /> Cancel
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
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing {filtered.length} of {trips.length} trips</p>
        </div>
      </div>

      {/* Create Trip Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(''); setCapacityWarning(''); setForm(EMPTY_FORM); }}
        title="Create New Trip" subtitle="Assign vehicle and driver to a route" width="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Select Vehicle" required>
              <select value={form.vehicleId} onChange={e => field('vehicleId', e.target.value)} className={selectCls}>
                <option value="">— Select available vehicle —</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} – {v.model} ({v.type}, {v.capacity.toLocaleString()} kg)</option>
                ))}
              </select>
              {availableVehicles.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No available vehicles. Check maintenance logs.</p>
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

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Origin Address" required>
              <input value={form.origin} onChange={e => field('origin', e.target.value)} placeholder="e.g. Nairobi CBD" className={inputCls} />
            </FormField>
            <FormField label="Destination" required>
              <input value={form.destination} onChange={e => field('destination', e.target.value)} placeholder="e.g. Mombasa Port" className={inputCls} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Departure Time">
              <input type="datetime-local" value={form.departureTime} onChange={e => field('departureTime', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="ETA">
              <input type="datetime-local" value={form.eta} onChange={e => field('eta', e.target.value)} className={inputCls} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cargo Weight (kg)">
              <input type="number" value={form.cargoWeight} onChange={e => field('cargoWeight', e.target.value)} placeholder="e.g. 5000" className={inputCls} />
            </FormField>
            <FormField label="Estimated Fuel Cost (KES)">
              <input type="number" value={form.estimatedCost} onChange={e => field('estimatedCost', e.target.value)} placeholder="e.g. 25000" className={inputCls} />
            </FormField>
          </div>

          {capacityWarning && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">{capacityWarning}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <p className="text-xs text-blue-600 font-medium mb-1">Workflow: Draft → Dispatched → Completed</p>
            <p className="text-xs text-blue-500">Trip will be saved as Draft. Use "Dispatch" button to activate and assign vehicle & driver.</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Confirm & Save Trip
            </button>
            <button type="button" onClick={() => { setShowModal(false); setError(''); setCapacityWarning(''); setForm(EMPTY_FORM); }}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
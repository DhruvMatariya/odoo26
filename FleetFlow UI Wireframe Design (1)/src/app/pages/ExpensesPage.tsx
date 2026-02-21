import React, { useState } from 'react';
import { Plus, Search, Download, DollarSign } from 'lucide-react';
import { useApp, Expense } from '../context/AppContext';
import { Modal, FormField, inputCls, selectCls } from '../components/Modal';

const EMPTY_FORM = {
  tripId: '',
  fuelAmount: '',
  fuelCost: '',
  otherExpense: '',
  expenseNote: '',
  date: new Date().toISOString().split('T')[0],
};

export function ExpensesPage() {
  const { expenses, trips, addExpense, getVehicleById, getDriverById } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const completedTrips = trips.filter(t => t.status === 'Completed' || t.status === 'Dispatched');

  const filtered = expenses.filter(e => {
    const matchSearch = e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.tripId.toLowerCase().includes(search.toLowerCase()) ||
      e.expenseNote.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tripId || !form.date) { setError('Please select a trip and date.'); return; }
    addExpense({
      tripId: form.tripId,
      fuelAmount: Number(form.fuelAmount) || 0,
      fuelCost: Number(form.fuelCost) || 0,
      otherExpense: Number(form.otherExpense) || 0,
      expenseNote: form.expenseNote,
      date: form.date,
    });
    setForm(EMPTY_FORM);
    setShowModal(false);
    setError('');
  };

  const field = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const totalFuel = expenses.reduce((s, e) => s + e.fuelCost, 0);
  const totalOther = expenses.reduce((s, e) => s + e.otherExpense, 0);
  const grandTotal = totalFuel + totalOther;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Expense & Fuel Tracking</h1>
          <p className="text-sm text-gray-500 mt-0.5">Financial tracking per trip and asset — {expenses.length} entries</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign size={17} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Total Fuel Cost</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">KES {totalFuel.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            {expenses.reduce((s, e) => s + e.fuelAmount, 0).toLocaleString()} liters total
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <DollarSign size={17} className="text-amber-600" />
            </div>
            <p className="text-sm text-gray-500">Other Expenses</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">KES {totalOther.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Tolls, parking, misc.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={17} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Total Operational Cost</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">KES {grandTotal.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Fuel + all other expenses</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by entry ID, trip, note..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Entry ID', 'Trip ID', 'Driver', 'Vehicle', 'Fuel (L)', 'Fuel Cost', 'Other Expense', 'Note', 'Total Cost', 'Date'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-gray-400">No expense entries found.</td></tr>
              ) : filtered.map(entry => {
                const trip = trips.find(t => t.id === entry.tripId);
                const vehicle = trip ? getVehicleById(trip.vehicleId) : undefined;
                const driver = trip ? getDriverById(trip.driverId) : undefined;
                const total = entry.fuelCost + entry.otherExpense;
                return (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-blue-600">{entry.id}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{entry.tripId}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{driver?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{vehicle?.model ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{entry.fuelAmount} L</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">KES {entry.fuelCost.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">KES {entry.otherExpense.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">{entry.expenseNote || '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">KES {total.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{entry.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {filtered.length} of {expenses.length} entries</p>
          <p className="text-sm font-medium text-gray-900">
            Visible total: KES {filtered.reduce((s, e) => s + e.fuelCost + e.otherExpense, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(''); setForm(EMPTY_FORM); }}
        title="Add Expense Entry" subtitle="Record fuel and operational costs for a trip">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Trip" required>
            <select value={form.tripId} onChange={e => field('tripId', e.target.value)} className={selectCls}>
              <option value="">— Select trip —</option>
              {completedTrips.map(t => {
                const v = getVehicleById(t.vehicleId);
                const d = getDriverById(t.driverId);
                return (
                  <option key={t.id} value={t.id}>
                    {t.id} — {t.origin} → {t.destination} ({d?.name ?? '?'})
                  </option>
                );
              })}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fuel Amount (Liters)">
              <input type="number" value={form.fuelAmount} onChange={e => field('fuelAmount', e.target.value)} placeholder="e.g. 80" className={inputCls} />
            </FormField>
            <FormField label="Fuel Cost (KES)">
              <input type="number" value={form.fuelCost} onChange={e => field('fuelCost', e.target.value)} placeholder="e.g. 12000" className={inputCls} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Other Expense (KES)">
              <input type="number" value={form.otherExpense} onChange={e => field('otherExpense', e.target.value)} placeholder="Tolls, parking, etc." className={inputCls} />
            </FormField>
            <FormField label="Date" required>
              <input type="date" value={form.date} onChange={e => field('date', e.target.value)} className={inputCls} />
            </FormField>
          </div>

          <FormField label="Expense Note">
            <input value={form.expenseNote} onChange={e => field('expenseNote', e.target.value)} placeholder="Brief description of other expenses..." className={inputCls} />
          </FormField>

          {/* Calculated total preview */}
          {(form.fuelCost || form.otherExpense) && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Calculated Total</p>
              <p className="text-base font-semibold text-gray-900">
                KES {((Number(form.fuelCost) || 0) + (Number(form.otherExpense) || 0)).toLocaleString()}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Save Entry
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

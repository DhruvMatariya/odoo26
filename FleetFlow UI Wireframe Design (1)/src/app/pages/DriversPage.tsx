import React, { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, Clock, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusPill } from '../components/StatusPill';

function isLicenseExpired(expiry: string) {
  return new Date(expiry) < new Date();
}

function isLicenseSoonExpiring(expiry: string) {
  const diff = new Date(expiry).getTime() - new Date().getTime();
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000; // 90 days
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm text-gray-700 font-medium">{score}</span>
    </div>
  );
}

export function DriversPage() {
  const { drivers, trips, updateDriverStatus } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = drivers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.license.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const expiredCount = drivers.filter(d => isLicenseExpired(d.licenseExpiry)).length;
  const expiringSoon = drivers.filter(d => isLicenseSoonExpiring(d.licenseExpiry)).length;
  const onDuty = drivers.filter(d => d.status === 'On Duty').length;
  const avgScore = Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Driver Performance & Safety</h1>
          <p className="text-sm text-gray-500 mt-0.5">Compliance monitoring and performance profiles — {drivers.length} drivers</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-blue-500" />
            <p className="text-sm text-gray-500">Total Drivers</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{drivers.length}</p>
          <p className="text-xs text-gray-400 mt-1">{onDuty} currently on duty</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-green-500" />
            <p className="text-sm text-gray-500">Avg Safety Score</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{avgScore}</p>
          <p className="text-xs text-gray-400 mt-1">Out of 100</p>
        </div>
        <div className={`bg-white border rounded-xl p-4 ${expiredCount > 0 ? 'border-red-200' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={16} className={expiredCount > 0 ? 'text-red-500' : 'text-gray-400'} />
            <p className="text-sm text-gray-500">Expired Licenses</p>
          </div>
          <p className={`text-2xl font-semibold ${expiredCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{expiredCount}</p>
          <p className="text-xs text-gray-400 mt-1">Blocked from assignment</p>
        </div>
        <div className={`bg-white border rounded-xl p-4 ${expiringSoon > 0 ? 'border-amber-200' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className={expiringSoon > 0 ? 'text-amber-500' : 'text-gray-400'} />
            <p className="text-sm text-gray-500">Expiring Soon</p>
          </div>
          <p className={`text-2xl font-semibold ${expiringSoon > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{expiringSoon}</p>
          <p className="text-xs text-gray-400 mt-1">Within 90 days</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, license, ID..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['All', 'On Duty', 'Off Duty', 'Suspended'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterStatus === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
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
                {['Driver', 'License No.', 'Category', 'License Expiry', 'Safety Score', 'Trips Done', 'Compliance', 'Status', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">No drivers found.</td></tr>
              ) : filtered.map(driver => {
                const expired = isLicenseExpired(driver.licenseExpiry);
                const expiring = isLicenseSoonExpiring(driver.licenseExpiry);
                const driverTrips = trips.filter(t => t.driverId === driver.id);
                const completionRate = driverTrips.length > 0
                  ? Math.round((driverTrips.filter(t => t.status === 'Completed').length / driverTrips.length) * 100)
                  : 0;

                return (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold flex-shrink-0">
                          {driver.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                          <p className="text-xs text-gray-400">{driver.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono text-gray-600 text-xs">{driver.license}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">{driver.category}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${expired ? 'text-red-600 font-medium' : expiring ? 'text-amber-600' : 'text-gray-600'}`}>
                          {driver.licenseExpiry}
                        </span>
                        {(expired || expiring) && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            expired ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {expired ? 'Expired' : 'Soon'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <ScoreBar score={driver.safetyScore} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{driver.tripsCompleted}</td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={expired ? 'Expired' : 'Valid'} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={driver.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {driver.status !== 'On Duty' && (
                          <button onClick={() => updateDriverStatus(driver.id, 'On Duty')}
                            className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors font-medium">
                            Activate
                          </button>
                        )}
                        {driver.status !== 'Off Duty' && (
                          <button onClick={() => updateDriverStatus(driver.id, 'Off Duty')}
                            className="text-xs text-gray-500 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                            Off Duty
                          </button>
                        )}
                        {driver.status !== 'Suspended' && (
                          <button onClick={() => updateDriverStatus(driver.id, 'Suspended')}
                            className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors">
                            Suspend
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
          <p className="text-sm text-gray-500">Showing {filtered.length} of {drivers.length} drivers</p>
        </div>
      </div>

      {/* Compliance Note */}
      {expiredCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={16} className="text-red-600" />
            <p className="text-sm font-medium text-red-800">Compliance Alert</p>
          </div>
          <p className="text-sm text-red-700">
            {expiredCount} driver{expiredCount > 1 ? 's have' : ' has'} an expired license and{' '}
            {expiredCount > 1 ? 'are' : 'is'} automatically blocked from trip assignment.
            Renew license before enabling for dispatch.
          </p>
        </div>
      )}
    </div>
  );
}

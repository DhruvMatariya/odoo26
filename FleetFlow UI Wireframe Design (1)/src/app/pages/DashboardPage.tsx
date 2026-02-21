import React from 'react';
import { Truck, Wrench, Navigation, DollarSign, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusPill } from '../components/StatusPill';
import { useNavigate } from 'react-router';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { vehicles, trips, maintenance, expenses, getVehicleById, getDriverById, currentUser } = useApp();
  const navigate = useNavigate();

  const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
  const maintenanceAlerts = vehicles.filter(v => v.status === 'In Shop').length;
  const pendingTrips = trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').length;
  const totalFuelCost = expenses.reduce((sum, e) => sum + e.fuelCost, 0);
  const utilizationRate = Math.round(((activeFleet + vehicles.filter(v => v.status === 'Available').length) / vehicles.filter(v => v.status !== 'Retired').length) * 100);
  const recentTrips = [...trips].reverse().slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Command Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fleet overview — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Types</option>
            <option>Truck</option>
            <option>Van</option>
            <option>Bike</option>
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Regions</option>
            <option>Nairobi</option>
            <option>Mombasa</option>
            <option>Kisumu</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Truck}
          label="Active Fleet"
          value={activeFleet}
          sub={`of ${vehicles.filter(v => v.status !== 'Retired').length} total vehicles`}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Maintenance Alerts"
          value={maintenanceAlerts}
          sub="vehicles currently in shop"
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Navigation}
          label="Pending Trips"
          value={pendingTrips}
          sub="draft + dispatched"
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={DollarSign}
          label="Fuel Cost (Jan)"
          value={`KES ${totalFuelCost.toLocaleString()}`}
          sub="across all active trips"
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Fleet Utilization Rate</p>
          <p className="text-3xl font-semibold text-gray-900">{utilizationRate}%</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${utilizationRate}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">Fleet assigned vs idle</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Pending Cargo</p>
          <p className="text-3xl font-semibold text-gray-900">
            {trips.filter(t => t.status === 'Draft').length}
          </p>
          <p className="text-xs text-gray-400 mt-2">Shipments awaiting assignment</p>
          <div className="flex gap-2 mt-3">
            {['Truck', 'Van', 'Bike'].map(type => (
              <span key={type} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{type}</span>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Completed Trips (Jan)</p>
          <p className="text-3xl font-semibold text-gray-900">
            {trips.filter(t => t.status === 'Completed').length}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            <span className="text-green-600 font-medium">↑ 12%</span> vs last month
          </p>
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-xs text-gray-500">Performance improving</span>
          </div>
        </div>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Recent Trips</h2>
            <p className="text-sm text-gray-500 mt-0.5">Latest trip activity across the fleet</p>
          </div>
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all <ChevronRight size={15} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Trip ID', 'Vehicle', 'Driver', 'Origin → Destination', 'Status', 'ETA'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTrips.map(trip => {
                const vehicle = getVehicleById(trip.vehicleId);
                const driver = getDriverById(trip.driverId);
                return (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-blue-600">{trip.id}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">{vehicle?.model ?? trip.vehicleId}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{driver?.name ?? trip.driverId}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {trip.origin} → {trip.destination}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={trip.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                      {trip.eta.split(' ')[0]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Banner */}
      {maintenanceAlerts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              {maintenanceAlerts} vehicle{maintenanceAlerts > 1 ? 's' : ''} currently in maintenance
            </p>
            <p className="text-xs text-amber-600 mt-0.5">These vehicles are hidden from the dispatcher queue until service is complete.</p>
          </div>
          <button
            onClick={() => navigate('/maintenance')}
            className="text-sm text-amber-700 font-medium hover:text-amber-900 whitespace-nowrap"
          >
            View logs →
          </button>
        </div>
      )}
    </div>
  );
}

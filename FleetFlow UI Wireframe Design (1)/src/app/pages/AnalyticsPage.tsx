import React, { useState } from 'react';
import { Download, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';

const FUEL_TREND_DATA = [
  { month: 'Aug', efficiency: 7.8, cost: 32000 },
  { month: 'Sep', efficiency: 8.1, cost: 29500 },
  { month: 'Oct', efficiency: 7.5, cost: 34000 },
  { month: 'Nov', efficiency: 8.9, cost: 28000 },
  { month: 'Dec', efficiency: 8.4, cost: 31000 },
  { month: 'Jan', efficiency: 9.3, cost: 25000 },
];

const FINANCIAL_SUMMARY = [
  { month: 'Aug', revenue: 120000, fuel: 32000, maintenance: 15000, profit: 73000 },
  { month: 'Sep', revenue: 135000, fuel: 29500, maintenance: 8000, profit: 97500 },
  { month: 'Oct', revenue: 118000, fuel: 34000, maintenance: 45000, profit: 39000 },
  { month: 'Nov', revenue: 148000, fuel: 28000, maintenance: 6000, profit: 114000 },
  { month: 'Dec', revenue: 142000, fuel: 31000, maintenance: 12000, profit: 99000 },
  { month: 'Jan', revenue: 156000, fuel: 25000, maintenance: 9000, profit: 122000 },
];

function KpiCard({ label, value, sub, trend, color }: { label: string; value: string; sub?: string; trend?: { val: string; up: boolean }; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${color}`}>{value}</p>
      {trend && (
        <div className={`flex items-center gap-1 mt-1 ${trend.up ? 'text-green-600' : 'text-red-500'}`}>
          {trend.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span className="text-xs font-medium">{trend.val}</span>
        </div>
      )}
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export function AnalyticsPage() {
  const { vehicles, trips, expenses, maintenance, drivers } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'financial'>('overview');

  const totalFuelCost = expenses.reduce((s, e) => s + e.fuelCost, 0);
  const totalMaintenanceCost = maintenance.reduce((s, m) => s + m.cost, 0);
  const totalOtherExpense = expenses.reduce((s, e) => s + e.otherExpense, 0);
  const totalOperational = totalFuelCost + totalMaintenanceCost + totalOtherExpense;
  const utilizationRate = Math.round(
    (vehicles.filter(v => v.status === 'On Trip').length / vehicles.filter(v => v.status !== 'Retired').length) * 100
  );
  const completionRate = Math.round(
    (trips.filter(t => t.status === 'Completed').length / trips.length) * 100
  );
  const avgSafetyScore = Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length);

  // Utilization per vehicle
  const vehicleUtilization = vehicles
    .filter(v => v.status !== 'Retired')
    .map(v => ({
      name: v.id,
      model: v.model.split(' ')[0],
      trips: trips.filter(t => t.vehicleId === v.id).length,
      revenue: trips.filter(t => t.vehicleId === v.id).reduce((s, t) => s + t.estimatedCost, 0),
    }))
    .sort((a, b) => b.trips - a.trips)
    .slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
          <p className="font-medium text-gray-700 mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Analytics & Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Operational intelligence and financial performance</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={15} />
            Export PDF
          </button>
          <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {([['overview', 'Fleet Overview'], ['financial', 'Financial Reports']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KpiCard
              label="Total Fuel Cost"
              value={`KES ${totalFuelCost.toLocaleString()}`}
              sub="Across all logged trips"
              trend={{ val: '↓ 8% vs last month', up: true }}
              color="text-gray-900"
            />
            <KpiCard
              label="Fleet Utilization"
              value={`${utilizationRate}%`}
              sub="Active vs available fleet"
              trend={{ val: '↑ 5% improvement', up: true }}
              color="text-blue-600"
            />
            <KpiCard
              label="Trip Completion Rate"
              value={`${completionRate}%`}
              sub={`${trips.filter(t => t.status === 'Completed').length} of ${trips.length} trips`}
              trend={{ val: '↑ 12% vs last month', up: true }}
              color="text-green-600"
            />
            <KpiCard
              label="Avg Safety Score"
              value={`${avgSafetyScore}/100`}
              sub="Across all active drivers"
              trend={{ val: '↑ 3 pts improvement', up: true }}
              color="text-purple-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Fuel Efficiency Trend */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Fuel Efficiency Trend</h3>
                  <p className="text-xs text-gray-400 mt-0.5">km/L over the past 6 months</p>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={15} />
                  <span className="text-sm font-medium">↑ 19.2%</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={FUEL_TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} domain={[6, 11]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    name="km/L"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Utilized Vehicles */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Top Utilized Vehicles</h3>
                  <p className="text-xs text-gray-400 mt-0.5">By number of trips completed</p>
                </div>
                <BarChart2 size={16} className="text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={vehicleUtilization} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="trips" name="Trips" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Vehicle Performance Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Vehicle', 'Model', 'Total Trips', 'Est. Revenue', 'Fuel Cost', 'Maint. Cost', 'ROI'].map(col => (
                      <th key={col} className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider pr-4 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {vehicleUtilization.map(v => {
                    const fuelCost = expenses
                      .filter(e => trips.find(t => t.id === e.tripId && t.vehicleId === (vehicles.find(vh => vh.model.includes(v.model))?.id || '')))
                      .reduce((s, e) => s + e.fuelCost, 0);
                    const maintCost = maintenance
                      .filter(m => m.vehicleId === (vehicles.find(vh => vh.model.includes(v.model))?.id || ''))
                      .reduce((s, m) => s + m.cost, 0);
                    const roi = v.revenue > 0 ? Math.round(((v.revenue - fuelCost - maintCost) / Math.max(v.revenue, 1)) * 100) : 0;
                    return (
                      <tr key={v.name} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4 text-sm font-medium text-blue-600">{v.name}</td>
                        <td className="py-3 pr-4 text-sm text-gray-700">{v.model}</td>
                        <td className="py-3 pr-4 text-sm text-gray-700">{v.trips}</td>
                        <td className="py-3 pr-4 text-sm text-gray-700">KES {v.revenue.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-sm text-gray-600">KES {fuelCost.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-sm text-gray-600">KES {maintCost.toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-sm font-medium ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {roi}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'financial' && (
        <>
          {/* Financial KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KpiCard label="Total Revenue (6mo)" value="KES 819K" trend={{ val: '↑ 14%', up: true }} color="text-green-600" />
            <KpiCard label="Total Fuel Spend" value={`KES ${totalFuelCost.toLocaleString()}`} sub="All logged trips" color="text-blue-600" />
            <KpiCard label="Maintenance Spend" value={`KES ${totalMaintenanceCost.toLocaleString()}`} sub="All service logs" color="text-amber-600" />
            <KpiCard label="Net Profit (Jan)" value="KES 122K" trend={{ val: '↑ 23%', up: true }} color="text-gray-900" />
          </div>

          {/* Financial Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900">Revenue vs Operational Costs</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly breakdown (KES)</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={FINANCIAL_SUMMARY} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="fuel" name="Fuel Cost" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="maintenance" name="Maintenance" fill="#ef4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Summary Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Financial Summary of Month</h3>
              <p className="text-xs text-gray-500 mt-0.5">Downloadable for payroll and health audits</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Month', 'Revenue (KES)', 'Fuel Cost', 'Maint. Cost', 'Other', 'Net Profit', 'Margin'].map(col => (
                      <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {FINANCIAL_SUMMARY.map(row => {
                    const totalCost = row.fuel + row.maintenance;
                    const margin = Math.round((row.profit / row.revenue) * 100);
                    return (
                      <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{row.month} 2024</td>
                        <td className="px-5 py-3.5 text-sm text-gray-700">{row.revenue.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm text-amber-600">{row.fuel.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm text-red-500">{row.maintenance.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">—</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-green-600">{row.profit.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            margin >= 50 ? 'bg-green-50 text-green-700' : margin >= 30 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {margin}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
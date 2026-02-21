import React, { useState } from 'react';
import { Download, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';

const DARK_CSS = `
  .ff-pg-card { background:#0D1017; border:1px solid #1E2330; border-radius:12px; }
  .ff-pg-table { width:100%; border-collapse:collapse; }
  .ff-pg-thead tr { background:#0A0C10; border-bottom:1px solid #1E2330; }
  .ff-pg-th { padding:11px 20px; text-align:left; font-family:'Poppins',sans-serif; font-size:10px; font-weight:600; color:#334155; text-transform:uppercase; letter-spacing:.08em; white-space:nowrap; }
  .ff-pg-tbody tr { border-bottom:1px solid #111318; transition:background 140ms; }
  .ff-pg-tbody tr:last-child { border-bottom:none; }
  .ff-pg-tbody tr:hover { background:rgba(30,42,62,.35); }
  .ff-pg-td { padding:13px 20px; font-family:'Poppins',sans-serif; font-size:13px; color:#94A3B8; }
  .ff-pg-tabs { display:flex; gap:3px; background:#0D1017; border:1px solid #1E2330; border-radius:10px; padding:4px; flex-wrap:wrap; }
  .ff-pg-tab { padding:6px 18px; border-radius:7px; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; color:#64748B; cursor:pointer; background:transparent; border:1px solid transparent; transition:all 160ms; white-space:nowrap; }
  .ff-pg-tab.active { background:#1E2A3E; color:#3B82F6; border-color:rgba(59,130,246,.25); }
  .ff-pg-tab:not(.active):hover { color:#94A3B8; }
  .ff-pg-btn-ghost { display:flex; align-items:center; gap:6px; padding:8px 14px; background:transparent; border:1px solid #1E2330; border-radius:8px; color:#64748B; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:border-color 160ms,color 160ms; }
  .ff-pg-btn-ghost:hover { border-color:#334155; color:#94A3B8; }
`;

const FUEL_TREND = [
  { month: 'Aug', efficiency: 7.8, cost: 32000 },
  { month: 'Sep', efficiency: 8.1, cost: 29500 },
  { month: 'Oct', efficiency: 7.5, cost: 34000 },
  { month: 'Nov', efficiency: 8.9, cost: 28000 },
  { month: 'Dec', efficiency: 8.4, cost: 31000 },
  { month: 'Jan', efficiency: 9.3, cost: 25000 },
];

const FINANCIAL = [
  { month: 'Aug', revenue: 120000, fuel: 32000, maintenance: 15000, profit: 73000 },
  { month: 'Sep', revenue: 135000, fuel: 29500, maintenance: 8000,  profit: 97500 },
  { month: 'Oct', revenue: 118000, fuel: 34000, maintenance: 45000, profit: 39000 },
  { month: 'Nov', revenue: 148000, fuel: 28000, maintenance: 6000,  profit: 114000 },
  { month: 'Dec', revenue: 142000, fuel: 31000, maintenance: 12000, profit: 99000 },
  { month: 'Jan', revenue: 156000, fuel: 25000, maintenance: 9000,  profit: 122000 },
];

const TICK = { fontSize: 11, fill: '#334155', fontFamily: 'Poppins, sans-serif' };
const GRID = { stroke: '#1A2030', strokeDasharray: '3 3' };

function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0D1017', border: '1px solid #1E2330', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'Poppins,sans-serif' }}>
      <p style={{ color: '#94A3B8', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? `KES ${p.value.toLocaleString()}` : p.value}</p>
      ))}
    </div>
  );
}

function KpiCard({ label, value, sub, trend, valueColor = '#F1F5F9' }: { label: string; value: string; sub?: string; trend?: { val: string; up: boolean }; valueColor?: string }) {
  return (
    <div style={{ background: '#0D1017', border: '1px solid #1E2330', borderRadius: 12, padding: 20 }}>
      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#64748B', margin: '0 0 6px' }}>{label}</p>
      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 700, color: valueColor, margin: '0 0 4px' }}>{value}</p>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: trend.up ? '#10B981' : '#EF4444', marginBottom: 2 }}>
          {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 500 }}>{trend.val}</span>
        </div>
      )}
      {sub && <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: 0 }}>{sub}</p>}
    </div>
  );
}

export function AnalyticsPage() {
  const { vehicles, trips, expenses, maintenance, drivers } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'financial'>('overview');

  const totalFuelCost = expenses.reduce((s, e) => s + e.fuelCost, 0);
  const totalMaintCost = maintenance.reduce((s, m) => s + m.cost, 0);
  const totalOther = expenses.reduce((s, e) => s + e.otherExpense, 0);
  const utilizationRate = Math.round(
    (vehicles.filter(v => v.status === 'On Trip').length / Math.max(vehicles.filter(v => v.status !== 'Retired').length, 1)) * 100
  );
  const completionRate = Math.round(
    (trips.filter(t => t.status === 'Completed').length / Math.max(trips.length, 1)) * 100
  );
  const avgSafety = Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / Math.max(drivers.length, 1));

  const vehicleUtil = vehicles
    .filter(v => v.status !== 'Retired')
    .map(v => ({
      name: v.id,
      model: v.model.split(' ')[0],
      trips: trips.filter(t => t.vehicleId === v.id).length,
      revenue: trips.filter(t => t.vehicleId === v.id).reduce((s, t) => s + t.estimatedCost, 0),
    }))
    .sort((a, b) => b.trips - a.trips)
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{DARK_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Analytics & Reports</h1>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>
            Operational intelligence and financial performance
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ff-pg-btn-ghost"><Download size={14} /> Export PDF</button>
          <button className="ff-pg-btn-ghost"><Download size={14} /> Export CSV</button>
        </div>
      </div>

      {/* Tab switch */}
      <div className="ff-pg-tabs" style={{ width: 'fit-content' }}>
        {([['overview', 'Fleet Overview'], ['financial', 'Financial Reports']] as const).map(([key, label]) => (
          <button key={key} className={`ff-pg-tab${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            <KpiCard label="Total Fuel Cost" value={`KES ${totalFuelCost.toLocaleString()}`} sub="Across all logged trips" trend={{ val: '↓ 8% vs last month', up: true }} />
            <KpiCard label="Fleet Utilization" value={`${utilizationRate}%`} sub="Active vs available fleet" trend={{ val: '↑ 5% improvement', up: true }} valueColor="#3B82F6" />
            <KpiCard label="Trip Completion" value={`${completionRate}%`} sub={`${trips.filter(t => t.status === 'Completed').length} of ${trips.length} trips`} trend={{ val: '↑ 12% vs last month', up: true }} valueColor="#10B981" />
            <KpiCard label="Avg Safety Score" value={`${avgSafety}/100`} sub="Across all active drivers" trend={{ val: '↑ 3 pts improvement', up: true }} valueColor="#A855F7" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {/* Fuel Efficiency */}
            <div className="ff-pg-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: 0 }}>Fuel Efficiency Trend</h3>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: '3px 0 0' }}>km/L over the past 6 months</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981' }}>
                  <TrendingUp size={14} />
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 600 }}>↑ 19.2%</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={FUEL_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} domain={[6, 11]} />
                  <Tooltip content={<DarkTooltip />} />
                  <Line type="monotone" dataKey="efficiency" name="km/L" stroke="#3B82F6" strokeWidth={2.5}
                    dot={{ fill: '#3B82F6', r: 3, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#2563EB' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Vehicles */}
            <div className="ff-pg-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: 0 }}>Top Utilized Vehicles</h3>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: '3px 0 0' }}>By number of trips completed</p>
                </div>
                <BarChart2 size={15} style={{ color: '#334155' }} />
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={vehicleUtil} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid {...GRID} vertical={false} />
                  <XAxis dataKey="name" tick={{ ...TICK, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="trips" name="Trips" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vehicle breakdown table */}
          <div className="ff-pg-card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: '0 0 16px' }}>Vehicle Performance Breakdown</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="ff-pg-table">
                <thead className="ff-pg-thead">
                  <tr>
                    {['Vehicle', 'Model', 'Total Trips', 'Est. Revenue', 'Fuel Cost', 'Maint. Cost', 'ROI'].map(col => (
                      <th key={col} className="ff-pg-th">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="ff-pg-tbody">
                  {vehicleUtil.map(v => {
                    const fuelCost = expenses
                      .filter(e => trips.find(t => t.id === e.tripId && t.vehicleId === (vehicles.find(vh => vh.model.includes(v.model))?.id || '')))
                      .reduce((s, e) => s + e.fuelCost, 0);
                    const maintCost = maintenance
                      .filter(m => m.vehicleId === (vehicles.find(vh => vh.model.includes(v.model))?.id || ''))
                      .reduce((s, m) => s + m.cost, 0);
                    const roi = v.revenue > 0 ? Math.round(((v.revenue - fuelCost - maintCost) / Math.max(v.revenue, 1)) * 100) : 0;
                    return (
                      <tr key={v.name}>
                        <td className="ff-pg-td" style={{ color: '#3B82F6', fontWeight: 600 }}>{v.name}</td>
                        <td className="ff-pg-td" style={{ color: '#F1F5F9' }}>{v.model}</td>
                        <td className="ff-pg-td">{v.trips}</td>
                        <td className="ff-pg-td">KES {v.revenue.toLocaleString()}</td>
                        <td className="ff-pg-td">KES {fuelCost.toLocaleString()}</td>
                        <td className="ff-pg-td">KES {maintCost.toLocaleString()}</td>
                        <td className="ff-pg-td">
                          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 600, color: roi >= 0 ? '#10B981' : '#EF4444' }}>{roi}%</span>
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

      {/* ── FINANCIAL ── */}
      {activeTab === 'financial' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            <KpiCard label="Total Revenue (6mo)" value="KES 819K" trend={{ val: '↑ 14%', up: true }} valueColor="#10B981" />
            <KpiCard label="Total Fuel Spend" value={`KES ${totalFuelCost.toLocaleString()}`} sub="All logged trips" valueColor="#3B82F6" />
            <KpiCard label="Maintenance Spend" value={`KES ${totalMaintCost.toLocaleString()}`} sub="All service logs" valueColor="#F59E0B" />
            <KpiCard label="Net Profit (Jan)" value="KES 122K" trend={{ val: '↑ 23%', up: true }} />
          </div>

          {/* Financial chart */}
          <div className="ff-pg-card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: '0 0 4px' }}>Revenue vs Operational Costs</h3>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: '0 0 18px' }}>Monthly breakdown (KES)</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={FINANCIAL} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid {...GRID} vertical={false} />
                <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<DarkTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Poppins,sans-serif', color: '#64748B', paddingTop: 16 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="fuel" name="Fuel Cost" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                <Bar dataKey="maintenance" name="Maintenance" fill="#EF4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Financial summary table */}
          <div className="ff-pg-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #1A2030' }}>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: 0 }}>Financial Summary by Month</h3>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#64748B', margin: '3px 0 0' }}>Downloadable for payroll and health audits</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="ff-pg-table">
                <thead className="ff-pg-thead">
                  <tr>
                    {['Month', 'Revenue (KES)', 'Fuel Cost', 'Maint. Cost', 'Other', 'Net Profit', 'Margin'].map(col => (
                      <th key={col} className="ff-pg-th">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="ff-pg-tbody">
                  {FINANCIAL.map(row => {
                    const margin = Math.round((row.profit / row.revenue) * 100);
                    const marginColor = margin >= 50 ? '#10B981' : margin >= 30 ? '#F59E0B' : '#EF4444';
                    const marginBg = margin >= 50 ? 'rgba(16,185,129,.1)' : margin >= 30 ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)';
                    return (
                      <tr key={row.month}>
                        <td className="ff-pg-td" style={{ color: '#F1F5F9', fontWeight: 600 }}>{row.month} 2024</td>
                        <td className="ff-pg-td" style={{ color: '#F1F5F9' }}>{row.revenue.toLocaleString()}</td>
                        <td className="ff-pg-td" style={{ color: '#F59E0B' }}>{row.fuel.toLocaleString()}</td>
                        <td className="ff-pg-td" style={{ color: '#EF4444' }}>{row.maintenance.toLocaleString()}</td>
                        <td className="ff-pg-td" style={{ color: '#334155' }}>—</td>
                        <td className="ff-pg-td" style={{ color: '#10B981', fontWeight: 600 }}>{row.profit.toLocaleString()}</td>
                        <td className="ff-pg-td">
                          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 100, background: marginBg, color: marginColor }}>
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

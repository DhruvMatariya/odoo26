import React, { useState, useMemo } from 'react';
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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

/** Group items by YYYY-MM key from a date string field, return sorted last N months */
function groupByMonth<T>(items: T[], dateKey: (item: T) => string, maxMonths = 6): string[] {
  const keys = new Set<string>();
  items.forEach(item => {
    const d = dateKey(item);
    if (d && d.length >= 7) keys.add(d.slice(0, 7)); // YYYY-MM
  });
  return [...keys].sort().slice(-maxMonths);
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

export function AnalyticsPage() {
  const { vehicles, trips, expenses, maintenance, drivers } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'financial'>('overview');

  const totalFuelCost = expenses.reduce((s, e) => s + e.fuelCost, 0);
  const totalMaintCost = maintenance.reduce((s, m) => s + m.cost, 0);
  const totalOther = expenses.reduce((s, e) => s + e.otherExpense, 0);
  const totalRevenue = trips.reduce((s, t) => s + t.estimatedCost, 0);
  const totalProfit = totalRevenue - totalFuelCost - totalMaintCost - totalOther;

  const utilizationRate = Math.round(
    (vehicles.filter(v => v.status === 'On Trip').length / Math.max(vehicles.filter(v => v.status !== 'Retired').length, 1)) * 100
  );
  const completionRate = Math.round(
    (trips.filter(t => t.status === 'Completed').length / Math.max(trips.length, 1)) * 100
  );
  const activeDrivers = drivers.filter(d => d.status === 'On Duty').length;

  // Build a trip-id → vehicle-id lookup for expense → vehicle mapping
  const tripVehicleMap = useMemo(() => {
    const m = new Map<string, string>();
    trips.forEach(t => m.set(t.id, t.vehicleId));
    return m;
  }, [trips]);

  // Monthly fuel trend (from real expenses)
  const fuelTrend = useMemo(() => {
    const months = groupByMonth(expenses, e => e.date, 6);
    if (months.length === 0) return [];
    return months.map(ym => {
      const monthExpenses = expenses.filter(e => e.date.startsWith(ym));
      const fuelCost = monthExpenses.reduce((s, e) => s + e.fuelCost, 0);
      const fuelLiters = monthExpenses.reduce((s, e) => s + e.fuelAmount, 0);
      return { month: monthLabel(ym), cost: fuelCost, liters: fuelLiters };
    });
  }, [expenses]);

  // Monthly financial data (from real trips, expenses, maintenance)
  const financialData = useMemo(() => {
    // Collect all date keys
    const allDates = [
      ...trips.map(t => t.departureTime || ''),
      ...expenses.map(e => e.date),
      ...maintenance.map(m => m.serviceDate),
    ];
    const months = groupByMonth(allDates.map(d => ({ d })), i => i.d, 6);
    if (months.length === 0) return [];
    return months.map(ym => {
      const revenue = trips
        .filter(t => (t.departureTime || '').startsWith(ym))
        .reduce((s, t) => s + t.estimatedCost, 0);
      const fuel = expenses.filter(e => e.date.startsWith(ym)).reduce((s, e) => s + e.fuelCost, 0);
      const maint = maintenance.filter(m => m.serviceDate.startsWith(ym)).reduce((s, m) => s + m.cost, 0);
      const other = expenses.filter(e => e.date.startsWith(ym)).reduce((s, e) => s + e.otherExpense, 0);
      const profit = revenue - fuel - maint - other;
      return { month: monthLabel(ym), revenue, fuel, maintenance: maint, other, profit };
    });
  }, [trips, expenses, maintenance]);

  // Top utilized vehicles — using real data
  const vehicleUtil = useMemo(() => {
    return vehicles
      .filter(v => v.status !== 'Retired')
      .map(v => {
        const vTrips = trips.filter(t => t.vehicleId === v.id);
        const vTripIds = new Set(vTrips.map(t => t.id));
        const revenue = vTrips.reduce((s, t) => s + t.estimatedCost, 0);
        const fuelCost = expenses.filter(e => vTripIds.has(e.tripId)).reduce((s, e) => s + e.fuelCost, 0);
        const maintCost = maintenance.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
        return {
          id: v.id,
          model: v.model,
          plate: v.plate,
          trips: vTrips.length,
          revenue,
          fuelCost,
          maintCost,
        };
      })
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 8);
  }, [vehicles, trips, expenses, maintenance]);

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
            <KpiCard label="Total Fuel Cost" value={`KES ${totalFuelCost.toLocaleString()}`} sub="Across all logged trips" />
            <KpiCard label="Fleet Utilization" value={`${utilizationRate}%`} sub="Active vs available fleet" valueColor="#3B82F6" />
            <KpiCard label="Trip Completion" value={`${completionRate}%`} sub={`${trips.filter(t => t.status === 'Completed').length} of ${trips.length} trips`} valueColor="#10B981" />
            <KpiCard label="Active Drivers" value={`${activeDrivers}`} sub={`${drivers.length} total drivers`} valueColor="#A855F7" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {/* Fuel Cost Trend */}
            <div className="ff-pg-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: 0 }}>Fuel Cost Trend</h3>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: '3px 0 0' }}>Monthly fuel spend (KES)</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3B82F6' }}>
                  <TrendingUp size={14} />
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 600 }}>
                    {fuelTrend.length} months
                  </span>
                </div>
              </div>
              {fuelTrend.length === 0 ? (
                <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#334155' }}>No expense data yet</p>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={fuelTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<DarkTooltip />} />
                  <Line type="monotone" dataKey="cost" name="Fuel Cost" stroke="#3B82F6" strokeWidth={2.5}
                    dot={{ fill: '#3B82F6', r: 3, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#2563EB' }} />
                </LineChart>
              </ResponsiveContainer>
              )}
            </div>

            {/* Top Vehicles */}
            <div className="ff-pg-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: 0 }}>Top Utilized Vehicles</h3>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: '3px 0 0' }}>By number of trips assigned</p>
                </div>
                <BarChart2 size={15} style={{ color: '#334155' }} />
              </div>
              {vehicleUtil.length === 0 ? (
                <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#334155' }}>No vehicle data yet</p>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={vehicleUtil.map(v => ({ ...v, label: v.model.split(' ')[0] }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid {...GRID} vertical={false} />
                  <XAxis dataKey="label" tick={{ ...TICK, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="trips" name="Trips" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              )}
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
                  {vehicleUtil.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#334155' }}>No vehicle data yet.</td></tr>
                  ) : vehicleUtil.map(v => {
                    const roi = v.revenue > 0 ? Math.round(((v.revenue - v.fuelCost - v.maintCost) / Math.max(v.revenue, 1)) * 100) : 0;
                    return (
                      <tr key={v.id}>
                        <td className="ff-pg-td" style={{ color: '#3B82F6', fontWeight: 600 }}>{v.id.slice(0, 8)}</td>
                        <td className="ff-pg-td" style={{ color: '#F1F5F9' }}>
                          <p style={{ margin: 0 }}>{v.model}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#334155' }}>{v.plate}</p>
                        </td>
                        <td className="ff-pg-td">{v.trips}</td>
                        <td className="ff-pg-td">KES {v.revenue.toLocaleString()}</td>
                        <td className="ff-pg-td">KES {v.fuelCost.toLocaleString()}</td>
                        <td className="ff-pg-td">KES {v.maintCost.toLocaleString()}</td>
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
            <KpiCard label="Total Revenue" value={`KES ${totalRevenue.toLocaleString()}`} sub="Sum of trip estimated costs" valueColor="#10B981" />
            <KpiCard label="Total Fuel Spend" value={`KES ${totalFuelCost.toLocaleString()}`} sub="All logged expenses" valueColor="#3B82F6" />
            <KpiCard label="Maintenance Spend" value={`KES ${totalMaintCost.toLocaleString()}`} sub="All service logs" valueColor="#F59E0B" />
            <KpiCard label="Net Profit" value={`KES ${totalProfit.toLocaleString()}`} sub="Revenue − costs" trend={totalProfit >= 0 ? { val: 'Positive', up: true } : { val: 'Negative', up: false }} />
          </div>

          {/* Financial chart */}
          <div className="ff-pg-card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: '0 0 4px' }}>Revenue vs Operational Costs</h3>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#334155', margin: '0 0 18px' }}>Monthly breakdown (KES)</p>
            {financialData.length === 0 ? (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#334155' }}>No financial data yet. Create trips and expenses to see trends.</p>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={financialData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
            )}
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
                  {financialData.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#334155' }}>No financial data yet.</td></tr>
                  ) : financialData.map(row => {
                    const margin = row.revenue > 0 ? Math.round((row.profit / row.revenue) * 100) : 0;
                    const marginColor = margin >= 50 ? '#10B981' : margin >= 30 ? '#F59E0B' : '#EF4444';
                    const marginBg = margin >= 50 ? 'rgba(16,185,129,.1)' : margin >= 30 ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)';
                    return (
                      <tr key={row.month}>
                        <td className="ff-pg-td" style={{ color: '#F1F5F9', fontWeight: 600 }}>{row.month}</td>
                        <td className="ff-pg-td" style={{ color: '#F1F5F9' }}>{row.revenue.toLocaleString()}</td>
                        <td className="ff-pg-td" style={{ color: '#F59E0B' }}>{row.fuel.toLocaleString()}</td>
                        <td className="ff-pg-td" style={{ color: '#EF4444' }}>{row.maintenance.toLocaleString()}</td>
                        <td className="ff-pg-td" style={{ color: '#94A3B8' }}>{row.other.toLocaleString()}</td>
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

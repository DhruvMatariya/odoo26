import React from 'react';
import { Truck, Wrench, Navigation, DollarSign, TrendingUp, AlertTriangle, ChevronRight, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusPill } from '../components/StatusPill';
import { useNavigate } from 'react-router';

const DASH_CSS = `
  .dash-card {
    background: #0D1017;
    border: 1px solid #1A2030;
    border-radius: 14px;
    padding: 20px;
    transition: border-color 250ms, box-shadow 250ms;
  }
  .dash-card:hover {
    border-color: rgba(59,130,246,0.18);
    box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  }
  .dash-stat-card {
    background: #0D1017;
    border: 1px solid #1A2030;
    border-radius: 14px;
    padding: 20px 22px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    transition: border-color 250ms, box-shadow 250ms, transform 200ms;
  }
  .dash-stat-card:hover {
    border-color: rgba(59,130,246,0.2);
    box-shadow: 0 4px 28px rgba(0,0,0,0.35);
    transform: translateY(-1px);
  }
  .dash-select {
    background: #0D1017;
    border: 1px solid #1E2330;
    border-radius: 9px;
    color: #64748B;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    font-weight: 500;
    padding: 8px 12px;
    outline: none;
    cursor: pointer;
    transition: border-color 200ms;
    appearance: none;
  }
  .dash-select:focus { border-color: #3B82F6; }
  .dash-select option { background: #0D1017; color: #F1F5F9; }

  .dash-tr:hover td { background: rgba(30,42,62,0.25); }
  .dash-th {
    font-family: 'Poppins', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 12px 18px;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid #1A2030;
  }
  .dash-td {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    color: #94A3B8;
    padding: 14px 18px;
    white-space: nowrap;
  }
  .dash-td-primary {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    color: #3B82F6;
    padding: 14px 18px;
    white-space: nowrap;
    font-weight: 600;
  }
  .dash-td-name {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    color: #F1F5F9;
    padding: 14px 18px;
    white-space: nowrap;
    font-weight: 500;
  }
  .dash-view-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #3B82F6;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 200ms;
    padding: 6px 10px;
    border-radius: 7px;
    border: 1px solid transparent;
  }
  .dash-view-btn:hover {
    color: #60A5FA;
    background: rgba(59,130,246,0.08);
    border-color: rgba(59,130,246,0.15);
  }

  @keyframes dashFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .dash-a1 { animation: dashFadeUp 0.4s ease both; }
  .dash-a2 { animation: dashFadeUp 0.4s ease both; animation-delay: 60ms; }
  .dash-a3 { animation: dashFadeUp 0.4s ease both; animation-delay: 120ms; }
  .dash-a4 { animation: dashFadeUp 0.4s ease both; animation-delay: 180ms; }
  .dash-a5 { animation: dashFadeUp 0.4s ease both; animation-delay: 240ms; }
`;

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accentColor: string;
  accentBg: string;
}

function StatCard({ icon: Icon, label, value, sub, accentColor, accentBg }: StatCardProps) {
  return (
    <div className="dash-stat-card">
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: accentBg,
        border: `1px solid ${accentColor}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 0 16px ${accentColor}18`,
      }}>
        <Icon size={19} style={{ color: accentColor }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#64748B', margin: '0 0 3px', fontWeight: 500 }}>{label}</p>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 24, color: '#F1F5F9', margin: '0 0 3px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: '#334155', margin: 0 }}>{sub}</p>}
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
  const totalVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const utilizationRate = Math.round(((activeFleet + vehicles.filter(v => v.status === 'Available').length) / totalVehicles) * 100);
  const recentTrips = [...trips].reverse().slice(0, 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <style>{DASH_CSS}</style>

      {/* Page Header */}
      <div className="dash-a1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: '0 0 4px', lineHeight: 1.2 }}>
            Command Center
          </h1>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: '#64748B', margin: 0 }}>
            Fleet overview — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select className="dash-select">
            <option>All Types</option>
            <option>Truck</option>
            <option>Van</option>
            <option>Bike</option>
          </select>
          <select className="dash-select">
            <option>All Regions</option>
            <option>Nairobi</option>
            <option>Mombasa</option>
            <option>Kisumu</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dash-a2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard icon={Truck}         label="Active Fleet"         value={activeFleet}                         sub={`of ${totalVehicles} total vehicles`} accentColor="#3B82F6" accentBg="rgba(59,130,246,0.1)"  />
        <StatCard icon={AlertTriangle} label="Maintenance Alerts"   value={maintenanceAlerts}                   sub="vehicles in shop"                    accentColor="#F59E0B" accentBg="rgba(245,158,11,0.1)" />
        <StatCard icon={Navigation}    label="Pending Trips"        value={pendingTrips}                        sub="draft + dispatched"                  accentColor="#8B5CF6" accentBg="rgba(139,92,246,0.1)" />
        <StatCard icon={DollarSign}    label="Fuel Cost (Jan)"      value={`KES ${totalFuelCost.toLocaleString()}`} sub="across active trips"             accentColor="#10B981" accentBg="rgba(16,185,129,0.1)" />
      </div>

      {/* Secondary Row */}
      <div className="dash-a3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>

        {/* Utilization */}
        <div className="dash-card">
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Fleet Utilization</p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 28, color: '#F1F5F9', margin: '0 0 12px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {utilizationRate}%
          </p>
          <div style={{ height: 6, background: '#1A2030', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              height: '100%',
              width: `${utilizationRate}%`,
              background: 'linear-gradient(to right, #3B82F6, #60A5FA)',
              borderRadius: 3,
              transition: 'width 800ms ease',
            }} />
          </div>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: '#334155', margin: 0 }}>Assigned vs idle fleet</p>
        </div>

        {/* Pending Cargo */}
        <div className="dash-card">
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Pending Cargo</p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 28, color: '#F1F5F9', margin: '0 0 8px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {trips.filter(t => t.status === 'Draft').length}
          </p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: '#334155', margin: '0 0 10px' }}>Shipments awaiting assignment</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Truck', 'Van', 'Bike'].map(type => (
              <span key={type} style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 10,
                color: '#64748B',
                background: '#111318',
                border: '1px solid #1E2330',
                borderRadius: 6,
                padding: '3px 8px',
                fontWeight: 500,
              }}>
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Completed Trips */}
        <div className="dash-card">
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Completed Trips</p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 28, color: '#F1F5F9', margin: '0 0 4px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {trips.filter(t => t.status === 'Completed').length}
          </p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#334155', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#10B981', fontWeight: 600 }}>↑ 12%</span>
            <span>vs last month</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={13} style={{ color: '#10B981' }} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: '#64748B' }}>Performance improving</span>
          </div>
        </div>
      </div>

      {/* Recent Trips Table */}
      <div className="dash-a4 dash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px 16px',
          borderBottom: '1px solid #1A2030',
        }}>
          <div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: '#F1F5F9', margin: '0 0 3px' }}>
              Recent Trips
            </h2>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#64748B', margin: 0 }}>
              Latest trip activity across the fleet
            </p>
          </div>
          <button className="dash-view-btn" onClick={() => navigate('/trips')}>
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Trip ID', 'Vehicle', 'Driver', 'Route', 'Status', 'ETA'].map(col => (
                  <th key={col} className="dash-th">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((trip, idx) => {
                const vehicle = getVehicleById(trip.vehicleId);
                const driver = getDriverById(trip.driverId);
                return (
                  <tr
                    key={trip.id}
                    className="dash-tr"
                    style={{ borderBottom: idx < recentTrips.length - 1 ? '1px solid #111318' : 'none' }}
                  >
                    <td className="dash-td-primary">{trip.id}</td>
                    <td className="dash-td-name">{vehicle?.model ?? trip.vehicleId}</td>
                    <td className="dash-td">{driver?.name ?? trip.driverId}</td>
                    <td className="dash-td">{trip.origin} → {trip.destination}</td>
                    <td style={{ padding: '14px 18px' }}><StatusPill status={trip.status} /></td>
                    <td className="dash-td">{trip.eta.split(' ')[0]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Banner */}
      {maintenanceAlerts > 0 && (
        <div className="dash-a5" style={{
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.18)',
          borderRadius: 12,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: '#F59E0B', fontWeight: 600, margin: '0 0 2px' }}>
              {maintenanceAlerts} vehicle{maintenanceAlerts > 1 ? 's' : ''} currently in maintenance
            </p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#92400E', margin: 0 }}>
              These vehicles are hidden from the dispatcher queue until service is complete.
            </p>
          </div>
          <button
            className="dash-view-btn"
            onClick={() => navigate('/maintenance')}
            style={{ flexShrink: 0 }}
          >
            View logs →
          </button>
        </div>
      )}
    </div>
  );
}

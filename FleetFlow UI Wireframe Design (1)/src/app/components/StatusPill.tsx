import React from 'react';

interface StatusPillProps {
  status: string;
  size?: 'sm' | 'md';
}

// Dark-palette status configuration
const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string; border: string }> = {
  // Vehicle
  'Available':   { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', dot: '#10B981', border: 'rgba(16,185,129,0.25)'  },
  'On Trip':     { bg: 'rgba(59,130,246,0.1)',   color: '#3B82F6', dot: '#3B82F6', border: 'rgba(59,130,246,0.25)'  },
  'In Shop':     { bg: 'rgba(245,158,11,0.1)',   color: '#F59E0B', dot: '#F59E0B', border: 'rgba(245,158,11,0.25)'  },
  'Retired':     { bg: 'rgba(255,255,255,0.05)', color: '#64748B', dot: '#334155', border: 'rgba(255,255,255,0.08)' },
  // Driver
  'On Duty':     { bg: 'rgba(16,185,129,0.1)',   color: '#10B981', dot: '#10B981', border: 'rgba(16,185,129,0.25)'  },
  'Off Duty':    { bg: 'rgba(255,255,255,0.05)', color: '#64748B', dot: '#334155', border: 'rgba(255,255,255,0.08)' },
  'Suspended':   { bg: 'rgba(239,68,68,0.1)',    color: '#EF4444', dot: '#EF4444', border: 'rgba(239,68,68,0.25)'   },
  // Trip
  'Draft':       { bg: 'rgba(255,255,255,0.05)', color: '#64748B', dot: '#334155', border: 'rgba(255,255,255,0.08)' },
  'Dispatched':  { bg: 'rgba(59,130,246,0.1)',   color: '#3B82F6', dot: '#3B82F6', border: 'rgba(59,130,246,0.25)'  },
  'Completed':   { bg: 'rgba(16,185,129,0.1)',   color: '#10B981', dot: '#10B981', border: 'rgba(16,185,129,0.25)'  },
  'Cancelled':   { bg: 'rgba(239,68,68,0.1)',    color: '#EF4444', dot: '#EF4444', border: 'rgba(239,68,68,0.25)'   },
  // Maintenance
  'Scheduled':   { bg: 'rgba(245,158,11,0.1)',   color: '#F59E0B', dot: '#F59E0B', border: 'rgba(245,158,11,0.25)'  },
  'In Progress': { bg: 'rgba(59,130,246,0.1)',   color: '#3B82F6', dot: '#3B82F6', border: 'rgba(59,130,246,0.25)'  },
  // License
  'Valid':       { bg: 'rgba(16,185,129,0.1)',   color: '#10B981', dot: '#10B981', border: 'rgba(16,185,129,0.25)'  },
  'Expired':     { bg: 'rgba(239,68,68,0.1)',    color: '#EF4444', dot: '#EF4444', border: 'rgba(239,68,68,0.25)'   },
};

export function StatusPill({ status, size = 'sm' }: StatusPillProps) {
  const cfg = STATUS_CONFIG[status] ?? {
    bg: 'rgba(255,255,255,0.05)', color: '#64748B', dot: '#334155', border: 'rgba(255,255,255,0.08)',
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: size === 'md' ? '5px 12px' : '3px 10px',
      borderRadius: 100,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      fontFamily: "'Poppins', sans-serif",
      fontSize: size === 'md' ? 12 : 11,
      fontWeight: 600,
      color: cfg.color,
      whiteSpace: 'nowrap',
      letterSpacing: '0.02em',
    }}>
      <span style={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
        boxShadow: `0 0 4px ${cfg.dot}99`,
      }} />
      {status}
    </span>
  );
}

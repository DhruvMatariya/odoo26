import React from 'react';

interface StatusPillProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  // Vehicle
  'Available':    { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  'On Trip':      { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  'In Shop':      { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  'Retired':      { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400' },
  // Driver
  'On Duty':      { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  'Off Duty':     { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400' },
  'Suspended':    { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
  // Trip
  'Draft':        { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400' },
  'Dispatched':   { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  'Completed':    { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  'Cancelled':    { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
  // Maintenance
  'Scheduled':    { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  'In Progress':  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  // License
  'Valid':        { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  'Expired':      { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
};

export function StatusPill({ status, size = 'sm' }: StatusPillProps) {
  const config = STATUS_CONFIG[status] ?? { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' };
  const padding = size === 'md' ? 'px-3 py-1.5' : 'px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium ${padding} ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {status}
    </span>
  );
}

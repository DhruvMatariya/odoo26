import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, subtitle, children, width = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const maxW = { sm: 480, md: 560, lg: 780 }[width];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div style={{
        position: 'relative',
        background: '#0D1017',
        border: '1px solid #1E2330',
        borderRadius: 16,
        width: '100%',
        maxWidth: maxW,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '20px 24px 18px',
          borderBottom: '1px solid #1A2030',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: '#F1F5F9', margin: 0, lineHeight: 1.3 }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#64748B', margin: '3px 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            data-cursor="button"
            className="acct-close-btn"
            style={{
              marginLeft: 16,
              width: 30, height: 30,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #1E2330',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748B',
              flexShrink: 0,
              transition: 'color 180ms, border-color 180ms, background 180ms',
            }}
          >
            <X size={15} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        color: '#64748B',
        marginBottom: 6,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// Dark-themed input/select class strings (used across pages)
export const inputCls = [
  'w-full px-3 py-2 rounded-lg text-sm outline-none transition-all',
  'bg-[#0A0C10] border border-[#1E2330] text-[#F1F5F9]',
  'placeholder-[#334155]',
  'focus:border-[#3B82F6]',
  'font-[Poppins]',
].join(' ');

export const selectCls = [
  'w-full px-3 py-2 rounded-lg text-sm outline-none transition-all appearance-none',
  'bg-[#0A0C10] border border-[#1E2330] text-[#F1F5F9]',
  'focus:border-[#3B82F6]',
  'font-[Poppins]',
].join(' ');

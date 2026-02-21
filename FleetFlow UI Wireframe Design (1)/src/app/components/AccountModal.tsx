import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, User, Mail, Shield, Save, Check, Pencil, Copy, Key, Building2 } from 'lucide-react';
import { useApp, UserRole } from '../context/AppContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_BADGE: Record<UserRole, { bg: string; color: string; label: string }> = {
  'Admin':        { bg: 'rgba(168,85,247,0.12)', color: '#A855F7', label: 'Administrator' },
  'Fleet Manager':{ bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6', label: 'Fleet Manager'  },
  'Dispatcher':   { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B', label: 'Dispatcher'     },
  'Driver':       { bg: 'rgba(16,185,129,0.12)',  color: '#10B981', label: 'Driver'         },
};

const ACCOUNT_CSS = `
  @keyframes acctSlideIn {
    from { opacity: 0; transform: translateX(-32px) scale(0.97); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes acctFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes acctFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .acct-overlay {
    position: fixed;
    inset: 0;
    z-index: 9000;
    display: flex;
    align-items: stretch;
    animation: acctFadeIn 200ms ease both;
  }
  .acct-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(4px);
  }
  .acct-panel {
    position: relative;
    z-index: 1;
    width: 420px;
    max-width: 100vw;
    background: #0D1017;
    border-right: 1px solid #1E2330;
    display: flex;
    flex-direction: column;
    animation: acctSlideIn 280ms cubic-bezier(0.34,1.4,0.64,1) both;
    overflow: hidden;
  }
  .acct-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 28px 20px;
    border-bottom: 1px solid #1A2030;
    flex-shrink: 0;
  }
  .acct-body {
    flex: 1;
    overflow-y: auto;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .acct-body::-webkit-scrollbar { width: 4px; }
  .acct-body::-webkit-scrollbar-track { background: transparent; }
  .acct-body::-webkit-scrollbar-thumb { background: #1E2330; border-radius: 2px; }

  .acct-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    background: #0A0C10;
    border: 1px solid #1E2330;
    border-radius: 10px;
    transition: border-color 200ms, box-shadow 200ms;
    overflow: hidden;
  }
  .acct-input-wrap:focus-within {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  .acct-input-wrap:focus-within .acct-input-icon { color: #3B82F6; }
  .acct-input-icon {
    position: absolute;
    left: 14px;
    color: #334155;
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: color 200ms;
  }
  .acct-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #F1F5F9;
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    padding: 13px 14px 13px 44px;
    width: 100%;
  }
  .acct-input::placeholder { color: #334155; }
  .acct-input:disabled {
    color: #334155;
    cursor: not-allowed;
  }
  .acct-label {
    font-family: 'Poppins', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #64748B;
    display: block;
    margin-bottom: 8px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .acct-save-btn {
    width: 100%;
    height: 46px;
    background: #3B82F6;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 200ms, box-shadow 200ms, transform 100ms;
  }
  .acct-save-btn:hover { background: #2563EB; box-shadow: 0 4px 20px rgba(59,130,246,0.4); }
  .acct-save-btn:active { transform: scale(0.98); }
  .acct-save-btn.saved { background: #059669; }

  .acct-close-btn {
    width: 32px;
    height: 32px;
    background: rgba(255,255,255,0.04);
    border: 1px solid #1E2330;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748B;
    transition: color 200ms, border-color 200ms, background 200ms;
    flex-shrink: 0;
  }
  .acct-close-btn:hover { color: #F1F5F9; border-color: #334155; background: rgba(255,255,255,0.07); }

  .acct-avatar-ring {
    position: relative;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    cursor: pointer;
    flex-shrink: 0;
  }
  .acct-avatar-ring::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    z-index: 0;
  }
  .acct-avatar-img {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #0D1017;
  }
  .acct-avatar-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0,0,0,0.55);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    opacity: 0;
    transition: opacity 200ms;
    z-index: 2;
    border: 2px solid transparent;
  }
  .acct-avatar-ring:hover .acct-avatar-overlay { opacity: 1; }

  @keyframes acctSavedPop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  .acct-saved-icon { animation: acctSavedPop 350ms cubic-bezier(0.34,1.56,0.64,1) both; }

  .acct-section-title {
    font-family: 'Poppins', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #334155;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .acct-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #1A2030;
  }

  .acct-info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #0A0C10;
    border: 1px solid #1A2030;
    border-radius: 10px;
  }
  .acct-info-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
`;

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { currentUser, updateUser } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [previewPic, setPreviewPic] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name);
      setPreviewPic(currentUser.profilePic);
      setSaved(false);
      setIsEditingName(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleBadge = ROLE_BADGE[currentUser.role];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPreviewPic(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    updateUser({ name: name.trim(), profilePic: previewPic });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
    setIsEditingName(false);
  };

  const hasChanges = name.trim() !== currentUser.name || previewPic !== currentUser.profilePic;

  return (
    <div className="acct-overlay">
      <style>{ACCOUNT_CSS}</style>

      {/* Backdrop */}
      <div className="acct-backdrop" onClick={onClose} />

      {/* Side Panel */}
      <div className="acct-panel">

        {/* Header */}
        <div className="acct-header">
          <div>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 17,
              fontWeight: 700,
              color: '#F1F5F9',
              margin: 0,
              lineHeight: 1.3,
            }}>
              Account Settings
            </h2>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 12,
              color: '#64748B',
              margin: '3px 0 0',
            }}>
              Manage your profile & preferences
            </p>
          </div>
          <button className="acct-close-btn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="acct-body">

          {/* Profile Picture Section */}
          <div style={{ animation: 'acctFadeUp 0.35s ease both', animationDelay: '60ms' }}>
            <div className="acct-section-title">Profile Photo</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Avatar */}
              <div
                className="acct-avatar-ring"
                onClick={() => fileRef.current?.click()}
                title="Click to change photo"
              >
                {previewPic ? (
                  <img src={previewPic} className="acct-avatar-img" alt="Profile" />
                ) : (
                  <div style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1E2A3E 0%, #0D1017 100%)',
                    border: '2px solid #0D1017',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 26,
                      fontWeight: 700,
                      color: '#3B82F6',
                      letterSpacing: '-0.02em',
                    }}>
                      {initials}
                    </span>
                  </div>
                )}
                <div className="acct-avatar-overlay">
                  <Camera size={18} style={{ color: '#fff' }} />
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 9, color: '#fff', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Change
                  </span>
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: '#94A3B8', margin: '0 0 8px', lineHeight: 1.6 }}>
                  Click the avatar to upload a new photo. Supports JPG, PNG, or WebP.
                </p>
                {previewPic && previewPic !== currentUser.profilePic && (
                  <span style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 11,
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 500,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
                    New photo ready — save to apply
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div style={{ animation: 'acctFadeUp 0.35s ease both', animationDelay: '120ms' }}>
            <div className="acct-section-title">Display Name</div>
            <div>
              <label className="acct-label">Full Name</label>
              <div className="acct-input-wrap">
                <span className="acct-input-icon"><User size={15} /></span>
                <input
                  type="text"
                  className="acct-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  onFocus={() => setIsEditingName(true)}
                  style={{ paddingRight: 44 }}
                />
                <div style={{
                  position: 'absolute',
                  right: 14,
                  display: 'flex',
                  alignItems: 'center',
                  color: '#334155',
                }}>
                  <Pencil size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Account Info (read-only) */}
          <div style={{ animation: 'acctFadeUp 0.35s ease both', animationDelay: '180ms' }}>
            <div className="acct-section-title">Account Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Email */}
              <div className="acct-info-row">
                <div className="acct-info-icon">
                  <Mail size={15} style={{ color: '#3B82F6' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: '#64748B', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Email</p>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: '#94A3B8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.email}
                  </p>
                </div>
                <span style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 10,
                  color: '#334155',
                  background: '#0A0C10',
                  border: '1px solid #1A2030',
                  borderRadius: 4,
                  padding: '2px 7px',
                  flexShrink: 0,
                  fontWeight: 500,
                }}>
                  read-only
                </span>
              </div>

              {/* Role */}
              <div className="acct-info-row">
                <div className="acct-info-icon" style={{ background: `${roleBadge.bg}`, borderColor: `${roleBadge.color}22` }}>
                  <Shield size={15} style={{ color: roleBadge.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: '#64748B', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Role</p>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: roleBadge.color, margin: 0, fontWeight: 600 }}>
                    {roleBadge.label}
                  </p>
                </div>
                <span style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 10,
                  color: '#334155',
                  background: '#0A0C10',
                  border: '1px solid #1A2030',
                  borderRadius: 4,
                  padding: '2px 7px',
                  flexShrink: 0,
                  fontWeight: 500,
                }}>
                  read-only
                </span>
              </div>

              {/* Organisation Access Code (managers only) */}
              {currentUser.role === 'Fleet Manager' && currentUser.organisationId && (
                <div className="acct-info-row" style={{ borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.04)' }}>
                  <div className="acct-info-icon" style={{ background: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.2)' }}>
                    <Building2 size={15} style={{ color: '#8B5CF6' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: '#64748B', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Organisation ID</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#8B5CF6', margin: 0, fontWeight: 600 }}>
                      {currentUser.organisationId}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 10,
                    color: '#334155',
                    background: '#0A0C10',
                    border: '1px solid #1A2030',
                    borderRadius: 4,
                    padding: '2px 7px',
                    flexShrink: 0,
                    fontWeight: 500,
                  }}>
                    read-only
                  </span>
                </div>
              )}

              {currentUser.role === 'Fleet Manager' && currentUser.accessCode && (
                <div className="acct-info-row" style={{ borderColor: 'rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.04)' }}>
                  <div className="acct-info-icon" style={{ background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.2)' }}>
                    <Key size={15} style={{ color: '#3B82F6' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: '#64748B', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Organisation Access Code</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, color: '#3B82F6', margin: 0, fontWeight: 700, letterSpacing: '0.25em' }}>
                      {currentUser.accessCode}
                    </p>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, color: '#64748B', margin: '4px 0 0', lineHeight: 1.4 }}>
                      Share this code with dispatchers so they can join your organisation
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentUser.accessCode!);
                      setCodeCopied(true);
                      setTimeout(() => setCodeCopied(false), 2000);
                    }}
                    style={{
                      background: codeCopied ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.1)',
                      border: `1px solid ${codeCopied ? 'rgba(16,185,129,0.25)' : 'rgba(59,130,246,0.2)'}`,
                      borderRadius: 8,
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      cursor: 'pointer',
                      color: codeCopied ? '#10B981' : '#3B82F6',
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      transition: 'all 200ms',
                      flexShrink: 0,
                    }}
                  >
                    {codeCopied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>
              )}

              {/* User ID */}
              <div className="acct-info-row">
                <div className="acct-info-icon">
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, color: '#3B82F6', fontWeight: 700 }}>ID</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: '#64748B', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>User ID</p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#334155', margin: 0 }}>
                    {currentUser.id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ animation: 'acctFadeUp 0.35s ease both', animationDelay: '240ms', marginTop: 'auto' }}>
            <button
              className={`acct-save-btn ${saved ? 'saved' : ''}`}
              onClick={handleSave}
              disabled={!hasChanges && !saved}
              style={{ opacity: !hasChanges && !saved ? 0.5 : 1, cursor: !hasChanges && !saved ? 'not-allowed' : 'pointer' }}
            >
              {saved ? (
                <>
                  <Check size={16} className="acct-saved-icon" />
                  Changes Saved!
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>

            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 11,
              color: '#1E2330',
              textAlign: 'center',
              marginTop: 12,
              letterSpacing: '0.04em',
            }}>
              Changes apply to your current session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
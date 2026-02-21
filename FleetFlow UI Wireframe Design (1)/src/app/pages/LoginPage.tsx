import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Truck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useApp, UserRole } from '../context/AppContext';
import { AuthBackground } from '../components/auth/AuthBackground';
import { CursorFollower } from '../components/auth/CursorFollower';

type RolePill = 'Manager' | 'Dispatcher';

const AUTH_CSS = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
  @keyframes spinIcon {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes focusPulse {
    0%   { box-shadow: 0 0 0 0px rgba(59,130,246,0); }
    50%  { box-shadow: 0 0 0 4px rgba(59,130,246,0.18); }
    100% { box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  }

  .ff-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    background: #0D1017;
    border: 1px solid #1E2330;
    border-radius: 8px;
    transition: border-color 200ms ease, box-shadow 200ms ease;
    overflow: hidden;
  }
  .ff-input-wrap:focus-within {
    border-color: #3B82F6;
    animation: focusPulse 300ms ease forwards;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  .ff-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #F1F5F9;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    padding: 13px 14px 13px 44px;
    width: 100%;
  }
  .ff-input::placeholder { color: #334155; }
  .ff-input-icon {
    position: absolute;
    left: 14px;
    color: #334155;
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: color 200ms ease;
  }
  .ff-input-wrap:focus-within .ff-input-icon { color: #3B82F6; }
  .ff-input-action {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: #334155;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 4px;
    transition: color 200ms;
  }
  .ff-input-action:hover { color: #64748B; }
  .ff-btn-primary {
    width: 100%;
    height: 44px;
    background: #3B82F6;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 200ms ease, box-shadow 200ms ease, transform 100ms ease;
  }
  .ff-btn-primary:hover:not(:disabled) {
    background: #2563EB;
    box-shadow: 0 4px 20px rgba(59,130,246,0.4);
  }
  .ff-btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .ff-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
  .ff-btn-ghost {
    flex: 1;
    height: 40px;
    background: #1A1D26;
    border: 1px solid #1E2330;
    border-radius: 8px;
    color: #64748B;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: border-color 200ms, color 200ms;
  }
  .ff-btn-ghost:hover { border-color: #3B82F6; color: #94A3B8; }

  .ff-fade-1 { animation: fadeInUp 0.5s ease both; animation-delay: 0ms; }
  .ff-fade-2 { animation: fadeInUp 0.5s ease both; animation-delay: 80ms; }
  .ff-fade-3 { animation: fadeInUp 0.5s ease both; animation-delay: 160ms; }
  .ff-fade-4 { animation: fadeInUp 0.5s ease both; animation-delay: 240ms; }
  .ff-fade-5 { animation: fadeInUp 0.5s ease both; animation-delay: 320ms; }
  .ff-fade-6 { animation: fadeInUp 0.5s ease both; animation-delay: 400ms; }
  .ff-fade-7 { animation: fadeInUp 0.5s ease both; animation-delay: 480ms; }
  .ff-fade-8 { animation: fadeInUp 0.5s ease both; animation-delay: 560ms; }

  .ff-shake { animation: shake 0.45s ease both; }
  .ff-spin { animation: spinIcon 1s linear infinite; }

  .ff-link {
    color: #3B82F6;
    text-decoration: none;
    transition: text-decoration 150ms;
    cursor: pointer;
  }
  .ff-link:hover { text-decoration: underline; }

  @media (max-width: 768px) {
    .ff-left-panel { display: none !important; }
    .ff-right-panel { padding: 24px !important; }
  }
`;

export function LoginPage() {
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<RolePill>('Manager');
  const [email, setEmail] = useState('manager@fleetflow.io');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setTimeout(() => toast.success('Account created! Welcome to FleetFlow. Please sign in.'), 300);
    }
  }, [searchParams]);

  const handleRoleSwitch = (r: RolePill) => {
    setRole(r);
    setEmail(r === 'Manager' ? 'manager@fleetflow.io' : 'dispatch@fleetflow.io');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setIsLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 900));
    const roleMap: Record<RolePill, UserRole> = { Manager: 'Fleet Manager', Dispatcher: 'Dispatcher' };
    const ok = login(email, password, roleMap[role]);
    if (!ok) {
      setError('Invalid credentials. Check your email and password.');
      setShakeKey(k => k + 1);
    } else {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      background: '#0A0C10',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <style>{AUTH_CSS}</style>

      {/* Full-page network background */}
      <AuthBackground />

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 24,
          left: 28,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: 'none',
          color: '#334155',
          fontFamily: '"Sora", sans-serif',
          fontSize: 13,
          cursor: 'pointer',
          padding: '6px 10px',
          borderRadius: 6,
          transition: 'color 200ms',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#64748B')}
        onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Logo */}
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.18)',
          borderRadius: 8,
          padding: 7,
          display: 'flex',
          boxShadow: '0 0 16px rgba(59,130,246,0.2)',
        }}>
          <Truck size={16} style={{ color: '#3B82F6' }} />
        </div>
        <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: 16, color: '#F1F5F9' }}>
          FleetFlow
        </span>
      </div>

      {/* Card */}
      <div
        key={`form-${shakeKey}`}
        className={shakeKey > 0 ? 'ff-shake' : ''}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 400,
          padding: '0 24px',
        }}
      >
        {/* Card container */}
        <div style={{
          background: 'rgba(13,16,23,0.85)',
          border: '1px solid #1E2330',
          borderRadius: 16,
          padding: '36px 32px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>

          {/* Header */}
          <div className="ff-fade-1" style={{ marginBottom: 28 }}>
            <h2 style={{
              fontFamily: '"Sora", sans-serif',
              fontSize: 26,
              fontWeight: 700,
              color: '#F1F5F9',
              margin: '0 0 6px',
              lineHeight: 1.2,
            }}>
              Welcome back
            </h2>
            <p style={{ fontFamily: '"Sora", sans-serif', fontSize: 14, color: '#64748B', margin: 0 }}>
              Sign in to your fleet account
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              marginBottom: 16,
              background: '#1A0A0A',
              borderLeft: '3px solid #EF4444',
              borderRadius: '0 8px 8px 0',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <AlertCircle size={15} style={{ color: '#EF4444', flexShrink: 0 }} />
              <span style={{ fontFamily: '"Sora", sans-serif', fontSize: 13, color: '#EF4444' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Pill Selector */}
            <div className="ff-fade-2" style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex',
                gap: 8,
                background: '#0D1017',
                border: '1px solid #1E2330',
                borderRadius: 10,
                padding: 4,
              }}>
                {(['Manager', 'Dispatcher'] as RolePill[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSwitch(r)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: 7,
                      border: role === r ? '1px solid #3B82F6' : '1px solid transparent',
                      background: role === r ? '#1E2A3E' : 'transparent',
                      color: role === r ? '#3B82F6' : '#64748B',
                      fontFamily: '"Sora", sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{r === 'Manager' ? '🏢' : '📡'}</span>
                    {r === 'Manager' ? 'Fleet Manager' : 'Dispatcher'}
                  </button>
                ))}
              </div>
            </div>

            {/* Email field */}
            <div className="ff-fade-3" style={{ marginBottom: 12 }}>
              <label style={{
                fontFamily: '"Sora", sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: '#64748B',
                display: 'block',
                marginBottom: 6,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Email Address
              </label>
              <div className="ff-input-wrap">
                <span className="ff-input-icon"><Mail size={15} /></span>
                <input
                  type="email"
                  className="ff-input"
                  placeholder="you@fleet.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="ff-fade-4" style={{ marginBottom: 8 }}>
              <label style={{
                fontFamily: '"Sora", sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: '#64748B',
                display: 'block',
                marginBottom: 6,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Password
              </label>
              <div className="ff-input-wrap">
                <span className="ff-input-icon"><Lock size={15} /></span>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="ff-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" className="ff-input-action" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="ff-fade-4" style={{ textAlign: 'right', marginBottom: 20 }}>
              <span className="ff-link" style={{ fontSize: 12 }}>Forgot password?</span>
            </div>

            {/* Sign In button */}
            <div className="ff-fade-5">
              <button type="submit" className="ff-btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="ff-spin" />
                    Authenticating...
                  </>
                ) : 'Sign In'}
              </button>
            </div>

            {/* Footer link */}
            <div className="ff-fade-6" style={{
              textAlign: 'center',
              marginTop: 22,
              fontFamily: '"Sora", sans-serif',
              fontSize: 13,
              color: '#64748B',
            }}>
              Don't have an account?{' '}
              <span className="ff-link" style={{ fontWeight: 600 }} onClick={() => navigate('/signup')}>
                Create one →
              </span>
            </div>
          </form>
        </div>
      </div>

      <CursorFollower />
    </div>
  );
}
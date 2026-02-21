import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Lock, Building2, ChevronDown, Eye, EyeOff, AlertCircle, Check, Truck, ArrowLeft } from 'lucide-react';
import { AuthBackground } from '../components/auth/AuthBackground';
import { CursorFollower } from '../components/auth/CursorFollower';
import { authApi } from '../services/api';

const SIGNUP_CSS = `
  @keyframes fadeInUpSignup {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideOutLeft {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(-24px); }
  }
  @keyframes stepPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
    50%       { box-shadow: 0 0 0 5px rgba(59,130,246,0); }
  }
  @keyframes spinSignup {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .sg-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    background: #0D1017;
    border: 1px solid #1E2330;
    border-radius: 8px;
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }
  .sg-input-wrap:focus-within {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  .sg-input-wrap:focus-within .sg-input-icon { color: #3B82F6 !important; }
  .sg-input {
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
  .sg-input::placeholder { color: #334155; }
  .sg-input-icon {
    position: absolute;
    left: 14px;
    color: #334155;
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: color 200ms;
  }
  .sg-input-action {
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
  .sg-input-action:hover { color: #64748B; }
  .sg-label {
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #64748B;
    display: block;
    margin-bottom: 6px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .sg-btn-primary {
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
    transition: background 200ms, box-shadow 200ms, transform 100ms;
  }
  .sg-btn-primary:hover { background: #2563EB; box-shadow: 0 4px 20px rgba(59,130,246,0.4); }
  .sg-btn-primary:active { transform: scale(0.98); }
  .sg-btn-outline {
    width: 100%;
    height: 44px;
    background: transparent;
    border: 1px solid #1E2330;
    border-radius: 8px;
    color: #64748B;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: border-color 200ms, color 200ms;
  }
  .sg-btn-outline:hover { border-color: #334155; color: #94A3B8; }
  .sg-step-active { animation: stepPulse 1.8s ease infinite; }
  .sg-slide-in { animation: slideInRight 0.32s cubic-bezier(0.25,0.46,0.45,0.94) both; }
  .sg-fade-1 { animation: fadeInUpSignup 0.45s ease both; animation-delay: 0ms; }
  .sg-fade-2 { animation: fadeInUpSignup 0.45s ease both; animation-delay: 70ms; }
  .sg-fade-3 { animation: fadeInUpSignup 0.45s ease both; animation-delay: 140ms; }
  .sg-fade-4 { animation: fadeInUpSignup 0.45s ease both; animation-delay: 210ms; }
  .sg-fade-5 { animation: fadeInUpSignup 0.45s ease both; animation-delay: 280ms; }
  .sg-link { color: #3B82F6; cursor: pointer; text-decoration: none; }
  .sg-link:hover { text-decoration: underline; }

  .sg-otp-box {
    width: 44px;
    height: 52px;
    background: #0D1017;
    border: 1px solid #1E2330;
    border-radius: 8px;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 20px;
    font-weight: 500;
    color: #F1F5F9;
    outline: none;
    transition: border-color 200ms, box-shadow 200ms;
  }
  .sg-otp-box:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
  }
  .sg-otp-box.filled {
    border-color: rgba(59,130,246,0.4);
    color: #3B82F6;
  }
  .sg-select {
    width: 100%;
    background: #0D1017;
    border: 1px solid #1E2330;
    border-radius: 8px;
    color: #F1F5F9;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    padding: 13px 40px 13px 16px;
    outline: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    transition: border-color 200ms, box-shadow 200ms;
  }
  .sg-select:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .sg-select option { background: #111318; color: #F1F5F9; }
  .sg-select-wrap { position: relative; }
  .sg-select-icon {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #334155;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    .sg-left-panel { display: none !important; }
    .sg-right-inner { padding: 24px !important; }
  }
`;

const ROLE_DESCRIPTIONS: Record<string, string> = {
  'Fleet Manager':       'Full system access including analytics, vehicle registry, and reports.',
  'Dispatcher':          'Create and manage trip assignments, dispatch routes, and cargo loads.',
  'Safety Officer':      'Monitor driver compliance, license expiration, and safety scores.',
  'Financial Analyst':   'Access expense reports, fuel costs, and operational financial analytics.',
};

function PasswordStrength({ password }: { password: string }) {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ['', 'Weak', 'Fair', 'Moderate', 'Strong'];
  const segColors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981'];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: i <= score ? segColors[score - 1] : '#1E2330',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>
      <span style={{
        fontFamily: '"Sora", sans-serif',
        fontSize: 11,
        color: score > 0 ? segColors[score - 1] : '#64748B',
        fontWeight: 500,
      }}>
        {labels[score] || 'Too Short'}
      </span>
    </div>
  );
}

function OTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, val: string) => {
    const newVal = [...value];
    newVal[index] = val.replace(/\D/g, '').slice(-1);
    onChange(newVal);
    if (val && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newVal = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    onChange(newVal);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {value.map((char, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={char}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`sg-otp-box${char ? ' filled' : ''}`}
        />
      ))}
    </div>
  );
}

type Step = 1 | 2 | 3;

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [stepKey, setStepKey] = useState(0);

  // Step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Step 2
  const [role, setRole] = useState('Fleet Manager');
  const [fleet, setFleet] = useState('');
  const [region, setRegion] = useState('');

  // Step 3
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const advance = (next: Step) => {
    setStep(next);
    setStepKey(k => k + 1);
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required.';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email.';
    if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (password !== confirmPw) e.confirmPw = "Passwords don't match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!fleet.trim()) e.fleet = 'Organization name is required.';
    if (!region) e.region = 'Please select a region.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) advance(2);
    else if (step === 2 && validateStep2()) advance(3);
  };

  const handleBack = () => {
    if (step === 2) advance(1);
    else if (step === 3) advance(2);
  };

  const handleSubmit = async () => {
    const accessCode = otp.join('').trim();
    if (accessCode.length !== 6) {
      setErrors({ otp: 'Enter all 6 digits of the access code.' });
      return;
    }
    const roleLower = role === 'Fleet Manager' ? 'manager' : 'dispatcher';
    if (roleLower === 'dispatcher' && !accessCode) {
      setErrors({ otp: 'Access code is required for Dispatchers.' });
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    const result = await authApi.signup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: roleLower as 'manager' | 'dispatcher',
      ...(roleLower === 'manager' && { organisationName: fleet.trim() || 'My Organisation' }),
      ...(roleLower === 'dispatcher' && { accessCode }),
    });
    if ('error' in result) {
      setErrors({ otp: result.error || 'Signup failed. Try again.' });
      setIsSubmitting(false);
      return;
    }
    navigate('/login?registered=true');
    setIsSubmitting(false);
  };

  const STEPS = [
    { n: 1, label: 'Account' },
    { n: 2, label: 'Role' },
    { n: 3, label: 'Access' },
  ];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      background: '#0A0C10',
      overflow: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <style>{SIGNUP_CSS}</style>

      {/* Full-page network background */}
      <AuthBackground />

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
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
      <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
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
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: 440,
        padding: '96px 24px 40px',
      }}>
        <div style={{
          background: 'rgba(13,16,23,0.85)',
          border: '1px solid #1E2330',
          borderRadius: 16,
          padding: '36px 32px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>

          {/* Page header */}
          <div className="sg-fade-1" style={{ marginBottom: 24 }}>
            <h2 style={{
              fontFamily: '"Sora", sans-serif',
              fontSize: 24,
              fontWeight: 700,
              color: '#F1F5F9',
              margin: '0 0 6px',
            }}>
              Create account
            </h2>
            <p style={{ fontFamily: '"Sora", sans-serif', fontSize: 14, color: '#64748B', margin: 0 }}>
              Join your fleet operations team
            </p>
          </div>

          {/* Step Progress Indicator */}
          <div className="sg-fade-2" style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.n}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    className={step === s.n ? 'sg-step-active' : ''}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: step > s.n ? '#3B82F6' : step === s.n ? '#1E2A3E' : '#111318',
                      border: step > s.n ? '2px solid #3B82F6' : step === s.n ? '2px solid #3B82F6' : '2px solid #1E2330',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 300ms ease',
                      flexShrink: 0,
                    }}
                  >
                    {step > s.n ? (
                      <Check size={13} style={{ color: '#fff', strokeWidth: 2.5 }} />
                    ) : (
                      <span style={{
                        fontFamily: '"DM Mono", monospace',
                        fontSize: 11,
                        fontWeight: 500,
                        color: step === s.n ? '#3B82F6' : '#334155',
                      }}>
                        {s.n}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontFamily: '"Sora", sans-serif',
                    fontSize: 10,
                    fontWeight: 500,
                    color: step === s.n ? '#3B82F6' : step > s.n ? '#64748B' : '#334155',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 1,
                    background: step > s.n ? '#3B82F6' : '#1E2330',
                    margin: '0 8px',
                    marginBottom: 22,
                    transition: 'background 300ms ease',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          <div key={stepKey} className="sg-slide-in">

            {/* ── STEP 1: Account Details ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="sg-fade-1">
                  <label className="sg-label">Full Name</label>
                  <div className="sg-input-wrap">
                    <span className="sg-input-icon"><User size={15} /></span>
                    <input className="sg-input" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
                  </div>
                  {errors.name && <ErrorMsg msg={errors.name} />}
                </div>
                <div className="sg-fade-2">
                  <label className="sg-label">Work Email</label>
                  <div className="sg-input-wrap">
                    <span className="sg-input-icon"><Mail size={15} /></span>
                    <input type="email" className="sg-input" placeholder="jane@yourfleet.io" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                  </div>
                  {errors.email && <ErrorMsg msg={errors.email} />}
                </div>
                <div className="sg-fade-3">
                  <label className="sg-label">Password</label>
                  <div className="sg-input-wrap">
                    <span className="sg-input-icon"><Lock size={15} /></span>
                    <input type={showPw ? 'text' : 'password'} className="sg-input" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} autoComplete="new-password" />
                    <button type="button" className="sg-input-action" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                  {errors.password && <ErrorMsg msg={errors.password} />}
                </div>
                <div className="sg-fade-4">
                  <label className="sg-label">Confirm Password</label>
                  <div className="sg-input-wrap" style={{ borderColor: errors.confirmPw ? '#EF4444' : undefined }}>
                    <span className="sg-input-icon"><Lock size={15} /></span>
                    <input type={showConfirmPw ? 'text' : 'password'} className="sg-input" placeholder="Repeat password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={{ paddingRight: 44 }} autoComplete="new-password" />
                    <button type="button" className="sg-input-action" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                      {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPw && <ErrorMsg msg={errors.confirmPw} />}
                </div>
                <div className="sg-fade-5" style={{ marginTop: 8 }}>
                  <button className="sg-btn-primary" onClick={handleNext} type="button">Continue to Role →</button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Role & Fleet ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="sg-fade-1">
                  <label className="sg-label">Your Role</label>
                  <div className="sg-select-wrap">
                    <select className="sg-select" value={role} onChange={e => setRole(e.target.value)}>
                      <option>Fleet Manager</option>
                      <option>Dispatcher</option>
                      <option>Safety Officer</option>
                      <option>Financial Analyst</option>
                    </select>
                    <span className="sg-select-icon"><ChevronDown size={15} /></span>
                  </div>
                  <div style={{ marginTop: 8, background: '#0D1017', border: '1px solid #1E2330', borderRadius: 6, padding: '10px 12px', borderLeft: '3px solid #3B82F6' }}>
                    <p style={{ fontFamily: '"Sora", sans-serif', fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  </div>
                </div>
                <div className="sg-fade-2">
                  <label className="sg-label">Fleet / Organization Name</label>
                  <div className="sg-input-wrap">
                    <span className="sg-input-icon"><Building2 size={15} /></span>
                    <input className="sg-input" placeholder="e.g. Apex Logistics Ltd" value={fleet} onChange={e => setFleet(e.target.value)} />
                  </div>
                  {errors.fleet && <ErrorMsg msg={errors.fleet} />}
                </div>
                <div className="sg-fade-3">
                  <label className="sg-label">Region</label>
                  <div className="sg-select-wrap">
                    <select className="sg-select" value={region} onChange={e => setRegion(e.target.value)}>
                      <option value="">— Select your region —</option>
                      {['North', 'South', 'East', 'West', 'Central'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <span className="sg-select-icon"><ChevronDown size={15} /></span>
                  </div>
                  {errors.region && <ErrorMsg msg={errors.region} />}
                </div>
                <div className="sg-fade-4" style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button className="sg-btn-outline" onClick={handleBack} type="button" style={{ flex: '0 0 110px' }}>← Back</button>
                  <button className="sg-btn-primary" onClick={handleNext} type="button" style={{ flex: 1 }}>Continue →</button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Access Code ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="sg-fade-1">
                  <p style={{ fontFamily: '"Sora", sans-serif', fontSize: 13, color: '#64748B', lineHeight: 1.7, margin: '0 0 16px' }}>
                    Enter the <strong style={{ color: '#94A3B8' }}>6-digit access code</strong> provided by your Fleet Administrator.
                  </p>
                  <div style={{ background: '#0D1017', border: '1px solid #1E2330', borderRadius: 10, padding: '24px 16px', textAlign: 'center' }}>
                    <label style={{ fontFamily: '"DM Mono", monospace', fontSize: 10, color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
                      Access Code
                    </label>
                    <OTPInput value={otp} onChange={setOtp} />
                    {errors.otp && <div style={{ marginTop: 10 }}><ErrorMsg msg={errors.otp} /></div>}
                  </div>
                  <div style={{ background: '#0D1017', border: '1px solid #1E2330', borderRadius: 8, padding: '12px 14px', marginTop: 14 }}>
                    <p style={{ fontFamily: '"DM Mono", monospace', fontSize: 10, color: '#334155', marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Summary</p>
                    {[{ label: 'Name', val: name }, { label: 'Email', val: email }, { label: 'Role', val: role }, { label: 'Fleet', val: fleet }].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Mono", monospace', fontSize: 11, marginBottom: 3 }}>
                        <span style={{ color: '#334155' }}>{item.label}</span>
                        <span style={{ color: '#64748B' }}>{item.val || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sg-fade-2" style={{ display: 'flex', gap: 10 }}>
                  <button className="sg-btn-outline" onClick={handleBack} type="button" style={{ flex: '0 0 110px' }}>← Back</button>
                  <button className="sg-btn-primary" onClick={handleSubmit} type="button" style={{ flex: 1 }} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'spinSignup 1s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" /><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>Creating...</>
                    ) : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 24, fontFamily: '"Sora", sans-serif', fontSize: 13, color: '#64748B' }}>
            Already have an account?{' '}
            <span className="sg-link" style={{ fontWeight: 600 }} onClick={() => navigate('/login')}>Sign in →</span>
          </div>
        </div>
      </div>

      <CursorFollower />
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
      <AlertCircle size={12} style={{ color: '#EF4444', flexShrink: 0 }} />
      <span style={{ fontFamily: '"Sora", sans-serif', fontSize: 12, color: '#EF4444' }}>{msg}</span>
    </div>
  );
}
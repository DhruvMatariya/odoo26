import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Truck, ArrowRight, LogIn } from 'lucide-react';
import { TextRevealCard, TextRevealCardTitle } from '../components/ui/TextRevealCard';
import CountUp from '../components/ui/CountUp';
import { AuthBackground } from '../components/auth/AuthBackground';
import { CursorFollower } from '../components/auth/CursorFollower';

const STATS = [
  { to: 99.9, suffix: '%',   label: 'Uptime',   sub: 'Always on',          delay: 0   },
  { to: 12500, suffix: '+',  label: 'Dispatch',  sub: 'Routes managed',     delay: 0.2 },
  { to: 360,  suffix: '°',   label: 'Fullsight', sub: 'Fleet visibility',   delay: 0.4 },
];

const LANDING_CSS = `
  @keyframes landFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes landBadgePulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
    50%      { box-shadow: 0 0 0 6px rgba(59,130,246,0); }
  }
  @keyframes hintBlink {
    0%,100% { opacity: 0.35; }
    50%      { opacity: 0.65; }
  }
  .ld-a1 { animation: landFadeUp 0.6s ease both; animation-delay: 0ms; }
  .ld-a2 { animation: landFadeUp 0.6s ease both; animation-delay: 120ms; }
  .ld-a3 { animation: landFadeUp 0.6s ease both; animation-delay: 260ms; }
  .ld-a4 { animation: landFadeUp 0.6s ease both; animation-delay: 400ms; }
  .ld-a5 { animation: landFadeUp 0.6s ease both; animation-delay: 520ms; }
  .ld-a6 { animation: landFadeUp 0.6s ease both; animation-delay: 640ms; }

  .ld-btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 32px;
    height: 52px;
    background: #3B82F6;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 200ms, box-shadow 200ms, transform 100ms;
    letter-spacing: 0.01em;
  }
  .ld-btn-primary:hover {
    background: #2563EB;
    box-shadow: 0 6px 28px rgba(59,130,246,0.45);
    transform: translateY(-1px);
  }
  .ld-btn-primary:active { transform: scale(0.97); }

  .ld-btn-ghost {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 32px;
    height: 52px;
    background: transparent;
    border: 1px solid #1E2330;
    border-radius: 10px;
    color: #64748B;
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 200ms, color 200ms, background 200ms, transform 100ms;
    letter-spacing: 0.01em;
  }
  .ld-btn-ghost:hover {
    border-color: #334155;
    color: #94A3B8;
    background: rgba(255,255,255,0.02);
    transform: translateY(-1px);
  }
  .ld-btn-ghost:active { transform: scale(0.97); }

  .ld-stat-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 24px 16px;
    background: rgba(13,16,23,0.6);
    border: 1px solid #1A2030;
    border-radius: 12px;
    backdrop-filter: blur(8px);
    transition: border-color 300ms, background 300ms;
  }
  .ld-stat-card:hover {
    border-color: rgba(59,130,246,0.25);
    background: rgba(30,42,62,0.3);
  }

  .ld-hint {
    animation: hintBlink 2.2s ease-in-out infinite;
  }

  .ld-divider {
    width: 1px;
    height: 48px;
    background: linear-gradient(to bottom, transparent, #1E2330, transparent);
  }

  @media (max-width: 640px) {
    .ld-stats-row { flex-direction: column !important; gap: 10px !important; }
    .ld-divider { display: none; }
    .ld-btns { flex-direction: column !important; width: 100% !important; }
    .ld-btns button { width: 100% !important; }
  }
`;

export function LandingPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // tiny delay so stagger animations are visible
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      background: '#0A0C10',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{LANDING_CSS}</style>

      {/* Full-page network background */}
      <AuthBackground />

      {/* Top bar with logo */}
      <div className="ld-a1" style={{
        position: 'relative',
        zIndex: 2,
        padding: '28px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.18)',
          borderRadius: 10,
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(59,130,246,0.25)',
        }}>
          <Truck size={20} style={{ color: '#3B82F6' }} />
        </div>
        <span style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: '#F1F5F9',
          letterSpacing: '-0.01em',
        }}>
          FleetFlow
        </span>
      </div>

      {/* Center content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px 48px',
        gap: 0,
      }}>

        {/* Badge */}
        <div className="ld-a2" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 100,
          padding: '6px 16px',
          marginBottom: 32,
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#3B82F6',
            boxShadow: '0 0 8px rgba(59,130,246,0.8)',
            display: 'inline-block',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 11,
            color: '#64748B',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>
            Fleet Intelligence Platform
          </span>
        </div>

        {/* Main text reveal title */}
        <div className="ld-a3" style={{ textAlign: 'center', marginBottom: 12 }}>
          <TextRevealCard text="FLEET FLOW" revealText="FLEET FLOW">
            {/* <TextRevealCardTitle>
              Hover to reveal
            </TextRevealCardTitle> */}
          </TextRevealCard>
        </div>

        {/* Hint */}
        <div className="ld-a3 ld-hint" style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 11,
          color: '#334155',
          letterSpacing: '0.1em',
          marginBottom: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span>←</span>
          {/* <span>move cursor across the title</span> */}
          <span>→</span>
        </div>

        {/* Stats row */}
        <div className="ld-a4 ld-stats-row" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 48,
          maxWidth: 540,
          width: '100%',
        }}>
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <div className="ld-stat-card">
                <div style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'clamp(28px, 4vw, 38px)',
                  fontWeight: 700,
                  color: '#F1F5F9',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 2,
                }}>
                  <CountUp
                    from={0}
                    to={stat.to}
                    duration={1.8}
                    delay={stat.delay}
                    separator={stat.to >= 1000 ? ',' : ''}
                  />
                  <span style={{ color: '#3B82F6', fontSize: '0.65em', fontWeight: 400 }}>
                    {stat.suffix}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#3B82F6',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginTop: 6,
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 11,
                  color: '#334155',
                  marginTop: 2,
                }}>
                  {stat.sub}
                </div>
              </div>

              {i < STATS.length - 1 && (
                <div className="ld-divider" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="ld-a5 ld-btns" style={{
          display: 'flex',
          gap: 14,
        }}>
          <button className="ld-btn-ghost" onClick={() => navigate('/login')}>
            <LogIn size={16} />
            Sign In
          </button>
          <button className="ld-btn-primary" onClick={() => navigate('/signup')}>
            Get Started
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Bottom micro-text */}
        <div className="ld-a6" style={{
          marginTop: 28,
          fontFamily: "'Poppins', sans-serif",
          fontSize: 10,
          color: '#1E2330',
          letterSpacing: '0.1em',
          textAlign: 'center',
        }}>
          Trusted by fleet operators worldwide · Real-time · Secure
        </div>
      </div>

      {/* Cursor follower */}
      <CursorFollower />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Truck, Activity, Zap, Layers } from 'lucide-react';

const NODES = [
  { x: 55,  y: 70  },
  { x: 195, y: 45  },
  { x: 330, y: 90  },
  { x: 455, y: 50  },
  { x: 80,  y: 190 },
  { x: 240, y: 215 },
  { x: 400, y: 180 },
  { x: 20,  y: 345 },
  { x: 155, y: 370 },
  { x: 310, y: 325 },
  { x: 470, y: 365 },
  { x: 75,  y: 510 },
  { x: 220, y: 545 },
  { x: 380, y: 490 },
  { x: 30,  y: 655 },
  { x: 165, y: 695 },
  { x: 310, y: 650 },
  { x: 450, y: 680 },
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3],
  [0, 4], [1, 4], [1, 5],
  [2, 5], [2, 6], [3, 6],
  [4, 7], [4, 8], [5, 8],
  [5, 9], [6, 9], [6, 10],
  [7, 8], [8, 11], [8, 12],
  [9, 12], [9, 13], [10, 13],
  [11, 14], [11, 15], [12, 15],
  [12, 16], [13, 16], [13, 17],
  [14, 15], [15, 16], [16, 17],
];

const STATS = [
  { icon: Activity, value: '99.8%', label: 'Uptime' },
  { icon: Zap,      value: '<2s',   label: 'Dispatch' },
  { icon: Layers,   value: '8',     label: 'Full Suite', sub: 'Modules' },
];

interface Props {
  mobileHeader?: boolean;
}

export function AnimatedLeftPanel({ mobileHeader = false }: Props) {
  const [typedCenter, setTypedCenter] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const WORD = 'CENTER';
    let idx = 0;
    // Delay start slightly so page is rendered first
    const startDelay = setTimeout(() => {
      const typeTimer = setInterval(() => {
        idx++;
        setTypedCenter(WORD.slice(0, idx));
        if (idx >= WORD.length) clearInterval(typeTimer);
      }, 130);
    }, 600);

    const blinkTimer = setInterval(() => {
      setCursorVisible(v => !v);
    }, 520);

    return () => {
      clearTimeout(startDelay);
      clearInterval(blinkTimer);
    };
  }, []);

  if (mobileHeader) {
    return (
      <div style={{
        background: '#0A0C10',
        borderBottom: '1px solid #1E2330',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 24px',
        height: 72,
        flexShrink: 0,
      }}>
        <style>{`
          .ff-logo-glow {
            background: rgba(59,130,246,0.15);
            border: 1px solid rgba(59,130,246,0.25);
            border-radius: 10px;
            padding: 8px;
            box-shadow: 0 0 20px rgba(59,130,246,0.3);
          }
        `}</style>
        <div className="ff-logo-glow">
          <Truck size={18} style={{ color: '#3B82F6', display: 'block' }} />
        </div>
        <div style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, color: '#F1F5F9', fontSize: 18, letterSpacing: '0.02em' }}>
          FleetFlow
        </div>
        <div style={{
          marginLeft: 'auto',
          fontFamily: '"Sora", sans-serif',
          fontSize: 10,
          letterSpacing: '0.25em',
          color: '#3B82F6',
          textTransform: 'uppercase',
        }}>
          Command Center
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: '0 0 50%',
      background: '#0A0C10',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh',
    }}>
      <style>{`
        @keyframes nodePulse {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(2.2); }
        }
        @keyframes lineFlash {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.2; }
        }
        @keyframes dotStatic {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        .ff-node-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: nodePulse 4s ease-in-out infinite;
        }
        .ff-dot-base {
          transform-box: fill-box;
          transform-origin: center;
          animation: dotStatic 4s ease-in-out infinite;
        }
        .ff-line {
          animation: lineFlash 6s ease-in-out infinite;
        }
        .ff-logo-glow {
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 0 24px rgba(59,130,246,0.35);
        }
      `}</style>

      {/* Animated SVG Network */}
      <svg
        viewBox="0 0 500 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        {/* Connection lines */}
        {CONNECTIONS.map(([a, b], i) => (
          <line
            key={`line-${i}`}
            x1={NODES[a].x} y1={NODES[a].y}
            x2={NODES[b].x} y2={NODES[b].y}
            stroke="#1E2330"
            strokeWidth="0.75"
            className="ff-line"
            style={{ animationDelay: `${(i * 0.22) % 6}s` }}
          />
        ))}

        {/* Node glow rings */}
        {NODES.map((node, i) => (
          <circle
            key={`glow-${i}`}
            cx={node.x}
            cy={node.y}
            r={5}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="1"
            className="ff-node-pulse"
            style={{ animationDelay: `${(i * 0.28) % 4}s` }}
          />
        ))}

        {/* Node base dots */}
        {NODES.map((node, i) => (
          <circle
            key={`dot-${i}`}
            cx={node.x}
            cy={node.y}
            r={2.5}
            fill="#3B82F6"
            className="ff-dot-base"
            style={{ animationDelay: `${(i * 0.28) % 4}s` }}
          />
        ))}

        {/* Subtle grid dots in background */}
        {Array.from({ length: 12 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => (
            <circle
              key={`grid-${row}-${col}`}
              cx={col * 65 + 20}
              cy={row * 80 + 20}
              r={0.8}
              fill="#1E2330"
            />
          ))
        )}
      </svg>

      {/* Logo */}
      <div style={{ padding: '36px 40px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="ff-logo-glow">
            <Truck size={22} style={{ color: '#3B82F6', display: 'block' }} />
          </div>
          <span style={{
            fontFamily: '"DM Mono", monospace',
            fontWeight: 500,
            color: '#F1F5F9',
            fontSize: 20,
            letterSpacing: '0.01em',
          }}>
            FleetFlow
          </span>
        </div>
      </div>

      {/* Tagline — vertically centered */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 48px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div>
          <p style={{
            fontFamily: '"Sora", sans-serif',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.32em',
            color: '#3B82F6',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Fleet Intelligence
          </p>
          <h1 style={{
            fontFamily: '"Sora", sans-serif',
            fontSize: 44,
            fontWeight: 700,
            color: '#F1F5F9',
            lineHeight: 1.08,
            margin: 0,
          }}>
            COMMAND<br />
            <span>{typedCenter}</span>
            <span style={{
              display: 'inline-block',
              width: 3,
              height: '0.82em',
              background: cursorVisible ? '#3B82F6' : 'transparent',
              marginLeft: 3,
              verticalAlign: 'middle',
              borderRadius: 1,
              transition: 'background 80ms',
              boxShadow: cursorVisible ? '0 0 8px rgba(59,130,246,0.7)' : 'none',
            }} />
          </h1>
          <div style={{
            marginTop: 28,
            width: 40,
            height: 2,
            background: 'linear-gradient(to right, #3B82F6, transparent)',
            borderRadius: 2,
          }} />
          <p style={{
            fontFamily: '"Sora", sans-serif',
            fontSize: 13,
            color: '#334155',
            marginTop: 20,
            lineHeight: 1.7,
            maxWidth: 280,
          }}>
            Replace manual logbooks with a centralized operations platform that monitors your entire fleet in real time.
          </p>
        </div>
      </div>

      {/* Bottom Stats */}
      <div style={{
        padding: '0 40px 44px',
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid #111318',
        paddingTop: 28,
        marginTop: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          {STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <stat.icon size={15} style={{ color: '#3B82F6', margin: '0 auto 8px', display: 'block' }} />
              <div style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: 20,
                fontWeight: 500,
                color: '#F1F5F9',
                lineHeight: 1,
              }}>
                {stat.value}
              </div>
              {stat.sub && (
                <div style={{ fontSize: 10, color: '#3B82F6', marginTop: 2, fontFamily: '"DM Mono", monospace' }}>
                  {stat.sub}
                </div>
              )}
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 3, fontFamily: '"Sora", sans-serif' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right separator line */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: 1,
        height: '100%',
        background: 'linear-gradient(to bottom, transparent 0%, #3B82F6 50%, transparent 100%)',
        opacity: 0.4,
      }} />
    </div>
  );
}
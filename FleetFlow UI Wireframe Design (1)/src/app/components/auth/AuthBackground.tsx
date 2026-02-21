import React from 'react';

const NODES = [
  { x: 75,  y: 55  },
  { x: 290, y: 35  },
  { x: 510, y: 75  },
  { x: 155, y: 190 },
  { x: 370, y: 165 },
  { x: 560, y: 200 },
  { x: 50,  y: 340 },
  { x: 240, y: 370 },
  { x: 470, y: 330 },
  { x: 600, y: 280 },
  { x: 130, y: 520 },
  { x: 340, y: 495 },
  { x: 555, y: 530 },
  { x: 210, y: 680 },
  { x: 445, y: 700 },
  { x: 60,  y: 810 },
  { x: 580, y: 790 },
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2],
  [0, 3], [1, 3], [1, 4], [2, 4], [2, 5],
  [3, 6], [3, 7], [4, 7], [4, 8], [5, 8], [5, 9],
  [6, 7], [7, 10], [7, 11], [8, 11], [8, 12], [9, 12],
  [10, 11], [11, 13], [12, 14], [11, 14],
  [13, 15], [14, 16],
];

export function AuthBackground() {
  return (
    <>
      <style>{`
        @keyframes abNodePulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(2); }
        }
        @keyframes abDotBase {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.55; }
        }
        @keyframes abLineFlash {
          0%, 100% { opacity: 0.04; }
          50%       { opacity: 0.14; }
        }
        .ab-node-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: abNodePulse 5s ease-in-out infinite;
        }
        .ab-dot-base {
          transform-box: fill-box;
          transform-origin: center;
          animation: abDotBase 5s ease-in-out infinite;
        }
        .ab-line {
          animation: abLineFlash 7s ease-in-out infinite;
        }
      `}</style>
      <svg
        viewBox="0 0 650 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {/* Subtle grid dots */}
        {Array.from({ length: 12 }, (_, row) =>
          Array.from({ length: 9 }, (_, col) => (
            <circle
              key={`g-${row}-${col}`}
              cx={col * 75 + 30}
              cy={row * 80 + 30}
              r={0.7}
              fill="#1E2330"
              opacity={0.5}
            />
          ))
        )}

        {/* Connection lines */}
        {CONNECTIONS.map(([a, b], i) => (
          <line
            key={`l-${i}`}
            x1={NODES[a].x} y1={NODES[a].y}
            x2={NODES[b].x} y2={NODES[b].y}
            stroke="#1E2330"
            strokeWidth="0.7"
            className="ab-line"
            style={{ animationDelay: `${(i * 0.31) % 7}s` }}
          />
        ))}

        {/* Node glow rings */}
        {NODES.map((n, i) => (
          <circle
            key={`r-${i}`}
            cx={n.x} cy={n.y}
            r={5}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.8"
            className="ab-node-pulse"
            style={{ animationDelay: `${(i * 0.35) % 5}s` }}
          />
        ))}

        {/* Node dots */}
        {NODES.map((n, i) => (
          <circle
            key={`d-${i}`}
            cx={n.x} cy={n.y}
            r={2}
            fill="#3B82F6"
            className="ab-dot-base"
            style={{ animationDelay: `${(i * 0.35) % 5}s` }}
          />
        ))}
      </svg>
    </>
  );
}

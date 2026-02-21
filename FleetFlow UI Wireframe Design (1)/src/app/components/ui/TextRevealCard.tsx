import React, { useState, useRef, useCallback } from 'react';

interface TextRevealCardProps {
  text: string;
  revealText: string;
  children?: React.ReactNode;
  fontSize?: string | number;
}

export function TextRevealCard({
  text,
  revealText,
  children,
  fontSize = 'clamp(58px, 8.5vw, 116px)',
}: TextRevealCardProps) {
  const [widthPct, setWidthPct] = useState(0);
  const [isOver, setIsOver] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setWidthPct(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onMouseEnter = useCallback(() => setIsOver(true), []);
  const onMouseLeave = useCallback(() => {
    setIsOver(false);
    setWidthPct(0);
  }, []);

  const textStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontSize,
    fontWeight: 800,
    letterSpacing: '-0.035em',
    lineHeight: 0.88,
    whiteSpace: 'nowrap',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ position: 'relative', cursor: 'default', userSelect: 'none' }}
    >
      {children && <div>{children}</div>}

      <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
        {/* Base: dim text always visible */}
        <div style={{ ...textStyle, color: '#182030' }}>
          {text}
        </div>

        {/* Reveal layer: bright text, clipped to mouse X position */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            width: `${widthPct}%`,
            transition: isOver ? 'none' : 'width 600ms cubic-bezier(0.25,0.46,0.45,0.94)',
            WebkitMaskImage: `linear-gradient(to right, #000 ${Math.max(0, widthPct - 12)}%, transparent ${widthPct}%)`,
            maskImage: `linear-gradient(to right, #000 ${Math.max(0, widthPct - 12)}%, transparent ${widthPct}%)`,
          }}
        >
          <div style={{ ...textStyle, color: '#F1F5F9', whiteSpace: 'nowrap' }}>
            {revealText}
          </div>
        </div>

        {/* Cursor glow sweep line */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            bottom: '-10%',
            left: `${widthPct}%`,
            width: 2,
            background: 'linear-gradient(to bottom, transparent 0%, #3B82F6 30%, #60A5FA 50%, #3B82F6 70%, transparent 100%)',
            filter: 'blur(1px)',
            boxShadow: '0 0 18px 4px rgba(59,130,246,0.7), 0 0 40px 8px rgba(59,130,246,0.25)',
            opacity: isOver ? 1 : 0,
            transition: 'opacity 200ms ease',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

export function TextRevealCardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Poppins', sans-serif",
      fontSize: 11,
      fontWeight: 500,
      color: '#3B82F6',
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

export function TextRevealCardDescription({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Poppins', sans-serif",
      fontSize: 14,
      color: '#334155',
      lineHeight: 1.65,
      marginTop: 16,
    }}>
      {children}
    </div>
  );
}
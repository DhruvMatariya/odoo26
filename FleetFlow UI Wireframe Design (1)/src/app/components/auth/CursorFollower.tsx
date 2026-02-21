import React, { useEffect, useRef } from 'react';

export function CursorFollower() {
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const target = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    const onLeave = () => {
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    const lerp = 0.095;

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * lerp;
      pos.current.y += (target.current.y - pos.current.y) * lerp;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.x - 16}px, ${pos.current.y - 16}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes ringBreath {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
          50%       { box-shadow: 0 0 8px 2px rgba(59,130,246,0.15); }
        }
        .ff-cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          border: 1.5px solid rgba(59, 130, 246, 0.45);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          opacity: 0;
          transition: opacity 300ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
          animation: ringBreath 3s ease-in-out infinite;
        }
        .ff-cursor-dot {
          width: 4px;
          height: 4px;
          background: #3B82F6;
          border-radius: 50%;
          box-shadow: 0 0 5px rgba(59,130,246,0.9), 0 0 10px rgba(59,130,246,0.4);
          flex-shrink: 0;
        }
      `}</style>
      <div ref={ringRef} className="ff-cursor-ring">
        <div className="ff-cursor-dot" />
      </div>
    </>
  );
}

import React, { useEffect, useRef, useState } from 'react';

// Buttons that get the border-morph effect.
// Nav links, user-btn, logout-btn, header-icon-btn are intentionally excluded.
const INTERACTIVE =
  '.ff-btn-primary, .ff-btn-ghost, ' +
  '.sg-btn-primary, .sg-btn-outline, ' +
  '.ld-btn-primary, .ld-btn-ghost, ' +
  '.acct-save-btn, .acct-close-btn, ' +
  '[data-cursor="button"]';

export function CursorFollower() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);

  const pos           = useRef({ x: -400, y: -400 }); // smooth (lerped)
  const target        = useRef({ x: -400, y: -400 }); // raw mouse
  const hoverRectRef  = useRef<DOMRect | null>(null);
  const firstMoveRef  = useRef(true);                  // snap on first event
  const rafRef        = useRef<number>(0);

  // Drives React re-render so CSS transitions animate size/shape
  const [btnRect, setBtnRect] = useState<DOMRect | null>(null);
  const [isOverBtn, setIsOverBtn] = useState(false);

  useEffect(() => {
    // ── Hide native cursor globally while this component is mounted ──
    const styleEl = document.createElement('style');
    styleEl.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(styleEl);

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // On the FIRST move, snap pos to cursor so ring appears immediately
      if (firstMoveRef.current) {
        pos.current = { x, y };
        firstMoveRef.current = false;
      }
      target.current = { x, y };

      // Show ring
      if (ringRef.current) ringRef.current.style.opacity = '1';

      // ── Dot: always at exact cursor position (no lerp) ──
      if (dotRef.current) {
        dotRef.current.style.opacity = '1';
        dotRef.current.style.transform = `translate(${x - 2}px, ${y - 2}px)`;
      }

      // Detect interactive element
      const el = (e.target as Element)?.closest?.(INTERACTIVE) ?? null;
      if (el) {
        const r = el.getBoundingClientRect();
        hoverRectRef.current = r;
        setIsOverBtn(true);
        setBtnRect(r);
      } else {
        hoverRectRef.current = null;
        setIsOverBtn(false);
        setBtnRect(null);
      }
    };

    const onLeave = () => {
      if (ringRef.current) ringRef.current.style.opacity = '0';
      if (dotRef.current)  dotRef.current.style.opacity  = '0';
      hoverRectRef.current = null;
      setIsOverBtn(false);
      setBtnRect(null);
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    // ── RAF loop – runs ONCE, reads live data from refs ──────────────
    const animate = () => {
      const rect = hoverRectRef.current;

      // Lerp toward button centre (faster) or cursor (smooth)
      const tX   = rect ? rect.left + rect.width  / 2 : target.current.x;
      const tY   = rect ? rect.top  + rect.height / 2 : target.current.y;
      const lerp = rect ? 0.18 : 0.11;

      pos.current.x += (tX - pos.current.x) * lerp;
      pos.current.y += (tY - pos.current.y) * lerp;

      if (ringRef.current) {
        const w = rect ? rect.width  + 10 : 32;
        const h = rect ? rect.height + 10 : 32;
        ringRef.current.style.transform =
          `translate(${pos.current.x - w / 2}px, ${pos.current.y - h / 2}px)`;
      }

      // Hide dot when ring is wrapping a button
      if (dotRef.current) {
        dotRef.current.style.visibility = rect ? 'hidden' : 'visible';
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
      document.head.removeChild(styleEl);
    };
  }, []); // run once — all live state is in refs

  // ── Inline styles drive CSS size/shape transitions ────────────────
  const ringStyle: React.CSSProperties = btnRect
    ? {
        width:        btnRect.width  + 10,
        height:       btnRect.height + 10,
        borderRadius: inferRadius(btnRect.height),
        border:       '1.5px solid rgba(59,130,246,0.9)',
        boxShadow:    '0 0 16px rgba(59,130,246,0.25), 0 0 32px rgba(59,130,246,0.08)',
        background:   'rgba(59,130,246,0.04)',
      }
    : {
        width:        32,
        height:       32,
        borderRadius: '50%',
        border:       '1.5px solid rgba(59,130,246,0.45)',
        boxShadow:    'none',
        background:   'transparent',
      };

  return (
    <>
      <style>{`
        /* ── Ring ──────────────────────────────────────────────────── */
        .ff-cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 99998;
          opacity: 0;
          will-change: transform;
          /* Only shape transitions — position is always via JS transform */
          transition:
            width         240ms cubic-bezier(0.34, 1.56, 0.64, 1),
            height        240ms cubic-bezier(0.34, 1.56, 0.64, 1),
            border-radius 230ms cubic-bezier(0.34, 1.56, 0.64, 1),
            border-color  180ms ease,
            box-shadow    180ms ease,
            background    180ms ease,
            opacity       280ms ease;
        }

        /* ── Dot: exact cursor position, always on top ─────────────── */
        .ff-cursor-dot-exact {
          position: fixed;
          top: 0;
          left: 0;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #3B82F6;
          pointer-events: none;
          z-index: 99999;
          opacity: 0;
          will-change: transform;
          box-shadow:
            0 0 6px  rgba(59,130,246,0.95),
            0 0 14px rgba(59,130,246,0.45);
          transition: opacity 200ms ease, visibility 0ms;
        }
      `}</style>

      {/* Dot — pinned exactly to cursor, z-index above ring */}
      <div ref={dotRef} className="ff-cursor-dot-exact" />

      {/* Ring — smooth lerp, morphs to button border on hover */}
      <div ref={ringRef} className="ff-cursor-ring" style={ringStyle} />
    </>
  );
}

/** Match border-radius to the button's natural rounding */
function inferRadius(h: number): number {
  if (h <= 32) return 8;   // small icon buttons
  if (h <= 42) return 10;  // outline / ghost buttons
  return 12;               // primary full-width buttons
}

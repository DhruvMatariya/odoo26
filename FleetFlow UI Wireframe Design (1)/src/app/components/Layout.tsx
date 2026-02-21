import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Truck, Navigation, Wrench,
  Users, BarChart2, LogOut, Search,
  Bell, Fuel, Settings, X,
} from 'lucide-react';
import { useApp, UserRole } from '../context/AppContext';
import { CursorFollower } from './auth/CursorFollower';
import { AccountModal } from './AccountModal';

const SIDEBAR_W = 234; // desktop sidebar width in px

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Driver'] },
  { path: '/vehicles',    label: 'Vehicles',    icon: Truck,            roles: ['Admin', 'Fleet Manager'] },
  { path: '/trips',       label: 'Trips',       icon: Navigation,       roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Driver'] },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench,           roles: ['Admin', 'Fleet Manager'] },
  { path: '/expenses',    label: 'Expenses',    icon: Fuel,             roles: ['Admin', 'Fleet Manager'] },
  { path: '/drivers',     label: 'Drivers',     icon: Users,            roles: ['Admin', 'Fleet Manager'] },
  { path: '/analytics',   label: 'Analytics',   icon: BarChart2,        roles: ['Admin', 'Fleet Manager'] },
];

const ROLE_META: Record<UserRole, { color: string; bg: string }> = {
  'Admin':         { color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
  'Fleet Manager': { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  'Dispatcher':    { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'Driver':        { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
};

const LAYOUT_CSS = `
  /* ── Sidebar ─────────────────────────────────────────── */
  .ff-sidebar-inner {
    width: ${SIDEBAR_W}px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #0D1017;
    overflow: hidden;
  }

  /* ── Nav links ─────────────────────────────────────────── */
  .ff-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 10px;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #64748B;
    text-decoration: none;
    transition: background 180ms, color 180ms, border-color 180ms;
    border: 1px solid transparent;
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
  }
  .ff-nav-link:hover {
    background: rgba(30,42,62,0.5);
    color: #94A3B8;
    border-color: #1A2030;
  }
  .ff-nav-link.active {
    background: rgba(59,130,246,0.12);
    color: #3B82F6;
    border-color: rgba(59,130,246,0.2);
    font-weight: 600;
  }

  /* ── Search ─────────────────────────────────────────── */
  .ff-layout-search {
    background: #0A0C10;
    border: 1px solid #1E2330;
    border-radius: 10px;
    color: #F1F5F9;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    padding: 9px 14px 9px 38px;
    outline: none;
    transition: border-color 200ms, box-shadow 200ms;
    width: 100%;
  }
  .ff-layout-search::placeholder { color: #334155; }
  .ff-layout-search:focus {
    border-color: rgba(59,130,246,0.4);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
  }

  /* ── Shared icon button ─────────────────────────────── */
  .ff-header-icon-btn {
    width: 36px; height: 36px;
    border-radius: 9px;
    background: transparent;
    border: 1px solid #1E2330;
    display: flex; align-items: center; justify-content: center;
    color: #64748B;
    transition: background 180ms, color 180ms, border-color 180ms;
    flex-shrink: 0;
  }
  .ff-header-icon-btn:hover {
    background: rgba(30,42,62,0.6);
    color: #94A3B8;
    border-color: #334155;
  }

  /* ── Hamburger icon (3 bars → X) ────────────────────── */
  .ff-hbg {
    width: 18px; height: 14px;
    display: flex; flex-direction: column;
    justify-content: space-between;
  }
  .ff-hbg-bar {
    display: block;
    height: 1.5px;
    border-radius: 2px;
    background: currentColor;
    transform-origin: center;
    transition: transform 280ms cubic-bezier(0.4,0,0.2,1),
                opacity   220ms ease,
                width     260ms ease;
  }
  /* staggered default widths — decorative hamburger look */
  .ff-hbg-bar:nth-child(1) { width: 100%; }
  .ff-hbg-bar:nth-child(2) { width: 72%; }
  .ff-hbg-bar:nth-child(3) { width: 48%; }
  /* open state — all bars equal width, morph into X */
  .ff-hbg.open .ff-hbg-bar:nth-child(1) { width: 100%; transform: translateY(6.25px) rotate(45deg); }
  .ff-hbg.open .ff-hbg-bar:nth-child(2) { opacity: 0; width: 0; }
  .ff-hbg.open .ff-hbg-bar:nth-child(3) { width: 100%; transform: translateY(-6.25px) rotate(-45deg); }

  /* ── User / logout buttons ──────────────────────────── */
  .ff-user-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    transition: background 180ms, border-color 180ms;
    border: 1px solid transparent;
    width: 100%; background: transparent; text-align: left;
  }
  .ff-user-btn:hover { background: rgba(30,42,62,0.6); border-color: #1A2030; }

  .ff-logout-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500;
    color: #64748B; background: transparent; border: 1px solid transparent;
    width: 100%; letter-spacing: 0.01em;
    transition: background 180ms, color 180ms, border-color 180ms;
  }
  .ff-logout-btn:hover {
    background: rgba(239,68,68,0.08); color: #EF4444;
    border-color: rgba(239,68,68,0.15);
  }

  /* ── Mobile drawer animations ──────────────────────── */
  @keyframes ffDrawerIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes ffDrawerFadeIn { from { opacity: 0; } to { opacity: 1; } }

  /* ── Scrollbar ──────────────────────────────────────── */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1E2330; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #334155; }
`;

/* ─────────────────────────────────────────────────────────── */

export function Layout() {
  const { currentUser, isAuthenticated, authReady, logout } = useApp();
  const navigate = useNavigate();

  // Mobile: drawer open/closed
  const [mobileOpen, setMobileOpen]   = useState(false);
  // Desktop: sidebar collapsed (hidden) or expanded
  const [collapsed, setCollapsed]     = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Redirect to login when not authenticated (after auth state is restored from storage)
  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [authReady, isAuthenticated, navigate]);

  if (!authReady || !isAuthenticated || !currentUser) return null;

  const visibleNav = NAV_ITEMS.filter(i => i.roles.includes(currentUser.role));
  const initials   = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const roleMeta   = ROLE_META[currentUser.role];

  // Sign-out → landing page
  const handleLogout = () => { logout(); navigate('/'); };

  // Hamburger click: toggle drawer (mobile) or collapse (desktop)
  const toggleSidebar = () => {
    if (isMobile) setMobileOpen(p => !p);
    else          setCollapsed(p => !p);
  };

  // "Is open" for hamburger icon animation
  const sidebarIsOpen = isMobile ? mobileOpen : !collapsed;

  /* ── Sidebar content (reused in desktop + mobile drawer) ─ */
  const SidebarContent = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <div className="ff-sidebar-inner">

      {/* Logo + optional drawer-close */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #1A2030', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, flexShrink: 0,
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59,130,246,0.15)',
          }}>
            <Truck size={16} style={{ color: '#3B82F6' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, color: '#F1F5F9', letterSpacing: '-0.01em', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              FleetFlow
            </div>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 10, color: '#334155', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Logistics Platform
            </div>
          </div>

          {/* X button inside mobile drawer only */}
          {inDrawer && (
            <button
              onClick={() => setMobileOpen(false)}
              data-cursor="button"
              style={{ marginLeft: 'auto', width: 30, height: 30, flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid #1E2330', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 10, color: '#334155', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 14px 8px' }}>
          Navigation
        </div>
        {visibleNav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => inDrawer && setMobileOpen(false)}
            className={({ isActive }) => `ff-nav-link${isActive ? ' active' : ''}`}
          >
            <item.icon size={16} style={{ flexShrink: 0 }} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Account + logout */}
      <div style={{ padding: '10px', borderTop: '1px solid #1A2030', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <button className="ff-user-btn" onClick={() => { setAccountOpen(true); inDrawer && setMobileOpen(false); }}>
          {currentUser.profilePic ? (
            <img src={currentUser.profilePic} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #1E2330' }} alt="Profile" />
          ) : (
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A3E,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#F1F5F9', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
              {currentUser.name}
            </p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: roleMeta.color, margin: 0, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {currentUser.role}
            </p>
          </div>
          <Settings size={13} style={{ color: '#334155', flexShrink: 0 }} />
        </button>

        <button className="ff-logout-btn" onClick={handleLogout}>
          <LogOut size={14} style={{ flexShrink: 0 }} /> Sign out
        </button>
      </div>
    </div>
  );

  /* ── Mobile portal drawer ─────────────────────────────── */
  const MobileDrawer = mobileOpen ? createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9400, display: 'flex', animation: 'ffDrawerFadeIn 200ms ease both' }}>
      <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} />
      <aside style={{
        position: 'relative', zIndex: 1,
        width: SIDEBAR_W, height: '100%',
        borderRight: '1px solid #1A2030',
        animation: 'ffDrawerIn 260ms cubic-bezier(0.25,0.46,0.45,0.94) both',
        boxShadow: '8px 0 40px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>
        <SidebarContent inDrawer />
      </aside>
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0C10', overflow: 'hidden', cursor: 'none' }}>
      <style>{LAYOUT_CSS}</style>

      {/* ── Desktop sidebar — smooth collapse via width transition ── */}
      {!isMobile && (
        <aside style={{
          width: collapsed ? 0 : SIDEBAR_W,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 260ms cubic-bezier(0.25,0.46,0.45,0.94)',
          borderRight: collapsed ? 'none' : '1px solid #1A2030',
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* ── Mobile drawer via Portal ── */}
      {MobileDrawer}

      {/* ── Main content ──────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          background: '#0D1017',
          borderBottom: '1px solid #1A2030',
          padding: '0 20px',
          height: 56,
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}>

          {/* ── Hamburger — always visible, animates bars → X ── */}
          <button
            className="ff-header-icon-btn"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
            title={sidebarIsOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className={`ff-hbg${sidebarIsOpen ? ' open' : ''}`}>
              <span className="ff-hbg-bar" />
              <span className="ff-hbg-bar" />
              <span className="ff-hbg-bar" />
            </span>
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
            <input type="text" className="ff-layout-search" placeholder="Search vehicles, trips, drivers..." />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            {/* Role badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px 12px', borderRadius: 100,
              fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 600,
              color: roleMeta.color, background: roleMeta.bg,
              border: `1px solid ${roleMeta.color}22`,
              letterSpacing: '0.04em', whiteSpace: 'nowrap',
            }}>
              {currentUser.role}
            </span>

            {/* Notifications */}
            <button className="ff-header-icon-btn" style={{ position: 'relative' }}>
              <Bell size={15} />
              <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, background: '#EF4444', borderRadius: '50%', border: '1.5px solid #0D1017' }} />
            </button>

            {/* Avatar */}
            <button
              className="ff-header-icon-btn"
              onClick={() => setAccountOpen(true)}
              style={{ width: 36, height: 36, padding: 0, overflow: 'hidden', borderRadius: 9 }}
              title="Account settings"
            >
              {currentUser.profilePic ? (
                <img src={currentUser.profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1E2A3E,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 700, color: '#fff' }}>
                  {initials}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Page content — expands/contracts as sidebar opens/closes */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '22px 24px', background: '#0A0C10' }}>
          <Outlet />
        </main>
      </div>

      <AccountModal isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
      <CursorFollower />
    </div>
  );
}
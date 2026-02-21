import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Truck, Navigation, Wrench,
  Receipt, Users, BarChart2, LogOut, Search,
  Bell, ChevronDown, Menu, X, Fuel,
} from 'lucide-react';
import { useApp, UserRole } from '../context/AppContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard, roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Driver'] },
  { path: '/vehicles',  label: 'Vehicles',    icon: Truck,           roles: ['Admin', 'Fleet Manager'] },
  { path: '/trips',     label: 'Trips',       icon: Navigation,      roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Driver'] },
  { path: '/maintenance',label: 'Maintenance', icon: Wrench,          roles: ['Admin', 'Fleet Manager'] },
  { path: '/expenses',  label: 'Expenses',    icon: Fuel,            roles: ['Admin', 'Fleet Manager'] },
  { path: '/drivers',   label: 'Drivers',     icon: Users,           roles: ['Admin', 'Fleet Manager'] },
  { path: '/analytics', label: 'Analytics',   icon: BarChart2,       roles: ['Admin', 'Fleet Manager'] },
];

const ROLE_COLORS: Record<UserRole, string> = {
  'Admin':        'bg-purple-100 text-purple-700',
  'Fleet Manager':'bg-blue-100 text-blue-700',
  'Dispatcher':   'bg-amber-100 text-amber-700',
  'Driver':       'bg-green-100 text-green-700',
};

export function Layout() {
  const { currentUser, isAuthenticated, logout } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !currentUser) return null;

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Truck size={16} className="text-white" />
          </div>
          <div>
            <span className="text-white font-semibold text-base tracking-tight">FleetFlow</span>
            <div className="text-slate-400 text-xs">Logistics Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-slate-500 text-xs font-medium px-3 pb-2 uppercase tracking-wider">Navigation</div>
        {visibleNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`
            }
          >
            <item.icon size={17} className="flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-400 truncate">{currentUser.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors w-full"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-800 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-60 h-full bg-slate-800 z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4 flex-shrink-0">
          {/* Mobile menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles, trips, drivers..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Role badge */}
            <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[currentUser.role]}`}>
              {currentUser.role}
            </span>

            {/* Notifications */}
            <button className="relative text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile */}
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 pl-1">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                {initials}
              </div>
              <span className="hidden md:block font-medium">{currentUser.name}</span>
              <ChevronDown size={14} className="hidden md:block text-gray-400" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

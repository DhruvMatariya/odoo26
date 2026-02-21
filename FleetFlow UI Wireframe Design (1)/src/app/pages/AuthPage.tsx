import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Truck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useApp, UserRole } from '../context/AppContext';

type Tab = 'login' | 'register';

const ROLE_OPTIONS: UserRole[] = ['Admin', 'Fleet Manager', 'Dispatcher', 'Driver'];

const DEMO_ACCOUNTS = [
  { email: 'admin@fleetflow.com', role: 'Admin', color: 'bg-purple-100 text-purple-700' },
  { email: 'manager@fleetflow.com', role: 'Fleet Manager', color: 'bg-blue-100 text-blue-700' },
  { email: 'dispatcher@fleetflow.com', role: 'Dispatcher', color: 'bg-amber-100 text-amber-700' },
  { email: 'driver@fleetflow.com', role: 'Driver', color: 'bg-green-100 text-green-700' },
];

export function AuthPage() {
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('admin@fleetflow.com');
  const [loginPassword, setLoginPassword] = useState('password');
  const [loginRole, setLoginRole] = useState<UserRole>('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Dispatcher');
  const [showRegPassword, setShowRegPassword] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields.');
      return;
    }
    login(loginEmail, loginPassword, loginRole);
    navigate('/dashboard');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;
    login(regEmail, regPassword, regRole);
    navigate('/dashboard');
  };

  const fillDemo = (email: string, role: string) => {
    setLoginEmail(email);
    setLoginRole(role as UserRole);
    setLoginPassword('password');
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-800 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
            <Truck size={18} className="text-white" />
          </div>
          <span className="text-xl font-semibold">FleetFlow</span>
        </div>

        <div>
          <h1 className="text-4xl font-semibold leading-tight mb-4 text-white">
            Modular Fleet &<br />Logistics Management
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Replace inefficient manual logbooks with a centralized digital hub that optimizes your fleet lifecycle, monitors driver safety, and tracks financial performance.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active Vehicles', value: '220+' },
              { label: 'Trips Completed', value: '4,800+' },
              { label: 'Cost Saved', value: '32%' },
              { label: 'Uptime', value: '99.9%' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-700 rounded-xl p-4">
                <div className="text-2xl font-semibold text-white">{stat.value}</div>
                <div className="text-slate-400 text-sm mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-slate-500 text-sm">
          © 2024 FleetFlow. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Truck size={15} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">FleetFlow</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
                <p className="text-gray-500 text-sm mt-1">Sign in to your FleetFlow account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`${inputCls} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button type="button" className="text-xs text-blue-600 hover:underline">Forgot password?</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <select
                    value={loginRole}
                    onChange={e => setLoginRole(e.target.value as UserRole)}
                    className={inputCls}
                  >
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {loginError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{loginError}</p>}

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  Sign In
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Demo accounts */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Demo accounts — click to fill</p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map(acc => (
                    <button
                      key={acc.email}
                      onClick={() => fillDemo(acc.email, acc.role)}
                      className="text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${acc.color}`}>{acc.role}</span>
                      <p className="text-xs text-gray-500 mt-1 truncate">{acc.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Create account</h2>
                <p className="text-gray-500 text-sm mt-1">Register for a FleetFlow account</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="John Doe"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Create a password"
                      className={`${inputCls} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className={inputCls}
                  >
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  Create Account
                  <ArrowRight size={16} />
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{' '}
                <button onClick={() => setTab('login')} className="text-blue-600 font-medium hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

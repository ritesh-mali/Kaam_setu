import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { EmergencySosModal } from './EmergencySosModal';
import { 
  Wrench, 
  User, 
  LogOut, 
  ShieldCheck, 
  Briefcase, 
  CalendarCheck, 
  Menu, 
  X, 
  Bell,
  AlertTriangle,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isWorker, isAdmin, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.notifications.getAll(),
        api.notifications.getUnreadCount(),
      ]);
      if (listRes && listRes.data) setNotifications(listRes.data);
      if (countRes && countRes.data !== undefined) setUnreadCount(countRes.data);
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  const handleDemoSwitch = async (role) => {
    try {
      await demoLogin(role);
      if (role === 'customer') navigate('/customer/dashboard');
      else if (role === 'worker') navigate('/worker/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (e) {
      console.error('Demo login failed', e);
    }
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isWorker) return '/worker/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Demo Bar for Easy Testing */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden sm:flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span><strong>Quick Demo Roles:</strong> Click to switch identity instantly:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDemoSwitch('customer')}
            className={`px-2 py-0.5 rounded transition ${isCustomer ? 'bg-brand-500 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            👤 Customer (Rahul)
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => handleDemoSwitch('worker')}
            className={`px-2 py-0.5 rounded transition ${isWorker ? 'bg-brand-500 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            🔧 Worker (Rajesh - Plumber)
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => handleDemoSwitch('admin')}
            className={`px-2 py-0.5 rounded transition ${isAdmin ? 'bg-brand-500 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            🛡️ Admin Dashboard
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">
                Kaam<span className="text-brand-600">Setu</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">
                Local Worker Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              to="/workers"
              className={`hover:text-brand-600 transition ${location.pathname === '/workers' ? 'text-brand-600 font-semibold' : ''}`}
            >
              Find Workers
            </Link>
            <Link
              to="/#how-it-works"
              className="hover:text-brand-600 transition"
              onClick={() => {
                if (location.pathname !== '/') navigate('/');
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              How It Works
            </Link>
            <Link
              to="/#pricing"
              className="hover:text-brand-600 transition"
              onClick={() => {
                if (location.pathname !== '/') navigate('/');
                setTimeout(() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              Transparent Pricing
            </Link>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Emergency SOS Button */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Emergency SOS</span>
            </button>

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setNotificationOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-brand-600 hover:text-brand-700 font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-slate-400">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setNotificationOpen(false);
                              if (n.linkUrl) navigate(n.linkUrl);
                            }}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition ${
                              !n.read ? 'bg-brand-50/40' : ''
                            }`}
                          >
                            <p className="font-bold text-slate-800">{n.title}</p>
                            <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  <img
                    src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/20"
                  />
                  <div className="text-left text-xs">
                    <span className="font-semibold text-slate-800 block line-clamp-1">{user?.name}</span>
                    <span className="text-[10px] text-brand-600 uppercase font-bold tracking-wide">
                      {isWorker ? 'Worker' : isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition"
                    >
                      {isAdmin ? <ShieldCheck className="w-4 h-4 text-brand-600" /> : isWorker ? <Briefcase className="w-4 h-4 text-brand-600" /> : <CalendarCheck className="w-4 h-4 text-brand-600" />}
                      Dashboard & Bookings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/30 transition hover:shadow"
                >
                  Join as Worker / Customer
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setSosModalOpen(true)}
              className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold"
            >
              SOS
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-center text-xs">
            <button
              onClick={() => { handleDemoSwitch('customer'); setMobileMenuOpen(false); }}
              className="py-1 rounded font-medium hover:bg-white"
            >
              Customer
            </button>
            <button
              onClick={() => { handleDemoSwitch('worker'); setMobileMenuOpen(false); }}
              className="py-1 rounded font-medium hover:bg-white"
            >
              Worker
            </button>
            <button
              onClick={() => { handleDemoSwitch('admin'); setMobileMenuOpen(false); }}
              className="py-1 rounded font-medium hover:bg-white"
            >
              Admin
            </button>
          </div>

          <Link
            to="/workers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Workers
          </Link>
          <Link
            to="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            How It Works
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-brand-600 bg-brand-50"
              >
                Go to Dashboard ({user?.name})
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Emergency SOS Modal */}
      {sosModalOpen && (
        <EmergencySosModal
          isOpen={sosModalOpen}
          onClose={() => setSosModalOpen(false)}
        />
      )}
    </header>
  );
};

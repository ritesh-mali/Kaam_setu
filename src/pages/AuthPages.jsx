import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Wrench, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Briefcase,
  Sparkles
} from 'lucide-react';

export const AuthPages = ({ defaultMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [roleType, setRoleType] = useState('ROLE_CUSTOMER'); // 'ROLE_CUSTOMER' or 'ROLE_WORKER'
  const [categories, setCategories] = useState([]);

  const { login, register, demoLogin, isAuthenticated, user, isWorker, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('South Delhi');
  const [address, setAddress] = useState('');

  // Worker specific form states
  const [categoryId, setCategoryId] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [visitingCharge, setVisitingCharge] = useState(199);
  const [hourlyRate, setHourlyRate] = useState(249);
  const [serviceArea, setServiceArea] = useState('');

  useEffect(() => {
    setIsLogin(defaultMode === 'login');
  }, [defaultMode]);

  useEffect(() => {
    api.categories.getAll().then((res) => {
      if (res && res.data && res.data.length > 0) {
        setCategories(res.data);
        setCategoryId(res.data[0].id);
      }
    }).catch(console.error);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) navigate('/admin/dashboard');
      else if (isWorker) navigate('/worker/dashboard');
      else navigate('/customer/dashboard');
    }
  }, [isAuthenticated, isAdmin, isWorker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const u = await login(email, password);
        redirectAfterAuth(u);
      } else {
        const payload = {
          name,
          email,
          password,
          phone,
          role: roleType,
          city,
          address,
        };

        if (roleType === 'ROLE_WORKER') {
          payload.categoryId = Number(categoryId);
          payload.skills = skills;
          payload.experienceYears = Number(experienceYears);
          payload.visitingCharge = Number(visitingCharge);
          payload.hourlyRate = Number(hourlyRate);
          payload.serviceArea = serviceArea || city;
        }

        const u = await register(payload);
        redirectAfterAuth(u);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const redirectAfterAuth = (u) => {
    if (u?.role === 'ROLE_ADMIN') navigate('/admin/dashboard');
    else if (u?.role === 'ROLE_WORKER') navigate('/worker/dashboard');
    else navigate('/customer/dashboard');
  };

  const handleDemoClick = async (role) => {
    setLoading(true);
    setError('');
    try {
      const u = await demoLogin(role);
      redirectAfterAuth(u);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isLogin ? 'Sign in to KaamSetu' : 'Create your KaamSetu account'}
          </h2>
          <p className="text-xs text-slate-500">
            {isLogin ? 'Access your dashboard, track jobs and invoices' : 'Join our trusted local worker and homeowner network'}
          </p>
        </div>

        {/* Demo Fast Login Cards */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            ⚡ Quick 1-Click Demo Evaluation Sign-in
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoClick('customer')}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 transition text-center"
            >
              👤 Customer
              <span className="block text-[10px] font-normal text-blue-600">Rahul S.</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('worker')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition text-center"
            >
              🔧 Worker
              <span className="block text-[10px] font-normal text-amber-600">Rajesh (Plumber)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold border border-purple-200 transition text-center"
            >
              🛡️ Admin
              <span className="block text-[10px] font-normal text-purple-600">Full Access</span>
            </button>
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode switch */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 rounded-lg transition ${
                isLogin ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 rounded-lg transition ${
                !isLogin ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* Registration Role Picker */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRoleType('ROLE_CUSTOMER')}
                className={`p-3 rounded-2xl border text-center transition ${
                  roleType === 'ROLE_CUSTOMER'
                    ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold ring-1 ring-brand-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                <span>I am a Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleType('ROLE_WORKER')}
                className={`p-3 rounded-2xl border text-center transition ${
                  roleType === 'ROLE_WORKER'
                    ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold ring-1 ring-brand-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                <span>I am a Service Pro</span>
              </button>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {!isLogin && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  placeholder="e.g. Ramesh Chandra"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                    placeholder="House/Plot, Locality"
                  />
                </div>

                {/* Worker Specific Extra Fields */}
                {roleType === 'ROLE_WORKER' && (
                  <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-100 space-y-3">
                    <p className="font-bold text-brand-900 text-xs">Worker Profile & Rate Setup</p>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Primary Trade / Category *</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Visiting Charge (₹)</label>
                        <input
                          type="number"
                          value={visitingCharge}
                          onChange={(e) => setVisitingCharge(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Hourly Rate (₹/hr)</label>
                        <input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Skills (Comma separated)</label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        placeholder="e.g. Pipe Leakage, Taps, Bath Fittings"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-md shadow-brand-500/30 transition disabled:opacity-50"
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In to Account' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


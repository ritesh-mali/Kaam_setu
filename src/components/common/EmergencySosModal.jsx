import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertTriangle, 
  Flame, 
  Zap, 
  Droplet, 
  Tv, 
  MapPin, 
  Phone, 
  X, 
  ShieldCheck, 
  Clock, 
  Bike,
  ArrowRight
} from 'lucide-react';

export const EmergencySosModal = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const emergencyPresets = [
    {
      id: 'pipe-burst',
      categorySlug: 'plumber',
      title: 'Emergency Pipe Burst / High Water Leakage',
      desc: 'Continuous water flood under sink, overhead tank valve, or main pipeline.',
      icon: <Droplet className="w-5 h-5 text-blue-500" />,
      tag: 'Urgent Plumber',
    },
    {
      id: 'electric-spark',
      categorySlug: 'electrician',
      title: 'Electrical Sparking / Burning Smell / MCB Trip',
      desc: 'Immediate hazard of electrical short circuit, sparking switches, or full house trip.',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      tag: 'Urgent Electrician',
    },
    {
      id: 'ac-overflow',
      categorySlug: 'appliance-repair',
      title: 'AC Gas Leakage / Indoor Unit Flooding',
      desc: 'Heavy water dropping on electrical wiring or compressor rattling failure.',
      icon: <Tv className="w-5 h-5 text-purple-500" />,
      tag: 'Urgent Appliance Pro',
    },
    {
      id: 'door-lock-jam',
      categorySlug: 'carpenter',
      title: 'Main Door Lock Jammed / Stuck Outside',
      desc: 'Cannot enter or secure home. Broken key or jammed latch bolt.',
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      tag: 'Urgent Locksmith',
    },
  ];

  const [selectedEmergency, setSelectedEmergency] = useState(emergencyPresets[0]);
  const [address, setAddress] = useState(user?.address || 'Hauz Khas Enclave, South Delhi');
  const [phone, setPhone] = useState(user?.phone || '9811223344');
  const [city, setCity] = useState(user?.city || 'South Delhi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDispatch = async () => {
    if (!isAuthenticated) {
      alert('Please log in with the 1-click Demo Bar or create an account to dispatch an emergency worker.');
      return;
    }

    if (!address.trim() || !phone.trim()) {
      setError('Address and active mobile number are mandatory for emergency dispatch.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Find best available verified worker in this category
      const workersRes = await api.workers.search({
        category: selectedEmergency.categorySlug,
        city: city,
        verifiedOnly: true,
        availableOnly: true,
      });

      let targetWorker = null;
      if (workersRes && workersRes.data && workersRes.data.length > 0) {
        targetWorker = workersRes.data[0];
      } else {
        // Fallback to any worker in that category
        const allRes = await api.workers.search({ category: selectedEmergency.categorySlug });
        if (allRes && allRes.data && allRes.data.length > 0) {
          targetWorker = allRes.data[0];
        }
      }

      if (!targetWorker) {
        setError(`No active technicians currently available for ${selectedEmergency.categorySlug}. Please call 1800-KAAM-SETU.`);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const payload = {
        workerId: targetWorker.id,
        categoryId: targetWorker.categoryId,
        serviceTitle: `[EMERGENCY SOS] ${selectedEmergency.title}`,
        problemDescription: `HIGH PRIORITY EMERGENCY: ${selectedEmergency.desc}`,
        scheduledDate: today,
        scheduledTimeSlot: 'Immediate (15-30 Mins Express Dispatch)',
        address: address,
        city: city,
        contactPhone: phone,
        urgency: 'EMERGENCY',
      };

      const res = await api.bookings.create(payload);
      setLoading(false);
      onClose();
      navigate('/customer/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Emergency dispatch failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">KaamSetu Express SOS</h3>
                <span className="bg-white/25 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  15-Min Dispatch
                </span>
              </div>
              <p className="text-xs text-rose-100">Direct priority dispatch for critical home emergencies</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Emergency Type Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">Select Emergency Situation</label>
            <div className="space-y-2">
              {emergencyPresets.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedEmergency(item)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                    selectedEmergency.id === item.id
                      ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-400'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Contact Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" /> Emergency Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                placeholder="Flat / House No., Landmark"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Area</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-rose-600" /> Phone *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Rate Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900">
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>Standard Visit (₹199) + Emergency Priority Surcharge (₹150)</span>
            </div>
            <span className="font-bold text-sm">₹349 Visit</span>
          </div>

          {/* Dispatch button */}
          <div className="pt-2">
            <button
              onClick={handleDispatch}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Dispatching Nearest Verified Pro...</span>
              ) : (
                <>
                  <span>Confirm Emergency Express Dispatch</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


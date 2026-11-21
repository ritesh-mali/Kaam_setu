import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X, Calendar, Clock, MapPin, Phone, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

export const BookingModal = ({ worker, customerCoords, isOpen, onClose, onBookingSuccess }) => {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    serviceTitle: `Standard Service - ${worker?.categoryName || 'Home Repair'}`,
    problemDescription: '',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTimeSlot: '10:00 AM - 12:00 PM',
    address: user?.address || '',
    city: user?.city || worker?.city || 'New Delhi',
    contactPhone: user?.phone || '',
    urgency: 'NORMAL',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !worker) return null;

  const visitingFee = worker.visitingCharge || 199;
  const hourlyRate = worker.hourlyRate || 249;
  const emergencyCharge = formData.urgency === 'EMERGENCY' ? (worker.emergencyCharge || 150) : 0;
  const estimatedTotal = visitingFee + hourlyRate + emergencyCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('Please sign in to your account to book a service provider.');
      return;
    }

    if (!formData.problemDescription.trim()) {
      setError('Please briefly describe the problem you need help with.');
      return;
    }

    if (!formData.address.trim()) {
      setError('Please provide your service location address.');
      return;
    }

    if (!formData.contactPhone.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        workerId: worker.id,
        categoryId: worker.categoryId,
        serviceTitle: formData.serviceTitle,
        problemDescription: formData.problemDescription,
        scheduledDate: formData.scheduledDate,
        scheduledTimeSlot: formData.scheduledTimeSlot,
        address: formData.address,
        city: formData.city,
        contactPhone: formData.contactPhone,
        urgency: formData.urgency,
        customerLatitude: customerCoords?.lat || 28.5494,
        customerLongitude: customerCoords?.lon || 77.2001,
      };

      const res = await api.bookings.create(payload);
      setLoading(false);
      onBookingSuccess(res.data);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to submit booking');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src={worker.avatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
              alt={worker.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow-sm"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Book Service with {worker.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="font-medium text-brand-600">{worker.categoryName}</span>
                <span>•</span>
                <span>{worker.city}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Service Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Service Requested
            </label>
            <input
              type="text"
              required
              value={formData.serviceTitle}
              onChange={(e) => setFormData({ ...formData, serviceTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g. Tap replacement, MCB repair, Door lock fix"
            />
          </div>

          {/* Problem Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Describe the Issue / Work Needed *
            </label>
            <textarea
              required
              rows={3}
              value={formData.problemDescription}
              onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Please share details such as what needs repair, symptoms, or materials on site..."
            />
          </div>

          {/* Schedule Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-600" /> Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-600" /> Time Slot
              </label>
              <select
                value={formData.scheduledTimeSlot}
                onChange={(e) => setFormData({ ...formData, scheduledTimeSlot: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Noon)</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Night)</option>
              </select>
            </div>
          </div>

          {/* Urgency Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Service Urgency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'NORMAL', label: 'Standard', sub: 'Standard rates' },
                { id: 'HIGH', label: 'Priority', sub: 'Within 2-4 hrs' },
                { id: 'EMERGENCY', label: 'Emergency', sub: `+₹${worker.emergencyCharge || 150} fee` },
              ].map((urg) => (
                <button
                  type="button"
                  key={urg.id}
                  onClick={() => setFormData({ ...formData, urgency: urg.id })}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    formData.urgency === urg.id
                      ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-semibold ring-1 ring-brand-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <p className="font-semibold">{urg.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{urg.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Address & Phone */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Service Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                placeholder="House / Flat No., Street, Landmark"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Locality / City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand-600" /> Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  placeholder="10 digit mobile"
                />
              </div>
            </div>
          </div>

          {/* Transparent Price Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="font-bold text-slate-800 flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Transparent Pricing Breakdown
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase bg-emerald-100/60 px-2 py-0.5 rounded-full">
                No Hidden Charges
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Visiting / Inspection Charge:</span>
              <span className="font-semibold text-slate-900">₹{visitingFee}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Standard Labor Rate (first hour estimate):</span>
              <span className="font-semibold text-slate-900">₹{hourlyRate}</span>
            </div>

            {formData.urgency === 'EMERGENCY' && (
              <div className="flex justify-between text-amber-700 font-medium">
                <span>Emergency Surcharge:</span>
                <span>+₹{emergencyCharge}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Platform Service Fee:</span>
              <span className="text-emerald-600 font-bold">₹0 (Waived)</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Estimated Total (Excl. extra parts):</span>
              <span className="text-brand-600 text-base">₹{estimatedTotal}</span>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * Pay worker directly via Cash or UPI only after satisfactory job completion verified by your OTP.
            </p>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/30 transition hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Sending Request to Worker...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm & Request Service (₹{estimatedTotal})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


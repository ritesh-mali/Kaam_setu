import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { ReviewModal } from '../components/common/ReviewModal';
import { ChatModal } from '../components/common/ChatModal';
import { LiveMapTracker } from '../components/common/LiveMapTracker';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  KeyRound, 
  Receipt, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ArrowRight, 
  Wrench,
  Search,
  Check,
  MessageSquare,
  Navigation
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user, isCustomer, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);
  const [selectedChatBooking, setSelectedChatBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'all'

  // Map visibility toggle per booking id
  const [expandedMapBookingId, setExpandedMapBookingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCustomerBookings();
  }, [isAuthenticated]);

  const fetchCustomerBookings = async () => {
    try {
      setLoading(true);
      const res = await api.bookings.getCustomerBookings();
      if (res && res.data) {
        setBookings(res.data);
        const firstActive = res.data.find((b) => ['ACCEPTED', 'IN_PROGRESS'].includes(b.status));
        if (firstActive && expandedMapBookingId === null) {
          setExpandedMapBookingId(firstActive.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await api.bookings.updateStatus(bookingId, {
        status: 'CANCELLED',
        rejectionReason: 'Cancelled by customer',
      });
      fetchCustomerBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const activeBookings = bookings.filter((b) => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const getStepStatus = (bookingStatus, step) => {
    if (bookingStatus === 'REJECTED' || bookingStatus === 'CANCELLED') return 'error';
    const order = { PENDING: 1, ACCEPTED: 2, IN_PROGRESS: 3, COMPLETED: 4 };
    const current = order[bookingStatus] || 1;
    if (current > step) return 'completed';
    if (current === step) return 'active';
    return 'upcoming';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Customer Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Customer'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Track active service requests, chat with workers, and inspect digital records.
          </p>
        </div>

        <Link
          to="/workers"
          className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/30 transition flex items-center gap-2 shrink-0"
        >
          <Search className="w-4 h-4" /> Book New Service
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Active Jobs Underway</p>
            <p className="text-2xl font-extrabold text-brand-600 mt-1">{activeBookings.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Completed Services</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{completedBookings.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Spent (Transparent Bill)</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalSpent}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-semibold text-slate-500 gap-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 relative transition ${
            activeTab === 'active' ? 'text-brand-600 font-bold' : 'hover:text-slate-800'
          }`}
        >
          Active Bookings ({activeBookings.length})
          {activeTab === 'active' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 relative transition ${
            activeTab === 'completed' ? 'text-brand-600 font-bold' : 'hover:text-slate-800'
          }`}
        >
          Completed History & Invoices ({completedBookings.length})
          {activeTab === 'completed' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 relative transition ${
            activeTab === 'all' ? 'text-brand-600 font-bold' : 'hover:text-slate-800'
          }`}
        >
          All Requests ({bookings.length})
          {activeTab === 'all' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Content Rendering based on Tab */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading your service bookings...
        </div>
      ) : activeTab === 'active' ? (
        activeBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-lg">No Active Bookings Right Now</h3>
            <p className="text-xs text-slate-500">Need help with home repairs, wiring, or plumbing?</p>
            <Link
              to="/workers"
              className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Browse Nearby Technicians
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {activeBookings.map((b) => {
              const isMapOpen = expandedMapBookingId === b.id;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 hover:border-brand-300 transition-all"
                >
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">{b.bookingNumber}</span>
                        <Badge status={b.status} />
                        {b.urgency === 'EMERGENCY' && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            EMERGENCY SOS
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{b.serviceTitle}</h3>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      {['ACCEPTED', 'IN_PROGRESS'].includes(b.status) && (
                        <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-800 px-2.5 py-1 rounded-xl text-xs font-mono font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>{b.estimatedArrivalMinutes != null ? `${b.estimatedArrivalMinutes} min ETA` : '5 min ETA'}</span>
                          <span>•</span>
                          <span>{b.distanceKm != null ? `${b.distanceKm} km away` : '1.2 km'}</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-400">Scheduled For:</p>
                      <p className="text-xs font-bold text-slate-800">
                        📅 {b.scheduledDate} • {b.scheduledTimeSlot}
                      </p>
                    </div>
                  </div>

                  {/* Progress Stepper Visual */}
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] relative">
                      {[
                        { step: 1, title: 'Requested', desc: 'Awaiting worker' },
                        { step: 2, title: 'Accepted', desc: 'Slot confirmed' },
                        { step: 3, title: 'In Progress', desc: 'Technician on site' },
                        { step: 4, title: 'Completed', desc: 'OTP verified' },
                      ].map((s) => {
                        const state = getStepStatus(b.status, s.step);
                        return (
                          <div key={s.step} className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                                state === 'completed'
                                  ? 'bg-emerald-500 text-white'
                                  : state === 'active'
                                  ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {state === 'completed' ? <Check className="w-4 h-4" /> : s.step}
                            </div>
                            <span className={`font-semibold ${state === 'active' ? 'text-brand-600 font-bold' : 'text-slate-700'}`}>
                              {s.title}
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">{s.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Map Route Simulator (if accepted or in_progress) */}
                  {['ACCEPTED', 'IN_PROGRESS'].includes(b.status) && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Navigation className="w-4 h-4 text-brand-600" /> Live Technician Route & Arrival ETA
                        </span>
                        <button
                          onClick={() => setExpandedMapBookingId(isMapOpen ? null : b.id)}
                          className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold"
                        >
                          {isMapOpen ? 'Hide Map' : 'Show Live Map'}
                        </button>
                      </div>

                      {isMapOpen && <LiveMapTracker booking={b} />}
                    </div>
                  )}

                  {/* Worker Details & Secure OTP Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Worker Information & Chat Action */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.workerAvatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                          alt={b.workerName}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500/20"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-slate-900 text-sm">{b.workerName}</p>
                          <p className="text-brand-600 font-medium">{b.categoryName} Professional</p>
                          <p className="text-slate-500 mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>Ph: {b.workerPhone || 'Assigned'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Direct In-App Chat Button */}
                      <button
                        onClick={() => setSelectedChatBooking(b)}
                        className="px-3 py-2 bg-white hover:bg-brand-50 border border-brand-200 text-brand-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                        title="Chat directly with technician"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                        <span>Chat</span>
                      </button>
                    </div>

                    {/* Secure Job Completion OTP Display */}
                    <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-amber-600" />
                          Job Completion OTP
                        </span>
                        <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          Customer Only
                        </span>
                      </div>

                      <div className="my-2 flex items-center justify-center gap-2">
                        {b.completionOtp?.split('').map((digit, idx) => (
                          <span
                            key={idx}
                            className="w-9 h-10 bg-white border border-amber-300 rounded-xl text-lg font-mono font-extrabold text-amber-900 flex items-center justify-center shadow-sm"
                          >
                            {digit}
                          </span>
                        ))}
                      </div>

                      <p className="text-[10px] text-amber-800 leading-tight">
                        ⚠️ <strong>Security Rule:</strong> Share this 4-digit OTP with {b.workerName} ONLY AFTER the service has been inspected and finished.
                      </p>
                    </div>
                  </div>

                  {/* Problem details & action */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="font-semibold text-slate-800">Address: </span>
                      <span>{b.address}, {b.city}</span>
                      <p className="text-slate-500 mt-0.5">Problem: {b.problemDescription}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-2">
                        <span className="text-[10px] text-slate-400 block">Estimated Charge:</span>
                        <span className="font-bold text-slate-900 text-sm">₹{b.totalAmount}</span>
                      </div>

                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Completed History / Invoices */
        completedBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-lg">No Completed Bookings Yet</h3>
            <p className="text-xs text-slate-500">Your completed service records and downloadable invoices will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">{b.bookingNumber}</span>
                    <Badge status="COMPLETED" size="xs" />
                    <span className="text-slate-400">• Completed on {b.completedAt ? new Date(b.completedAt).toLocaleDateString() : b.scheduledDate}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{b.serviceTitle}</h4>
                  <p className="text-slate-500">Service by <strong>{b.workerName}</strong> ({b.categoryName})</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right mr-2">
                    <span className="text-[10px] text-slate-400 block">Total Paid:</span>
                    <span className="font-extrabold text-slate-900 text-base">₹{b.totalAmount}</span>
                  </div>

                  <button
                    onClick={() => setSelectedInvoiceBooking(b)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Digital Invoice & UPI
                  </button>

                  {!b.hasReviewed ? (
                    <button
                      onClick={() => setSelectedReviewBooking(b)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      Rate Service
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Invoice Modal */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          isOpen={!!selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
          onPaymentUpdated={fetchCustomerBookings}
        />
      )}

      {/* Review Modal */}
      {selectedReviewBooking && (
        <ReviewModal
          booking={selectedReviewBooking}
          isOpen={!!selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
          onReviewSuccess={() => {
            fetchCustomerBookings();
            alert('Thank you for rating your service experience!');
          }}
        />
      )}

      {/* Chat Modal */}
      {selectedChatBooking && (
        <ChatModal
          booking={selectedChatBooking}
          isOpen={!!selectedChatBooking}
          onClose={() => setSelectedChatBooking(null)}
        />
      )}
    </div>
  );
};

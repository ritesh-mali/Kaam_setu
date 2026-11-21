import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { StarRating } from '../components/common/StarRating';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { ChatModal } from '../components/common/ChatModal';
import { LocationPermissionBanner } from '../components/common/LocationPermissionBanner';
import { detectLocationWithFallback, DEFAULT_HUBS } from '../services/locationService';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Power,
  MapPin,
  Phone,
  KeyRound,
  Receipt,
  Star,
  Wrench,
  Sliders,
  MessageSquare,
  Save,
  AlertTriangle,
  Send,
  Compass,
  Radio,
  Navigation,
  Bike
} from 'lucide-react';

const PRESET_LOCATIONS = DEFAULT_HUBS;

export const WorkerDashboard = () => {
  const { user, isWorker, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'active', 'completed', 'settings', 'reviews'

  // Location & Uber/Ola Simulation State
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');
  const [simulatingBookingId, setSimulatingBookingId] = useState(null);
  const [locationSource, setLocationSource] = useState('DEFAULT');
  const [showLocationPermissionHelp, setShowLocationPermissionHelp] = useState(false);

  // Chat modal state
  const [selectedChatBooking, setSelectedChatBooking] = useState(null);

  // Completion Form Modal State
  const [completingBooking, setCompletingBooking] = useState(null);
  const [completionForm, setCompletionForm] = useState({
    otp: '',
    estimatedHours: 1.0,
    partsCost: 0,
    workerNotes: '',
    paymentStatus: 'PAID_CASH',
  });
  const [completionError, setCompletionError] = useState('');
  const [submittingCompletion, setSubmittingCompletion] = useState(false);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    visitingCharge: 199,
    hourlyRate: 249,
    emergencyCharge: 150,
    skills: '',
    bio: '',
    serviceArea: '',
    city: '',
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  // Selected invoice for viewing
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Review reply state
  const [replyTextMap, setReplyTextMap] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWorkerData();
  }, [isAuthenticated]);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.workers.getMyProfile();
      if (profileRes && profileRes.data) {
        setProfile(profileRes.data);
        setProfileForm({
          visitingCharge: profileRes.data.visitingCharge || 199,
          hourlyRate: profileRes.data.hourlyRate || 249,
          emergencyCharge: profileRes.data.emergencyCharge || 150,
          skills: profileRes.data.skills || '',
          bio: profileRes.data.bio || '',
          serviceArea: profileRes.data.serviceArea || '',
          city: profileRes.data.city || '',
        });

        // fetch reviews for this worker
        api.reviews.getForWorker(profileRes.data.id).then((rRes) => {
          if (rRes && rRes.data) setReviews(rRes.data);
        }).catch(console.error);
      }

      const bookingsRes = await api.bookings.getWorkerBookings();
      if (bookingsRes && bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch worker dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const res = await api.workers.toggleAvailability();
      if (res && res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleUpdateWorkerLocation = async (lat, lon, name) => {
    try {
      setUpdatingLocation(true);
      const res = await api.workers.updateLocation({
        latitude: lat,
        longitude: lon,
        locationName: name
      });
      if (res?.data) {
        setProfile(res.data);
        setLocationSuccessMsg(`📍 Location updated to: ${name}`);
        setTimeout(() => setLocationSuccessMsg(''), 4000);
      }
      fetchWorkerData();
    } catch (err) {
      alert(err.message || 'Failed to update location');
    } finally {
      setUpdatingLocation(false);
    }
  };

  const handleDetectGPS = async () => {
    try {
      setUpdatingLocation(true);
      const res = await detectLocationWithFallback({
        lat: profile?.latitude || 28.5355,
        lon: profile?.longitude || 77.2100,
        name: profile?.currentLocationName || 'Malviya Nagar, South Delhi'
      });

      setLocationSource(res.source);
      setShowLocationPermissionHelp(res.permissionDenied);

      await handleUpdateWorkerLocation(res.latitude, res.longitude, res.locationName);
    } catch (err) {
      console.warn('GPS detection error:', err);
    } finally {
      setUpdatingLocation(false);
    }
  };

  // Live Trip Simulation (Uber/Ola Drive to Customer)
  useEffect(() => {
    if (!simulatingBookingId) return;

    const interval = setInterval(async () => {
      setBookings((prevBookings) => {
        const target = prevBookings.find((b) => b.id === simulatingBookingId);
        if (!target) return prevBookings;

        const custLat = target.customerLatitude || 28.5494;
        const custLon = target.customerLongitude || 77.2001;
        const currLat = target.workerLatitude || 28.5355;
        const currLon = target.workerLongitude || 77.2100;

        // Step 18% closer
        const nextLat = +(currLat + (custLat - currLat) * 0.18).toFixed(4);
        const nextLon = +(currLon + (custLon - currLon) * 0.18).toFixed(4);

        // Approximate distance remaining
        const remainingDist = +(Math.hypot(custLat - nextLat, custLon - nextLon) * 111).toFixed(1);

        if (remainingDist <= 0.08) {
          clearInterval(interval);
          setSimulatingBookingId(null);
          // Broadcast arrived
          api.bookings.updateLocation(target.id, {
            latitude: custLat,
            longitude: custLon,
            locationName: 'At Customer Doorstep'
          }).then(() => fetchWorkerData()).catch(console.error);

          return prevBookings.map((b) =>
            b.id === target.id
              ? { ...b, workerLatitude: custLat, workerLongitude: custLon, distanceKm: 0.0, estimatedArrivalMinutes: 0 }
              : b
          );
        }

        const eta = Math.max(1, Math.ceil(remainingDist * 3.5));

        // Asynchronously broadcast to backend
        api.bookings.updateLocation(target.id, {
          latitude: nextLat,
          longitude: nextLon,
          locationName: `En route to ${target.address || 'Customer'}`
        }).catch(console.error);

        return prevBookings.map((b) =>
          b.id === target.id
            ? { ...b, workerLatitude: nextLat, workerLongitude: nextLon, distanceKm: remainingDist, estimatedArrivalMinutes: eta }
            : b
        );
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [simulatingBookingId]);

  const handleAcceptBooking = async (bookingId) => {
    try {
      await api.bookings.updateStatus(bookingId, { status: 'ACCEPTED' });
      fetchWorkerData();
    } catch (err) {
      alert(err.message || 'Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Please enter a reason for declining this request (optional):', 'Slot full / outside service area');
    if (reason === null) return;
    try {
      await api.bookings.updateStatus(bookingId, { status: 'REJECTED', rejectionReason: reason });
      fetchWorkerData();
    } catch (err) {
      alert(err.message || 'Failed to reject booking');
    }
  };

  const handleStartJob = async (bookingId) => {
    try {
      await api.bookings.updateStatus(bookingId, { status: 'IN_PROGRESS' });
      fetchWorkerData();
    } catch (err) {
      alert(err.message || 'Failed to start job');
    }
  };

  const handleCompleteJobSubmit = async (e) => {
    e.preventDefault();
    setCompletionError('');

    if (!completionForm.otp || completionForm.otp.length !== 4) {
      setCompletionError('Please enter the 4-digit OTP provided by the customer.');
      return;
    }

    try {
      setSubmittingCompletion(true);
      const res = await api.bookings.updateStatus(completingBooking.id, {
        status: 'COMPLETED',
        otp: completionForm.otp,
        estimatedHours: Number(completionForm.estimatedHours),
        partsCost: Number(completionForm.partsCost),
        workerNotes: completionForm.workerNotes,
        paymentStatus: completionForm.paymentStatus,
      });

      setSubmittingCompletion(false);
      setCompletingBooking(null);
      fetchWorkerData();
      setSelectedInvoice(res.data); // Show completed invoice immediately!
    } catch (err) {
      setSubmittingCompletion(false);
      setCompletionError(err.message || 'OTP verification failed');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.workers.updateProfile(profileForm);
      if (res && res.data) {
        setProfile(res.data);
        setProfileSavedMsg('Profile and rate card updated successfully!');
        setTimeout(() => setProfileSavedMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to save profile');
    }
  };

  const handleReplySubmit = async (reviewId) => {
    const replyText = replyTextMap[reviewId];
    if (!replyText || !replyText.trim()) return;

    try {
      await api.reviews.reply(reviewId, replyText);
      fetchWorkerData();
      setReplyTextMap({ ...replyTextMap, [reviewId]: '' });
    } catch (err) {
      alert(err.message || 'Failed to submit reply');
    }
  };

  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const activeJobs = bookings.filter((b) => ['ACCEPTED', 'IN_PROGRESS'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  const totalEarnings = completedJobs.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Online/Offline Toggle */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
              {profile?.verified ? <Badge status="VERIFIED" /> : <Badge status="PENDING" />}
            </div>
            <p className="text-xs text-brand-400 font-semibold mt-0.5">
              {profile?.categoryName || 'Service Specialist'} • {profile?.experienceYears || 2} Years Experience
            </p>
            <p className="text-xs text-slate-300 mt-1">
              📍 {profile?.serviceArea || profile?.city || 'Delhi NCR'}
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Work Status</span>
            <span className={`font-bold ${profile?.available ? 'text-emerald-400' : 'text-slate-400'}`}>
              {profile?.available ? 'Online (Accepting Jobs)' : 'Offline (On Break)'}
            </span>
          </div>

          <button
            onClick={handleToggleAvailability}
            className={`p-3 rounded-xl transition-all shadow-md ${profile?.available
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            title="Click to toggle availability"
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Worker Location & GPS Radar Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Technician Live GPS Broadcasting
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {profile?.currentLocationName || 'Malviya Nagar Main Market, South Delhi'}
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                Coords: [{profile?.latitude || 28.5355}, {profile?.longitude || 77.2100}] • Visible to customers on live map
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDetectGPS}
              disabled={updatingLocation}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-400" />
              <span>{updatingLocation ? 'Detecting GPS...' : 'Use Device GPS'}</span>
            </button>

            <div className="relative">
              <select
                onChange={(e) => {
                  const loc = PRESET_LOCATIONS.find((l) => l.name === e.target.value);
                  if (loc) {
                    handleUpdateWorkerLocation(loc.lat, loc.lon, loc.name);
                  }
                }}
                defaultValue=""
                disabled={updatingLocation}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                <option value="" disabled>Change Working Area Hub...</option>
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    📍 {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {locationSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-xl font-medium animate-in fade-in">
            {locationSuccessMsg}
          </div>
        )}

        {showLocationPermissionHelp && (
          <LocationPermissionBanner
            currentSource={locationSource}
            onRetry={handleDetectGPS}
            onDismiss={() => setShowLocationPermissionHelp(false)}
          />
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Total Earnings (100%)</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalEarnings}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">₹0 Platform Commission Cut</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Pending Requests</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingRequests.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting your response</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Jobs Completed</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{completedJobs.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Verified with Customer OTP</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Customer Rating</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{profile?.rating || 5.0}</span>
            <StarRating rating={profile?.rating || 5} size="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">From {profile?.totalReviews || 0} customer reviews</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-semibold text-slate-500 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 relative transition flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'requests' ? 'text-brand-600 font-bold' : 'hover:text-slate-800'
            }`}
        >
          <span>Incoming Requests</span>
          {pendingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingRequests.length}
            </span>
          )}
          {activeTab === 'requests' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"></span>}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 relative transition flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'active' ? 'text-brand-600 font-bold' : 'hover:text-slate-800'
            }`}
        >
          <span>Active & Scheduled ({activeJobs.length})</span>
          {activeTab === 'active' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"></span>}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 relative transition whitespace-nowrap ${activeTab === 'completed' ? 'text-brand-600 font-bold' : 'hover:text-slate-800'
            }`}
        >
          Completed Records ({completedJobs.length})
          {activeTab === 'completed' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"></span>}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 relative transition whitespace-nowrap ${activeTab === 'settings' ? 'text-brand-600 font-bold' : 'hover:text-slate-800'
            }`}
        >
          Rate Card & Profile
          {activeTab === 'settings' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"></span>}
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 relative transition whitespace-nowrap ${activeTab === 'reviews' ? 'text-brand-600 font-bold' : 'hover:text-slate-800'
            }`}
        >
          Reviews & Feedback ({reviews.length})
          {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"></span>}
        </button>
      </div>

      {/* Tab 1: Incoming Booking Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-lg">No Pending Booking Requests</h3>
              <p className="text-xs text-slate-500">
                Ensure your work status toggle is set to <strong className="text-emerald-600">Online</strong> to receive new requests from nearby customers.
              </p>
            </div>
          ) : (
            pendingRequests.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-brand-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{b.bookingNumber}</span>
                    <Badge status="PENDING" size="xs" />
                    {b.urgency === 'EMERGENCY' && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        🚨 EMERGENCY (+₹{profile?.emergencyCharge || 150})
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{b.serviceTitle}</h3>
                  <p className="text-xs text-slate-600 max-w-xl">
                    <strong className="text-slate-800">Problem: </strong>
                    {b.problemDescription}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>📅 {b.scheduledDate} • {b.scheduledTimeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      <span>{b.address}, {b.city}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Customer: <strong>{b.customerName}</strong> • Ph: {b.contactPhone}
                  </p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right mb-2">
                    <span className="text-[10px] text-slate-400 block">Estimated Fee:</span>
                    <span className="font-extrabold text-slate-900 text-lg">₹{b.totalAmount}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleRejectBooking(b.id)}
                      className="flex-1 md:flex-initial px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptBooking(b.id)}
                      className="flex-1 md:flex-initial px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
                    >
                      Accept Booking
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Active & Scheduled Jobs */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-lg">No Active Jobs Underway</h3>
              <p className="text-xs text-slate-500">Accepted service requests will show up here.</p>
            </div>
          ) : (
            activeJobs.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:border-brand-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{b.bookingNumber}</span>
                      <Badge status={b.status} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{b.serviceTitle}</h3>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-400">Slot: </span>
                    <span className="font-bold text-slate-800">{b.scheduledDate} ({b.scheduledTimeSlot})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800">Customer Location & Contact</p>
                    <p className="mt-0.5">{b.address}, {b.city}</p>
                    <p className="mt-1 font-mono text-brand-700">📞 Ph: {b.contactPhone}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Problem Reported</p>
                    <p className="mt-0.5 text-slate-600">{b.problemDescription}</p>
                  </div>
                </div>

                {/* Live Trip Broadcaster & Uber/Ola Simulation */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl border border-slate-700/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
                      </span>
                      <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                        Live Customer Trip Radar
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
                      <span>Remaining: <strong className="text-brand-400 font-bold">{b.distanceKm != null ? b.distanceKm : 1.2} km</strong></span>
                      <span>•</span>
                      <span>ETA: <strong className="text-emerald-400 font-bold">{b.estimatedArrivalMinutes != null ? b.estimatedArrivalMinutes : 5} mins</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/60 text-xs">
                    <p className="text-[11px] text-slate-400">
                      Worker location: <strong className="text-slate-200">{b.workerLocationName || profile?.currentLocationName || 'Near Hauz Khas'}</strong>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (simulatingBookingId === b.id) {
                            setSimulatingBookingId(null);
                          } else {
                            setSimulatingBookingId(b.id);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${simulatingBookingId === b.id
                            ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                            : 'bg-brand-600 hover:bg-brand-500 text-white'
                          }`}
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>
                          {simulatingBookingId === b.id ? 'Driving in Progress (Pause)' : 'Simulate Drive to Customer'}
                        </span>
                      </button>

                      <button
                        onClick={async () => {
                          const custLat = b.customerLatitude || 28.5494;
                          const custLon = b.customerLongitude || 77.2001;
                          setSimulatingBookingId(null);
                          try {
                            await api.bookings.updateLocation(b.id, {
                              latitude: custLat,
                              longitude: custLon,
                              locationName: 'At Customer Doorstep'
                            });
                            fetchWorkerData();
                          } catch (err) {
                            alert(err.message || 'Failed to update location');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                        title="Immediately set location to customer doorstep"
                      >
                        Arrived at Site
                      </button>
                    </div>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {b.status === 'ACCEPTED' ? (
                      <span>Ready to visit customer location? Click <strong>Start Job</strong> upon arrival.</span>
                    ) : (
                      <span className="text-purple-700 font-semibold flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 animate-spin" />
                        Work in progress. Collect 4-digit OTP from customer to verify & complete.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Chat button */}
                    <button
                      onClick={() => setSelectedChatBooking(b)}
                      className="px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                      Chat with Customer
                    </button>

                    {b.status === 'ACCEPTED' ? (
                      <button
                        onClick={() => handleStartJob(b.id)}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Start Job (On Site)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setCompletingBooking(b);
                          setCompletionForm({
                            otp: '',
                            estimatedHours: b.estimatedHours || 1.0,
                            partsCost: 0,
                            workerNotes: '',
                            paymentStatus: 'PAID_CASH',
                          });
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Complete Job with Customer OTP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Completed Records & Invoices */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-lg">No Completed Jobs Yet</h3>
              <p className="text-xs text-slate-500">Records of completed jobs and invoices will be stored here permanently.</p>
            </div>
          ) : (
            completedJobs.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">{b.bookingNumber}</span>
                    <Badge status="COMPLETED" size="xs" />
                    <span className="text-slate-400">• {b.completedAt ? new Date(b.completedAt).toLocaleDateString() : b.scheduledDate}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{b.serviceTitle}</h4>
                  <p className="text-slate-500 mt-0.5">
                    Customer: {b.customerName} ({b.city}) • {b.workerNotes || 'Job completed smoothly'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right mr-2">
                    <span className="text-[10px] text-slate-400 block">Earnings:</span>
                    <span className="font-extrabold text-emerald-600 text-base">₹{b.totalAmount}</span>
                  </div>

                  <button
                    onClick={() => setSelectedInvoice(b)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Invoice Receipt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Rate Card & Profile Management */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm max-w-2xl">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Manage Service Charges & Profile</h3>
            <p className="text-xs text-slate-500">
              Set transparent rates for your visiting fee and labor charges. Customers will see these rates upfront.
            </p>
          </div>

          {profileSavedMsg && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{profileSavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            {/* Rate inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doorstep Visiting Fee (₹) *</label>
                <input
                  type="number"
                  required
                  min="50"
                  max="1000"
                  value={profileForm.visitingCharge}
                  onChange={(e) => setProfileForm({ ...profileForm, visitingCharge: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hourly Labor Rate (₹/hr) *</label>
                <input
                  type="number"
                  required
                  min="50"
                  max="2000"
                  value={profileForm.hourlyRate}
                  onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Surcharge (₹)</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={profileForm.emergencyCharge}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyCharge: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Service Areas */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Localities Served (Comma separated)</label>
              <input
                type="text"
                value={profileForm.serviceArea}
                onChange={(e) => setProfileForm({ ...profileForm, serviceArea: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                placeholder="e.g. Hauz Khas, Malviya Nagar, Saket, Green Park"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specialized Skills (Comma separated)</label>
              <input
                type="text"
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                placeholder="e.g. Pipe Leakage, Sanitary Fittings, Motor Pump"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bio / Profile Description</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                placeholder="Tell customers about your experience, certifications, and work ethic..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="py-3 px-5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-brand-500/20"
              >
                <Save className="w-4 h-4" /> Save Rate Card & Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 5: Reviews & Replies */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Customer Reviews & Ratings</h3>
              <p className="text-xs text-slate-500">Build trust by replying politely to your customers' feedback.</p>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <span className="font-extrabold text-amber-900 text-base">{profile?.rating || 5.0}</span>
              <StarRating rating={profile?.rating || 5} size="w-4 h-4" />
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{rev.customerName || 'Verified Customer'}</span>
                      <span className="text-slate-400 ml-2 font-mono">({rev.bookingNumber})</span>
                    </div>
                    <StarRating rating={rev.rating} size="w-3.5 h-3.5" />
                  </div>

                  <p className="text-slate-700 italic">"{rev.comment}"</p>

                  {/* Worker reply or reply form */}
                  {rev.workerReply ? (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 text-slate-700">
                      <span className="font-bold text-brand-600 block text-[11px]">Your Reply:</span>
                      <span>{rev.workerReply}</span>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a polite reply to customer..."
                        value={replyTextMap[rev.id] || ''}
                        onChange={(e) => setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                      <button
                        onClick={() => handleReplySubmit(rev.id)}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complete Job Modal with OTP Verification */}
      {completingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Complete Job & Verify with OTP</h3>
                <p className="text-xs text-slate-500">{completingBooking.bookingNumber} • {completingBooking.customerName}</p>
              </div>
              <button
                onClick={() => setCompletingBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteJobSubmit} className="p-6 space-y-4 text-xs">
              {completionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{completionError}</span>
                </div>
              )}

              {/* 4-digit OTP Input */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
                <label className="block font-bold text-amber-900 text-xs">
                  Enter 4-Digit Customer Completion OTP *
                </label>
                <p className="text-[11px] text-amber-800">
                  Ask the customer for the OTP displayed on their dashboard after they inspect the work.
                </p>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="e.g. 4321"
                  value={completionForm.otp}
                  onChange={(e) => setCompletionForm({ ...completionForm, otp: e.target.value.trim() })}
                  className="w-36 py-2 text-center font-mono font-extrabold text-2xl tracking-widest rounded-xl border border-amber-300 mx-auto block uppercase"
                />
              </div>

              {/* Labor hours and parts cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Labor Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={completionForm.estimatedHours}
                    onChange={(e) => setCompletionForm({ ...completionForm, estimatedHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <span className="text-[10px] text-slate-400">@ ₹{completingBooking.hourlyRate}/hr</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Spare Parts Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={completionForm.partsCost}
                    onChange={(e) => setCompletionForm({ ...completionForm, partsCost: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <span className="text-[10px] text-slate-400">Add original bill amount if any</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Done Remarks</label>
                <textarea
                  rows={2}
                  value={completionForm.workerNotes}
                  onChange={(e) => setCompletionForm({ ...completionForm, workerNotes: e.target.value })}
                  placeholder="e.g. Replaced leaking valve, tested pressure, cleaned area."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method Collected</label>
                <select
                  value={completionForm.paymentStatus}
                  onChange={(e) => setCompletionForm({ ...completionForm, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="PAID_CASH">Cash Paid Directly to Worker</option>
                  <option value="PAID_ONLINE">UPI / Online Transfer</option>
                </select>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingCompletion}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submittingCompletion ? 'Verifying OTP & Finalizing...' : 'Verify OTP & Complete Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Viewer */}
      {selectedInvoice && (
        <InvoiceModal
          booking={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
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


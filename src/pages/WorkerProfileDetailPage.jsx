import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { StarRating } from '../components/common/StarRating';
import { Badge } from '../components/common/Badge';
import { BookingModal } from '../components/common/BookingModal';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Clock, 
  Award, 
  CheckCircle2, 
  MessageSquare, 
  Receipt, 
  AlertCircle,
  Calendar,
  ArrowLeft 
} from 'lucide-react';

export const WorkerProfileDetailPage = () => {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    fetchWorkerAndReviews();
  }, [id]);

  const fetchWorkerAndReviews = async () => {
    try {
      setLoading(true);
      const workerRes = await api.workers.getById(id);
      if (workerRes && workerRes.data) {
        setWorker(workerRes.data);
      }
      const reviewsRes = await api.reviews.getForWorker(id);
      if (reviewsRes && reviewsRes.data) {
        setReviews(reviewsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch worker details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading worker profile & verified credentials...
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Worker Profile Not Found</h2>
        <Link to="/workers" className="text-brand-600 text-sm mt-2 inline-block">← Back to Workers Directory</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/workers" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Search Results
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Avatar & Badges */}
          <div className="md:col-span-3 text-center md:text-left">
            <img
              src={worker.avatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200'}
              alt={worker.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover mx-auto md:mx-0 ring-4 ring-brand-500/20 shadow-lg"
            />
          </div>

          {/* Details */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{worker.name}</h1>
              {worker.verified && <Badge status="VERIFIED" />}
              <Badge status={worker.available ? 'ONLINE' : 'OFFLINE'} size="xs" />
            </div>

            <p className="text-base font-semibold text-brand-600">{worker.categoryName} Professional</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <StarRating rating={worker.rating || 5} size="w-4 h-4" />
                <span className="font-bold text-slate-900 text-sm">{worker.rating}</span>
                <span className="text-slate-400">({worker.totalReviews} reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-brand-500" />
                <span>{worker.experienceYears} Years Experience</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{worker.completedJobsCount} Completed Jobs</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Coverage: <strong>{worker.serviceArea || worker.city}</strong></span>
            </div>
          </div>

          {/* CTA Box */}
          <div className="md:col-span-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="text-xs text-slate-500">Doorstep Visiting Fee</div>
            <div className="text-3xl font-extrabold text-slate-900">₹{worker.visitingCharge}</div>
            <div className="text-xs text-slate-600">+ ₹{worker.hourlyRate}/hr labor rate</div>

            <button
              onClick={() => setBookingOpen(true)}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/30 transition hover:shadow-lg"
            >
              Book Service Now
            </button>
            <p className="text-[10px] text-slate-400">Pay directly after OTP-verified work completion</p>
          </div>
        </div>
      </div>

      {/* Details Grid: Bio, Transparent Rate Card, Verification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: About & Skills */}
        <div className="md:col-span-2 space-y-6">
          {/* About section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base">About the Worker</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {worker.bio}
            </p>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Specialized Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {worker.skills?.split(',').map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-brand-50 border border-brand-100 text-brand-800 rounded-lg text-xs font-medium"
                  >
                    ✓ {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Customer Reviews & Feedback</h3>
                <p className="text-xs text-slate-500">Verified feedback from completed platform bookings</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                <span className="font-extrabold text-amber-900 text-sm">{worker.rating}</span>
                <StarRating rating={worker.rating} size="w-3.5 h-3.5" />
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No customer reviews yet. Be the first to book and rate this service provider!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{rev.customerName || 'Verified Customer'}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                          Verified Booking
                        </span>
                      </div>
                      <StarRating rating={rev.rating} size="w-3.5 h-3.5" />
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{rev.comment}"
                    </p>

                    {rev.workerReply && (
                      <div className="mt-2.5 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                        <span className="font-bold text-brand-600 block text-[11px]">
                          ↳ Reply from {worker.name}:
                        </span>
                        <span>{rev.workerReply}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Rate Card & Verification Card */}
        <div className="space-y-6">
          {/* Rate Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-600" />
              Standard Rate Card
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                <span>Visiting & Diagnostic Fee:</span>
                <span className="font-bold text-slate-900">₹{worker.visitingCharge}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                <span>Standard Labor Charge:</span>
                <span className="font-bold text-slate-900">₹{worker.hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                <span>Emergency Surcharge:</span>
                <span className="font-bold text-amber-700">+₹{worker.emergencyCharge || 150}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-600">
                <span>Spare Parts:</span>
                <span className="font-bold text-slate-900">Actual bill cost</span>
              </div>
            </div>

            <div className="bg-brand-50 p-3 rounded-xl text-[11px] text-brand-900 leading-tight">
              ✓ Guaranteed no hidden platform fee. Inspect work and verify with OTP before making payment.
            </div>
          </div>

          {/* Verification Badge Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Trust & Verification
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>Government ID:</span>
                <span className="font-semibold text-slate-800">{worker.idProofType || 'AADHAAR'} Verified</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Safety Check:</span>
                <span className="text-emerald-600 font-bold">Passed (Zero Disputes)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Verification Notes:</span>
                <span className="text-slate-700 italic">{worker.verificationNotes || 'Aadhaar identity and trade qualifications verified by KaamSetu Admin.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingOpen && (
        <BookingModal
          worker={worker}
          isOpen={bookingOpen}
          onClose={() => setBookingOpen(false)}
          onBookingSuccess={(b) => {
            alert(`Booking #${b.bookingNumber} confirmed! Check your Customer Dashboard.`);
          }}
        />
      )}
    </div>
  );
};


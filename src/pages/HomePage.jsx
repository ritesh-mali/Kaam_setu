import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StarRating } from '../components/common/StarRating';
import { Badge } from '../components/common/Badge';
import { BookingModal } from '../components/common/BookingModal';
import { 
  Wrench, 
  Zap, 
  Hammer, 
  Tv, 
  Paintbrush, 
  Sparkles, 
  ShieldCheck, 
  Receipt, 
  KeyRound, 
  Search, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  TrendingUp, 
  Users, 
  ChevronRight 
} from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredWorkers, setFeaturedWorkers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [bookingWorker, setBookingWorker] = useState(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  useEffect(() => {
    // Load categories
    api.categories.getAll().then((res) => {
      if (res && res.data) setCategories(res.data);
    }).catch(console.error);

    // Load featured verified workers
    api.workers.search({ verifiedOnly: true }).then((res) => {
      if (res && res.data) setFeaturedWorkers(res.data.slice(0, 4));
    }).catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (selectedCategory) query.append('category', selectedCategory);
    if (selectedCity) query.append('city', selectedCity);
    navigate(`/workers?${query.toString()}`);
  };

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'plumber': return <Wrench className="w-6 h-6 text-blue-600" />;
      case 'electrician': return <Zap className="w-6 h-6 text-amber-500" />;
      case 'carpenter': return <Hammer className="w-6 h-6 text-orange-600" />;
      case 'appliance-repair': return <Tv className="w-6 h-6 text-purple-600" />;
      case 'painter': return <Paintbrush className="w-6 h-6 text-emerald-600" />;
      case 'house-cleaner': return <Sparkles className="w-6 h-6 text-cyan-600" />;
      default: return <Wrench className="w-6 h-6 text-brand-600" />;
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Toast Notification */}
      {bookingSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{bookingSuccessMsg}</span>
          <button onClick={() => setBookingSuccessMsg('')} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 md:pt-16 pb-12 bg-gradient-to-b from-brand-50/60 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping"></span>
                Local Worker Network • Zero Middlemen Cuts
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Skilled Local Workers. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-amber-600 to-brand-500">
                  Transparent Upfront Pricing.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Directly book vetted plumbers, electricians, carpenters, and appliance mechanics in your neighbourhood. Transparent rate cards, verified skills, and secure OTP job completion.
              </p>

              {/* Live Search Card */}
              <form onSubmit={handleSearch} className="bg-white p-3.5 rounded-3xl shadow-xl shadow-brand-950/5 border border-slate-200/80 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Category */}
                  <div className="sm:col-span-5 px-3 py-1.5 flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-slate-200">
                    <Wrench className="w-5 h-5 text-brand-500 shrink-0" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
                    >
                      <option value="">All Services</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* City / Locality */}
                  <div className="sm:col-span-4 px-3 py-1.5 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="Locality or City..."
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Search Button */}
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand-500/30 transition flex items-center justify-center gap-1.5 hover:shadow-lg"
                    >
                      <Search className="w-4 h-4" />
                      Find Pros
                    </button>
                  </div>
                </div>
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Identity & Background</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Itemized Digital Invoices</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>OTP Secure Job Completion</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Card Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm">
                {/* Decorative glows */}
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-500 to-amber-500 rounded-3xl opacity-20 blur-xl"></div>

                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Featured Technician</span>
                    <Badge status="VERIFIED" />
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
                      alt="Rajesh Sharma"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow-md"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">Rajesh Sharma</h4>
                      <p className="text-xs font-semibold text-brand-600">Master Plumber • 8 yrs exp</p>
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <StarRating rating={4.9} size="w-3.5 h-3.5" />
                        <span className="font-bold text-slate-800">4.9</span>
                        <span className="text-slate-400">(38 jobs)</span>
                      </div>
                    </div>
                  </div>

                  {/* Transparent Rate Box */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Doorstep Visiting Fee:</span>
                      <span className="font-bold text-slate-900">₹199 fixed</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Standard Hourly Rate:</span>
                      <span className="font-bold text-slate-900">₹249/hr</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                      <span>Platform Commission:</span>
                      <span>₹0 (100% to Worker)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> South Delhi (30 min away)
                    </span>
                    <Badge status="ONLINE" />
                  </div>

                  <button
                    onClick={() => {
                      if (featuredWorkers.length > 0) setBookingWorker(featuredWorkers[0]);
                      else navigate('/workers');
                    }}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/30 transition flex items-center justify-center gap-2"
                  >
                    <span>Instant Book Service</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Service Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a trade to browse certified local experts with transparent rate cards.
            </p>
          </div>
          <Link
            to="/workers"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0"
          >
            <span>View All Services</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/workers?category=${cat.slug}`}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all text-center flex flex-col items-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-brand-50 flex items-center justify-center transition-colors">
                {getCategoryIcon(cat.slug)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  From ₹{cat.basePriceEstimate || 199} visit
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Verified Workers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified & Rated Technicians
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top-Rated Nearby Service Providers
            </h2>
          </div>
          <Link
            to="/workers"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Browse Full Directory ({featuredWorkers.length}+ Active)</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={worker.avatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                      alt={worker.name}
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-brand-500/20"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{worker.name}</h4>
                      <p className="text-xs font-semibold text-brand-600">{worker.categoryName}</p>
                      <div className="flex items-center gap-1 text-[11px] mt-0.5">
                        <StarRating rating={worker.rating || 5} size="w-3 h-3" />
                        <span className="font-bold text-slate-800">{worker.rating}</span>
                        <span className="text-slate-400">({worker.completedJobsCount} jobs)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {worker.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1">
                  {worker.skills?.split(',').slice(0, 2).map((skill, idx) => (
                    <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {skill.trim()}
                    </span>
                  ))}
                </div>

                {/* Rates */}
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Visit Fee:</span>
                    <span className="font-bold text-slate-900">₹{worker.visitingCharge}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Hourly Rate:</span>
                    <span className="font-bold text-slate-900">₹{worker.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                <Link
                  to={`/workers/${worker.id}`}
                  className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => setBookingWorker(worker)}
                  className="flex-1 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why KaamSetu - Transparent vs Unorganized */}
      <section id="how-it-works" className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Homeowners & Workers Trust KaamSetu
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              We solve the biggest challenges in local services: hidden costs, untrusted workers, and no proof of work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">100% Transparent Rates</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear doorstep inspection fee and hourly labor rates displayed upfront. No surge pricing surprises or arbitrary bargaining on doorstep.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Secure OTP Job Completion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The job is marked complete only after the customer provides a confidential 4-digit OTP, ensuring the service has been delivered to your satisfaction.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Verified Digital History</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Both customer and worker maintain permanent digital receipts with itemized spare parts costs, warranty notes, and verified reviews.
              </p>
            </div>
          </div>

          {/* Transparent Price Chart Comparison Table */}
          <div id="pricing" className="mt-16 bg-slate-900 text-white rounded-3xl p-8 sm:p-10">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Rate Card Comparison</span>
              <h3 className="text-2xl font-bold mt-1">KaamSetu Fair Pricing vs Unorganized Market</h3>
              <p className="text-xs text-slate-400 mt-1">Our standard rate recommendations for typical household tasks.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-left">
                    <th className="py-3 font-semibold">Service Type</th>
                    <th className="py-3 font-semibold">Doorstep Visiting Fee</th>
                    <th className="py-3 font-semibold">Hourly Labor Rate</th>
                    <th className="py-3 font-semibold">Typical Unorganized Market</th>
                    <th className="py-3 font-semibold">KaamSetu Guarantee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="py-3.5 font-bold text-white">Plumbing (Tap / Leak repair)</td>
                    <td className="py-3.5 text-brand-400 font-semibold">₹199 fixed</td>
                    <td className="py-3.5">₹249/hr</td>
                    <td className="py-3.5 text-slate-400">₹400 - ₹800 (arbitrary)</td>
                    <td className="py-3.5 text-emerald-400 font-semibold">Verified ID + 4-digit OTP</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-bold text-white">Electrical (MCB / Switchboard)</td>
                    <td className="py-3.5 text-brand-400 font-semibold">₹149 fixed</td>
                    <td className="py-3.5">₹220/hr</td>
                    <td className="py-3.5 text-slate-400">₹350 - ₹700 (random)</td>
                    <td className="py-3.5 text-emerald-400 font-semibold">ITI Diploma Checked</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-bold text-white">Carpentry (Locks / Furniture)</td>
                    <td className="py-3.5 text-brand-400 font-semibold">₹249 fixed</td>
                    <td className="py-3.5">₹350/hr</td>
                    <td className="py-3.5 text-slate-400">₹600 - ₹1200 (unpredictable)</td>
                    <td className="py-3.5 text-emerald-400 font-semibold">Itemized Parts Receipt</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-bold text-white">Appliance (AC / Refrigerator)</td>
                    <td className="py-3.5 text-brand-400 font-semibold">₹199 fixed</td>
                    <td className="py-3.5">₹399/hr</td>
                    <td className="py-3.5 text-slate-400">₹500 inspection + hidden fees</td>
                    <td className="py-3.5 text-emerald-400 font-semibold">Original parts invoice</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {bookingWorker && (
        <BookingModal
          worker={bookingWorker}
          isOpen={!!bookingWorker}
          onClose={() => setBookingWorker(null)}
          onBookingSuccess={(b) => {
            setBookingSuccessMsg(`Booking #${b.bookingNumber} successfully created! Track in your dashboard.`);
            navigate('/customer/dashboard');
          }}
        />
      )}
    </div>
  );
};


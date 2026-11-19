import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { StarRating } from '../components/common/StarRating';
import { Badge } from '../components/common/Badge';
import { BookingModal } from '../components/common/BookingModal';
import { 
  Filter, 
  Search, 
  MapPin, 
  ShieldCheck, 
  SlidersHorizontal, 
  RotateCcw, 
  Check, 
  ArrowRight, 
  Scale, 
  X, 
  CheckCircle2, 
  Wrench,
  Compass,
  Navigation,
  Bike,
  Radio,
  Clock
} from 'lucide-react';

const PRESET_CUSTOMER_LOCATIONS = [
  { name: 'Hauz Khas Enclave, South Delhi', lat: 28.5494, lon: 77.2001 },
  { name: 'Malviya Nagar, South Delhi', lat: 28.5355, lon: 77.2100 },
  { name: 'Connaught Place, Central Delhi', lat: 28.6304, lon: 77.2177 },
  { name: 'Rajouri Garden, West Delhi', lat: 28.6415, lon: 77.1209 },
  { name: 'Sector 62, Noida', lat: 28.6270, lon: 77.3620 },
  { name: 'Sector 18 Atta Market, Noida', lat: 28.5700, lon: 77.3200 },
  { name: 'DLF Cyber City, Gurugram', lat: 28.4900, lon: 77.0900 }
];

export const WorkerSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialCity = searchParams.get('city') || '';

  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Customer Location state for Uber/Ola Proximity Matching
  const [customerLocation, setCustomerLocation] = useState({
    name: 'Hauz Khas Enclave, South Delhi',
    lat: 28.5494,
    lon: 77.2001
  });
  const [detectingGPS, setDetectingGPS] = useState(false);
  const [maxDistanceKm, setMaxDistanceKm] = useState('');

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxRate, setMaxRate] = useState(500);
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest', 'rating', 'experience', 'price'

  // Comparison State
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Booking modal
  const [bookingWorker, setBookingWorker] = useState(null);

  useEffect(() => {
    api.categories.getAll().then((res) => {
      if (res && res.data) setCategories(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [selectedCategory, selectedCity, verifiedOnly, availableOnly, maxRate, customerLocation, maxDistanceKm, sortBy]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await api.workers.search({
        category: selectedCategory,
        city: selectedCity,
        verifiedOnly,
        availableOnly,
        maxRate,
        customerLat: customerLocation?.lat,
        customerLon: customerLocation?.lon,
        maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : null,
        sortByDistance: sortBy === 'nearest'
      });
      if (res && res.data) {
        setWorkers(res.data);
      }
    } catch (err) {
      console.error('Failed to search workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGPS(false);
        const { latitude, longitude } = pos.coords;
        setCustomerLocation({
          name: `GPS Detected (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
          lat: +latitude.toFixed(4),
          lon: +longitude.toFixed(4)
        });
      },
      (err) => {
        setDetectingGPS(false);
        alert('Could not get GPS position: ' + err.message + '. You can choose a locality from the dropdown.');
      },
      { timeout: 8000 }
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setMaxRate(500);
    setMaxDistanceKm('');
    setSortBy('nearest');
    setSearchParams({});
  };

  // Toggle compare item
  const toggleCompare = (worker) => {
    if (compareList.some((w) => w.id === worker.id)) {
      setCompareList(compareList.filter((w) => w.id !== worker.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 workers at a time.');
        return;
      }
      setCompareList([...compareList, worker]);
    }
  };

  // Sorted workers
  const sortedWorkers = [...workers].sort((a, b) => {
    if (sortBy === 'nearest') {
      const distA = a.distanceKm != null ? a.distanceKm : 999;
      const distB = b.distanceKm != null ? b.distanceKm : 999;
      return distA - distB;
    }
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
    if (sortBy === 'price') return (a.visitingCharge || 0) - (b.visitingCharge || 0);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Trusted Local Service Providers
          </h1>
          <p className="text-sm text-slate-500">
            Compare prices, check verified credentials, and book local pros with transparent pricing.
          </p>
        </div>

        {/* Floating Quick Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => { setSelectedCategory(''); setSearchParams({}); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              !selectedCategory ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Trades
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat.slug ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Location & Proximity Bar (Uber/Ola Style) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-3xl shadow-xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/20 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/30">
            <Radio className="w-5 h-5 animate-pulse text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                Your Current Service Location
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-full font-mono">
                GPS MATCHING ACTIVE
              </span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">
              📍 {customerLocation.name}
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              Coords: [{customerLocation.lat}, {customerLocation.lon}] • Showing nearest available technicians first
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleDetectGPS}
            disabled={detectingGPS}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{detectingGPS ? 'Detecting GPS...' : 'Use My GPS'}</span>
          </button>

          <select
            value={customerLocation.name}
            onChange={(e) => {
              const loc = PRESET_CUSTOMER_LOCATIONS.find((l) => l.name === e.target.value);
              if (loc) setCustomerLocation(loc);
            }}
            className="text-xs font-semibold bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            {PRESET_CUSTOMER_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name} className="bg-slate-900 text-white">
                📍 {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filter Workers
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Distance Radius Filter (Uber/Ola) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-brand-600" /> Max Distance Radius
              </label>
              <select
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Any Distance (All NCR)</option>
                <option value="3">Within 3 km (Fastest ~10 min)</option>
                <option value="5">Within 5 km (~15 min)</option>
                <option value="10">Within 10 km (~30 min)</option>
                <option value="20">Within 20 km (Wider City)</option>
              </select>
            </div>

            {/* Locality / City Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Locality or City
              </label>
              <input
                type="text"
                placeholder="e.g. South Delhi, Noida, Hauz Khas"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* Max Visiting Fee Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
                <span>Max Visit Fee:</span>
                <span className="text-brand-600 font-bold">₹{maxRate}</span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="25"
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
                className="w-full accent-brand-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹100</span>
                <span>₹300</span>
                <span>₹500</span>
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="text-slate-700 font-medium">Verified Technicians Only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="text-slate-700 font-medium">Available Right Now</span>
              </label>
            </div>
          </div>

          {/* Comparison Bar (if items selected) */}
          {compareList.length > 0 && (
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-brand-600" />
                  Compare ({compareList.length}/3)
                </span>
                <button
                  onClick={() => setCompareList([])}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2">
                {compareList.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-brand-100">
                    <span className="font-semibold text-slate-800 truncate">{w.name}</span>
                    <button
                      onClick={() => toggleCompare(w)}
                      className="text-slate-400 hover:text-rose-500 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCompareModal(true)}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Compare Side-by-Side
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Results & Sorting */}
        <div className="lg:col-span-3 space-y-5">
          {/* Top Bar: Count & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 gap-3 text-xs">
            <span className="font-semibold text-slate-700">
              Showing <strong className="text-slate-900">{sortedWorkers.length}</strong> available service providers
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
              >
                <option value="nearest">Nearest First (Uber/Ola GPS) 📍</option>
                <option value="rating">Highest Rating ★</option>
                <option value="experience">Most Experience (Years)</option>
                <option value="price">Lowest Visiting Fee (₹)</option>
              </select>
            </div>
          </div>

          {/* Workers List */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              <Wrench className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-2" />
              Searching nearby verified technicians...
            </div>
          ) : sortedWorkers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">No Workers Found Matching Filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Try broadening your search locality or increasing the max visiting fee.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sortedWorkers.map((worker) => {
                const isComparing = compareList.some((w) => w.id === worker.id);

                return (
                  <div
                    key={worker.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Card Top: Worker info & Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={worker.avatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                            alt={worker.name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500/20"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-slate-900 text-base">{worker.name}</h3>
                              {worker.verified && (
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Worker" />
                              )}
                            </div>
                            <p className="text-xs font-bold text-brand-600">{worker.categoryName}</p>
                            <p className="text-[11px] text-slate-400">{worker.experienceYears} Years Experience</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge status={worker.available ? 'ONLINE' : 'OFFLINE'} size="xs" />
                          <div className="flex items-center gap-1 text-xs mt-1.5 justify-end">
                            <StarRating rating={worker.rating || 5} size="w-3.5 h-3.5" />
                            <span className="font-bold text-slate-900">{worker.rating}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">({worker.completedJobsCount} jobs completed)</span>
                        </div>
                      </div>

                      {/* Uber/Ola Live Distance & ETA Badge */}
                      {worker.distanceKm != null ? (
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-orange-50 border border-brand-200/80 text-brand-900 text-xs">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>{worker.distanceKm} km away</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> ~{worker.estimatedArrivalMinutes || 6} min ETA
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-brand-200 text-brand-700">
                            {worker.distanceKm <= 2 ? 'Super Close' : worker.distanceKm <= 6 ? 'Nearby' : 'NCR Region'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{worker.currentLocationName || worker.serviceArea || worker.city}</span>
                        </div>
                      )}

                      {/* Bio */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {worker.bio}
                      </p>

                      {/* Service Area */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{worker.serviceArea || worker.city}</span>
                      </div>

                      {/* Transparent Price Card */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Visiting / Inspection</span>
                          <span className="font-bold text-slate-900 text-sm">₹{worker.visitingCharge}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Hourly Labor Rate</span>
                          <span className="font-bold text-slate-900 text-sm">₹{worker.hourlyRate}/hr</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => toggleCompare(worker)}
                        className={`p-2 rounded-xl border text-xs font-medium transition ${
                          isComparing
                            ? 'bg-brand-50 border-brand-500 text-brand-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Compare with other workers"
                      >
                        <Scale className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/workers/${worker.id}`}
                        className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                      >
                        Profile & Reviews
                      </Link>

                      <button
                        onClick={() => setBookingWorker(worker)}
                        className="flex-1 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
                      >
                        Book Service
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && compareList.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-lg">Compare Workers Side-by-Side</h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 text-left font-semibold text-slate-400 w-1/4">Criteria</th>
                    {compareList.map((w) => (
                      <th key={w.id} className="py-3 text-center font-bold text-slate-900">
                        <img
                          src={w.avatarUrl}
                          alt={w.name}
                          className="w-12 h-12 rounded-xl object-cover mx-auto mb-2 ring-2 ring-brand-500/20"
                        />
                        {w.name}
                        <span className="block text-[11px] font-normal text-brand-600">{w.categoryName}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 font-semibold text-slate-600">Verification Status</td>
                    {compareList.map((w) => (
                      <td key={w.id} className="py-3 text-center">
                        <Badge status={w.verified ? 'VERIFIED' : 'PENDING'} size="xs" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-600">Customer Rating</td>
                    {compareList.map((w) => (
                      <td key={w.id} className="py-3 text-center font-bold text-slate-800">
                        ★ {w.rating} / 5.0 ({w.totalReviews} reviews)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-600">Doorstep Visiting Fee</td>
                    {compareList.map((w) => (
                      <td key={w.id} className="py-3 text-center font-bold text-brand-600 text-sm">
                        ₹{w.visitingCharge}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-600">Hourly Labor Rate</td>
                    {compareList.map((w) => (
                      <td key={w.id} className="py-3 text-center font-bold text-slate-900">
                        ₹{w.hourlyRate}/hr
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-600">Emergency Surcharge</td>
                    {compareList.map((w) => (
                      <td key={w.id} className="py-3 text-center text-slate-600">
                        +₹{w.emergencyCharge || 150}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-600">Experience</td>
                    {compareList.map((w) => (
                      <td key={w.id} className="py-3 text-center font-medium text-slate-700">
                        {w.experienceYears} Years
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-600">Jobs Completed</td>
                    {compareList.map((w) => (
                      <td key={w.id} className="py-3 text-center font-medium text-slate-700">
                        {w.completedJobsCount} Jobs
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-600">Action</td>
                    {compareList.map((w) => (
                      <td key={w.id} className="py-3 text-center">
                        <button
                          onClick={() => {
                            setShowCompareModal(false);
                            setBookingWorker(w);
                          }}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs"
                        >
                          Book Now
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Booking Drawer */}
      {bookingWorker && (
        <BookingModal
          worker={bookingWorker}
          customerCoords={customerLocation}
          isOpen={!!bookingWorker}
          onClose={() => setBookingWorker(null)}
          onBookingSuccess={(b) => {
            alert(`Booking #${b.bookingNumber} confirmed! Check your dashboard for updates.`);
          }}
        />
      )}
    </div>
  );
};


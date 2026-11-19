import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, MapPin, Bike, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Compass, RefreshCw, Radio } from 'lucide-react';
import { api } from '../../services/api';

export const LiveMapTracker = ({ booking }) => {
  const [data, setData] = useState(booking);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const workerMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  // Fallback default coordinates if not present (Delhi NCR)
  const customerLat = data.customerLatitude || 28.5494;
  const customerLon = data.customerLongitude || 77.2001;
  const workerLat = data.workerLatitude || 28.5550;
  const workerLon = data.workerLongitude || 77.2060;

  const distanceKm = data.distanceKm != null ? data.distanceKm : 1.2;
  const etaMins = data.estimatedArrivalMinutes != null ? data.estimatedArrivalMinutes : 5;
  const isCompleted = data.status === 'COMPLETED';
  const isNearby = distanceKm <= 0.5;
  const hasArrived = distanceKm <= 0.1;

  // Poll for live location updates when booking is active
  useEffect(() => {
    setData(booking);
  }, [booking]);

  useEffect(() => {
    if (data.status === 'COMPLETED' || data.status === 'CANCELLED' || data.status === 'REJECTED') {
      return;
    }

    const pollTracking = async () => {
      try {
        const res = await api.bookings.getLiveTracking(data.id);
        if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        // Silent catch during periodic background polling
      }
    };

    const interval = setInterval(pollTracking, 3000);
    return () => clearInterval(interval);
  }, [data.id, data.status]);

  // Leaflet Map Initialization and Layer updates
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Custom modern SVG icons using L.divIcon
    const workerIcon = L.divIcon({
      className: 'custom-worker-div-icon',
      html: `
        <div style="position:relative; width:40px; height:40px; background:#f97316; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; box-shadow:0 0 16px rgba(249,115,22,0.8); border:3px solid #ffffff;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
          </svg>
          <span style="position:absolute; top:-2px; right:-2px; width:12px; height:12px; background:#22c55e; border:2px solid #ffffff; border-radius:50%; box-shadow:0 0 8px #22c55e;"></span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });

    const customerIcon = L.divIcon({
      className: 'custom-customer-div-icon',
      html: `
        <div style="position:relative; width:38px; height:38px; background:#0284c7; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; box-shadow:0 0 16px rgba(2,132,199,0.7); border:3px solid #ffffff;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -19]
    });

    // Create map if not yet initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [(workerLat + customerLat) / 2, (workerLon + customerLon) / 2],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // Clean OpenStreetMap CartoDB Positron / OSM tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Customer Marker
      const cMarker = L.marker([customerLat, customerLon], { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<b>Your Address</b><br/>${data.address || 'Service Location'}`);

      // Worker Marker
      const wMarker = L.marker([workerLat, workerLon], { icon: workerIcon })
        .addTo(map)
        .bindPopup(`<b>${data.workerName || 'Technician'}</b><br/>Live Location`);

      // Polyline route
      const poly = L.polyline([[workerLat, workerLon], [customerLat, customerLon]], {
        color: '#f97316',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(map);

      // Fit bounds nicely with padding
      map.fitBounds([[workerLat, workerLon], [customerLat, customerLon]], {
        padding: [50, 50],
        maxZoom: 16
      });

      mapInstanceRef.current = map;
      customerMarkerRef.current = cMarker;
      workerMarkerRef.current = wMarker;
      polylineRef.current = poly;
    } else {
      // Smoothly update marker coordinates and polyline
      const map = mapInstanceRef.current;
      if (workerMarkerRef.current) {
        workerMarkerRef.current.setLatLng([workerLat, workerLon]);
      }
      if (customerMarkerRef.current) {
        customerMarkerRef.current.setLatLng([customerLat, customerLon]);
      }
      if (polylineRef.current) {
        polylineRef.current.setLatLngs([[workerLat, workerLon], [customerLat, customerLon]]);
      }
    }

    return () => {
      // Map instance is kept until unmount
    };
  }, [customerLat, customerLon, workerLat, workerLon, data.address, data.workerName]);

  // Clean unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(
        [[workerLat, workerLon], [customerLat, customerLon]],
        { padding: [50, 50], maxZoom: 16 }
      );
    }
  };

  const handleFocusWorker = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([workerLat, workerLon], 16, { animate: true });
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.bookings.getLiveTracking(data.id);
      if (res?.data) {
        setData(res.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative">
      {/* Top Header Bar */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              Live Worker GPS Radar
              <span className="bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                UBER / OLA TRACKING
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {data.workerLocationName ? `Near ${data.workerLocationName}` : 'Broadcasting real-time coordinates'}
            </p>
          </div>
        </div>

        {/* ETA & Distance Pill */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2.5 font-mono text-xs">
            <div className="flex items-center gap-1 text-brand-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{isCompleted ? 'Arrived' : `${etaMins} mins`}</span>
            </div>
            <span className="text-slate-500">|</span>
            <div className="flex items-center gap-1 text-slate-200 font-bold">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>{isCompleted ? 'Completed' : `${distanceKm} km away`}</span>
            </div>
          </div>

          <button
            onClick={handleManualRefresh}
            className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all ${
              isRefreshing ? 'animate-spin text-brand-400' : ''
            }`}
            title="Refresh GPS Signal"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Proximity Alerts Banner */}
      {isNearby && !isCompleted && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Technician Nearby!</strong> {data.workerName || 'Worker'} is less than <strong>500m away</strong>.
            </span>
          </div>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase">
            Arriving Soon
          </span>
        </div>
      )}

      {hasArrived && !isCompleted && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-2 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Technician has arrived at your address!</strong> Please share the 4-digit OTP only after satisfaction.
          </span>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Overlay Controls */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
          <button
            onClick={handleRecenter}
            className="bg-slate-900/90 hover:bg-slate-800 text-white p-2 rounded-xl border border-slate-700 shadow-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm transition-all"
            title="Recenter Full Route"
          >
            <Compass className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden sm:inline">Fit Route</span>
          </button>
          <button
            onClick={handleFocusWorker}
            className="bg-slate-900/90 hover:bg-slate-800 text-white p-2 rounded-xl border border-slate-700 shadow-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm transition-all"
            title="Focus Worker Bike"
          >
            <Bike className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Worker</span>
          </button>
        </div>

        {/* Floating Destination Address Pill on Map */}
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400">Destination Doorstep</p>
              <p className="text-white font-medium truncate">{data.address || 'Hauz Khas, New Delhi'}</p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-[11px] font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Active Live Ping</span>
          </div>
        </div>
      </div>
    </div>
  );
};

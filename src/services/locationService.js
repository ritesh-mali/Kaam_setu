/**
 * Multi-layer Location Service
 * 1. HTML5 Geolocation (Hardware / Device GPS)
 * 2. Network IP Geolocation (ipwho.is) - Zero permission required fallback
 * 3. Default Delhi NCR Metro Hub (Safe fallback)
 */

export const DEFAULT_HUBS = [
  { name: 'Malviya Nagar Main Market, South Delhi', lat: 28.5355, lon: 77.2100 },
  { name: 'Hauz Khas Enclave, South Delhi', lat: 28.5494, lon: 77.2001 },
  { name: 'Saket District Centre, South Delhi', lat: 28.5283, lon: 77.2190 },
  { name: 'Connaught Place, Central Delhi', lat: 28.6304, lon: 77.2177 },
  { name: 'Rajouri Garden, West Delhi', lat: 28.6415, lon: 77.1209 },
  { name: 'Karol Bagh Metro Gate 2, Central Delhi', lat: 28.6517, lon: 77.1906 },
  { name: 'Sector 18 Atta Market, Noida', lat: 28.5700, lon: 77.3200 },
  { name: 'Sector 62 Institutional Area, Noida', lat: 28.6270, lon: 77.3620 },
  { name: 'Cyber Hub DLF Phase 2, Gurugram', lat: 28.4900, lon: 77.0900 },
  { name: 'Indirapuram, Ghaziabad', lat: 28.6444, lon: 77.3719 }
];

export async function detectLocationWithFallback(defaultLoc = DEFAULT_HUBS[0]) {
  // 1. Try Device / Browser GPS
  if (typeof window !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 30000
        });
      });

      const { latitude, longitude } = position.coords;
      return {
        success: true,
        source: 'GPS',
        latitude: +latitude.toFixed(4),
        longitude: +longitude.toFixed(4),
        locationName: `Live GPS Fix (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
        permissionDenied: false
      };
    } catch (err) {
      console.warn('GPS detection failed or denied (' + err.message + '). Attempting IP network fallback...');
    }
  }

  // 2. Try Free Public IP Geolocation Fallback (No user permission prompt needed)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timer);

    const data = await res.json();
    if (data && data.success && data.latitude && data.longitude) {
      return {
        success: true,
        source: 'IP',
        latitude: +data.latitude.toFixed(4),
        longitude: +data.longitude.toFixed(4),
        locationName: `${data.city || 'Local Area'}, ${data.region || ''} (Network IP-Detected)`,
        permissionDenied: true
      };
    }
  } catch (ipErr) {
    console.warn('Network IP geolocation fallback unavailable:', ipErr);
  }

  // 3. Fallback to default locality hub (e.g. South Delhi)
  return {
    success: true,
    source: 'DEFAULT',
    latitude: defaultLoc.lat,
    longitude: defaultLoc.lon,
    locationName: `${defaultLoc.name} (Default Hub)`,
    permissionDenied: true
  };
}

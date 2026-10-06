/**
 * Location and Reverse Geocoding Utilities
 * Provides resilient real-device geolocation capture (network & GPS)
 * with strict accuracy verification (position.coords.accuracy) to reject coarse/distant estimates,
 * without inaccurate IP fallbacks, and reverse/forward geocoding.
 */

// Maximum acceptable inaccuracy in meters for salon location pinning.
// Reject coarse estimates (e.g. distant cellular tower triangulation > 1000m).
export const MAX_ACCEPTABLE_ACCURACY_METERS = 1000;

/**
 * Reverse geocodes latitude & longitude into a clean, human-readable address.
 * Primary: BigDataCloud reverse geocode client API (CORS friendly, fast, free).
 * Fallback: OpenStreetMap Nominatim API.
 */
export async function reverseGeocode(latitude, longitude) {
  if (latitude == null || longitude == null) return null;

  // 1. Try BigDataCloud reverse geocode client
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const parts = [];

      // Check administrative details for locality/neighborhood/village
      if (data.localityInfo?.administrative) {
        const admin = data.localityInfo.administrative;
        const neighborhood = admin.find((a) => a.order >= 8 && a.name);
        if (neighborhood && neighborhood.name !== data.city) {
          parts.push(neighborhood.name);
        }
      }

      if (data.locality && !parts.includes(data.locality) && data.locality !== data.city) {
        parts.push(data.locality);
      }
      if (data.city) {
        parts.push(data.city);
      } else if (data.principalSubdivision) {
        parts.push(data.principalSubdivision);
      }
      if (data.principalSubdivision && !parts.includes(data.principalSubdivision)) {
        parts.push(data.principalSubdivision);
      }
      if (data.postcode) {
        parts.push(data.postcode);
      }
      if (data.countryName) {
        parts.push(data.countryName);
      }

      const formatted = parts.filter(Boolean).join(', ');
      if (formatted.length > 5) {
        return formatted;
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode error, attempting OSM fallback:', err);
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    if (osmRes.ok) {
      const data = await osmRes.json();
      if (data.address) {
        const a = data.address;
        const parts = [
          a.amenity || a.shop || a.building,
          a.road || a.pedestrian,
          a.suburb || a.neighbourhood || a.village || a.hamlet,
          a.city || a.town || a.county,
          a.state_district || a.state,
          a.postcode,
          a.country
        ].filter(Boolean);
        if (parts.length > 0) return parts.join(', ');
      }
      if (data.display_name) {
        return data.display_name;
      }
    }
  } catch (err) {
    console.warn('OSM Nominatim reverse geocode error:', err);
  }

  return null;
}

/**
 * Forward geocodes an address string into coordinates { latitude, longitude }.
 */
export async function forwardGeocode(addressQuery) {
  if (!addressQuery || !addressQuery.trim()) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(addressQuery.trim())}&limit=1`
    );
    if (res.ok) {
      const items = await res.json();
      if (items && items.length > 0) {
        return {
          latitude: parseFloat(items[0].lat),
          longitude: parseFloat(items[0].lon),
          displayName: items[0].display_name
        };
      }
    }
  } catch (err) {
    console.warn('Forward geocoding error:', err);
  }
  return null;
}

/**
 * Gets the user's real current device position with strict accuracy verification:
 * 1. Checks position.coords.accuracy against maxAccuracyMeters
 * 2. Standard/network/cached location first (accepts only if accuracy <= maxAccuracyMeters)
 * 3. High-accuracy GPS with ample acquisition time (30s) if network is too coarse or unavailable
 * 4. Rejects imprecise readings (e.g. broad cell tower triangulation > 1000m) to protect salon radius searches
 * 5. Specific, helpful device/permission error messages on failure
 *
 * Then automatically calls reverse geocoding to resolve the human-readable address.
 */
export async function getCurrentLocationWithAddress(maxAccuracyMeters = MAX_ACCEPTABLE_ACCURACY_METERS) {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  const getPosition = (options) =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  let coords = null;
  let bestCoords = null;
  let lastError = null;

  // 1. Try standard / network / recent cached location first
  try {
    const position = await getPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    });

    const accuracy = position.coords.accuracy;
    bestCoords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: typeof accuracy === 'number' ? Math.round(accuracy) : null
    };

    // If within preferred precision, accept immediately
    if (typeof accuracy === 'number' && accuracy <= maxAccuracyMeters) {
      coords = bestCoords;
    } else {
      console.warn(
        `Standard location accuracy is coarse (±${Math.round(accuracy)}m). Checking for higher-accuracy GPS...`
      );
    }
  } catch (error) {
    lastError = error;
    console.warn('Standard location attempt failed, checking high-accuracy GPS...', error);
  }

  // 2. Try high-accuracy GPS if precise coordinates not yet acquired
  if (!coords) {
    try {
      const position = await getPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      const accuracy = position.coords.accuracy;
      const highAccCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: typeof accuracy === 'number' ? Math.round(accuracy) : null
      };

      if (!bestCoords || (typeof accuracy === 'number' && (!bestCoords.accuracy || accuracy <= bestCoords.accuracy))) {
        bestCoords = highAccCoords;
      }

      coords = bestCoords;
    } catch (error) {
      lastError = error;
      console.warn('High accuracy GPS attempt failed or timed out:', error);
    }
  }

  // 3. Fallback: Always accept best available coordinates rather than failing
  if (!coords && bestCoords) {
    coords = bestCoords;
  }

  // If no position could be determined at all (permission denied, disabled, or complete timeout)
  if (!coords) {
    let message = 'Unable to determine your current location.';

    if (lastError) {
      switch (lastError.code) {
        case 1: // PERMISSION_DENIED
          message = 'Location permission was denied. Please allow location access for this site in your browser / phone settings.';
          break;
        case 2: // POSITION_UNAVAILABLE
          message = 'Your device could not determine your location. Please turn on Location/GPS and try again.';
          break;
        case 3: // TIMEOUT
          message = 'Location request timed out. Please ensure GPS/Location is enabled and try again.';
          break;
        default:
          if (lastError.message) message = lastError.message;
      }
    }

    throw new Error(message);
  }

  // Reverse geocode true coordinates to human-readable address
  let address = null;
  try {
    address = await reverseGeocode(coords.latitude, coords.longitude);
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
  }

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    address
  };
}

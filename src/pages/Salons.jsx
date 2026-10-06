import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Pin, Compass, X } from 'lucide-react';
import api from '../config/api';
import SalonCard from '../components/SalonCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getCurrentLocationWithAddress } from '../utils/locationUtils';

const Salons = ({ onSelectSalon, searchTerm = '' }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isLight = theme === 'light';

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Coordinates: Prioritize customer's saved profile location, then cached localStorage
  const [coords, setCoords] = useState(() => {
    if (user?.latitude && user?.longitude) {
      return { latitude: user.latitude, longitude: user.longitude };
    }
    try {
      const saved = localStorage.getItem('user_coords');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Keep coords synced if user profile loads or is updated
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setCoords({ latitude: user.latitude, longitude: user.longitude });
    }
  }, [user?.latitude, user?.longitude]);

  // Search Radius filter (2km, 5km [default], 10km, 25km, 'ALL') persisted in localStorage
  const [selectedRadius, setSelectedRadius] = useState(() => {
    try {
      const saved = localStorage.getItem('selected_salon_radius');
      if (saved === 'ALL') return 'ALL';
      return saved ? Number(saved) : 5;
    } catch (e) {
      return 5;
    }
  });

  const coordsRef = useRef(coords);
  const searchTermRef = useRef(searchTerm);
  const selectedRadiusRef = useRef(selectedRadius);

  useEffect(() => {
    coordsRef.current = coords;
  }, [coords]);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    selectedRadiusRef.current = selectedRadius;
  }, [selectedRadius]);

  // Favorites / Pinned salons persisted in localStorage & synced with backend if authenticated
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorite_salons');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);

  const toggleFavorite = async (salonId, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(salonId);
      const updated = exists ? prev.filter((id) => id !== salonId) : [...prev, salonId];
      try {
        localStorage.setItem('favorite_salons', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save favorite salons to localStorage', err);
      }
      return updated;
    });

    try {
      await api.post(`/api/customer/my-salons/${salonId}/favorite`);
    } catch (err) {
      // ignore if unauthenticated guest
    }
  };

  const handleRadiusChange = (radius) => {
    setSelectedRadius(radius);
    try {
      localStorage.setItem('selected_salon_radius', String(radius));
    } catch (e) {}
    fetchSalons(coordsRef.current?.latitude, coordsRef.current?.longitude, searchTermRef.current, false, radius);
  };

  const fetchSalons = async (
    latitude = coordsRef.current?.latitude,
    longitude = coordsRef.current?.longitude,
    query = searchTermRef.current,
    isSilent = false,
    radius = selectedRadiusRef.current
  ) => {
    try {
      if (!isSilent) setLoading(true);
      setError('');
      let url = '/api/salons';

      if (query && query.trim()) {
        // Customer searched a particular salon!
        // Search globally across all salons (both nearby and far away) without distance restriction
        const q = encodeURIComponent(query.trim());
        if (latitude && longitude) {
          url = `/api/salons?name=${q}&latitude=${latitude}&longitude=${longitude}&_t=${Date.now()}`;
        } else {
          url = `/api/salons?name=${q}&address=${q}&_t=${Date.now()}`;
        }
      } else if (latitude && longitude && radius !== 'ALL') {
        // Normal browsing mode: STRICTLY nearby salons within selected radius
        url = `/api/salons?latitude=${latitude}&longitude=${longitude}&radiusKm=${radius || 5}&_t=${Date.now()}`;
      } else if (latitude && longitude) {
        // Browsing with 'ALL' radius selected
        url = `/api/salons?latitude=${latitude}&longitude=${longitude}&_t=${Date.now()}`;
      } else {
        url = `/api/salons?_t=${Date.now()}`;
      }

      const response = await api.get(url, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const results = response.data.data || [];
      setSalons(results);
    } catch (err) {
      if (!isSilent) setError('Failed to fetch salons. Please try again.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const getGeoLocation = async (isInitial = false) => {
    try {
      const loc = await getCurrentLocationWithAddress();
      const newCoords = { latitude: loc.latitude, longitude: loc.longitude };
      setCoords(newCoords);
      try {
        localStorage.setItem('user_coords', JSON.stringify(newCoords));
      } catch (e) {}
      fetchSalons(loc.latitude, loc.longitude, searchTermRef.current, !isInitial, selectedRadiusRef.current);
    } catch (error) {
      console.warn('Geolocation access unavailable or denied', error);
      if (isInitial && !coordsRef.current) {
        fetchSalons(null, null, searchTermRef.current, false, selectedRadiusRef.current);
      }
    }
  };

  useEffect(() => {
    if (coords) {
      // 1. Instant load from customer's saved/cached location: strictly fetch nearby salons for selected radius
      fetchSalons(coords.latitude, coords.longitude, searchTermRef.current, false, selectedRadius);
      // Saved location exists: DO NOT trigger device GPS on refresh!
    } else {
      // 1. Only if customer has NO saved or cached coordinates at all, detect initial GPS
      getGeoLocation(true);
    }

    // Detect GPS location if customer grants permission for the first time
    let permissionStatus = null;
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        permissionStatus = status;
        status.onchange = () => {
          // Only auto-detect if coordinates are completely missing
          if (status.state === 'granted' && !coordsRef.current && !user?.latitude) {
            getGeoLocation(false);
          }
        };
      }).catch((e) => console.warn('Geolocation permission query error:', e));
    }

    const interval = setInterval(() => {
      fetchSalons(coordsRef.current?.latitude, coordsRef.current?.longitude, searchTermRef.current, true, selectedRadiusRef.current);
    }, 5000);

    return () => {
      clearInterval(interval);
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  useEffect(() => {
    // Debounced fetch when search term changes from header
    const timer = setTimeout(() => {
      fetchSalons(coords?.latitude, coords?.longitude, searchTerm, false, selectedRadius);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Priority sorting: Pinned salons always appear at the top
  const displayedSalons = salons
    .filter((salon) => !filterFavoritesOnly || favorites.includes(salon.id))
    .sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-20 animate-fade-in">

      {error && (
        <div className={`p-3 border rounded-xl text-xs font-semibold ${
          isLight
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-red-500/10 border-red-500/25 text-red-400'
        }`}>
          {error}
        </div>
      )}

      {/* Search active notice */}
      {searchTerm && (
        <div className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border shadow-sm animate-fade-in transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
            : 'bg-slate-900/70 border-slate-800 text-slate-100 shadow-slate-950/40'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl shrink-0 ${
              isLight ? 'bg-violet-100 text-violet-700' : 'bg-violet-500/15 text-violet-400'
            }`}>
              <Search className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`text-xs sm:text-sm font-bold block truncate ${
                isLight ? 'text-slate-900' : 'text-slate-100'
              }`}>
                Search results for "{searchTerm}"
              </span>
              <span className={`text-[10px] sm:text-xs block truncate ${
                isLight ? 'text-slate-500 font-medium' : 'text-slate-400'
              }`}>
                Showing all matching salons across all distances
              </span>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border shrink-0 ${
            isLight
              ? 'bg-violet-50 border-violet-200 text-violet-700 shadow-xs'
              : 'text-violet-400 bg-violet-500/10 border-violet-500/20'
          }`}>
            {salons.length} found
          </span>
        </div>
      )}

      {/* Nearby Salons Radius Bar (Visible when not actively searching) */}
      {!searchTerm && (
        <div className={`flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl border shadow-sm transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
            : 'bg-slate-900/60 border-slate-800 text-slate-100 shadow-slate-950/40'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl shrink-0 ${
              isLight ? 'bg-violet-100 text-violet-700' : 'bg-violet-500/15 text-violet-400'
            }`}>
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`text-xs sm:text-sm font-bold block truncate ${
                isLight ? 'text-slate-900' : 'text-slate-100'
              }`}>
                Nearby Salons Radius
              </span>
              <span className={`text-[10px] sm:text-xs block truncate ${
                isLight ? 'text-slate-500 font-medium' : 'text-slate-400'
              }`}>
                {coords
                  ? `Showing salons within ${selectedRadius === 'ALL' ? 'all distances' : selectedRadius + ' km'}`
                  : 'Detecting GPS to show nearby salons (Default 5 km)'}
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-xl border shrink-0 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-850'
          }`}>
            {[2, 5, 10, 25].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => handleRadiusChange(km)}
                className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRadius === km
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {km} km
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleRadiusChange('ALL')}
              className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRadius === 'ALL'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              All
            </button>
          </div>
        </div>
      )}

      {/* Salons List Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20 min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
        </div>
      ) : salons.length > 0 ? (
        <div className="space-y-4">
          {/* Quick Filter tabs: All Salons vs Pinned Salons (visible when at least 1 salon is pinned) */}
          {favorites.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterFavoritesOnly(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !filterFavoritesOnly
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                    : isLight
                      ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Salons ({salons.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterFavoritesOnly(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterFavoritesOnly
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                    : isLight
                      ? 'bg-white text-slate-600 hover:text-violet-700 border border-slate-200 shadow-xs'
                      : 'bg-slate-900/80 text-slate-400 hover:text-violet-300 border border-slate-800'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${filterFavoritesOnly ? 'fill-white text-white rotate-45' : 'fill-violet-500 text-violet-500'}`} />
                <span>Pinned ({favorites.length})</span>
              </button>
            </div>
          )}

          {displayedSalons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedSalons.map((salon) => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  isFavorite={favorites.includes(salon.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={() => onSelectSalon(salon.id)}
                />
              ))}
            </div>
          ) : (
            <div className={`p-8 text-center rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800'
            }`}>
              <p className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                No pinned salons found
              </p>
              <button
                type="button"
                onClick={() => setFilterFavoritesOnly(false)}
                className="mt-3 text-xs text-violet-600 hover:underline font-semibold cursor-pointer"
              >
                View all salons
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className={`flex-1 flex flex-col items-center justify-center text-center py-14 px-4 my-auto min-h-[320px] rounded-2xl border p-6 transition-all ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900/30 border-slate-850'
        }`}>
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 shadow-xl ${
            isLight
              ? 'bg-violet-50 border-violet-200 text-violet-600 shadow-slate-200/50'
              : 'bg-slate-900 border-slate-850 text-violet-400 shadow-slate-950/50'
          }`}>
            {searchTerm ? <Search className="w-8 h-8 opacity-80" /> : <Compass className="w-8 h-8 opacity-80" />}
          </div>

          <p className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            {searchTerm
              ? `No salons found matching "${searchTerm}"`
              : selectedRadius === 'ALL'
              ? 'No registered salons found'
              : `No salons found within ${selectedRadius} km`}
          </p>

          <p className={`text-xs mt-1.5 max-w-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {searchTerm
              ? 'Check the spelling or try searching for another salon name, area, town, or city.'
              : selectedRadius !== 'ALL'
              ? `There are no salons registered within ${selectedRadius} km of your location. Try expanding the distance radius below or search for a specific salon.`
              : 'No salons are currently registered on the platform.'}
          </p>

          {/* Quick distance expand buttons */}
          {!searchTerm && selectedRadius !== 'ALL' && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              {selectedRadius < 10 && (
                <button
                  type="button"
                  onClick={() => handleRadiusChange(10)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all hover:scale-105 ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                  }`}
                >
                  Try 10 km
                </button>
              )}
              {selectedRadius < 25 && (
                <button
                  type="button"
                  onClick={() => handleRadiusChange(25)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all hover:scale-105 ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                  }`}
                >
                  Try 25 km
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRadiusChange('ALL')}
                className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold cursor-pointer shadow-md shadow-violet-600/30 transition-all hover:scale-105"
              >
                Show All Salons
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Salons;

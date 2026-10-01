import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Pin } from 'lucide-react';
import api from '../config/api';
import SalonCard from '../components/SalonCard';

const Salons = ({ onSelectSalon, searchTerm = '' }) => {
  const { t } = useTranslation();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');

  const coordsRef = useRef(coords);
  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    coordsRef.current = coords;
  }, [coords]);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  // Favorites / Pinned salons persisted in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorite_salons');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);

  const toggleFavorite = (salonId, e) => {
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
  };

  const fetchSalons = async (latitude = null, longitude = null, query = searchTermRef.current, isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError('');
      let url = '/api/salons';

      if (query) {
        url = `/api/salons?name=${encodeURIComponent(query)}&address=${encodeURIComponent(query)}&_t=${Date.now()}`;
      } else if (latitude && longitude) {
        url = `/api/salons?latitude=${latitude}&longitude=${longitude}&radiusKm=50&_t=${Date.now()}`;
      } else {
        url = `/api/salons?_t=${Date.now()}`;
      }

      const response = await api.get(url, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      setSalons(response.data.data || []);
    } catch (err) {
      if (!isSilent) setError('Failed to fetch salons. Please try again.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        fetchSalons(latitude, longitude, searchTermRef.current);
      },
      (error) => {
        console.warn('Geolocation access denied', error);
        // Fallback to fetch without coords
        fetchSalons(null, null, searchTermRef.current);
      }
    );
  };

  useEffect(() => {
    // Initial fetch using geolocation or search term
    getGeoLocation();

    const interval = setInterval(() => {
      fetchSalons(coordsRef.current?.latitude, coordsRef.current?.longitude, searchTermRef.current, true);
    }, 4000); // 4-second live refresh

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Debounced fetch when search term changes from header
    const timer = setTimeout(() => {
      fetchSalons(coords?.latitude, coords?.longitude, searchTerm);
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
        <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}


      {/* Salons list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20 min-h-[350px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
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
                    : 'bg-slate-900/80 text-slate-400 hover:text-violet-300 border border-slate-800'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${filterFavoritesOnly ? 'fill-white text-white rotate-45' : 'fill-violet-400 text-violet-400'}`} />
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
            <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
              <p className="text-sm font-bold text-slate-300">No pinned salons found matching your search</p>
              <button
                type="button"
                onClick={() => setFilterFavoritesOnly(false)}
                className="mt-3 text-xs text-violet-400 hover:underline font-semibold cursor-pointer"
              >
                View all salons
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4 my-auto min-h-[350px]">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-4 text-violet-400 shadow-xl shadow-slate-950/50">
            <Search className="w-8 h-8 opacity-80" />
          </div>
          <p className="font-bold text-slate-200 text-base">No salons found</p>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
            Try resetting search filters or checking GPS permission.
          </p>
        </div>
      )}
    </div>
  );
};

export default Salons;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Mail, 
  Languages, 
  MapPin, 
  LogOut, 
  Loader, 
  CheckCircle, 
  Smartphone, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  RefreshCw, 
  X, 
  Store, 
  Bell, 
  BellOff, 
  Star,
  ChevronDown,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import api from '../config/api';
import { getCurrentLocationWithAddress, reverseGeocode } from '../utils/locationUtils';

const Profile = () => {
  const { t } = useTranslation();
  const { user, logout, updateProfileInContext } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const [name, setName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState(user?.language || 'ENGLISH');
  const [latitude, setLatitude] = useState(user?.latitude || '');
  const [longitude, setLongitude] = useState(user?.longitude || '');
  const [locating, setLocating] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [gpsAutoDetected, setGpsAutoDetected] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied'

  // Keep state synced if user context updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobileNumber(user.mobileNumber || '');
      setEmail(user.email || '');
      setLanguage(user.language || 'ENGLISH');
      if (user.latitude != null) setLatitude(user.latitude);
      if (user.longitude != null) setLongitude(user.longitude);
    }
  }, [user]);

  // GPS Location Detection Handler (Triggered on click, or on initial grant if no saved location)
  const getGeoLocation = async (isAuto = false) => {
    setLocating(true);
    try {
      const loc = await getCurrentLocationWithAddress();
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      setGpsAutoDetected(true);
      setPermissionState('granted');

      if (loc.address) {
        setResolvedAddress(loc.address);
      }
    } catch (error) {
      console.warn('Geolocation error:', error);
      if (
        error?.message?.toLowerCase().includes('denied') || 
        error?.message?.toLowerCase().includes('permission')
      ) {
        setPermissionState('denied');
      }
      if (!isAuto) {
        alert(error.message || 'Could not resolve location coordinates');
      }
    } finally {
      setLocating(false);
    }
  };

  // On mount: Fetch the saved customer profile from backend to ensure latest saved location is populated
  useEffect(() => {
    const fetchSavedProfile = async () => {
      try {
        const res = await api.get('/api/customer/profile');
        if (res.data?.data) {
          const profile = res.data.data;
          if (profile.name) setName(profile.name);
          if (profile.mobileNumber) setMobileNumber(profile.mobileNumber);
          if (profile.email) setEmail(profile.email);
          if (profile.language) setLanguage(profile.language);
          if (profile.latitude != null) setLatitude(profile.latitude);
          if (profile.longitude != null) setLongitude(profile.longitude);
          updateProfileInContext(profile);
        }
      } catch (err) {
        console.warn('Could not fetch saved profile:', err);
      }
    };

    fetchSavedProfile();
  }, []);

  // Reverse geocode whenever latitude & longitude are available
  useEffect(() => {
    if (latitude && longitude && !resolvedAddress) {
      reverseGeocode(latitude, longitude).then((addr) => {
        if (addr) setResolvedAddress(addr);
      });
    }
  }, [latitude, longitude]);

  // My Salons & Tenant Notification State
  const [mySalons, setMySalons] = useState([]);
  const [loadingMySalons, setLoadingMySalons] = useState(false);

  const fetchMySalons = async () => {
    try {
      setLoadingMySalons(true);
      const res = await api.get('/api/customer/my-salons');
      setMySalons(res.data.data || []);
    } catch (err) {
      console.warn('Could not load My Salons:', err);
    } finally {
      setLoadingMySalons(false);
    }
  };

  useEffect(() => {
    fetchMySalons();
  }, []);

  const handleToggleSalonNotifications = async (salonId, currentEnabled) => {
    const nextVal = !currentEnabled;
    // Optimistic UI update
    setMySalons((prev) =>
      prev.map((item) =>
        item.salonId === salonId ? { ...item, notificationsEnabled: nextVal } : item
      )
    );
    try {
      await api.put(`/api/customer/my-salons/${salonId}/notifications?enabled=${nextVal}`);
    } catch (err) {
      // Revert on error
      setMySalons((prev) =>
        prev.map((item) =>
          item.salonId === salonId ? { ...item, notificationsEnabled: currentEnabled } : item
        )
      );
    }
  };

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Mobile Update Modal States
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1: Enter mobile, 2: Verify OTP
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!newMobileNumber.trim() || newMobileNumber.trim().length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSending(true);
    setOtpError('');
    setOtpMessage('');
    try {
      const res = await api.post('/api/auth/send-otp', { mobileNumber: newMobileNumber.trim() });
      const generatedOtp = res.data.data;
      setOtpStep(2);
      if (generatedOtp) {
        setOtp(generatedOtp);
      }
      setOtpMessage(`OTP Code sent to +91 ${newMobileNumber.trim()}: ${generatedOtp || '123456'}`);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyAndUpdateMobile = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError('Please enter 6-digit OTP');
      return;
    }
    setOtpVerifying(true);
    setOtpError('');
    try {
      const res = await api.put('/api/customer/update-mobile', {
        newMobileNumber: newMobileNumber.trim(),
        otp: otp.trim()
      });
      updateProfileInContext(res.data.data);
      setMobileNumber(res.data.data.mobileNumber);
      setSuccess(true);
      setMobileModalOpen(false);
      setNewMobileNumber('');
      setOtp('');
      setOtpStep(1);
      setOtpMessage('');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        name,
        mobileNumber: mobileNumber ? mobileNumber.trim() : null,
        email: email || null,
        language,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      };

      const response = await api.put('/api/customer/profile', payload);
      // Update profile in AuthContext
      updateProfileInContext(response.data.data);
      if (response.data.data?.latitude && response.data.data?.longitude) {
        try {
          localStorage.setItem('user_coords', JSON.stringify({
            latitude: response.data.data.latitude,
            longitude: response.data.data.longitude
          }));
        } catch (e) {}
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details');
    } finally {
      setLoading(false);
    }
  };

  // Initials generator for avatar
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 sm:space-y-6 pb-24 sm:pb-28 animate-fade-in px-0 sm:px-2">
      {/* Mobile-Friendly Profile Summary Header */}
      <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all ${
        isLight
          ? 'bg-gradient-to-br from-white via-violet-50/40 to-white border-slate-200/90 shadow-sm'
          : 'bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-violet-950/20 border-slate-800/80 shadow-lg'
      }`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
          {/* Avatar Icon */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-lg shadow-violet-500/25 ring-4 ring-violet-500/15">
              {getInitials(name || user?.name)}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-950" title="Active" />
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className={`text-lg sm:text-xl font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {name || user?.name || t('profile.title')}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-violet-400" />
                Customer
              </span>
            </div>

            <p className={`text-xs font-medium flex items-center justify-center sm:justify-start gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <Smartphone className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span>{mobileNumber ? `+91 ${mobileNumber}` : 'No phone linked'}</span>
            </p>

            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              Manage your personal settings, language, and salon notifications
            </p>
          </div>
        </div>
      </div>

      {/* Main Account Settings Card Form */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-7 border transition-all ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-sm'
          : 'glass-card border-slate-800/80 shadow-xl'
      }`}>
        <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-5">
          {/* Header Title inside card */}
          <div className={`border-b pb-3 ${isLight ? 'border-slate-100' : 'border-slate-800/80'}`}>
            <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <User className="w-4 h-4 text-violet-500" />
              <span>Personal Information</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Keep your contact details up to date for booking confirmations
            </p>
          </div>

          {/* Feedback Alerts */}
          {success && (
            <div className="p-3 sm:p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-3 sm:p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Mobile Number with Update & OTP Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {t('profile.mobile')}
              </label>
              <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  disabled
                  value={mobileNumber ? `+91 ${mobileNumber}` : ''}
                  className={`w-full rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs sm:text-sm font-semibold cursor-not-allowed border ${
                    isLight 
                      ? 'bg-slate-100 border-slate-200 text-slate-700' 
                      : 'bg-slate-950/70 border-slate-800 text-slate-300'
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileModalOpen(true);
                  setOtpStep(1);
                  setOtpError('');
                  setOtpMessage('');
                  setNewMobileNumber('');
                  setOtp('');
                }}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-550 hover:to-fuchsia-550 text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Update Mobile</span>
              </button>
            </div>
            <p className={`text-[10px] sm:text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Requires 6-digit OTP verification to change phone number
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              {t('profile.name')} *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className={`w-full border rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-violet-500' 
                    : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-violet-500'
                }`}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full border rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-violet-500' 
                    : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-violet-500'
                }`}
              />
            </div>
          </div>

          {/* Preferred Language Selector */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Preferred Language
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Languages className="w-4 h-4" />
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full border rounded-xl py-2.5 sm:py-3 pl-10 pr-10 text-xs sm:text-sm font-semibold transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-violet-500' 
                    : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-violet-500'
                }`}
              >
                <option value="ENGLISH" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>English</option>
                <option value="HINDI" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>हिन्दी (Hindi)</option>
                <option value="MARATHI" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>मराठी (Marathi)</option>
                <option value="TAMIL" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>தமிழ் (Tamil)</option>
                <option value="TELUGU" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>తెలుగు (Telugu)</option>
                <option value="KANNADA" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>ಕನ್ನಡ (Kannada)</option>
                <option value="GUJARATI" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>ગુજરાતી (Gujarati)</option>
                <option value="BENGALI" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>বাংলা (Bengali)</option>
                <option value="PUNJABI" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Coordinates Grid (Mobile Responsive 1-col on small mobile, 2-cols on tablet/desktop) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Location Coordinates
              </label>
              {gpsAutoDetected || permissionState === 'granted' ? (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  GPS Auto-Detected
                </span>
              ) : permissionState === 'denied' ? (
                <span className="text-[10px] font-medium text-amber-500 flex items-center gap-1">
                  Permission Denied
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
              <div className="space-y-1">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Latitude</span>
                <input
                  type="number"
                  step="0.0001"
                  disabled
                  value={latitude}
                  placeholder="0.0000"
                  className={`w-full rounded-xl py-2 px-3 text-xs sm:text-sm font-mono cursor-not-allowed border ${
                    isLight 
                      ? 'bg-slate-100 border-slate-200 text-slate-600' 
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Longitude</span>
                <input
                  type="number"
                  step="0.0001"
                  disabled
                  value={longitude}
                  placeholder="0.0000"
                  className={`w-full rounded-xl py-2 px-3 text-xs sm:text-sm font-mono cursor-not-allowed border ${
                    isLight 
                      ? 'bg-slate-100 border-slate-200 text-slate-600' 
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Resolved Address Banner */}
          {resolvedAddress && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              isLight
                ? 'bg-violet-50/80 border-violet-200 text-violet-900'
                : 'bg-violet-950/30 border-violet-800/40 text-violet-300'
            }`}>
              <MapPin className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold block text-[10px] uppercase tracking-wider text-violet-500 mb-0.5">Detected Address</span>
                <span className="break-words leading-relaxed">{resolvedAddress}</span>
              </div>
            </div>
          )}

          {/* GPS Sync Location Button */}
          <button
            type="button"
            onClick={() => getGeoLocation(false)}
            disabled={locating}
            className={`w-full py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50 ${
              isLight
                ? 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
                : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            {locating ? (
              <>
                <Loader className="w-4 h-4 animate-spin text-violet-500" />
                <span>Detecting GPS Location...</span>
              </>
            ) : gpsAutoDetected || permissionState === 'granted' ? (
              <>
                <RefreshCw className="w-4 h-4 text-emerald-500" />
                <span>Refresh GPS Coordinates</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-violet-500" />
                <span>Sync Location & Address</span>
              </>
            )}
          </button>

          {/* Save Profile Button */}
          <div className="pt-2 sm:pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Connected Salons & Notification Controls */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 border transition-all space-y-4 ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-sm'
          : 'glass-card border-slate-800/80 shadow-xl'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 text-violet-500 border border-violet-500/25 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>My Connected Salons</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-extrabold border border-violet-500/25">
                  {mySalons.length}
                </span>
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Control alerts and booking notices per salon
              </p>
            </div>
          </div>
        </div>

        {loadingMySalons ? (
          <div className="flex items-center justify-center py-8 text-slate-500 text-xs sm:text-sm">
            <Loader className="w-4 h-4 animate-spin mr-2 text-violet-500" />
            <span>Loading connected salons...</span>
          </div>
        ) : mySalons.length > 0 ? (
          <div className="space-y-3 pt-1">
            {mySalons.map((item) => (
              <div
                key={item.salonId}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Salon Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                      {item.salonName}
                    </h4>
                    {item.isFavorite && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        Favorite
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] sm:text-xs break-words line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {item.city || item.address || 'Registered Salon'}
                  </p>
                  {item.lastVisitedAt && (
                    <p className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      Last visit: {new Date(item.lastVisitedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Notifications Toggle Switch (Full width on mobile, inline on desktop) */}
                <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/30 sm:border-none flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleToggleSalonNotifications(item.salonId, item.notificationsEnabled)}
                    className={`w-full sm:w-auto py-2 sm:py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                      item.notificationsEnabled
                        ? isLight
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-sm shadow-emerald-500/10'
                        : isLight
                          ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                    title={item.notificationsEnabled ? 'Click to mute alerts for this salon' : 'Click to enable alerts'}
                  >
                    {item.notificationsEnabled ? (
                      <>
                        <Bell className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Alerts: ON</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Muted</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-5 rounded-2xl border text-center space-y-1.5 ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-950/40 border-slate-800/60'
          }`}>
            <p className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              No connected salons yet
            </p>
            <p className={`text-[11px] max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Salons you book with, join queues for, or save as favorites will appear here so you can easily toggle notices.
            </p>
          </div>
        )}
      </div>

      {/* Logout Action Button */}
      <button
        onClick={logout}
        className={`w-full py-3 sm:py-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer ${
          isLight
            ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-600'
            : 'border-red-500/20 bg-red-500/10 hover:bg-red-500/15 text-red-400 hover:text-red-300'
        }`}
      >
        <LogOut className="w-4 h-4 shrink-0" />
        <span>{t('profile.logout')}</span>
      </button>

      {/* Update Mobile Number & OTP Verification Modal (Mobile Responsive) */}
      {mobileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 xs:p-4 sm:p-6 animate-fade-in">
          <div className={`w-full max-w-sm sm:max-w-md max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl relative border p-4 sm:p-6 space-y-4 ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'glass-modal border-violet-500/30 text-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-violet-500 shrink-0" />
                <span>Update Mobile Number</span>
              </h3>
              <button
                type="button"
                onClick={() => setMobileModalOpen(false)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800' 
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {otpError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* OTP Generated Simulation Banner */}
            {otpMessage && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-semibold space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 animate-bounce" />
                  <span>OTP Code Generated!</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Your OTP Code:</span>
                  <span className="text-amber-400 font-mono font-black text-sm sm:text-base px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 tracking-widest animate-pulse shadow-md shadow-amber-500/10">
                    {otp || '123456'}
                  </span>
                </div>
              </div>
            )}

            {otpStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Enter New Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      placeholder="e.g. 9876543210"
                      value={newMobileNumber}
                      onChange={(e) => setNewMobileNumber(e.target.value)}
                      className={`w-full border rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-violet-500'
                          : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-violet-500'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpSending}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-550 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                >
                  {otpSending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndUpdateMobile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Enter 6-Digit OTP *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4 text-violet-500" />
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={`w-full border rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-sm sm:text-base font-bold tracking-[0.25em] text-center font-mono transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-violet-500'
                          : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-violet-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Responsive Action Buttons (Stacked on mobile, side-by-side on sm) */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(1);
                      setOtpError('');
                      setOtpMessage('');
                    }}
                    className={`flex-1 py-2.5 sm:py-3 border font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Change Number
                  </button>

                  <button
                    type="submit"
                    disabled={otpVerifying}
                    className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-550 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                  >
                    {otpVerifying ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Update</span>
                        <ShieldCheck className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

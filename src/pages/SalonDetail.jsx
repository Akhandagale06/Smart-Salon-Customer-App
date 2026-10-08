import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { formatServiceName } from '../utils/serviceTranslator';
import { isHolidayExpired, isDateOnHoliday, getLocalDateString, formatToDDMMYYYY } from '../utils/dateUtils';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Scissors, 
  AlertTriangle, 
  Zap, 
  CheckCircle,
  Loader,
  Calendar,
  Sparkles,
  Heart,
  Megaphone,
  Users,
  Lock
} from 'lucide-react';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import HolidayAnnouncementCard from '../components/HolidayAnnouncementCard';
import CustomAnnouncementBanner from '../components/CustomAnnouncementBanner';

const SalonDetail = ({ salonId, onBack, onBookingSuccess }) => {
  const { t, i18n } = useTranslation();
  const themeContext = useTheme?.();
  const isLight = themeContext?.theme === 'light';
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Custom Announcement state with instant local & remote synchronization
  const [localAnnouncement, setLocalAnnouncement] = useState(() => {
    return localStorage.getItem(`salon_announcement_${salonId}`) || '';
  });
  const [localAnnouncementImg, setLocalAnnouncementImg] = useState(() => {
    return localStorage.getItem(`salon_announcement_img_${salonId}`) || null;
  });

  useEffect(() => {
    const handleSync = () => {
      setLocalAnnouncement(localStorage.getItem(`salon_announcement_${salonId}`) || '');
      setLocalAnnouncementImg(localStorage.getItem(`salon_announcement_img_${salonId}`) || null);
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('salon_announcement_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('salon_announcement_updated', handleSync);
    };
  }, [salonId]);

  const activeCustomMessage = salon?.customAnnouncement || localAnnouncement;
  const activeCustomImage = salon?.customAnnouncementImage || localAnnouncementImg;
  
  // Booking pane states
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => getLocalDateString());
  const [bookingTime, setBookingTime] = useState('09:00');
  const [chairs, setChairs] = useState([]);
  const [selectedChairId, setSelectedChairId] = useState(null);
  const [queueSummary, setQueueSummary] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Sync refs so setInterval always reads the freshest values without stale closures
  const selectedServiceRef = useRef(selectedService);
  const bookingDateRef = useRef(bookingDate);
  const selectedChairIdRef = useRef(selectedChairId);
  const bookingTimeRef = useRef(bookingTime);

  useEffect(() => {
    selectedServiceRef.current = selectedService;
  }, [selectedService]);

  useEffect(() => {
    bookingDateRef.current = bookingDate;
  }, [bookingDate]);

  useEffect(() => {
    selectedChairIdRef.current = selectedChairId;
  }, [selectedChairId]);

  useEffect(() => {
    bookingTimeRef.current = bookingTime;
  }, [bookingTime]);

  const formatTime12Hr = (time24) => {
    if (!time24) return '';
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hours12}:${minutesStr} ${ampm}`;
  };

  const formatDateDMY = (dateStr) => {
    return formatToDDMMYYYY(dateStr);
  };

  const getSlotLabel = (slot) => {
    if (slot.breakName) {
      if (slot.breakName.toLowerCase().includes('lunch')) return '☕ Lunch';
      if (slot.breakName.toLowerCase().includes('tea')) return '☕ Tea';
      return '☕ Break';
    }
    return formatTime12Hr(slot.time);
  };

  const fetchSalonDetails = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError('');
      const response = await api.get(`/api/salons/${salonId}?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const data = response.data?.data;
      setSalon(data);
      // Auto-select the first service if not selected yet so empty slots calculate immediately
      if (data?.services?.length > 0 && !selectedServiceRef.current) {
        setSelectedService(data.services[0]);
      }
    } catch (err) {
      if (!isSilent) setError('Failed to load salon details.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const fetchChairs = async () => {
    try {
      const res = await api.get(`/api/salons/${salonId}/chairs/active?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      setChairs(res.data?.data || []);
    } catch (err) {}
  };

  const fetchSlots = async (isSilent = false) => {
    const currentService = selectedServiceRef.current;
    const currentDate = bookingDateRef.current;
    const currentChair = selectedChairIdRef.current;

    if (!currentService || !currentDate) return;
    try {
      if (!isSilent) setSlotsLoading(true);
      const chairParam = currentChair ? `&preferredChairId=${currentChair}` : '';
      const res = await api.get(`/api/salons/${salonId}/slots?date=${currentDate}&serviceId=${currentService.id}${chairParam}&_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const fetchedSlots = res.data?.data || [];
      setSlots(fetchedSlots);
      
      const availableSlots = fetchedSlots.filter(s => s.available);
      setBookingTime(prevTime => {
        if (prevTime && availableSlots.some(s => s.time === prevTime)) {
          return prevTime;
        }
        return availableSlots.length > 0 ? availableSlots[0].time : '';
      });
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      if (!isSilent) setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (salonId) {
      // Parallel initial fetch of salon details and active chairs
      Promise.all([fetchSalonDetails(), fetchChairs()]);

      const interval = setInterval(() => {
        Promise.all([
          fetchSalonDetails(true),
          fetchChairs(),
          fetchSlots(true)
        ]);
      }, 3000); // 3-second live refresh

      return () => clearInterval(interval);
    }
  }, [salonId]);

  useEffect(() => {
    if (selectedService && bookingDate) {
      fetchSlots(false);
    }
  }, [selectedService?.id, bookingDate, selectedChairId]);

  const handleBookSlot = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    setBookingLoading(true);
    setBookingError('');

    const currentLang = (i18n.language || localStorage.getItem('customer_lang') || 'en').substring(0, 2).toLowerCase();

    try {
      const payload = {
        salonId,
        serviceId: selectedService.id,
        bookingDate,
        bookingTime: bookingTime + ":00", // Format to LocalTime HH:mm:ss
        preferredChairId: selectedChairId,
        lang: currentLang
      };

      await api.post('/api/appointments', payload);

      onBookingSuccess();
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to complete booking. Slot might be unavailable.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const isCurrentHoliday = salon?.holidayDate && !isHolidayExpired(salon.holidayDate);
  const isBookingDateToday = bookingDate === getLocalDateString();
  const isCurrentlyClosed = salon?.isOpen === false;
  const isBookingDateOnHoliday = isDateOnHoliday(bookingDate, salon?.holidayDate);
  const isUnavailable = salon?.mode === 'EMERGENCY' || (salon?.mode === 'BUSY' && isBookingDateToday) || (isCurrentlyClosed && isBookingDateToday) || isBookingDateOnHoliday;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('detail.back')}
      </button>

      {/* Hero Section */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden space-y-4">
        {/* Dynamic Status Tag and Salon Brand Photo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {salon?.profileImage ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-700/60 shrink-0 shadow-md">
                <img src={salon.profileImage} alt={salon.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-violet-400 shadow-inner">
                <Scissors className="w-7 h-7" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{salon?.name}</h2>
                {salon?.city && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wide">
                    📍 {salon.city}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">By {salon?.ownerName}</p>
              {salon?.description && (
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 max-w-md">{salon.description}</p>
              )}
            </div>
          </div>
          
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border self-start sm:self-auto shrink-0 ${
            salon?.isOpen === false
              ? 'bg-red-500/10 border-red-500/35 text-red-400'
              : salon?.mode === 'EMERGENCY' 
              ? 'bg-red-500/10 border-red-500/35 text-red-400' 
              : salon?.mode === 'BUSY'
              ? 'bg-amber-500/10 border-amber-500/35 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
          }`}>
            {salon?.isOpen === false ? 'CLOSED' : salon?.mode}
          </span>
        </div>

        {/* Address and working hours info */}
        <div className="space-y-2 text-xs text-slate-400 font-medium pt-2 border-t border-slate-900">
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{salon?.city || salon?.address}</span>
          </p>
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            {t('salonDetailMsg.workingHours', { defaultValue: 'Working Hours:' })} {formatTime12Hr(salon?.workingHoursStart?.substring(0, 5))} - {formatTime12Hr(salon?.workingHoursEnd?.substring(0, 5))}
          </p>

        </div>
      </div>

      {/* Animated Holiday Announcement Banner */}
      {isCurrentHoliday && (
        <HolidayAnnouncementCard
          holidayDate={salon.holidayDate}
          holidayReason={salon.holidayReason}
          holidayMessage={salon.holidayMessage}
          salonName={salon.name}
        />
      )}

      {/* 📢 Custom Announcement & Banner from Salon Owner */}
      {(activeCustomMessage || activeCustomImage) && (
        <CustomAnnouncementBanner
          message={activeCustomMessage}
          imageUrl={activeCustomImage}
          salonName={salon?.name || 'Salon'}
        />
      )}

      {/* Locked notice */}
      {salon?.isLocked && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300">
          <Lock className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">{t('salonDetailMsg.accountLocked', { defaultValue: 'Salon Account Suspended' })}</h4>
            <p className="text-xs opacity-90 mt-0.5">
              {t('salonDetailMsg.accountLockedDesc', { defaultValue: 'This salon is currently locked by administration. New appointments and queue tokens are not being accepted.' })}
            </p>
          </div>
        </div>
      )}

      {/* Closed notice */}
      {!salon?.isLocked && salon?.isOpen === false && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">{t('salonDetailMsg.salonClosed', { defaultValue: 'Salon is Closed' })}</h4>
            <p className="text-xs opacity-90 mt-0.5">
              {t('salonDetailMsg.salonClosedDesc', { defaultValue: 'The salon is currently outside of working hours. Booking and queue services are locked.' })} ({formatTime12Hr(salon?.workingHoursStart?.substring(0, 5))} - {formatTime12Hr(salon?.workingHoursEnd?.substring(0, 5))}).
            </p>
          </div>
        </div>
      )}

      {/* Emergency closure alert box */}
      {salon?.mode === 'EMERGENCY' && (
        <div 
          className={`emergency-notice-card relative overflow-hidden p-4 sm:p-5 rounded-3xl transition-all duration-300 border backdrop-blur-md space-y-3.5 animate-fade-in ${
            isLight
              ? 'bg-gradient-to-br from-amber-50/95 via-orange-50/70 to-amber-100/40 border-amber-200/90 text-amber-950 shadow-lg shadow-amber-500/5'
              : 'bg-gradient-to-br from-amber-950/80 via-slate-900/95 to-purple-950/50 border-amber-500/35 text-amber-200 shadow-xl shadow-amber-950/30'
          }`}
        >
          {/* Subtle Ambient Glow */}
          <div 
            className={`absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none blur-3xl opacity-30 ${
              isLight ? 'bg-amber-400' : 'bg-amber-500'
            }`} 
            aria-hidden="true" 
          />

          <div className={`emergency-notice-header flex items-center justify-between gap-3 border-b pb-3 relative z-10 ${
            isLight ? 'border-amber-200/80' : 'border-amber-500/20'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                isLight
                  ? 'bg-amber-100/90 border-amber-300 text-amber-700 shadow-sm shadow-amber-200/50'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-inner'
              }`}>
                <Sparkles className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-amber-300'} animate-pulse`} />
              </div>
              <div className="min-w-0">
                <h4 className={`emergency-notice-title font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2 flex-wrap ${
                  isLight ? 'text-slate-900' : 'text-amber-100'
                }`}>
                  <span>{t('salonDetailMsg.temporarilyClosed', { defaultValue: 'Salon Temporarily Closed' })}</span>
                  <span className={`emergency-notice-badge text-[9px] sm:text-[10px] font-black uppercase px-2 sm:px-2.5 py-0.5 rounded-full border tracking-wide shrink-0 ${
                    isLight
                      ? 'bg-amber-100/90 border-amber-300 text-amber-800 shadow-xs'
                      : 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                  }`}>
                    {t('salonDetailMsg.specialNotice', { defaultValue: 'Special Notice' })}
                  </span>
                </h4>
                <p className={`emergency-notice-sub text-[11px] sm:text-xs font-semibold mt-0.5 ${
                  isLight ? 'text-amber-800/80' : 'text-amber-300/80'
                }`}>
                  {t('salonDetailMsg.ownerNotice', { defaultValue: 'Notice from Salon Owner' })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-0.5 relative z-10">
            <div className={`emergency-notice-box p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
              isLight
                ? 'bg-white/95 border-amber-200/90 shadow-xs'
                : 'bg-slate-950/70 border-amber-500/20 shadow-inner'
            }`}>
              <p className={`emergency-notice-message text-xs sm:text-sm font-semibold leading-relaxed flex items-start gap-2.5 ${
                isLight ? 'text-slate-800' : 'text-slate-100'
              }`}>
                <span className="text-base shrink-0 leading-tight">🌺</span>
                <span className="break-words">
                  {salon.emergencyMessage || 'The salon is temporarily closed today due to a special occasion / family function.'}
                </span>
              </p>
            </div>
            <p className={`emergency-notice-footer text-[11px] sm:text-xs pt-0.5 flex items-start sm:items-center gap-1.5 font-medium leading-normal ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <Heart className={`w-3.5 h-3.5 mt-0.5 sm:mt-0 ${isLight ? 'text-rose-500' : 'text-pink-400'} fill-current shrink-0 animate-pulse`} />
              <span>{t('salonDetailMsg.emergencyNoticeFooter', { defaultValue: 'Online bookings & live queue slots are temporarily paused. Thank you for your warm understanding!' })}</span>
            </p>
          </div>
        </div>
      )}

      {/* Busy mode notice */}
      {salon?.mode === 'BUSY' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3 text-amber-600 dark:text-amber-400">
          <Zap className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">{t('salonDetailMsg.busyActive', { defaultValue: 'Busy Mode Active' })}</h4>
            <p className="text-xs opacity-90 mt-0.5">
              {t('salonDetailMsg.busyDesc', { defaultValue: 'The salon is currently experiencing high demand. Online bookings are paused. Please visit as walk-in or check back later.' })}
            </p>
          </div>
        </div>
      )}

      {/* Services and Booking Pane layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Services catalog */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3">
            <Scissors className="w-4.5 h-4.5 text-violet-400" />
            {t('salonDetailMsg.availableMenu', { defaultValue: 'Available Services Menu' })}
          </h3>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {salon?.services?.length > 0 ? (
              salon.services.map((service) => (
                <div 
                  key={service.id}
                  onClick={() => !isUnavailable && setSelectedService(service)}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 flex justify-between items-center cursor-pointer ${
                    isUnavailable 
                      ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900/10'
                      : selectedService?.id === service.id
                      ? 'border-violet-500/50 bg-violet-600/10 shadow-inner'
                      : 'border-slate-850 hover:bg-slate-900/40 bg-slate-950/20'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {formatServiceName(service.name, t)}
                    </h4>
                    <p className="text-[11px] text-slate-450 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {service.durationMinutes} {t('common.mins')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-white">₹{service.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">{t('salonDetailMsg.noServices', { defaultValue: 'No active services provided' })}</p>
            )}
          </div>
        </div>

        {/* Booking Form Pane */}
        {selectedService && (
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3">
              <Calendar className="w-4.5 h-4.5 text-violet-400" />
              {t('salonDetailMsg.bookSlot', { defaultValue: 'Book Appointment Slot' })}
            </h3>

            <form onSubmit={handleBookSlot} className="space-y-4">
              {bookingError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
                  {bookingError}
                </div>
              )}

              {/* Selected service summary */}
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[9px]">{t('salonDetailMsg.selectedService', { defaultValue: 'Selected Service' })}</span>
                  <p className="font-bold text-white mt-0.5">
                    {t(`serviceNames.${selectedService.name}`, { defaultValue: selectedService.name })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-semibold uppercase text-[9px]">{t('salonDetailMsg.serviceCost', { defaultValue: 'Service cost' })}</span>
                  <p className="font-extrabold text-violet-400 mt-0.5">₹{selectedService.price}</p>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">{t('salonDetailMsg.selectDate', { defaultValue: 'Select Date' })}</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={formatDateDMY(bookingDate)}
                    onClick={() => {
                      const picker = document.getElementById('booking-date-picker');
                      if (picker && typeof picker.showPicker === 'function') {
                        picker.showPicker();
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-semibold cursor-pointer"
                  />
                  <input
                    id="booking-date-picker"
                    type="date"
                    min={getLocalDateString()}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
                  />
                </div>
                {isBookingDateOnHoliday && (
                  <p className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 p-2.5 rounded-xl flex items-center gap-2 mt-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Salon is closed on holiday on this date ({formatToDDMMYYYY(salon?.holidayDate)}). Please pick another date for booking.</span>
                  </p>
                )}
              </div>

              {/* Chair / Barber Preference Selector */}
              {chairs.length > 1 && (
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-slate-350">
                    {t('detail.chooseChair', { defaultValue: 'Select Barber / Chair Preference' })}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Any Chair (Auto) */}
                    <button
                      type="button"
                      onClick={() => setSelectedChairId(null)}
                      className={`chair-btn p-3 rounded-2xl border text-xs font-bold transition-all duration-200 text-left flex flex-col justify-between gap-1.5 relative overflow-hidden ${
                        selectedChairId === null
                          ? 'chair-btn-selected bg-gradient-to-br from-violet-600 to-fuchsia-600 border-violet-400 text-white shadow-lg shadow-violet-500/25 ring-2 ring-violet-400/40'
                          : 'chair-btn-unselected bg-slate-950/80 border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 w-full">
                        <span className="font-extrabold flex items-center gap-1.5 truncate">
                          <span className="text-sm">✨</span>
                          <span className="truncate">{t('detail.anyChair', { defaultValue: 'Any Chair' })}</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          selectedChairId === null
                            ? 'bg-white/20 border-white/30 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          {t('salonDetailMsg.autoAssign', { defaultValue: 'Auto-assign' })}
                        </span>
                      </div>
                      <span className={`text-[10px] truncate ${selectedChairId === null ? 'text-violet-100' : 'text-slate-400'}`}>
                        {t('salonDetailMsg.fastestChair', { defaultValue: 'Fastest available chair' })}
                      </span>
                    </button>

                    {/* Specific Chairs */}
                    {chairs.map((chair) => {
                      const isSelected = String(chair.id) === String(selectedChairId);
                      return (
                        <button
                          key={chair.id}
                          type="button"
                          onClick={() => setSelectedChairId(chair.id)}
                          className={`chair-btn p-3 rounded-2xl border text-xs font-bold transition-all duration-200 text-left flex flex-col justify-between gap-1.5 relative overflow-hidden cursor-pointer ${
                            isSelected
                              ? 'chair-btn-selected bg-gradient-to-br from-violet-600 to-fuchsia-600 border-violet-400 text-white shadow-lg shadow-violet-500/25 ring-2 ring-violet-400/40'
                              : 'chair-btn-unselected bg-slate-950/80 border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5 w-full">
                            <span className="font-extrabold flex items-center gap-1.5 truncate">
                              <span className="text-sm">💈</span>
                              <span className="truncate">{chair.name || `Chair ${chair.chairNumber}`}</span>
                            </span>
                          </div>
                          <span className={`text-[10px] truncate ${isSelected ? 'text-violet-100' : 'text-slate-400'}`}>
                            {chair.barberName ? `✂️ ${chair.barberName}` : `Chair ${chair.chairNumber}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Time Slots Grid */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-400">{t('salonDetailMsg.availableSlots', { defaultValue: 'Available Time Slots' })}</label>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      LIVE
                    </span>
                  </div>
                  {!slotsLoading && slots.length > 0 && (
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                      {slots.filter(s => s.available).length} {t('detail.emptySlots', { defaultValue: 'empty slot(s)' })}
                    </span>
                  )}
                </div>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
                    <Loader className="w-4 h-4 animate-spin text-violet-500" />
                    {t('detail.calculatingSlots', { defaultValue: 'Calculating empty slots...' })}
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {slots
                      .filter((slot) => {
                        // When booking for today, omit past slots from earlier hours
                        if (bookingDate === getLocalDateString()) {
                          const [h, m] = slot.time.split(':').map(Number);
                          const now = new Date();
                          const slotDate = new Date();
                          slotDate.setHours(h, m, 0, 0);
                          if (slotDate.getTime() < now.getTime() - 2 * 60 * 1000) {
                            return false;
                          }
                        }
                        return true;
                      })
                      .map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setBookingTime(slot.time)}
                          title={slot.breakName ? `Break: ${slot.breakName}` : (!slot.available ? 'Slot Booked' : 'Available')}
                          className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 border cursor-pointer ${
                            bookingTime === slot.time
                              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-violet-400 shadow-md shadow-violet-500/20'
                              : slot.breakName
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 cursor-not-allowed opacity-75'
                              : slot.available
                              ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
                              : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-40'
                          }`}
                        >
                          {getSlotLabel(slot)}
                        </button>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-2">{t('detail.noSlots', { defaultValue: 'No slots available for the selected date.' })}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={bookingLoading || !bookingTime || isBookingDateOnHoliday}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 transition-opacity cursor-pointer"
              >
                {bookingLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  t('salonDetailMsg.confirmBooking', { defaultValue: 'Confirm Booking Slot' })
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default SalonDetail;

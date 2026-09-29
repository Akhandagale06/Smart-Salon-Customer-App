import React from 'react';
import { Calendar, Sparkles, Info, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { formatToDDMMYYYY } from '../utils/dateUtils';

const HolidayAnnouncementCard = ({
  holidayDate,
  holidayReason,
  holidayMessage,
  salonName,
  className = '',
  showCancelButton = false,
  onCancel = null,
  isCancelling = false
}) => {
  const { t } = useTranslation();
  const themeContext = useTheme?.();
  const isLight = themeContext?.theme === 'light';

  const formattedDate = formatToDDMMYYYY(holidayDate);
  const reasonText = holidayReason || 'Festival / Holiday';
  const messageQuote = holidayMessage || 'Online bookings and live queue slots will resume on the next working day. Thank you for your support!';

  return (
    <div 
      className={`holiday-banner-card relative overflow-hidden rounded-3xl p-5 sm:p-7 transition-all duration-300 border shadow-lg group ${
        isLight
          ? 'bg-white border-[#e0e7ff] text-slate-900 shadow-violet-500/5'
          : 'bg-gradient-to-br from-slate-900/95 via-[#18112e]/95 to-slate-950/95 border-violet-500/20 text-slate-100 shadow-xl shadow-purple-950/30'
      } ${className}`}
    >
      <div className="relative z-10 space-y-4 sm:space-y-4.5">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Animated Dynamic Loudspeaker Icon */}
            <div className={`relative shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border shadow-inner ${
              isLight 
                ? 'bg-gradient-to-br from-violet-100 to-indigo-50 border-violet-200/80 shadow-violet-500/10' 
                : 'bg-gradient-to-br from-violet-950/80 to-slate-900 border-violet-700/40 shadow-violet-900/40'
            }`}>
              {/* Animated Speaker SVG Art */}
              <svg 
                viewBox="0 0 64 64" 
                className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-md overflow-visible"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="spkBodyGradCustomer" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>

                {/* Speaker Body with Broadcast Pulse */}
                <g className="speaker-broadcast-pulse" style={{ transformOrigin: '22px 32px' }}>
                  {/* Speaker Driver Base */}
                  <rect x="7" y="24" width="6" height="16" rx="2.5" fill={isLight ? '#6366f1' : '#818cf8'} />
                  
                  {/* Speaker Horn Cone */}
                  <path 
                    d="M 13 23 L 23 23 L 34 14 C 36 12.5 38 13.8 38 16 L 38 48 C 38 50.2 36 51.5 34 50 L 23 41 L 13 41 C 11.5 41 10 39.5 10 38 L 10 26 C 10 24.5 11.5 23 13 23 Z" 
                    fill="url(#spkBodyGradCustomer)" 
                    stroke={isLight ? '#4f46e5' : '#a78bfa'}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />

                  {/* Cone highlight contour */}
                  <ellipse cx="23" cy="32" rx="2" ry="5.5" fill={isLight ? '#ffffff' : '#c4b5fd'} opacity="0.65" />

                  {/* Speaker Bell Front Rim */}
                  <line x1="38" y1="16" x2="38" y2="48" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
                </g>

                {/* Staggered Radiating Sound Waves */}
                {/* Wave 1 - Inner Arc */}
                <path 
                  d="M 43 25 C 47 28 47 36 43 39" 
                  stroke="#8b5cf6" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="sound-wave sound-wave-1"
                />

                {/* Wave 2 - Middle Arc */}
                <path 
                  d="M 49 20 C 55 25 55 39 49 44" 
                  stroke="#a855f7" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="sound-wave sound-wave-2"
                />

                {/* Wave 3 - Outer Arc */}
                <path 
                  d="M 55 15 C 63 22 63 42 55 49" 
                  stroke="#ec4899" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="sound-wave sound-wave-3"
                />
              </svg>

              <style>{`
                @keyframes speakerBroadcast {
                  0%, 100% { transform: scale(1) rotate(0deg); }
                  20% { transform: scale(1.08) rotate(-4deg); }
                  40% { transform: scale(0.96) rotate(1deg); }
                  60% { transform: scale(1.04) rotate(-2deg); }
                  80% { transform: scale(0.98) rotate(0deg); }
                }
                @keyframes soundWaveRipple {
                  0% { opacity: 0.1; transform: scale(0.9); }
                  40% { opacity: 1; transform: scale(1.08); }
                  80%, 100% { opacity: 0.1; transform: scale(0.9); }
                }
                .speaker-broadcast-pulse {
                  animation: speakerBroadcast 1.8s ease-in-out infinite;
                }
                .sound-wave {
                  transform-origin: 38px 32px;
                  animation: soundWaveRipple 1.4s ease-in-out infinite;
                }
                .sound-wave-1 {
                  animation-delay: 0s;
                }
                .sound-wave-2 {
                  animation-delay: 0.22s;
                }
                .sound-wave-3 {
                  animation-delay: 0.44s;
                }
              `}</style>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h3 className={`font-black text-base sm:text-lg tracking-wide uppercase leading-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {t('holiday.announcementTitle', { defaultValue: 'SALON HOLIDAY ANNOUNCEMENT' })}
              </h3>
              <p className={`holiday-sub text-xs sm:text-sm font-semibold mt-0.5 ${
                isLight ? 'text-slate-500' : 'text-violet-300/80'
              }`}>
                {salonName ? `${salonName} • ` : ''}{t('holiday.noticeSub', { defaultValue: 'Official Owner Holiday Notice' })}
              </p>
            </div>
          </div>

          {/* Right Badges: 📅 HOLIDAY & Cancel */}
          <div className="flex items-center gap-2">
            <span 
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-[11px] sm:text-xs uppercase tracking-wider border shadow-2xs ${
                isLight
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-rose-950/60 border-rose-800/60 text-rose-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{t('holiday.badge', { defaultValue: 'HOLIDAY' })}</span>
            </span>

            {showCancelButton && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isCancelling}
                className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-2xs border ${
                  isLight
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                    : 'bg-rose-950/80 border-rose-700/60 text-rose-200 hover:bg-rose-900'
                }`}
                title="Cancel holiday notice"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Holiday Date & Occasion Chips */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Date Chip */}
          <div 
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border shadow-xs ${
              isLight
                ? 'bg-white border-[#e0e7ff]'
                : 'bg-slate-800/80 border-slate-700/80'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#6366f1] shrink-0" />
            <span className={`text-xs sm:text-sm font-semibold ${
              isLight ? 'text-[#475569]' : 'text-slate-300'
            }`}>
              {t('holiday.dateLabel', { defaultValue: 'Holiday Date:' })}
            </span>
            <span 
              className={`px-3 py-0.5 rounded-xl font-black text-xs sm:text-sm tracking-wide ${
                isLight
                  ? 'bg-[#ede9fe] text-[#4338ca]'
                  : 'bg-violet-900/70 text-violet-200 border border-violet-700/50'
              }`}
            >
              {formattedDate}
            </span>
          </div>

          {/* Occasion / Reason Chip */}
          <div 
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border shadow-xs font-bold text-xs sm:text-sm ${
              isLight
                ? 'bg-white border-[#e0e7ff] text-[#1e1b4b]'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-100'
            }`}
          >
            <span className="text-amber-500 text-sm">⭐</span>
            <span>{reasonText}</span>
          </div>
        </div>

        {/* Third Row: Message Quote */}
        <div className="pt-0.5 pr-2 sm:pr-4">
          <p className={`holiday-quote text-xs sm:text-sm font-medium italic leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>
            “{messageQuote}”
          </p>
        </div>

        {/* Fourth Row: Bottom Info Alert Strip */}
        <div 
          className={`p-3 sm:p-3.5 rounded-2xl border flex items-center gap-2.5 shadow-2xs ${
            isLight
              ? 'bg-[#f5f3ff] border-[#e9d5ff] text-[#4338ca]'
              : 'bg-violet-950/40 border-violet-800/40 text-violet-200'
          }`}
        >
          <div 
            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs force-text-white ${
              isLight ? 'bg-[#7c3aed] text-white' : 'bg-violet-600 text-white'
            }`}
          >
            i
          </div>
          <p className={`holiday-strip-text text-xs font-semibold leading-tight ${
            isLight ? 'text-[#4338ca]' : 'text-violet-200'
          }`}>
            {t('holiday.bottomNotice', { defaultValue: 'Online bookings & live queue operations will resume after the holiday. Thank you for your support!' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HolidayAnnouncementCard;

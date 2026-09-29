import React from 'react';
import { Megaphone, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CustomAnnouncementBanner = ({
  message,
  imageUrl,
  salonName = 'Salon',
  onClose = null,
  showClose = false,
  className = ''
}) => {
  const themeContext = useTheme?.();
  const isLight = themeContext?.theme === 'light';

  if (!message && !imageUrl) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-7 transition-all duration-300 border shadow-lg ${
        isLight
          ? 'bg-gradient-to-br from-violet-50 via-white to-indigo-50/60 border-violet-200/90 text-slate-900 shadow-violet-500/5'
          : 'bg-gradient-to-br from-slate-900/95 via-violet-950/30 to-slate-950/95 border-violet-500/30 text-slate-100 shadow-xl shadow-purple-950/20'
      } ${className}`}
    >
      {/* Subtle Background Glow Effect */}
      <div 
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-30 bg-violet-500" 
        aria-hidden="true" 
      />

      <div className="relative z-10 space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Animated Megaphone Badge */}
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
              isLight
                ? 'bg-violet-100 border-violet-200 text-violet-700 shadow-violet-500/10'
                : 'bg-violet-950/80 border-violet-700/50 text-violet-300 shadow-violet-900/30'
            }`}>
              <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isLight
                    ? 'bg-violet-100 text-violet-800 border-violet-200'
                    : 'bg-violet-500/20 text-violet-300 border-violet-400/30'
                }`}>
                  <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
                  Special Announcement
                </span>
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  • Notice from {salonName}
                </span>
              </div>
              <h3 className={`text-sm sm:text-base font-extrabold tracking-tight mt-0.5 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Customer Update & Offers
              </h3>
            </div>
          </div>

          {showClose && onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl border transition-all ${
                isLight
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Uploaded Banner Image (if available) */}
        {imageUrl && (
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-950/40 shadow-inner group">
            <img
              src={imageUrl}
              alt="Salon Announcement Banner"
              className="w-full max-h-64 sm:max-h-80 object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
        )}

        {/* Custom Message Text */}
        {message && (
          <div className={`p-4 rounded-2xl border ${
            isLight
              ? 'bg-white/80 border-violet-100 shadow-sm text-slate-800'
              : 'bg-slate-950/60 border-slate-800/80 shadow-inner text-slate-100'
          }`}>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomAnnouncementBanner;

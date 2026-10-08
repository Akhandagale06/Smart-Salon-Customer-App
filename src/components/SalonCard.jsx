import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Store, Pin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SalonCard = ({ salon, onClick, isFavorite = false, onToggleFavorite }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const getModeDetails = () => {
    if (salon.isOpen === false) {
      return {
        bg: isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-500/10 text-red-400 border-red-500/20',
        label: t('home.statusClosed'),
        dot: 'bg-red-500'
      };
    }
    switch (salon.mode) {
      case 'BUSY':
        return {
          bg: isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: t('home.statusPaused'),
          dot: 'bg-amber-500'
        };
      case 'EMERGENCY':
        return {
          bg: isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-500/10 text-red-400 border-red-500/20',
          label: t('home.statusClosed'),
          dot: 'bg-red-500'
        };
      default:
        return {
          bg: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: t('home.statusOpen'),
          dot: 'bg-emerald-500'
        };
    }
  };

  const mode = getModeDetails();

  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl p-3.5 sm:p-4 transition-all duration-300 flex items-start gap-3.5 sm:gap-4 cursor-pointer active:scale-[0.98] relative group w-full max-w-[420px] border ${
        isLight
          ? isFavorite
            ? 'bg-white border-violet-400 shadow-md shadow-violet-500/10 ring-2 ring-violet-400/20'
            : 'bg-white border-slate-200/90 shadow-sm hover:border-violet-300 hover:shadow-md'
          : isFavorite
            ? 'border-violet-500/40 bg-slate-900/90 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/20'
            : 'glass-card hover:border-slate-800'
      }`}
    >
      {/* Thumbnail */}
      <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl border flex items-center justify-center font-bold shadow-inner shrink-0 relative overflow-hidden ${
        isLight ? 'bg-slate-100 border-slate-200 text-violet-600' : 'bg-slate-900 border-slate-850 text-violet-400'
      }`}>
        {salon.profileImage ? (
          <img src={salon.profileImage} alt={salon.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Store className={`w-7 h-7 sm:w-8 sm:h-8 ${isLight ? 'text-slate-400' : 'text-slate-700'}`} />
        )}

        {/* Pinned Indicator on Thumbnail */}
        {isFavorite && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-violet-600/95 text-white text-[9px] font-black flex items-center gap-0.5 shadow-md backdrop-blur-sm uppercase">
            <Pin className="w-2.5 h-2.5 fill-white" />
            <span>{t('salonsFilter.pinned', { defaultValue: 'PINNED' })}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1 pr-14 sm:pr-16">
        <div>
          <h3 className={`font-bold text-sm truncate leading-snug transition-colors ${
            isLight ? 'text-slate-900 group-hover:text-violet-700' : 'text-slate-100 group-hover:text-violet-300'
          }`}>
            {salon.name}
          </h3>
          <p className={`text-[10px] font-bold -mt-0.5 flex items-center gap-1 ${
            isLight ? 'text-violet-700' : 'text-violet-400'
          }`}>
            <span>{t('salonsFilter.owner', { defaultValue: 'Owner:' })}</span>
            <span className={`font-semibold truncate ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>{salon.ownerName || 'Sudam Khandagale'}</span>
          </p>
        </div>

        {/* Address and Distance info row with City / Town Badge */}
        <div className={`flex items-center gap-2 text-xs min-w-0 pt-0.5 ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <p className="truncate flex items-center gap-1.5 min-w-0 flex-1">
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
            <span className="truncate font-medium">{salon.city || salon.address}</span>
          </p>
          {salon.distance != null && (
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 font-mono ${
              isLight
                ? 'bg-violet-50 text-violet-700 border-violet-200 shadow-xs'
                : 'bg-violet-500/15 text-violet-300 border-violet-500/25'
            }`}>
              📍 {salon.distance < 1 ? `${Math.round(salon.distance * 1000)}m` : `${salon.distance.toFixed(1)}km`}
            </span>
          )}
        </div>
      </div>

      {/* Top Right Corner: Status Badge (Open Now / Paused / Closed) */}
      <span className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 text-[9px] font-extrabold px-2 py-0.5 rounded-full border shadow-sm z-10 ${mode.bg}`}>
        {mode.label}
      </span>

      {/* Pin Salon Button - Placed in Bottom Right Corner */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleFavorite) onToggleFavorite(salon.id, e);
        }}
        title={isFavorite ? 'Unpin salon' : 'Pin salon to top'}
        aria-label={isFavorite ? 'Unpin salon' : 'Pin salon to top'}
        className={`absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 p-1.5 rounded-xl border transition-all cursor-pointer active:scale-90 flex items-center justify-center z-10 ${
          isFavorite
            ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30 hover:bg-violet-500'
            : isLight
              ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-violet-700 hover:border-violet-300 hover:bg-violet-50'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-violet-300 hover:border-violet-500/40 hover:bg-slate-800/90'
        }`}
      >
        <Pin className={`w-3.5 h-3.5 transition-transform duration-200 ${
          isFavorite ? 'fill-white rotate-45 scale-105' : 'group-hover:rotate-12'
        }`} />
      </button>
    </div>
  );
};

export default SalonCard;

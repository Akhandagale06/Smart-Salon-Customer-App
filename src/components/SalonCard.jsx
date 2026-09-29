import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Store, Pin } from 'lucide-react';

const SalonCard = ({ salon, onClick, isFavorite = false, onToggleFavorite }) => {
  const { t } = useTranslation();
  
  const getModeDetails = () => {
    if (salon.isOpen === false) {
      return {
        bg: 'bg-red-500/10 text-red-400 border-red-500/20',
        label: t('home.statusClosed'),
        dot: 'bg-red-500'
      };
    }
    switch (salon.mode) {
      case 'BUSY':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: t('home.statusPaused'),
          dot: 'bg-amber-500'
        };
      case 'EMERGENCY':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/20',
          label: t('home.statusClosed'),
          dot: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: t('home.statusOpen'),
          dot: 'bg-emerald-500'
        };
    }
  };

  const mode = getModeDetails();

  return (
    <div 
      onClick={onClick}
      className={`glass-card rounded-2xl p-3.5 sm:p-4 transition-all duration-300 flex items-start gap-3.5 sm:gap-4 cursor-pointer active:scale-[0.98] relative group w-full max-w-[420px] ${
        isFavorite
          ? 'border-violet-500/40 bg-slate-900/90 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/20'
          : 'hover:border-slate-800'
      }`}
    >
      {/* Thumbnail */}
      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center font-bold text-violet-400 shadow-inner shrink-0 relative overflow-hidden">
        {salon.profileImage ? (
          <img src={salon.profileImage} alt={salon.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Store className="w-7 h-7 sm:w-8 sm:h-8 text-slate-700" />
        )}

        {/* Pinned Indicator on Thumbnail */}
        {isFavorite && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-violet-600/95 text-white text-[9px] font-black flex items-center gap-0.5 shadow-md backdrop-blur-sm">
            <Pin className="w-2.5 h-2.5 fill-white" />
            <span>PINNED</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1 pr-14 sm:pr-16">
        <div>
          <h3 className="font-bold text-slate-100 text-sm truncate leading-snug group-hover:text-violet-300 transition-colors">
            {salon.name}
          </h3>
          <p className="text-[10px] text-violet-400 font-bold -mt-0.5 flex items-center gap-1">
            Owner: <span className="text-slate-300 font-semibold truncate">{salon.ownerName || 'Sudam Khandagale'}</span>
          </p>
        </div>

        {/* Address info row */}
        <p className="text-xs text-slate-400 truncate flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{salon.address}</span>
        </p>
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

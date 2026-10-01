import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

export default function Footer({ onSelectTab }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isLight = theme === 'light';

  return (
    <footer className={`w-full mt-auto border-t transition-colors duration-200 text-center ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-900' 
        : 'bg-slate-950 border-slate-800/80 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col items-center gap-2">
        {/* Quick Trust Links */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs font-semibold">
          {onSelectTab && (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('about')}
                className={`hover:underline cursor-pointer transition-colors ${
                  isLight ? 'text-slate-600 hover:text-violet-600' : 'text-slate-400 hover:text-violet-400'
                }`}
              >
                {t('nav.about', { defaultValue: 'About Us' })}
              </button>
              <span className={isLight ? 'text-slate-300' : 'text-slate-700'}>•</span>
              <button
                type="button"
                onClick={() => onSelectTab('privacy')}
                className={`hover:underline cursor-pointer transition-colors flex items-center gap-1 ${
                  isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {t('nav.privacyPolicy', { defaultValue: 'Privacy Policy' })}
              </button>
            </>
          )}
        </div>

        <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          © 2026 Salon Queue Management System
        </h3>

        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {t('footer.allRightsReserved', { defaultValue: 'All Rights Reserved' })}
        </p>

        <p className={`flex items-center gap-1 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          {t('footer.madeWith', { defaultValue: 'Made with' })}
          <span className="text-red-500 animate-pulse">❤️</span>
          {t('footer.by', { defaultValue: 'by' })}
          <span className={`font-semibold ${isLight ? 'text-indigo-600' : 'text-violet-400'}`}>
            Aditya Khandagale
          </span>
        </p>
      </div>
    </footer>
  );
}

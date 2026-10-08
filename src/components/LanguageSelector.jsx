import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'mr', name: 'मराठी' }
];

export default function LanguageSelector({ storageKey = 'customer_lang' }) {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize language code (e.g. 'mr-IN' -> 'mr')
  const rawLang = i18n.language || localStorage.getItem(storageKey) || 'en';
  const langCode = rawLang.substring(0, 2).toLowerCase();
  const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem(storageKey, code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`lang-selector-btn inline-flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border shadow-sm transition-all cursor-pointer active:scale-95 ${
          theme === 'light'
            ? 'bg-white border-slate-300 text-black hover:bg-slate-50 hover:border-slate-400'
            : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-white'
        }`}
      >
        <Globe className={`w-4 h-4 shrink-0 ${theme === 'light' ? 'text-violet-600' : 'text-violet-400'}`} />
        <span className={`text-xs font-black whitespace-nowrap tracking-wide leading-none inline-block ${
          theme === 'light' ? 'text-black' : 'text-white'
        }`}>
          {currentLang.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
          theme === 'light' ? 'text-slate-800' : 'text-slate-300'
        } ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 sm:w-52 max-w-[calc(100vw-1.5rem)] rounded-xl shadow-2xl z-[100] overflow-hidden p-1.5 space-y-1.5 border ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-slate-300/60'
            : 'bg-slate-950 border-slate-700'
        }`}>
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang.code === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : theme === 'light'
                      ? 'bg-slate-50 hover:bg-slate-100 text-black border border-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800/80'
                }`}
              >
                <span className={`text-xs font-extrabold tracking-wide ${
                  isSelected ? 'text-white' : (theme === 'light' ? 'text-black' : 'text-white')
                }`}>
                  {lang.name}
                </span>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

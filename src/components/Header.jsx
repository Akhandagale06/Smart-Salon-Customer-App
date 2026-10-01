import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, Bell, User, Sparkles, X, Bot, Sun, Moon, ChevronDown, ChevronRight, Home, Info, ShieldCheck, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSelector from './LanguageSelector';

const AlertsDropdown = ({
  theme,
  activeTab,
  onOpenTelegramNotice,
  handleNotificationsClick,
  onNavigateTab,
  toggleTheme,
  t
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative inline-block text-left shrink-0 z-40" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={t('nav.quickMenu', { defaultValue: 'Alerts & Settings' })}
        aria-expanded={isOpen}
        className={`alerts-dropdown-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl border shadow-sm transition-all cursor-pointer active:scale-95 ${
          isOpen
            ? theme === 'light'
              ? 'bg-violet-50 border-violet-400 text-violet-900 ring-2 ring-violet-400/20'
              : 'bg-violet-600/25 border-violet-500/50 text-violet-200 ring-2 ring-violet-500/30'
            : activeTab === 'notifications'
              ? theme === 'light'
                ? 'bg-violet-100 border-violet-300 text-violet-800'
                : 'bg-violet-600/30 border-violet-500/40 text-violet-300'
              : theme === 'light'
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900'
                : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-violet-400" />
          <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-500 ring-2 animate-pulse ${
            theme === 'light' ? 'ring-white' : 'ring-slate-900'
          }`} />
        </div>
        <span className="hidden md:inline text-xs font-bold whitespace-nowrap">
          {t('nav.alerts', { defaultValue: 'Alerts' })}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-300'
        } ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Overlay Card */}
      {isOpen && (
        <div className={`alerts-dropdown-card absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] rounded-2xl p-2 z-50 shadow-2xl backdrop-blur-2xl border transition-all duration-200 origin-top-right animate-in fade-in-0 zoom-in-95 ${
          theme === 'light'
            ? 'bg-white/98 border-slate-200/90 shadow-slate-400/30 text-slate-800 ring-1 ring-black/5'
            : 'bg-slate-900/98 border-slate-800 shadow-black/80 text-slate-100 ring-1 ring-white/5'
        }`}>
          {/* Dropdown Header */}
          <div className={`px-3 py-2 border-b flex items-center justify-between mb-1 ${
            theme === 'light' ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-400'
          }`}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              {t('nav.quickMenu', { defaultValue: 'Alerts & Settings' })}
            </span>
            {activeTab === 'notifications' && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-500 border border-violet-500/25">
                Active
              </span>
            )}
          </div>

          <div className="space-y-1">
            {/* 1. Notifications (Bell) */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleNotificationsClick();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer group border ${
                activeTab === 'notifications'
                  ? theme === 'light'
                    ? 'bg-violet-50 border-violet-300/80 shadow-sm'
                    : 'bg-violet-600/20 border-violet-500/40 shadow-sm'
                  : theme === 'light'
                    ? 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                    : 'hover:bg-slate-800/60 border-transparent hover:border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative p-2 rounded-xl bg-violet-500/15 text-violet-400 group-hover:scale-105 transition-transform shrink-0">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-violet-900 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <span>{t('nav.notifications', { defaultValue: 'Notifications' })}</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    {t('nav.notificationsDesc', { defaultValue: 'Queue & booking updates' })}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* 2. Get Bot Alert (Telegram) */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenTelegramNotice();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer group border ${
                theme === 'light'
                  ? 'hover:bg-sky-50/80 border-transparent hover:border-sky-200'
                  : 'hover:bg-sky-500/10 border-transparent hover:border-sky-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 group-hover:scale-105 transition-transform shrink-0">
                  <Bot className="w-4 h-4 animate-pulse text-sky-400" />
                </div>
                <div className="flex flex-col">
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-sky-400">
                    <span>{t('nav.telegramAlert', { defaultValue: 'Get Bot Alert' })}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      TELEGRAM
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    {t('nav.telegramDesc', { defaultValue: 'Instant Telegram queue alerts' })}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* 3. Theme Toggle (Dark & Light Mode) */}
            <div
              onClick={toggleTheme}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer group select-none border ${
                theme === 'light'
                  ? 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                  : 'hover:bg-slate-800/60 border-transparent hover:border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-transform group-hover:scale-105 shrink-0 ${
                  theme === 'dark' ? 'bg-amber-500/15 text-amber-300' : 'bg-violet-500/15 text-violet-600'
                }`}>
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-violet-600" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold">
                    {t('nav.appearance', { defaultValue: 'Appearance' })}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    {theme === 'dark'
                      ? t('nav.darkMode', { defaultValue: 'Dark Mode Active' })
                      : t('nav.lightMode', { defaultValue: 'Light Mode Active' })}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 flex items-center cursor-pointer shrink-0 ${
                theme === 'dark' ? 'bg-violet-600 justify-end' : 'bg-slate-300 justify-start'
              }`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center transform transition-transform duration-300">
                  {theme === 'dark' ? (
                    <Moon className="w-2.5 h-2.5 text-violet-900" />
                  ) : (
                    <Sun className="w-2.5 h-2.5 text-amber-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Divider: Trust & Transparency */}
            <div className={`px-2.5 pt-2 pb-1 border-t flex items-center justify-between mt-1 ${
              theme === 'light' ? 'border-slate-100 text-slate-400' : 'border-slate-800/80 text-slate-500'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {t('nav.trustSection', { defaultValue: 'Trust & Verification' })}
              </span>
            </div>

            {/* 4. About Us */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onNavigateTab) onNavigateTab('about');
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer group border ${
                activeTab === 'about'
                  ? theme === 'light'
                    ? 'bg-violet-50 border-violet-300/80 shadow-sm'
                    : 'bg-violet-600/20 border-violet-500/40 shadow-sm'
                  : theme === 'light'
                    ? 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                    : 'hover:bg-slate-800/60 border-transparent hover:border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400 group-hover:scale-105 transition-transform shrink-0">
                  <Info className="w-4 h-4 text-violet-500" />
                </div>
                <div className="flex flex-col">
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <span>{t('nav.about', { defaultValue: 'About Us' })}</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    {t('nav.aboutDesc', { defaultValue: 'Mission & Queue Transparency' })}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* 5. Privacy Policy */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onNavigateTab) onNavigateTab('privacy');
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer group border ${
                activeTab === 'privacy'
                  ? theme === 'light'
                    ? 'bg-emerald-50 border-emerald-300/80 shadow-sm'
                    : 'bg-emerald-600/20 border-emerald-500/40 shadow-sm'
                  : theme === 'light'
                    ? 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                    : 'hover:bg-slate-800/60 border-transparent hover:border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <Lock className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <span>{t('nav.privacyPolicy', { defaultValue: 'Privacy Policy' })}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      {t('nav.verified', { defaultValue: 'VERIFIED' })}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    {t('nav.privacyDesc', { defaultValue: 'Data Protection & Security' })}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Header = ({ activeTab, setActiveTab, searchTerm, setSearchTerm, onLogoClick, onOpenTelegramNotice }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const [logoSrc, setLogoSrc] = useState('/logo.png');
  const [logoFailed, setLogoFailed] = useState(false);

  const handleLogoError = () => {
    if (logoSrc === '/logo.png') {
      setLogoSrc('/icon.png');
    } else {
      setLogoFailed(true);
    }
  };

  const handleBookingsClick = () => {
    setActiveTab('appointments');
  };

  const handleNotificationsClick = () => {
    setActiveTab('notifications');
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 md:px-8 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
        
        {/* Top Header Row on Mobile / Left Section on Desktop */}
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* Logo & Web Title */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
          >
            {!logoFailed ? (
              <img
                src={logoSrc}
                alt="Logo"
                onError={handleLogoError}
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-2xl group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10.5 sm:h-10.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="header-logo-title text-sm sm:text-base md:text-lg font-extrabold text-white tracking-tight leading-tight group-hover:text-violet-300 transition-colors">
                <span>{t('nav.title')}</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">{t('nav.subTitle')}</span>
            </div>
          </button>

          {/* Profile Button - Positioned in top-right corner on mobile (< md) */}
          <button
            onClick={handleProfileClick}
            title="Profile"
            className={`md:hidden flex items-center gap-1.5 p-1 rounded-full transition-all shrink-0 ${
              activeTab === 'profile'
                ? theme === 'light'
                  ? 'bg-violet-100 text-violet-800 border border-violet-300 shadow-sm'
                  : 'bg-violet-600/30 text-violet-300 border border-violet-500/50 shadow-md ring-2 ring-violet-500/30'
                : theme === 'light'
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/40 border border-transparent'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
            }`}
          >
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shadow-inner ${
              theme === 'light' ? 'bg-slate-100 border-violet-300 text-violet-700' : 'bg-slate-800 border-violet-500/40 text-violet-300'
            }`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="w-full md:w-auto md:flex-1 max-w-full md:max-w-xl mx-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t('home.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800/90 rounded-full py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 focus:outline-none transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons Row: Placed below Search Bar on Mobile */}
        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto py-0.5 relative">
          
          {/* Left on mobile: Home Button */}
          <div className="flex items-center shrink-0">
            <button
              onClick={onLogoClick}
              title={t('nav.homeTitle', { defaultValue: 'Home' })}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all cursor-pointer ${
                activeTab === 'salons'
                  ? theme === 'light'
                    ? 'bg-violet-100 text-violet-800 border border-violet-300 shadow-sm'
                    : 'bg-violet-600/30 text-violet-300 border border-violet-500/40 shadow-md'
                  : theme === 'light'
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/40 border border-transparent'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-violet-400" />
              <span className="hidden md:inline">{t('nav.homeTitle', { defaultValue: 'Home' })}</span>
            </button>
          </div>

          {/* Center on mobile: Bookings Button (Centered between Home and Language controls) */}
          <div className="flex-1 md:flex-initial flex items-center justify-center shrink-0">
            <button
              onClick={handleBookingsClick}
              title={t('nav.myAppointments')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all cursor-pointer ${
                activeTab === 'appointments'
                  ? theme === 'light'
                    ? 'bg-violet-100 text-violet-800 border border-violet-300 shadow-sm'
                    : 'bg-violet-600/30 text-violet-300 border border-violet-500/40 shadow-md'
                  : theme === 'light'
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/40 border border-transparent'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {/* Mobile View: "Bookings" */}
              <span className="inline md:hidden text-xs font-semibold">
                {t('nav.bookings', { defaultValue: 'Bookings' })}
              </span>
              {/* Desktop View: "My Appointments" */}
              <span className="hidden md:inline text-xs sm:text-sm font-semibold">
                {t('nav.myAppointments')}
              </span>
            </button>
          </div>

          {/* Right Controls: Language Selector & Alerts Dropdown on mobile; on desktop flows with Alerts & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto md:ml-0">
            {/* Language Selector: Right side below search bar on mobile */}
            <LanguageSelector storageKey="customer_lang" />

            {/* Alerts Dropdown (right side of Language Selector on mobile and desktop) */}
            <div className="inline-block">
              <AlertsDropdown
                theme={theme}
                activeTab={activeTab}
                onOpenTelegramNotice={onOpenTelegramNotice}
                handleNotificationsClick={handleNotificationsClick}
                onNavigateTab={setActiveTab}
                toggleTheme={toggleTheme}
                t={t}
              />
            </div>

            {/* Desktop Only Profile Button */}
            <button
              onClick={handleProfileClick}
              title="Profile"
              className={`hidden md:flex items-center gap-2 pl-1.5 sm:pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-full transition-all shrink-0 ${
                activeTab === 'profile'
                  ? theme === 'light'
                    ? 'bg-violet-100 text-violet-800 border border-violet-300 shadow-sm'
                    : 'bg-violet-600/30 text-violet-300 border border-violet-500/40 shadow-md'
                  : theme === 'light'
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/40 border border-transparent'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center text-xs sm:text-sm font-bold shadow-inner ${
                theme === 'light' ? 'bg-slate-100 border-violet-300 text-violet-700' : 'bg-slate-800 border-violet-500/40 text-violet-300'
              }`}>
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>
              <span className="hidden lg:inline text-xs sm:text-sm font-semibold max-w-[110px] truncate">
                {user?.name || 'Profile'}
              </span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};

export default Header;

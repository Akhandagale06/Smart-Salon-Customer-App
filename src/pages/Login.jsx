import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Phone, Lock, Sparkles, Loader, ArrowRight, User, MessageSquare } from 'lucide-react';
import api from '../config/api';
import Footer from '../components/Footer';
import LanguageSelector from '../components/LanguageSelector';

const Login = ({ forceStep3 }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { sendOtp, verifyOtp, updateProfileInContext } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(forceStep3 ? 3 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [customerName, setCustomerName] = useState('');

  // 20-Second OTP Pop-up Toast State
  const [otpPopup, setOtpPopup] = useState({ show: false, code: '', number: '', timeLeft: 20 });

  useEffect(() => {
    if (!otpPopup.show || otpPopup.timeLeft <= 0) return;
    const timer = setInterval(() => {
      setOtpPopup(prev => {
        if (prev.timeLeft <= 1) {
          return { ...prev, show: false, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpPopup.show, otpPopup.timeLeft]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError(t('login.errValidMobile', { defaultValue: 'Please enter a valid 10-digit mobile number' }));
      return;
    }

    setLoading(true);
    try {
      const responseData = await sendOtp(mobileNumber);
      const fetchedOtp = responseData?.data || responseData;
      setStep(2);

      if (fetchedOtp && (typeof fetchedOtp === 'string' || typeof fetchedOtp === 'number')) {
        const codeStr = String(fetchedOtp);
        setOtpPopup({ show: true, code: codeStr, number: mobileNumber, timeLeft: 20 });
        setInfoMessage('OTP generated! See notification popup.');
      } else {
        setInfoMessage('OTP sent! Please check SMS or backend logs.');
      }
    } catch (err) {
      setError(err.message || t('login.errSendOtpFailed', { defaultValue: 'Failed to send OTP.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be a 6-digit number');
      return;
    }

    setLoading(true);
    try {
      const authData = await verifyOtp(mobileNumber, otp);
      if (authData && (authData.isNewUser || !authData.name || authData.name.trim() === '')) {
        setStep(3); // Go to name entry step
        setInfoMessage('Please enter your name to complete registration.');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!customerName.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      await api.put('/api/customer/profile', { name: customerName });
      updateProfileInContext({ name: customerName });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save name');
    } finally {
      setLoading(false);
    }
  };

  // Custom Logo Image support (logo.png or icon.png in public/ directory)
  const [logoSrc, setLogoSrc] = useState('/logo.png');
  const [logoFailed, setLogoFailed] = useState(false);

  const handleLogoError = () => {
    if (logoSrc === '/logo.png') {
      setLogoSrc('/icon.png');
    } else {
      setLogoFailed(true);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans ${theme === 'light' ? 'theme-light bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* Top Language Selector */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-30">
        <LanguageSelector storageKey="customer_lang" />
      </div>

      {/* 20-Second OTP Pop-up Toast */}
      {otpPopup.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-bounce-in">
          <div className={`border-2 backdrop-blur-xl rounded-2xl p-4 shadow-2xl relative overflow-hidden transition-all ${
            theme === 'light'
              ? 'bg-white/95 border-violet-500 text-slate-900 shadow-violet-500/20'
              : 'bg-slate-900/95 border-violet-500/80 text-white shadow-violet-500/30'
          }`}>
            {/* 20s Countdown Progress Bar */}
            <div 
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(otpPopup.timeLeft / 20) * 100}%` }}
            ></div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 border animate-pulse ${
                  theme === 'light'
                    ? 'bg-violet-100 text-violet-600 border-violet-200'
                    : 'bg-violet-600/20 text-violet-400 border-violet-500/30'
                }`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 flex-wrap ${
                    theme === 'light' ? 'text-violet-700' : 'text-violet-300'
                  }`}>
                    <span>💬 {t('login.simulatedSms', { defaultValue: 'Simulated SMS Received' })}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                      theme === 'light'
                        ? 'bg-violet-100 text-violet-700 border-violet-300'
                        : 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                    }`}>
                      {otpPopup.timeLeft}s
                    </span>
                  </h4>
                  <p className={`text-xs font-medium mt-0.5 truncate ${
                    theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                  }`}>
                    {t('login.otpForNumber', { defaultValue: 'Your verification OTP for' })} <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>+91 {otpPopup.number}</span> {t('login.is', { defaultValue: 'is:' })}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setOtpPopup(prev => ({ ...prev, show: false }))}
                className={`text-xs font-bold p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  theme === 'light'
                    ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* OTP Code Display Box */}
            <div className={`mt-3 p-3 border rounded-xl flex items-center justify-between gap-2 ${
              theme === 'light'
                ? 'bg-violet-50/70 border-violet-200 shadow-inner'
                : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={`text-xl sm:text-2xl font-black tracking-[0.25em] sm:tracking-[0.3em] font-mono pl-1 sm:pl-2 ${
                theme === 'light' ? 'text-violet-700' : 'text-violet-400'
              }`}>
                {otpPopup.code}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOtp(otpPopup.code);
                  setOtpPopup(prev => ({ ...prev, show: false }));
                }}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-550 hover:to-fuchsia-550 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all shadow-md shadow-violet-500/25 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {t('login.autoFill', { defaultValue: 'Auto-fill Code' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="my-auto w-full max-w-md mx-auto relative z-10 pt-4">
        {/* Centered Brand Header directly upper side of the box */}
        <div className="text-center mb-5 flex justify-center">
          {!logoFailed ? (
            <div className={`inline-block p-1.5 rounded-2xl border shadow-xl hover:scale-105 transition-transform ${
              theme === 'light' 
                ? 'bg-white border-slate-200 shadow-slate-200/80' 
                : 'bg-slate-900/90 border-violet-500/30 shadow-violet-500/20'
            }`}>
              <img 
                src={logoSrc} 
                alt="Smart Salon Logo" 
                onError={handleLogoError}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-pink-500 text-white shadow-xl shadow-violet-500/30 border border-violet-400/30 group hover:scale-105 transition-transform">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          )}
        </div>

        {/* Card */}
        <div className={`rounded-3xl px-6 sm:px-8 py-8 sm:py-10 shadow-2xl relative border-t-2 border-t-violet-500/40 mb-4 transition-all ${
          theme === 'light'
            ? 'bg-white border border-slate-200 shadow-slate-200/70'
            : 'glass-panel'
        }`}>
          <h2 className={`text-xl sm:text-2xl font-extrabold mb-1.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {step === 3 ? t('login.completeProfile', { defaultValue: 'Complete Profile' }) : t('login.customerLogin', { defaultValue: 'Customer Login' })}
          </h2>
          <p className={`text-xs sm:text-sm mb-6 font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            {step === 3 
              ? t('login.enterNamePrompt', { defaultValue: 'Please enter your name to complete registration' }) 
              : t('login.enterMobile', { defaultValue: 'Enter mobile number to get instant OTP code' })}
          </p>

          {error && (
            <div className="p-3.5 mb-5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs sm:text-sm font-semibold">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 mb-5 bg-violet-500/10 border border-violet-500/25 text-violet-300 rounded-xl text-xs sm:text-sm font-medium">
              {infoMessage}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className={`text-xs sm:text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                  {t('login.mobileLabel', { defaultValue: 'Mobile Number' })}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone className="w-5 h-5" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder={t('login.mobilePlaceholder', { defaultValue: 'Enter 10-digit mobile number' })}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className={`w-full border rounded-xl py-3.5 sm:py-4 pl-11 pr-4 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-violet-500'
                        : 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-violet-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 text-white text-base font-bold rounded-xl py-3.5 sm:py-4 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all cursor-pointer active:scale-98"
              >
                {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>{t('login.sendOtp', { defaultValue: 'Send OTP' })} <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className={`text-xs sm:text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                  {t('login.otpLabel', { defaultValue: 'Enter OTP' })}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder={t('login.otpPlaceholder', { defaultValue: 'Enter 6-digit OTP' })}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className={`w-full border rounded-xl py-3.5 sm:py-4 pl-11 pr-4 text-base sm:text-lg tracking-[0.25em] font-mono text-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-violet-500'
                        : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-violet-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 text-white text-base font-bold rounded-xl py-3.5 sm:py-4 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all cursor-pointer active:scale-98"
              >
                {loading ? <Loader className="w-6 h-6 animate-spin" /> : t('login.verifyAndContinue', { defaultValue: 'Verify & Log In' })}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className={`w-full text-center text-xs sm:text-sm mt-2 block transition-colors cursor-pointer ${
                  theme === 'light' ? 'text-slate-500 hover:text-slate-800 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('login.editMobile', { defaultValue: 'Change mobile number' })}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveName} className="space-y-5">
              <div className="space-y-2">
                <label className={`text-xs sm:text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                  {t('login.nameLabel', { defaultValue: 'Your Full Name' })}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={t('login.namePlaceholder', { defaultValue: 'e.g. Rahul Sharma' })}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full border rounded-xl py-3.5 sm:py-4 pl-11 pr-4 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-violet-500'
                        : 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-violet-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 text-white text-base font-bold rounded-xl py-3.5 sm:py-4 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all cursor-pointer active:scale-98"
              >
                {loading ? <Loader className="w-6 h-6 animate-spin" /> : t('login.saveAndContinue', { defaultValue: 'Complete Registration' })}
              </button>
            </form>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Login;

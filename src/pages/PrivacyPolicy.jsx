import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  CheckCircle, 
  EyeOff, 
  KeyRound, 
  UserCheck, 
  Mail
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = ({ onBack, onNavigateTab }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isLight = theme === 'light';

  const sections = [
    {
      icon: <UserCheck className="w-5 h-5 text-violet-400" />,
      title: t('privacyPage.sec1Title', { defaultValue: '1. Information We Collect' }),
      content: [
        t('privacyPage.sec1P1', { 
          defaultValue: 'Personal Details: When registering, we collect your Name and Mobile Number. Mobile numbers are securely verified using One-Time Passwords (OTP).' 
        }),
        t('privacyPage.sec1P2', { 
          defaultValue: 'Queue & Booking Information: When you reserve a slot or join a live queue, we record your chosen service, appointment time, token number, and current queue state.' 
        }),
        t('privacyPage.sec1P3', { 
          defaultValue: 'Device & Preference Settings: We store essential app preferences locally on your device (such as your chosen display theme, language selection, and session tokens) so your settings persist.' 
        })
      ]
    },
    {
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      title: t('privacyPage.sec2Title', { defaultValue: '2. How We Use Your Data' }),
      content: [
        t('privacyPage.sec2P1', { 
          defaultValue: 'Queue & Turn Management: To calculate your real-time waiting estimation and notify you when your styling chair is ready.' 
        }),
        t('privacyPage.sec2P2', { 
          defaultValue: 'Timely Alerts: To send critical notifications regarding appointment confirmations, delays, or salon holiday updates via In-App notifications and our Telegram Bot.' 
        }),
        t('privacyPage.sec2P3', { 
          defaultValue: 'Service Fulfillment: To allow the specific salon stylist you booked with to recognize you when your token number is called.' 
        })
      ]
    },
    {
      icon: <EyeOff className="w-5 h-5 text-sky-400" />,
      title: t('privacyPage.sec3Title', { defaultValue: '3. Absolute No-Data-Selling Pledge' }),
      content: [
        t('privacyPage.sec3P1', { 
          defaultValue: 'We NEVER sell, trade, rent, or lease your personal information, mobile numbers, or booking records to third-party data brokers, marketers, or advertisers.' 
        }),
        t('privacyPage.sec3P2', { 
          defaultValue: 'Your contact information is strictly used for salon appointment logistics and queue operations within the Smart Salon platform.' 
        })
      ]
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />,
      title: t('privacyPage.sec4Title', { defaultValue: '4. Data Security & Encryption' }),
      content: [
        t('privacyPage.sec4P1', { 
          defaultValue: 'Encrypted Transmissions: All communications between your browser and our servers are encrypted using modern Transport Layer Security (TLS/HTTPS).' 
        }),
        t('privacyPage.sec4P2', { 
          defaultValue: 'Passwordless Authentication: We use secure OTP verification, eliminating the risk of compromised passwords or credential leaks.' 
        }),
        t('privacyPage.sec4P3', { 
          defaultValue: 'Role-Based Access: Salon staff only have access to active tokens and customer names for the services they are assigned to handle.' 
        })
      ]
    },
    {
      icon: <KeyRound className="w-5 h-5 text-amber-400" />,
      title: t('privacyPage.sec5Title', { defaultValue: '5. Your Rights & Data Control' }),
      content: [
        t('privacyPage.sec5P1', { 
          defaultValue: 'Profile Updates: You can modify your name, mobile number, and city preferences at any time from your Profile page.' 
        }),
        t('privacyPage.sec5P2', { 
          defaultValue: 'Notification Control: Notifications automatically clear daily to keep your inbox clean, and you can clear them manually anytime.' 
        }),
        t('privacyPage.sec5P3', { 
          defaultValue: 'Account Deletion: If you wish to permanently delete your account and associated records, you can submit a request via our support team.' 
        })
      ]
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in-50 duration-300">
      
      {/* Top Navigation & Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
            isLight
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('privacyPage.back', { defaultValue: 'Back to Salons' })}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Lock className="w-3.5 h-3.5" />
            <span>{t('privacyPage.trustBadge', { defaultValue: 'Bank-Grade Privacy Standard' })}</span>
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className={`rounded-3xl p-6 sm:p-10 border ${
        isLight
          ? 'bg-gradient-to-br from-emerald-50/70 via-white to-violet-50/50 border-slate-200 shadow-sm'
          : 'bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border-slate-800 shadow-xl'
      }`}>
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-400">
            {t('privacyPage.officialBadge', { defaultValue: 'Official Privacy Policy' })}
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {t('privacyPage.title', { defaultValue: 'Customer Privacy & Data Protection' })}
          </h1>
          <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {t('privacyPage.subtitle', { 
              defaultValue: 'At Smart Salon, we believe trust is earned through transparency. This Privacy Policy details how we handle, protect, and respect your personal information.' 
            })}
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            {t('privacyPage.effectiveDate', { defaultValue: 'Last Updated: September 2026 • Effective Worldwide' })}
          </p>
        </div>
      </div>

      {/* Trust Summary Box */}
      <div className={`p-5 rounded-2xl border ${
        isLight
          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
          : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
      }`}>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">
              {t('privacyPage.promiseTitle', { defaultValue: 'Our Privacy Promise in Plain English:' })}
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90">
              {t('privacyPage.promiseDesc', { 
                defaultValue: 'We never sell your phone number or data to advertisers. We collect only what is strictly necessary to hold your spot in the salon queue, send your turn alerts, and ensure you receive the haircut or styling service you booked.' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="space-y-5">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className={`p-5 sm:p-6 rounded-2xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-900/70 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-violet-500/10">
                {sec.icon}
              </div>
              <h3 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {sec.title}
              </h3>
            </div>

            <div className="space-y-2 pl-2">
              {sec.content.map((point, pIdx) => (
                <div key={pIdx} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                  <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Support & Contact Details */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-3 rounded-xl bg-violet-500/15 text-violet-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t('privacyPage.contactTitle', { defaultValue: 'Have Privacy Questions or Data Requests?' })}
            </h4>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('privacyPage.contactSubtitle', { defaultValue: 'Our dedicated Data Protection Team is here to help with any inquiries.' })}
            </p>
          </div>
        </div>

        <a
          href="mailto:support@smartsalon.com"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          support@smartsalon.com
        </a>
      </div>

      {/* Bottom Switch back to About */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => onNavigateTab ? onNavigateTab('about') : null}
          className="text-xs text-violet-400 hover:text-violet-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <span>{t('privacyPage.learnMoreAbout', { defaultValue: 'Learn more about how Smart Salon works in our About page' })}</span>
        </button>
      </div>

    </div>
  );
};

export default PrivacyPolicy;

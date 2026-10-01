import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Bell, 
  Lock, 
  Award,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const About = ({ onBack, onNavigateTab }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isLight = theme === 'light';

  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const trustPillars = [
    {
      icon: <Clock className="w-6 h-6 text-violet-500" />,
      title: t('aboutPage.pillar1Title', { defaultValue: 'Real-Time Queue Transparency' }),
      description: t('aboutPage.pillar1Desc', { 
        defaultValue: 'No guesswork or waiting in crowded salon lobbies. You see exactly how many clients are ahead, who is in the chair, and accurate remaining minutes.' 
      })
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-500" />,
      title: t('aboutPage.pillar2Title', { defaultValue: 'Zero Spam & Data Privacy' }),
      description: t('aboutPage.pillar2Desc', { 
        defaultValue: 'We strictly protect your identity. Your mobile number and profile are only used for turn notifications and booking confirmations—never sold or shared.' 
      })
    },
    {
      icon: <Award className="w-6 h-6 text-amber-500" />,
      title: t('aboutPage.pillar3Title', { defaultValue: 'Strict Turn Fairness' }),
      description: t('aboutPage.pillar3Desc', { 
        defaultValue: 'Our algorithmic queue follows transparent, first-come first-served rules alongside scheduled time slots. No jumping queues or preferential treatment.' 
      })
    },
    {
      icon: <Bell className="w-6 h-6 text-sky-500" />,
      title: t('aboutPage.pillar4Title', { defaultValue: 'Instant Turn Alerts' }),
      description: t('aboutPage.pillar4Desc', { 
        defaultValue: 'Receive timely reminders via In-App notifications and Telegram bot when your turn is 15 minutes away, so you arrive relaxed and ready.' 
      })
    }
  ];

  const steps = [
    {
      number: "01",
      title: t('aboutPage.step1Title', { defaultValue: 'Find Your Salon' }),
      desc: t('aboutPage.step1Desc', { defaultValue: 'Browse top-rated local salons, view their live open/closed status, operating hours, and service menus.' })
    },
    {
      number: "02",
      title: t('aboutPage.step2Title', { defaultValue: 'Book or Join Live Queue' }),
      desc: t('aboutPage.step2Desc', { defaultValue: 'Pick your preferred time slot or join the live walk-in queue with a single tap from anywhere.' })
    },
    {
      number: "03",
      title: t('aboutPage.step3Title', { defaultValue: 'Track Wait Time Anywhere' }),
      desc: t('aboutPage.step3Desc', { defaultValue: 'Grab a coffee or continue working while your queue position counts down live in real time.' })
    },
    {
      number: "04",
      title: t('aboutPage.step4Title', { defaultValue: 'Instant Alert & Service' }),
      desc: t('aboutPage.step4Desc', { defaultValue: 'Get notified when it is your turn. Walk straight to the styling chair with zero waiting friction.' })
    }
  ];

  const faqs = [
    {
      q: t('aboutPage.faq1Q', { defaultValue: 'How does the live queue wait estimation work?' }),
      a: t('aboutPage.faq1A', { defaultValue: 'Our smart queue engine calculates wait times based on the active styling services of customers ahead in line and historical completion paces. It updates dynamically as stylists complete appointments.' })
    },
    {
      q: t('aboutPage.faq2Q', { defaultValue: 'Is my personal data safe with Smart Salon?' }),
      a: t('aboutPage.faq2A', { defaultValue: 'Yes, completely. We adhere to high data privacy standards. Your phone number is verified via OTP only for security and appointment reminders. We never share your data with advertisers.' })
    },
    {
      q: t('aboutPage.faq3Q', { defaultValue: 'What happens if I arrive a few minutes late?' }),
      a: t('aboutPage.faq3A', { defaultValue: 'Salons keep a gentle grace buffer. However, to keep wait times fair for everyone in queue, we send 15-minute and 5-minute pre-alerts so you can arrive right on time.' })
    },
    {
      q: t('aboutPage.faq4Q', { defaultValue: 'Do I have to pay online to join the queue?' }),
      a: t('aboutPage.faq4A', { defaultValue: 'No online pre-payment is mandatory! You can join the queue or book slots smoothly and pay directly at the salon counter after enjoying your service.' })
    },
    {
      q: t('aboutPage.faq5Q', { defaultValue: 'Can I receive queue alerts on Telegram?' }),
      a: t('aboutPage.faq5A', { defaultValue: 'Yes! Use the Get Bot Alert option in the Alerts menu to connect our Telegram notification bot for instant push updates directly on your phone.' })
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in-50 duration-300">
      
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
          <span>{t('aboutPage.back', { defaultValue: 'Back to Salons' })}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('aboutPage.trustBadge', { defaultValue: 'Built For Trust & Transparency' })}</span>
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 border text-center ${
        isLight
          ? 'bg-gradient-to-b from-violet-50/80 via-white to-slate-50 border-slate-200 shadow-md'
          : 'bg-gradient-to-b from-violet-950/40 via-slate-900/90 to-slate-950 border-slate-800/80 shadow-2xl'
      }`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('aboutPage.verifiedBadge', { defaultValue: 'Verified Salon Platform' })}</span>
          </div>

          <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {t('aboutPage.heroTitlePrefix', { defaultValue: 'Skip The Waiting Room.' })}{' '}
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-500 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('aboutPage.heroTitleGradient', { defaultValue: 'Experience Total Queue Transparency.' })}
            </span>
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {t('aboutPage.heroSubtitle', { 
              defaultValue: 'Smart Salon was built with a single mission: to eliminate long, unpredictable salon waiting times. We provide real-time queue visibility so customers can spend their time living their lives rather than sitting on a waiting bench.' 
            })}
          </p>
        </div>
      </div>

      {/* 4 Trust Pillars */}
      <div className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {t('aboutPage.whyTrustTitle', { defaultValue: 'Why Customers Trust Smart Salon' })}
          </h2>
          <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('aboutPage.whyTrustSubtitle', { defaultValue: 'Our commitments to honesty, security, and exceptional convenience.' })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trustPillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                isLight
                  ? 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-2.5 w-fit rounded-xl bg-violet-500/10 mb-3.5">
                {pillar.icon}
              </div>
              <h3 className={`text-base font-bold mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {pillar.title}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900/40 border-slate-800'
      }`}>
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
            {t('aboutPage.howItWorksTag', { defaultValue: 'Simple 4-Step Process' })}
          </span>
          <h2 className={`text-xl sm:text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {t('aboutPage.howItWorksTitle', { defaultValue: 'How It Works For You' })}
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('aboutPage.howItWorksSubtitle', { defaultValue: 'From finding your stylist to walking in effortlessly when your chair is ready.' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((st, i) => (
            <div 
              key={i} 
              className={`relative p-4 rounded-2xl border flex flex-col justify-between ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent">
                  {st.number}
                </span>
                <h4 className={`text-sm font-bold mt-2 mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {st.title}
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-violet-400" />
          <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {t('aboutPage.faqsTitle', { defaultValue: 'Customer FAQs' })}
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer focus:outline-none"
                >
                  <span className={`text-sm sm:text-base font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-violet-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <div className={`px-4 pb-4 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                    isLight 
                      ? 'border-slate-100 text-slate-600' 
                      : 'border-slate-800/80 text-slate-300'
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust & Privacy Quick Action Card */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isLight
          ? 'bg-gradient-to-r from-violet-100/70 via-purple-50 to-pink-50 border-violet-200'
          : 'bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-900 border-violet-500/20'
      }`}>
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t('aboutPage.ctaTitle', { defaultValue: 'Want to review our data protection policy?' })}
            </h4>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {t('aboutPage.ctaSubtitle', { defaultValue: 'Read our comprehensive Privacy Policy detailing how we safeguard your personal information.' })}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab ? onNavigateTab('privacy') : null}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          {t('aboutPage.ctaBtn', { defaultValue: 'Read Privacy Policy' })}
        </button>
      </div>

    </div>
  );
};

export default About;

'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import posthog from 'posthog-js';
import useTiktokUpsellStore from '@/store/useTiktokUpsellStore';
import TiktokProfileSearchInput from '@/components/tiktok-upsell/ProfileSearchInput';
import TiktokServiceSelector from '@/components/tiktok-upsell/ServiceSelector';
import TiktokPostGrid from '@/components/tiktok-upsell/PostGrid';
import TiktokCheckoutSummary from '@/components/tiktok-upsell/CheckoutSummary';
import { getStripe } from '@/components/StripeProvider';
import { type Language } from '@/i18n/config';
import { getTiktokUpsellTranslations } from '@/i18n/tiktok-upsell';

const stepVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function TiktokUpsellPage() {
  const params = useParams();
  const lang = (params?.lang as Language) || 'fr';
  const t = getTiktokUpsellTranslations(lang);
  const { currentStep } = useTiktokUpsellStore();

  useEffect(() => {
    posthog.capture('tunnel_page_viewed', { target_platform: 'tiktok' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    if (currentStep >= 3) {
      getStripe();
    }
  }, [currentStep]);

  const steps = [
    { id: 0, title: t.steps.profile },
    { id: 1, title: t.steps.services },
    { id: 2, title: t.steps.posts },
    { id: 3, title: t.steps.payment },
  ];

  return (
    <div className="relative isolate min-h-full bg-gray-950 font-sans selection:bg-cyan-500/30">
      {/* Lightweight Background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-gray-950 to-pink-900/10" />
      </div>

      {/* Progress Header */}
      <header className="sticky top-0 z-40 bg-gray-950/95 sm:bg-gray-950/80 sm:backdrop-blur-xl border-b border-gray-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-center">
          <div className="hidden sm:flex items-center gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-tr from-cyan-500 via-pink-500 to-red-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id + 1
                  )}
                </div>
                <span className={`text-sm font-medium ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-px ${currentStep > step.id ? 'bg-cyan-500/50' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Mobile Progress */}
          <div className="flex sm:hidden items-center justify-between w-full">
            <span className="text-sm font-medium text-white">{steps[currentStep]?.title}</span>
            <span className="text-xs font-medium text-gray-500">{t.stepOf.replace('{current}', String(currentStep + 1))}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-20 min-h-[calc(100vh-64px)] flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="step-0" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="flex-1 flex flex-col">
              <TiktokProfileSearchInput lang={lang} />
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="step-1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="flex-1 flex flex-col">
              <TiktokServiceSelector lang={lang} />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step-2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="flex-1 flex flex-col">
              <TiktokPostGrid lang={lang} />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step-3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="flex-1 flex flex-col">
              <TiktokCheckoutSummary lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}

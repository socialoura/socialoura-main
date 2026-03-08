'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import posthog from 'posthog-js';
import useUpsellStore from '@/store/useUpsellStore';
import ProfileSearchInput from '@/components/upsell/ProfileSearchInput';
import ServiceSelector from '@/components/upsell/ServiceSelector';
import PostGrid from '@/components/upsell/PostGrid';
import CheckoutSummary from '@/components/upsell/CheckoutSummary';
import { getStripe } from '@/components/StripeProvider';
import { type Language } from '@/i18n/config';
import { getUpsellTranslations } from '@/i18n/upsell';
import { useAdsParams } from '@/hooks/useAdsParams';

const stepVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function UpsellPage() {
  const params = useParams();
  const lang = (params?.lang as Language) || 'fr';
  const t = getUpsellTranslations(lang);
  const { currentStep } = useUpsellStore();
  useAdsParams();

  // Étape 0: Track tunnel page view on mount
  useEffect(() => {
    posthog.capture('instagram_tunnel_page_viewed');
  }, []);

  // Scroll to top on every step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Preload Stripe SDK when user reaches step 3 (payment) to save memory on earlier steps
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
    <div className="relative isolate min-h-full bg-gray-950 font-sans selection:bg-pink-500/30">
      {/* Lightweight Background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-gray-950 to-pink-900/10" />
      </div>

      {/* Progress Header */}
      <header className="sticky top-0 z-40 bg-gray-950/95 sm:bg-gray-950/80 sm:backdrop-blur-xl border-b border-gray-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-center">
          <div className="hidden sm:flex items-center gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20' 
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
                  <div className={`w-8 h-px ${currentStep > step.id ? 'bg-pink-500/50' : 'bg-gray-800'}`} />
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
              <ProfileSearchInput lang={lang} />
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="step-1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="flex-1 flex flex-col">
              <ServiceSelector lang={lang} />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step-2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="flex-1 flex flex-col">
              <PostGrid lang={lang} />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step-3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="flex-1 flex flex-col">
              <CheckoutSummary lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}

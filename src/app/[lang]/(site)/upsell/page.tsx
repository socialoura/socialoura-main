'use client';

import { AnimatePresence, motion } from 'framer-motion';
import useUpsellStore from '@/store/useUpsellStore';
import ProfileSearchInput from '@/components/upsell/ProfileSearchInput';
import ServiceSelector from '@/components/upsell/ServiceSelector';
import PostGrid from '@/components/upsell/PostGrid';
import CheckoutSummary from '@/components/upsell/CheckoutSummary';

const stepVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const steps = [
  { id: 0, title: 'Profil' },
  { id: 1, title: 'Services' },
  { id: 2, title: 'Publications' },
  { id: 3, title: 'Paiement' },
];

export default function UpsellPage() {
  const { currentStep } = useUpsellStore();

  return (
    <div className="relative isolate min-h-full bg-gray-950 font-sans selection:bg-pink-500/30">
      {/* Premium Background Effects from /t */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-gray-950 to-pink-900/10" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Progress Header */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-center">
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
            <span className="text-xs font-medium text-gray-500">Étape {currentStep + 1}/4</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 min-h-[calc(100vh-64px)] flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="step-0" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
              <ProfileSearchInput />
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="step-1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
              <ServiceSelector />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step-2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
              <PostGrid />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step-3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
              <CheckoutSummary />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

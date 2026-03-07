'use client';

import { useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowLeft, ArrowRight, Heart, Eye } from 'lucide-react';
import posthog from 'posthog-js';
import useTiktokUpsellStore from '@/store/useTiktokUpsellStore';
import { proxyImageUrl } from '@/lib/image-proxy';
import { type Language } from '@/i18n/config';
import { getTiktokUpsellTranslations } from '@/i18n/tiktok-upsell';

interface PostGridProps {
  lang: Language;
}

function TiktokPostGrid({ lang }: PostGridProps) {
  const t = getTiktokUpsellTranslations(lang);
  const {
    posts,
    selectedPostsByService,
    currentDistributionService,
    selectedServices,
    togglePostSelection,
    calculateDistribution,
    prevStep,
    nextStep,
  } = useTiktokUpsellStore();

  const gridViewedRef = useRef(false);
  useEffect(() => {
    if (!gridViewedRef.current && currentDistributionService) {
      posthog.capture('step3_grid_viewed', { has_posts_available: posts.length > 0, target_platform: 'tiktok' });
      gridViewedRef.current = true;
    }
  }, [posts.length, currentDistributionService]);

  if (!currentDistributionService) return null;

  const distribution = calculateDistribution();
  const currentServiceData = selectedServices[currentDistributionService];

  if (!currentServiceData) return null;

  const serviceLabel = currentDistributionService === 'likes' ? t.service.likes : t.service.views;
  const ServiceIcon = currentDistributionService === 'likes' ? Heart : Eye;
  const currentSelectedPosts = selectedPostsByService[currentDistributionService] || [];
  const hasSelectedPosts = currentSelectedPosts.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full pb-28 sm:pb-32">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <button
            onClick={prevStep}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-4 transition-colors duration-200 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.grid.backToServices}
          </button>

          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-1 sm:mb-2 flex items-center gap-3">
            {t.grid.whereToSend.replace('{service}', serviceLabel.toLowerCase())}
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            {t.grid.selectPosts}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-4 rounded-2xl shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-pink-500 to-red-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ServiceIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">{t.grid.toDistribute}</p>
            <p className="text-xl font-bold text-white tracking-tight">
              {currentServiceData.quantity.toLocaleString()} <span className="text-cyan-400">{serviceLabel}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid Status Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800/50">
        <p className="text-sm font-medium text-gray-300">
          <span className="text-white font-bold">{posts.length}</span> {t.grid.postsAvailable}
        </p>
        <AnimatePresence mode="popLayout">
          {hasSelectedPosts && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold"
            >
              <CheckCircle className="w-4 h-4" />
              {t.grid.selectedCount.replace('{count}', String(currentSelectedPosts.length))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6">
        {posts.map((post, index) => {
          const isSelected = currentSelectedPosts.includes(post.id);
          const dist = distribution.find((d) => d.postId === post.id);

          return (
            <motion.button
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const willBeSelected = !currentSelectedPosts.includes(post.id);
                togglePostSelection(post.id);
                posthog.capture('step3_post_toggled', {
                  action: willBeSelected ? 'selected' : 'unselected',
                  current_total_selected: willBeSelected ? currentSelectedPosts.length + 1 : currentSelectedPosts.length - 1,
                  target_platform: 'tiktok',
                });
              }}
              className={`group relative aspect-[4/5] rounded-2xl overflow-hidden transition-all duration-300 ${
                isSelected
                  ? 'ring-2 ring-cyan-500 ring-offset-4 ring-offset-gray-950 shadow-xl shadow-cyan-500/20'
                  : 'ring-1 ring-gray-800 hover:ring-gray-600'
              }`}
            >
              <Image
                src={proxyImageUrl(post.imageUrl)}
                alt={post.caption || `Video ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />

              {/* Overlay */}
              <div
                className={`absolute inset-0 transition-all duration-300 ${
                  isSelected ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-100'
                }`}
              />

              {/* Stats for non-selected */}
              {!isSelected && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/80 text-xs font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likesCount}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.commentsCount}</span>
                </div>
              )}

              {/* Selected State Indicators */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-pink-500 to-red-500 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isSelected && dist && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-3 left-3 right-3"
                  >
                    <div className="bg-gray-900/90 backdrop-blur-md rounded-xl py-2 px-3 text-center border border-gray-700/50 shadow-lg">
                      <span className="text-cyan-400 text-[11px] sm:text-sm font-black tracking-tight">
                        +{dist.amount} {serviceLabel}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-100 border-t border-gray-800 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gray-800 items-center justify-center">
              <ServiceIcon className={`w-6 h-6 ${hasSelectedPosts ? 'text-cyan-400' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-400 mb-0.5">{t.grid.autoDistribution}</p>
              {hasSelectedPosts ? (
                <p className="text-base sm:text-lg font-bold text-white">
                  {t.grid.perPost.replace('{amount}', Math.floor(currentServiceData.quantity / currentSelectedPosts.length).toLocaleString()).replace('{service}', serviceLabel)}
                </p>
              ) : (
                <p className="text-sm sm:text-lg font-medium text-gray-500">
                  {t.grid.selectAtLeast}
                </p>
              )}
            </div>
          </div>

          <button
            disabled={!hasSelectedPosts}
            onClick={() => {
              if (!hasSelectedPosts) return;
              posthog.capture('step3_completed', { total_posts_selected: currentSelectedPosts.length, target_platform: 'tiktok' });
              nextStep();
            }}
            className="w-full sm:w-auto relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-pink-500 to-red-500 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 uppercase tracking-wide group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="relative z-10">{t.grid.validateSelection}</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(TiktokPostGrid);

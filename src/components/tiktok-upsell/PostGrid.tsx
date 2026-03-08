'use client';

import { useEffect, useRef, memo } from 'react';
import Image from 'next/image';
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

        <div className="flex items-center gap-3 bg-gray-900/50 sm:backdrop-blur-xl border border-gray-800 p-4 rounded-2xl shrink-0">
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
        {hasSelectedPosts && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            {t.grid.selectedCount.replace('{count}', String(currentSelectedPosts.length))}
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
        {posts.map((post, index) => {
          const isSelected = currentSelectedPosts.includes(post.id);
          const dist = distribution.find((d) => d.postId === post.id);

          return (
            <button
              key={post.id}
              onClick={() => {
                const willBeSelected = !currentSelectedPosts.includes(post.id);
                togglePostSelection(post.id);
                posthog.capture('step3_post_toggled', {
                  action: willBeSelected ? 'selected' : 'unselected',
                  current_total_selected: willBeSelected ? currentSelectedPosts.length + 1 : currentSelectedPosts.length - 1,
                  target_platform: 'tiktok',
                });
              }}
              className={`group relative aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden transition-colors duration-200 ${
                isSelected
                  ? 'ring-2 ring-cyan-500 ring-offset-2 sm:ring-offset-4 ring-offset-gray-950'
                  : 'ring-1 ring-gray-800 hover:ring-gray-600'
              }`}
            >
              <Image
                src={proxyImageUrl(post.imageUrl)}
                alt={post.caption || `Video ${index + 1}`}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                unoptimized
              />

              {/* Overlay */}
              <div
                className={`absolute inset-0 ${
                  isSelected ? 'bg-black/40' : 'bg-gradient-to-t from-gray-950/60 via-transparent to-transparent'
                }`}
              />

              {/* Selected State Indicator */}
              {isSelected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-pink-500 to-red-500 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                </div>
              )}

              {isSelected && dist && (
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                  <div className="bg-gray-900/90 rounded-lg sm:rounded-xl py-1.5 sm:py-2 px-2 sm:px-3 text-center border border-gray-700/50">
                    <span className="text-cyan-400 text-[10px] sm:text-sm font-black tracking-tight">
                      +{dist.amount} {serviceLabel}
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-100 border-t border-gray-800 z-50">
        <div className="max-w-5xl mx-auto px-6 pt-4 pb-6 sm:pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
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
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 via-pink-500 to-red-500 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg hover:opacity-90 transition-opacity duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{t.grid.validateSelection}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(TiktokPostGrid);

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, AlertCircle, Instagram, ChevronRight, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import posthog from 'posthog-js';
import useUpsellStore from '@/store/useUpsellStore';
import { proxyImageUrl } from '@/lib/image-proxy';
import { type Language } from '@/i18n/config';
import { getUpsellTranslations } from '@/i18n/upsell';

interface ProfileSearchInputProps {
  lang: Language;
}

export default function ProfileSearchInput({ lang }: ProfileSearchInputProps) {
  const t = getUpsellTranslations(lang);
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState<{
    username: string;
    fullName: string;
    avatarUrl: string;
    followersCount: number;
    posts: Array<{ id: string; shortCode: string; imageUrl: string; caption: string; likesCount: number; commentsCount: number }>;
  } | null>(null);
  const {
    isProfileLoading,
    profileError,
    setUsername,
    setProfile,
    setProfileLoading,
    setProfileError,
  } = useUpsellStore();

  const handleSearch = async (searchUsername: string) => {
    const clean = searchUsername.replace('@', '').trim();
    if (!clean) return;

    setUsername(clean);
    setProfileLoading(true);
    setProfileError(null);
    setSearchResult(null);

    posthog.capture('step1_search_initiated', { target_platform: 'instagram' });

    try {
      const res = await fetch(`/api/scraper?username=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t.search.errorTitle);
      }

      setSearchResult({
        username: data.username,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        followersCount: data.followersCount,
        posts: data.posts,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t.search.errorTitle;
      posthog.capture('step1_search_failed', { error_reason: errorMsg });
      setProfileError(errorMsg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSelectProfile = () => {
    if (!searchResult) return;
    posthog.capture('step1_profile_found', { follower_count: searchResult.followersCount });
    setUsername(searchResult.username);
    setProfile({
      avatarUrl: searchResult.avatarUrl,
      fullName: searchResult.fullName,
      followersCount: searchResult.followersCount,
      posts: searchResult.posts,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isProfileLoading) return;
    await handleSearch(trimmedValue);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-2 sm:mt-12 min-h-[60vh]">
      {/* Hero header */}
      <div className="text-center mb-8 sm:mb-14">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 mb-4 sm:mb-6 shadow-lg shadow-pink-500/20">
          <Instagram className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 sm:mb-4 leading-tight">
          {t.search.title}
        </h1>
        <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed px-2">
          {t.search.subtitle}
        </p>
      </div>

      {/* Search form */}
      <div className="mb-2 pl-4">
        <p className="text-xs text-gray-500 italic">
          {t.search.publicNote}
        </p>
      </div>
      <div className="p-2 sm:p-2.5 bg-gray-800/50 sm:backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-lg sm:shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
              @
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.search.placeholder}
              disabled={isProfileLoading}
              className="w-full pl-11 pr-4 py-3.5 sm:py-4 text-base sm:text-lg bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isProfileLoading}
            className="rounded-xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg hover:opacity-90 transition-opacity duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProfileLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.search.searching}</span>
              </>
            ) : (
              <>
                <span>{t.search.continue}</span>
                <Search className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-pink-400" />
          <span>{t.search.secure}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-pink-400" />
          <span>{t.search.noPassword}</span>
        </div>
      </div>

      {/* Trustpilot badge */}
      <div className="flex items-center justify-center mt-4">
        <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2" aria-label="Trustpilot rating 4.8 out of 5">
          <span className="text-sm font-black text-white">4.8</span>
          <span className="h-4 w-px bg-white/20"></span>
          <span className="inline-flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="inline-flex items-center justify-center w-5 h-5 rounded-[3px]" style={{ backgroundColor: 'rgb(0, 182, 122)' }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white" aria-hidden="true">
                  <path d="M12 17.27l-5.18 3.05 1.4-5.95L3.5 9.24l6.06-.52L12 3l2.44 5.72 6.06.52-4.72 5.13 1.4 5.95z"></path>
                </svg>
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Immersive Loading Skeleton */}
      <AnimatePresence>
        {isProfileLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-8 sm:mt-10 space-y-6"
          >
            {/* Profile skeleton */}
            <div className="bg-gray-800/50 sm:backdrop-blur-xl rounded-2xl border border-gray-700/50 p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-5 bg-gray-700 rounded-lg w-36 animate-pulse" />
                <div className="h-4 bg-gray-700/70 rounded-lg w-24 animate-pulse" />
                <div className="h-3.5 bg-gray-700/50 rounded-lg w-20 animate-pulse" />
              </div>
            </div>

            {/* Fake post grid skeleton */}
            <div>
              <p className="text-xs text-gray-500 mb-3 font-medium">{t.search.skeletonPosts}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-gray-800/60 animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search result - Profile card */}
      <AnimatePresence>
        {searchResult && !isProfileLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-8 sm:mt-10"
          >
            <button
              onClick={handleSelectProfile}
              className="w-full bg-gray-800/50 sm:backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-pink-500/50 p-4 sm:p-6 flex items-center gap-4 sm:gap-5 transition-colors duration-200 group hover:bg-gray-800/80"
            >
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-700 ring-2 ring-transparent group-hover:ring-pink-500/50 transition-colors duration-200">
                  <Image
                    src={proxyImageUrl(searchResult.avatarUrl)}
                    alt={searchResult.username}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Instagram className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-white text-base sm:text-xl group-hover:text-pink-400 transition-colors truncate">
                  @{searchResult.username}
                </p>
                <p className="text-sm text-gray-400 truncate">{searchResult.fullName}</p>
                <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" />
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {searchResult.followersCount.toLocaleString()} <span className="text-gray-500 font-normal">{t.search.followers}</span>
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-700/50 group-hover:bg-pink-500/20 flex items-center justify-center transition-colors duration-300">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-pink-400 transition-colors" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {profileError && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-8 sm:mt-10"
          >
            <div className="bg-red-900/20 rounded-2xl border border-red-500/30 p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-red-400">{t.search.errorTitle}</p>
                <p className="text-xs sm:text-sm text-red-300/80 mt-1 leading-relaxed">
                  {t.search.errorDesc}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Before/After visual - only show when no search result and no loading */}
      {!searchResult && !isProfileLoading && !profileError && (
        <div className="mt-8 sm:mt-10 mx-auto max-w-2xl w-full px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              {t.search.resultsTitle}
            </h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.search.beforeAfterLabel}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Before Image */}
            <div className="relative">
              <Image
                src="/before.png"
                alt="Avant - Profil Instagram"
                width={400}
                height={400}
                className="w-full h-auto rounded-xl shadow-lg"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute top-2 left-2 bg-gray-900/80 px-2 py-1 rounded-lg">
                <span className="text-xs font-bold text-gray-300">Avant</span>
              </div>
            </div>

            {/* After Image */}
            <div className="relative">
              <Image
                src="/after.png"
                alt="Après - Profil Instagram boosté"
                width={400}
                height={400}
                className="w-full h-auto rounded-xl shadow-lg ring-2 ring-pink-500/30"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-600 px-2 py-1 rounded-lg">
                <span className="text-xs font-bold text-white">Après</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

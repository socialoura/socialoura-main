'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, AlertCircle, Instagram, ChevronRight, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import useUpsellStore from '@/store/useUpsellStore';

export default function ProfileSearchInput() {
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

    try {
      const res = await fetch(`/api/scraper?username=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Profil introuvable');
      }

      setSearchResult({
        username: data.username,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        followersCount: data.followersCount,
        posts: data.posts,
      });
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSelectProfile = () => {
    if (!searchResult) return;
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
    <div className="w-full max-w-2xl mx-auto mt-4 sm:mt-12">
      {/* Hero header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 mb-6 shadow-lg shadow-pink-500/20">
          <Instagram className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
          BOOSTEZ VOTRE PROFIL
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Entrez votre nom d&apos;utilisateur Instagram public pour commencer. Aucun mot de passe requis.
        </p>
      </div>

      {/* Search form - /t style */}
      <div className="mb-2 pl-4">
        <p className="text-xs text-gray-500 italic">
          * Assurez-vous que votre compte est en public.
        </p>
      </div>
      <div className="p-2 sm:p-2.5 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
              @
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="votre_pseudo"
              disabled={isProfileLoading}
              className="w-full pl-11 pr-4 py-4 text-base sm:text-lg bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isProfileLoading}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 uppercase tracking-wide group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProfileLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Recherche...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">Continuer</span>
                <Search className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </form>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8 text-xs sm:text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-pink-400" />
          <span>100% Sécurisé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-pink-400" />
          <span>Sans mot de passe</span>
        </div>
      </div>

      {/* Loading skeleton */}
      <AnimatePresence>
        {isProfileLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-10"
          >
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-700 rounded-lg w-40 animate-pulse" />
                <div className="h-4 bg-gray-700 rounded-lg w-24 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search result - Profile card */}
      <AnimatePresence>
        {searchResult && !isProfileLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-10"
          >
            <button
              onClick={handleSelectProfile}
              className="w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-pink-500/50 p-6 flex items-center gap-5 transition-all duration-300 group hover:bg-gray-800/80"
            >
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-700 ring-2 ring-transparent group-hover:ring-pink-500/50 transition-all duration-300">
                  <Image
                    src={searchResult.avatarUrl}
                    alt={searchResult.username}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-white text-lg sm:text-xl group-hover:text-pink-400 transition-colors truncate">
                  @{searchResult.username}
                </p>
                <p className="text-sm sm:text-base text-gray-400 truncate">{searchResult.fullName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="w-4 h-4 text-pink-500" />
                  <p className="text-sm font-semibold text-white">
                    {searchResult.followersCount.toLocaleString()} <span className="text-gray-500 font-normal">abonnés</span>
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-700/50 group-hover:bg-pink-500/20 flex items-center justify-center transition-colors duration-300">
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-pink-400 transition-colors" />
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
            className="mt-10"
          >
            <div className="bg-red-900/20 backdrop-blur-xl rounded-2xl border border-red-500/30 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-base font-bold text-red-400">Profil introuvable</p>
                <p className="text-sm text-red-300/80 mt-1 leading-relaxed">
                  Sûrement vous avez mal tapé l&apos;username ou votre compte est en privé.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

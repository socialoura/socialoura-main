'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, User, AlertCircle } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isProfileLoading,
    profileError,
    setUsername,
    setProfile,
    setProfileLoading,
    setProfileError,
  } = useUpsellStore();

  const handleSearch = async () => {
    const clean = inputValue.replace('@', '').trim();
    if (!clean) return;

    setUsername(clean);
    setProfileLoading(true);
    setProfileError(null);

    try {
      const res = await fetch(`/api/scraper?username=${encodeURIComponent(clean)}`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Profil introuvable');
      }

      // Store search result instead of immediately setting profile
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25 mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Trouvez votre compte Instagram
        </h2>
        <p className="text-gray-500 text-sm">
          Entrez votre nom d&apos;utilisateur pour commencer
        </p>
      </div>

      {/* Search Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <User className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Entrez votre @username"
            disabled={isProfileLoading}
            className="w-full pl-12 pr-4 py-4 text-lg bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-60"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isProfileLoading || !inputValue.trim()}
          className="px-6 py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-2xl shadow-lg shadow-fuchsia-500/25 hover:shadow-xl hover:shadow-fuchsia-500/30 disabled:shadow-none transition-all flex items-center gap-2 disabled:cursor-not-allowed"
        >
          {isProfileLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">Rechercher</span>
        </button>
      </div>

      {/* Loading skeleton */}
      <AnimatePresence>
        {isProfileLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded-lg w-32 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded-lg w-24 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search result - Profile card */}
      <AnimatePresence>
        {searchResult && !isProfileLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <button
              onClick={handleSelectProfile}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-fuchsia-500 hover:shadow-md p-5 flex items-center gap-4 transition-all group"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-transparent group-hover:ring-fuchsia-500 transition-all">
                <img
                  src={searchResult.avatarUrl}
                  alt={searchResult.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 group-hover:text-fuchsia-600 transition-colors">
                  @{searchResult.username}
                </p>
                <p className="text-sm text-gray-500">{searchResult.fullName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {searchResult.followersCount.toLocaleString()} abonnés
                </p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-fuchsia-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {profileError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <div className="bg-red-50 rounded-2xl border border-red-200 p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{profileError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

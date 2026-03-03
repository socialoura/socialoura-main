'use client';

import { useState, useEffect, useCallback } from 'react';
import { Language } from '@/i18n/config';

interface SocialProofEvent {
  quantity: number;
  service: string;
  timeAgo: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter';
}

const EVENTS: Record<Language, SocialProofEvent[]> = {
  en: [
    { quantity: 250, service: 'likes delivered', timeAgo: '2 min ago', platform: 'instagram' },
    { quantity: 1000, service: 'followers delivered', timeAgo: '5 min ago', platform: 'tiktok' },
    { quantity: 500, service: 'views delivered', timeAgo: '1 min ago', platform: 'youtube' },
    { quantity: 2500, service: 'likes delivered', timeAgo: '8 min ago', platform: 'tiktok' },
    { quantity: 5000, service: 'followers delivered', timeAgo: '3 min ago', platform: 'instagram' },
    { quantity: 10000, service: 'views delivered', timeAgo: '6 min ago', platform: 'tiktok' },
    { quantity: 750, service: 'followers delivered', timeAgo: '4 min ago', platform: 'linkedin' },
    { quantity: 3000, service: 'likes delivered', timeAgo: '7 min ago', platform: 'instagram' },
  ],
  fr: [
    { quantity: 250, service: 'likes livrés', timeAgo: 'il y a 2 min', platform: 'instagram' },
    { quantity: 1000, service: 'abonnés livrés', timeAgo: 'il y a 5 min', platform: 'tiktok' },
    { quantity: 500, service: 'vues livrées', timeAgo: 'il y a 1 min', platform: 'youtube' },
    { quantity: 2500, service: 'likes livrés', timeAgo: 'il y a 8 min', platform: 'tiktok' },
    { quantity: 5000, service: 'abonnés livrés', timeAgo: 'il y a 3 min', platform: 'instagram' },
    { quantity: 10000, service: 'vues livrées', timeAgo: 'il y a 6 min', platform: 'tiktok' },
    { quantity: 750, service: 'abonnés livrés', timeAgo: 'il y a 4 min', platform: 'linkedin' },
    { quantity: 3000, service: 'likes livrés', timeAgo: 'il y a 7 min', platform: 'instagram' },
  ],
  de: [
    { quantity: 250, service: 'Likes geliefert', timeAgo: 'vor 2 Min', platform: 'instagram' },
    { quantity: 1000, service: 'Follower geliefert', timeAgo: 'vor 5 Min', platform: 'tiktok' },
    { quantity: 500, service: 'Views geliefert', timeAgo: 'vor 1 Min', platform: 'youtube' },
    { quantity: 2500, service: 'Likes geliefert', timeAgo: 'vor 8 Min', platform: 'tiktok' },
    { quantity: 5000, service: 'Follower geliefert', timeAgo: 'vor 3 Min', platform: 'instagram' },
    { quantity: 10000, service: 'Views geliefert', timeAgo: 'vor 6 Min', platform: 'tiktok' },
    { quantity: 750, service: 'Follower geliefert', timeAgo: 'vor 4 Min', platform: 'linkedin' },
    { quantity: 3000, service: 'Likes geliefert', timeAgo: 'vor 7 Min', platform: 'instagram' },
  ],
  es: [
    { quantity: 250, service: 'likes entregados', timeAgo: 'hace 2 min', platform: 'instagram' },
    { quantity: 1000, service: 'seguidores entregados', timeAgo: 'hace 5 min', platform: 'tiktok' },
    { quantity: 500, service: 'visualizaciones entregadas', timeAgo: 'hace 1 min', platform: 'youtube' },
    { quantity: 2500, service: 'likes entregados', timeAgo: 'hace 8 min', platform: 'tiktok' },
    { quantity: 5000, service: 'seguidores entregados', timeAgo: 'hace 3 min', platform: 'instagram' },
    { quantity: 10000, service: 'visualizaciones entregadas', timeAgo: 'hace 6 min', platform: 'tiktok' },
    { quantity: 750, service: 'seguidores entregados', timeAgo: 'hace 4 min', platform: 'linkedin' },
    { quantity: 3000, service: 'likes entregados', timeAgo: 'hace 7 min', platform: 'instagram' },
  ],
};

interface SocialProofToastProps {
  lang: Language;
}

const PlatformIcon = ({ platform }: { platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' }) => {
  switch (platform) {
    case 'instagram':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
  }
};

export default function SocialProofToast({ lang }: SocialProofToastProps) {
  const [currentEvent, setCurrentEvent] = useState<SocialProofEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const showNext = useCallback(() => {
    const events = EVENTS[lang] || EVENTS.en;
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    setCurrentEvent(randomEvent);
    setExiting(false);
    setVisible(true);

    // Hide after 4s
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        setVisible(false);
        setExiting(false);
      }, 500);
    }, 4000);
  }, [lang]);

  useEffect(() => {
    // First toast after 6s
    const initialTimeout = setTimeout(showNext, 6000);

    // Then every 12s
    const interval = setInterval(showNext, 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [showNext]);

  if (!visible || !currentEvent) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 max-w-sm transition-all duration-500 ease-out ${
        exiting
          ? 'opacity-0 translate-y-4 scale-95'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
      style={{ animation: !exiting ? 'socialProofSlideIn 0.5s ease-out' : undefined }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
        {/* Gradient accent line on top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-purple-500 to-pink-500" />

        <div className="flex items-center gap-4 px-5 py-4">
          {/* Animated pulse dot + icon */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PlatformIcon platform={currentEvent.platform} />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-gray-900" />
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight">
              <span className="text-emerald-400">{currentEvent.quantity.toLocaleString()}</span>{' '}
              {currentEvent.service}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-gray-400">{currentEvent.timeAgo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animation keyframes */}
      <style jsx>{`
        @keyframes socialProofSlideIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

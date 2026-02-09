'use client';

import { useState, useEffect, useCallback } from 'react';
import { Language } from '@/i18n/config';

interface SocialProofEvent {
  quantity: number;
  service: string;
  timeAgo: string;
  icon: string;
}

const EVENTS: Record<Language, SocialProofEvent[]> = {
  en: [
    { quantity: 250, service: 'likes delivered', timeAgo: '2 min ago', icon: '❤️' },
    { quantity: 1000, service: 'followers delivered', timeAgo: '5 min ago', icon: '👤' },
    { quantity: 500, service: 'views delivered', timeAgo: '1 min ago', icon: '👁️' },
    { quantity: 2500, service: 'likes delivered', timeAgo: '8 min ago', icon: '❤️' },
    { quantity: 5000, service: 'followers delivered', timeAgo: '3 min ago', icon: '👤' },
    { quantity: 10000, service: 'views delivered', timeAgo: '6 min ago', icon: '👁️' },
    { quantity: 750, service: 'followers delivered', timeAgo: '4 min ago', icon: '👤' },
    { quantity: 3000, service: 'likes delivered', timeAgo: '7 min ago', icon: '❤️' },
  ],
  fr: [
    { quantity: 250, service: 'likes livrés', timeAgo: 'il y a 2 min', icon: '❤️' },
    { quantity: 1000, service: 'abonnés livrés', timeAgo: 'il y a 5 min', icon: '👤' },
    { quantity: 500, service: 'vues livrées', timeAgo: 'il y a 1 min', icon: '👁️' },
    { quantity: 2500, service: 'likes livrés', timeAgo: 'il y a 8 min', icon: '❤️' },
    { quantity: 5000, service: 'abonnés livrés', timeAgo: 'il y a 3 min', icon: '👤' },
    { quantity: 10000, service: 'vues livrées', timeAgo: 'il y a 6 min', icon: '👁️' },
    { quantity: 750, service: 'abonnés livrés', timeAgo: 'il y a 4 min', icon: '👤' },
    { quantity: 3000, service: 'likes livrés', timeAgo: 'il y a 7 min', icon: '❤️' },
  ],
  de: [
    { quantity: 250, service: 'Likes geliefert', timeAgo: 'vor 2 Min', icon: '❤️' },
    { quantity: 1000, service: 'Follower geliefert', timeAgo: 'vor 5 Min', icon: '👤' },
    { quantity: 500, service: 'Views geliefert', timeAgo: 'vor 1 Min', icon: '👁️' },
    { quantity: 2500, service: 'Likes geliefert', timeAgo: 'vor 8 Min', icon: '❤️' },
    { quantity: 5000, service: 'Follower geliefert', timeAgo: 'vor 3 Min', icon: '👤' },
    { quantity: 10000, service: 'Views geliefert', timeAgo: 'vor 6 Min', icon: '👁️' },
    { quantity: 750, service: 'Follower geliefert', timeAgo: 'vor 4 Min', icon: '👤' },
    { quantity: 3000, service: 'Likes geliefert', timeAgo: 'vor 7 Min', icon: '❤️' },
  ],
};

interface SocialProofToastProps {
  lang: Language;
}

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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-lg">
              {currentEvent.icon}
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

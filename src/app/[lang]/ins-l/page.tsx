'use client';

import { Language } from '@/i18n/config';
import Link from 'next/link';

interface PageProps {
  params: { lang: string };
}

export default function InstagramLikesSelectPage({ params }: PageProps) {
  const lang = params.lang as Language;

  const content = {
    en: {
      title: 'Choose Your Platform',
      likes: 'Instagram Likes',
    },
    fr: {
      title: 'Choisissez Votre Plateforme',
      likes: 'Likes Instagram',
    },
    de: {
      title: 'Wählen Sie Ihre Plattform',
      likes: 'Instagram Likes',
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-950 to-pink-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-600/10 to-pink-600/10 rounded-full blur-3xl" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 text-center px-6">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-16">
          {t.title}
        </h1>

        {/* Platform Card */}
        <div className="flex items-center justify-center">
          {/* Instagram Likes Card */}
          <Link
            href={`/${lang}/il`}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-pink-500 to-red-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 bg-gradient-to-br from-red-500 via-pink-500 to-red-400 rounded-3xl flex flex-col items-center justify-center shadow-2xl shadow-red-500/30 group-hover:scale-105 group-hover:shadow-red-500/50 transition-all duration-300 cursor-pointer">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-white font-bold text-lg sm:text-xl">{t.likes}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

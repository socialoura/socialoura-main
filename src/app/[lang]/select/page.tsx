'use client';

import { Language } from '@/i18n/config';
import Link from 'next/link';

interface PageProps {
  params: { lang: string };
}

export default function SelectPlatformPage({ params }: PageProps) {
  const lang = params.lang as Language;

  const content = {
    en: {
      title: 'Choose Your Platform',
      instagram: 'Instagram',
      tiktok: 'TikTok',
    },
    fr: {
      title: 'Choisissez Votre Plateforme',
      instagram: 'Instagram',
      tiktok: 'TikTok',
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-pink-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-600/10 to-purple-600/10 rounded-full blur-3xl" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 text-center px-6">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-16">
          {t.title}
        </h1>

        {/* Platform Cards */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
          {/* Instagram Card */}
          <Link
            href={`/${lang}/i`}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-3xl flex flex-col items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:scale-105 group-hover:shadow-purple-500/50 transition-all duration-300 cursor-pointer">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-white font-bold text-lg sm:text-xl">{t.instagram}</span>
            </div>
          </Link>

          {/* TikTok Card */}
          <Link
            href={`/${lang}/t`}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 bg-black rounded-3xl flex flex-col items-center justify-center shadow-2xl shadow-cyan-500/30 group-hover:scale-105 group-hover:shadow-cyan-500/50 transition-all duration-300 cursor-pointer border border-gray-800">
              <svg viewBox="0 0 24 24" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white mb-3" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="text-white font-bold text-lg sm:text-xl">{t.tiktok}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

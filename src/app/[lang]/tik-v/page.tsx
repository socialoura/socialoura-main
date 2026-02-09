'use client';

import { Language } from '@/i18n/config';
import Link from 'next/link';
import TrustpilotBadge from '@/components/TrustpilotBadge';

interface PageProps {
  params: { lang: string };
}

export default function TikTokViewsLandingPage({ params }: PageProps) {
  const lang = params.lang as Language;

  const content = {
    en: {
      title: 'TikTok Visibility Campaign',
      subtitle: 'Designed to support promotion, improve reach, and increase credibility for your content.',
      cta: 'Start a Campaign',
    },
    fr: {
      title: 'Campagne de visibilité TikTok',
      subtitle: "Pensée pour la promotion, améliorer la portée et renforcer la crédibilité de votre contenu.",
      cta: 'Démarrer une campagne',
    },
    de: {
      title: 'TikTok Sichtbarkeitskampagne',
      subtitle: 'Für Promotion, bessere Reichweite und mehr Glaubwürdigkeit deines Contents.',
      cta: 'Kampagne starten',
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-gray-950 to-teal-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-600/10 to-teal-600/10 rounded-full blur-3xl" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 mb-8 shadow-lg shadow-cyan-500/30">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
          {t.title}
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 mb-12 leading-relaxed">
          {t.subtitle}
        </p>

        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.5 6.7c.3 2 1.4 3.5 3.4 4v2.3c-1.4-.1-2.7-.6-3.8-1.4v6.1a5.7 5.7 0 1 1-5.5-5.7c.4 0 .8 0 1.2.1v2.7a2.9 2.9 0 1 0 1.6 2.6V2h3.1c0 .5 0 1 .1 1.5z" />
            </svg>
            <span className="text-sm font-extrabold text-white">TikTok</span>
          </div>
          <TrustpilotBadge />
        </div>

        <div className="flex items-center justify-center">
          <Link href={`/${lang}/tv`} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative px-10 py-5 bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 rounded-2xl text-white font-bold text-lg sm:text-xl shadow-2xl shadow-cyan-500/30 group-hover:scale-[1.03] group-hover:shadow-cyan-500/50 transition-all duration-300">
              <span className="inline-flex items-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
                {t.cta}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

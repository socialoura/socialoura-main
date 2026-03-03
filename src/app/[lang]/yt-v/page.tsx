'use client';

import { Language } from '@/i18n/config';
import Link from 'next/link';
import TrustpilotBadge from '@/components/TrustpilotBadge';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: { lang: string };
}

export default function YouTubeViewsLandingPage({ params }: PageProps) {
  const lang = params.lang as Language;
  const router = useRouter();

  const content = {
    en: {
      title: 'YouTube Views Campaign',
      subtitle: 'Designed to boost visibility, improve ranking, and increase credibility for your YouTube videos.',
      cta: 'Start a Campaign',
    },
    fr: {
      title: 'Campagne de Vues YouTube',
      subtitle: 'Conçue pour booster la visibilité, améliorer le classement et renforcer la crédibilité de vos vidéos YouTube.',
      cta: 'Démarrer une campagne',
    },
    de: {
      title: 'YouTube Views Kampagne',
      subtitle: 'Für mehr Sichtbarkeit, besseres Ranking und mehr Glaubwürdigkeit Ihrer YouTube-Videos.',
      cta: 'Kampagne starten',
    },
    es: {
      title: 'Campaña de Vistas YouTube',
      subtitle: 'Diseñada para impulsar la visibilidad, mejorar el posicionamiento y aumentar la credibilidad de tus videos de YouTube.',
      cta: 'Iniciar una campaña',
    },
  };

  const t = content[lang];

  const trackCtaAndNavigate = (href: string) => {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (!gtag) {
      router.push(href);
      return;
    }

    gtag('event', 'conversion', {
      send_to: 'AW-17985942356/o6JlCPTc6oEcENTmroBD',
      value: 1.0,
      currency: 'EUR',
      event_callback: () => router.push(href),
    });

    window.setTimeout(() => router.push(href), 600);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-950 to-rose-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-600/10 to-rose-600/10 rounded-full blur-3xl" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 mb-8 shadow-lg shadow-red-500/30">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/>
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
            <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/>
            </svg>
            <span className="text-sm font-extrabold text-white">YouTube</span>
          </div>
          <TrustpilotBadge />
        </div>

        <div className="flex items-center justify-center">
          <Link
            href={`/${lang}/youtube-v`}
            className="group relative"
            onClick={(e) => {
              e.preventDefault();
              trackCtaAndNavigate(`/${lang}/youtube-v`);
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-rose-500 to-red-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative px-10 py-5 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 rounded-2xl text-white font-bold text-lg sm:text-xl shadow-2xl shadow-red-500/30 group-hover:scale-[1.03] group-hover:shadow-red-500/50 transition-all duration-300">
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

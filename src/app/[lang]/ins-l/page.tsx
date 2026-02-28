'use client';

import { Language } from '@/i18n/config';
import Link from 'next/link';
import TrustpilotBadge from '@/components/TrustpilotBadge';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: { lang: string };
}

export default function InstagramLikesSelectPage({ params }: PageProps) {
  const lang = params.lang as Language;
  const router = useRouter();

  const content = {
    en: {
      title: 'Instagram Engagement Campaign',
      likes: 'Instagram Engagement',
    },
    fr: {
      title: "Campagne d'engagement Instagram",
      likes: 'Engagement Instagram',
    },
    de: {
      title: 'Instagram Engagement Kampagne',
      likes: 'Instagram Engagement',
    },
    es: {
      title: 'Campaña de Engagement Instagram',
      likes: 'Engagement Instagram',
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
      send_to: 'AW-17898687645/IwwNCPiBzfUbEJ2Z4dZC',
      value: 1.0,
      currency: 'EUR',
      event_callback: () => router.push(href),
    });

    window.setTimeout(() => router.push(href), 600);
  };

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
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
          {t.title}
        </h1>

        <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm8.9 3.5a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zM12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z" />
            </svg>
            <span className="text-sm font-extrabold text-white">Instagram</span>
          </div>
          <TrustpilotBadge />
        </div>

        {/* Platform Card */}
        <div className="flex items-center justify-center">
          {/* Instagram Likes Card */}
          <Link
            href={`/${lang}/il`}
            className="group relative"
            onClick={(e) => {
              e.preventDefault();
              trackCtaAndNavigate(`/${lang}/il`);
            }}
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

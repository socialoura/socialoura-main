'use client';

import { Language } from '@/i18n/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: { lang: string };
}

export default function TwitterSelectPage({ params }: PageProps) {
  const lang = params.lang as Language;
  const router = useRouter();

  const content = {
    en: {
      title: 'Choose Your Platform',
      twitter: 'X (Twitter)',
    },
    fr: {
      title: 'Choisissez Votre Plateforme',
      twitter: 'X (Twitter)',
    },
    de: {
      title: 'Wählen Sie Ihre Plattform',
      twitter: 'X (Twitter)',
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
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-gray-950 to-gray-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-gray-600/10 to-gray-500/10 rounded-full blur-3xl" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 text-center px-6">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-16">
          {t.title}
        </h1>

        {/* Platform Card */}
        <div className="flex items-center justify-center">
          {/* Twitter/X Card */}
          <Link
            href={`/${lang}/x`}
            className="group relative"
            onClick={(e) => {
              e.preventDefault();
              trackCtaAndNavigate(`/${lang}/x`);
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 via-gray-800 to-black rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 bg-black rounded-3xl flex flex-col items-center justify-center shadow-2xl shadow-gray-500/30 group-hover:scale-105 group-hover:shadow-gray-400/50 transition-all duration-300 cursor-pointer border border-gray-800">
              <svg viewBox="0 0 24 24" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white mb-3" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-white font-bold text-lg sm:text-xl">{t.twitter}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { ArrowRight } from 'lucide-react';
import { type Language } from '@/i18n/config';
import { getLandingTiktokTranslations } from '@/i18n/landing-tiktok';

export default function FunnelTiktokLandingPage({ params }: { params: { lang: string } }) {
  const router = useRouter();
  const lang = (params?.lang as Language) || 'fr';
  const t = getLandingTiktokTranslations(lang);

  useEffect(() => {
    posthog.capture('tiktok_landing_funnel_viewed', { target_platform: 'tiktok' });
  }, []);

  const handleCta = () => {
    posthog.capture('tiktok_landing_funnel_cta_clicked', { target_platform: 'tiktok' });
    router.push(`/${lang}/tiktok`);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
        {/* TikTok Icon */}
        <div className="mb-6 sm:mb-8">
          <Image
            src="/tiktok.webp"
            alt="TikTok"
            width={96}
            height={96}
            className="w-16 h-16 sm:w-20 sm:h-20"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 sm:mb-6">
          {t.title.boost}{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            {t.title.platform}
          </span>{' '}
          {t.title.now}
        </h1>

        {/* Profile Showcase */}
        <div className="w-full max-w-lg mx-auto mb-6 sm:mb-8">
          <div className="text-center mb-4">
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-1">
              {t.showcase.title}
            </h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.showcase.subtitle}</span>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src="/12tiktok.jpg"
                alt="Profil TikTok à 12.3M d'abonnés"
                width={250}
                height={250}
                className="w-auto max-w-[200px] h-auto rounded-xl shadow-xl ring-2 ring-cyan-500/30"
                loading="lazy"
                sizes="(max-width: 640px) 200px, 250px"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleCta}
          className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-pink-500 to-red-500 px-10 sm:px-14 py-4 sm:py-5 text-lg sm:text-xl font-black text-white shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 uppercase tracking-wider flex items-center justify-center gap-3 mb-6"
        >
          <span className="relative z-10">{t.cta.text}</span>
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>

        {/* Trustpilot Social Proof */}
        <div className="flex items-center justify-center mt-4">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2" aria-label={t.trustpilot.ariaLabel}>
            <span className="text-sm font-black text-white">{t.trustpilot.rating}</span>
            <span className="h-4 w-px bg-white/20"></span>
            <span className="inline-flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="inline-flex items-center justify-center w-5 h-5 rounded-[3px]" style={{ backgroundColor: 'rgb(0, 182, 122)' }}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white" aria-hidden="true">
                    <path d="M12 17.27l-5.18 3.05 1.4-5.95L3.5 9.24l6.06-.52L12 3l2.44 5.72 6.06.52-4.72 5.13 1.4 5.95z"></path>
                  </svg>
                </span>
              ))}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

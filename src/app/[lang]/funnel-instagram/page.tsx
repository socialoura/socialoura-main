'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { ArrowRight } from 'lucide-react';
import { type Language } from '@/i18n/config';
import { getLandingTranslations } from '@/i18n/landing';

export default function FunnelLandingPage({ params }: { params: { lang: string } }) {
  const router = useRouter();
  const lang = (params?.lang as Language) || 'fr';
  const t = getLandingTranslations(lang);

  useEffect(() => {
    posthog.capture('instagram_landing_funnel_viewed');
  }, []);

  const handleCta = () => {
    posthog.capture('instagram_landing_funnel_cta_clicked');
    router.push(`/${lang}/instagram`);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
        {/* Instagram Icon */}
        <div className="mb-8 sm:mb-10">
          <Image
            src="/instagram.svg.webp"
            alt="Instagram"
            width={96}
            height={96}
            className="w-20 h-20 sm:w-24 sm:h-24"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6 sm:mb-8">
          {t.title.boost}{' '}
          <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            {t.title.platform}
          </span>{' '}
          {t.title.now}
        </h1>

        {/* Before/After Images */}
        <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
              {t.results.title}
            </h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.results.subtitle}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {/* Before Image */}
            <div className="relative">
              <Image
                src="/before.png"
                alt={t.results.before}
                width={400}
                height={400}
                className="w-full h-auto rounded-xl shadow-lg"
                loading="lazy"
                sizes="(max-width: 640px) 50vw, 50vw"
              />
              <div className="absolute top-2 left-2 bg-gray-900/80 px-2 py-1 rounded-lg">
                <span className="text-xs font-bold text-gray-300">{t.results.before}</span>
              </div>
            </div>

            {/* After Image */}
            <div className="relative">
              <Image
                src="/after.png"
                alt={t.results.after}
                width={400}
                height={400}
                className="w-full h-auto rounded-xl shadow-lg ring-2 ring-pink-500/30"
                loading="lazy"
                sizes="(max-width: 640px) 50vw, 50vw"
              />
              <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-600 px-2 py-1 rounded-lg">
                <span className="text-xs font-bold text-white">{t.results.after}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleCta}
          className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 px-10 sm:px-14 py-4 sm:py-5 text-lg sm:text-xl font-black text-white shadow-2xl shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 uppercase tracking-wider flex items-center justify-center gap-3 mb-6"
        >
          <span className="relative z-10">{t.cta.text}</span>
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

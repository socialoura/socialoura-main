'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { ArrowRight } from 'lucide-react';
import TikTokIcon from '@/components/icons/TikTokIcon';

export default function FunnelTiktokLandingPage({ params }: { params: { lang: string } }) {
  const router = useRouter();
  const lang = params.lang || 'fr';

  useEffect(() => {
    posthog.capture('landing_tiktok_viewed', { target_platform: 'tiktok' });
  }, []);

  const handleCta = () => {
    posthog.capture('landing_tiktok_cta_clicked', { target_platform: 'tiktok' });
    router.push(`/${lang}/tiktok`);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
        {/* TikTok Icon */}
        <div className="mb-10 sm:mb-14">
          <TikTokIcon className="w-24 h-24 sm:w-32 sm:h-32 text-white" size={128} />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4 sm:mb-6">
          Boostez votre compte{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            TikTok
          </span>{' '}
          dès maintenant
        </h1>

        {/* CTA */}
        <button
          onClick={handleCta}
          className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-pink-500 to-red-500 px-10 sm:px-14 py-4 sm:py-5 text-lg sm:text-xl font-black text-white shadow-2xl shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 uppercase tracking-wider flex items-center justify-center gap-3"
        >
          <span className="relative z-10">Démarrer</span>
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </div>
    </div>
  );
}

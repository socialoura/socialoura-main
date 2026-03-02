'use client';

import { Language } from '@/i18n/config';
import Link from 'next/link';
import TrustpilotBadge from '@/components/TrustpilotBadge';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: { lang: string };
}

export default function LinkedInFollowersLandingPage({ params }: PageProps) {
  const lang = params.lang as Language;
  const router = useRouter();

  const content = {
    en: {
      title: 'LinkedIn Followers Campaign',
      subtitle: 'Designed to boost your professional credibility, expand your network, and increase visibility on LinkedIn.',
      cta: 'Start a Campaign',
    },
    fr: {
      title: 'Campagne d\'Abonnés LinkedIn',
      subtitle: 'Conçue pour renforcer votre crédibilité professionnelle, élargir votre réseau et augmenter votre visibilité sur LinkedIn.',
      cta: 'Démarrer une campagne',
    },
    de: {
      title: 'LinkedIn Follower Kampagne',
      subtitle: 'Für mehr professionelle Glaubwürdigkeit, ein größeres Netzwerk und mehr Sichtbarkeit auf LinkedIn.',
      cta: 'Kampagne starten',
    },
    es: {
      title: 'Campaña de Seguidores LinkedIn',
      subtitle: 'Diseñada para impulsar tu credibilidad profesional, expandir tu red y aumentar la visibilidad en LinkedIn.',
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
      send_to: 'AW-17985942356/mF8GCIbql4EcENTmroBD',
      value: 1.0,
      currency: 'EUR',
      event_callback: () => router.push(href),
    });

    window.setTimeout(() => router.push(href), 600);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-gray-950 to-sky-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/10 to-sky-600/10 rounded-full blur-3xl" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0A66C2] mb-8 shadow-lg shadow-blue-500/30">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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
            <svg className="w-7 h-7 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-sm font-extrabold text-white">LinkedIn</span>
          </div>
          <TrustpilotBadge />
        </div>

        <div className="flex items-center justify-center">
          <Link
            href={`/${lang}/linkedin-f`}
            className="group relative"
            onClick={(e) => {
              e.preventDefault();
              trackCtaAndNavigate(`/${lang}/linkedin-f`);
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A66C2] via-blue-500 to-sky-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative px-10 py-5 bg-gradient-to-r from-[#0A66C2] via-blue-600 to-[#0A66C2] rounded-2xl text-white font-bold text-lg sm:text-xl shadow-2xl shadow-blue-500/30 group-hover:scale-[1.03] group-hover:shadow-blue-500/50 transition-all duration-300">
              <span className="inline-flex items-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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

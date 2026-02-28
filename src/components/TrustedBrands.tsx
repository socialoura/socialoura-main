'use client';

import { Language } from '@/i18n/config';

interface TrustedBrandsProps {
  lang: Language;
}

const BrandLogos = {
  prix: () => (
    <svg viewBox="0 0 100 40" className="h-8 w-auto" fill="currentColor">
      <text x="0" y="30" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="300" letterSpacing="-1">prix.</text>
    </svg>
  ),
  dbrand: () => (
    <svg viewBox="0 0 120 40" className="h-8 w-auto" fill="currentColor">
      <text x="0" y="30" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="700" letterSpacing="0">dbrand</text>
    </svg>
  ),
  mixtiles: () => (
    <svg viewBox="0 0 140 40" className="h-8 w-auto" fill="currentColor">
      <text x="0" y="30" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="400" letterSpacing="4">MIXTILES</text>
    </svg>
  ),
  sennheiser: () => (
    <svg viewBox="0 0 180 40" className="h-8 w-auto" fill="currentColor">
      <g transform="translate(0, 8)">
        <rect x="0" y="6" width="20" height="3" />
        <rect x="0" y="12" width="20" height="3" />
        <rect x="0" y="18" width="20" height="3" />
        <polygon points="0,6 6,0 6,6" />
        <polygon points="20,18 20,24 14,24" />
      </g>
      <text x="28" y="28" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="400" letterSpacing="2">SENNHEISER</text>
    </svg>
  ),
  victoriasSecret: () => (
    <svg viewBox="0 0 140 50" className="h-10 w-auto" fill="currentColor">
      <text x="0" y="22" fontFamily="Times New Roman, serif" fontSize="18" fontWeight="400" letterSpacing="2" fontStyle="italic">VICTORIA&apos;S</text>
      <text x="0" y="42" fontFamily="Times New Roman, serif" fontSize="18" fontWeight="400" letterSpacing="4">SECRET</text>
    </svg>
  ),
  birkenstock: () => (
    <svg viewBox="0 0 160 40" className="h-8 w-auto" fill="currentColor">
      <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700" letterSpacing="1">BIRKENSTOCK</text>
    </svg>
  ),
};

const brandKeys = ['prix', 'dbrand', 'mixtiles', 'sennheiser', 'victoriasSecret', 'birkenstock'] as const;

export default function TrustedBrands({ lang }: TrustedBrandsProps) {
  const title = lang === 'fr' 
    ? 'La confiance des marques de toutes tailles' 
    : lang === 'de'
    ? 'Vertraut von Marken jeder Größe'
    : lang === 'es'
    ? 'La confianza de marcas de todos los tamaños'
    : 'Trusted by brands of all sizes';

  const renderBrands = (keyPrefix: string) => (
    <div className="flex items-center gap-20 px-10 shrink-0">
      {brandKeys.map((key) => {
        const Logo = BrandLogos[key];
        return (
          <div
            key={`${keyPrefix}-${key}`}
            className="flex items-center justify-center min-w-[100px] h-12 text-gray-500 hover:text-gray-300 transition-colors duration-300 opacity-50 hover:opacity-80"
          >
            <Logo />
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="py-16 border-y border-gray-800/50 bg-gradient-to-b from-transparent via-gray-900/30 to-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl sm:text-2xl text-gray-400 mb-12 italic" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
          {title}
        </h2>
      </div>

      {/* Scrolling container */}
      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

        {/* Scrolling brands */}
        <div className="flex animate-scroll">
          {renderBrands('set1')}
          {renderBrands('set2')}
        </div>
      </div>

      {/* Custom CSS for animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Language, languages } from '@/i18n/config';
import ThemeToggle from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import Image from 'next/image';

interface HeaderProps {
  lang: Language;
}

type PromoBarConfig = {
  enabled: boolean;
  code: string;
  percentOff: number;
  durationHours: number;
  showCountdown: boolean;
  badgeText: Record<'en' | 'fr' | 'de', string>;
  messageText: Record<'en' | 'fr' | 'de', string>;
  excludePaths: string[];
  includePaths: string[];
  bgColor: string;
  textColor: string;
  accentColor: string;
  size: 'sm' | 'md' | 'lg';
};

export default function Header({ lang }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isInstagramMenuOpen, setIsInstagramMenuOpen] = useState(false);
  const [isTiktokMenuOpen, setIsTiktokMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [promoConfig, setPromoConfig] = useState<PromoBarConfig | null>(null);
 
  const navText = {
    en: {
      followers: 'Followers',
      likes: 'Likes',
      views: 'Views',
      instagram: 'Instagram',
      tiktok: 'TikTok',
    },
    fr: {
      followers: 'Abonnés',
      likes: 'Likes',
      views: 'Vues',
      instagram: 'Instagram',
      tiktok: 'TikTok',
    },
    de: {
      followers: 'Follower',
      likes: 'Likes',
      views: 'Views',
      instagram: 'Instagram',
      tiktok: 'TikTok',
    },
  };

  const nt = navText[lang];

  const getPathWithoutLang = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && languages.includes(segments[0] as Language)) {
      return '/' + segments.slice(1).join('/');
    }
    return '/';
  };

  const pathWithoutLang = getPathWithoutLang();
  const promoUiText = {
    en: { copied: 'Copied', copy: 'Copy', endsIn: 'Ends in' },
    fr: { copied: 'Copié', copy: 'Copier', endsIn: 'Se termine dans' },
    de: { copied: 'Kopiert', copy: 'Kopieren', endsIn: 'Endet in' },
  };

  const put = promoUiText[lang];

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/promo-bar', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setPromoConfig(data?.config || null);
      } catch {
        // ignore
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const showPromo = (() => {
    if (!promoConfig?.enabled) return false;
    if (promoConfig.excludePaths?.length && promoConfig.excludePaths.includes(pathWithoutLang)) return false;
    if (promoConfig.includePaths?.length && !promoConfig.includePaths.includes(pathWithoutLang)) return false;
    return true;
  })();

  useEffect(() => {
    if (!showPromo) return;
    if (!promoConfig?.showCountdown) return;

    const key = `promo-countdown-end:${promoConfig.code || 'default'}`;
    const existing = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    let endTs = existing ? Number(existing) : 0;
    if (!endTs || Number.isNaN(endTs) || endTs < Date.now()) {
      const duration = Math.max(1, Number(promoConfig.durationHours) || 6);
      endTs = Date.now() + duration * 60 * 60 * 1000;
      window.localStorage.setItem(key, String(endTs));
    }

    const tick = () => {
      const diff = Math.max(0, endTs - Date.now());
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ h, m, s });
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [pathWithoutLang, promoConfig]);
  
  // Get the path for a different language
  const getPathForLanguage = (targetLang: Language) => {
    return `/${targetLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
  };

  const languageMeta: Record<Language, { flag: string; label: string }> = {
    en: { flag: 'GB', label: 'English' },
    fr: { flag: 'FR', label: 'Français' },
    de: { flag: 'DE', label: 'Deutsch' },
  };

  const currentLanguage = languageMeta[lang];

  const pad = (n: number) => String(n).padStart(2, '0');
  const promoCode = promoConfig?.code || 'SOCIALOURA5';

  const handleCopyPromo = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const sizePy = promoConfig?.size === 'lg' ? 'py-3' : promoConfig?.size === 'md' ? 'py-2' : 'py-1.5';
  const sizeText = promoConfig?.size === 'lg' ? 'text-sm' : promoConfig?.size === 'md' ? 'text-[13px]' : 'text-xs';

  return (
    <div className="sticky top-0 z-50">
      {showPromo && promoConfig && (
        <div
          className={`w-full ${sizePy}`}
          style={{ backgroundColor: promoConfig.bgColor || '#0a0a1a', color: promoConfig.textColor || '#e2e8f0' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <span
              className={`${sizeText} font-bold uppercase tracking-wider px-2 py-0.5 rounded`}
              style={{ backgroundColor: `${promoConfig.accentColor || '#a855f7'}30`, color: promoConfig.accentColor || '#a855f7' }}
            >
              {promoConfig.badgeText?.[lang] || ''}
            </span>

            <span className={`${sizeText} font-medium opacity-90`}>
              {promoConfig.messageText?.[lang] || ''}
            </span>

            <button
              type="button"
              onClick={handleCopyPromo}
              className={`${sizeText} inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-black tracking-wider transition-opacity hover:opacity-80`}
              style={{ backgroundColor: promoConfig.accentColor || '#a855f7', color: promoConfig.bgColor || '#0a0a1a' }}
              aria-label={`Copy ${promoCode}`}
            >
              {promoCode}
              <span className="text-[10px] font-bold opacity-80">
                {copied ? put.copied : put.copy}
              </span>
            </button>

            {promoConfig.showCountdown && (
              <span className={`${sizeText} font-semibold opacity-70 flex items-center gap-1.5`}>
                {put.endsIn}
                <span
                  className="font-black tabular-nums px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${promoConfig.textColor || '#e2e8f0'}15` }}
                >
                  {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-24 sm:h-28">
            {/* Logo - Left */}
            <div className="flex items-center">
              <Link
                href={`/${lang}`}
                className="flex items-center transition-all group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                  <Image
                    src="/img/a-modern-flat-vector-logo-design-featuri_ZEbfVp__QiK-0wr5MrgGJg_ZFPYEbSKRM6a11TOK-IQCQ-removebg-preview.png"
                    alt="Socialoura"
                    width={128}
                    height={128}
                    priority
                    sizes="(min-width: 640px) 128px, 96px"
                    className="group-hover:scale-105 transition-transform"
                  />
                </div>
              </Link>
            </div>
          
          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsInstagramMenuOpen((v) => !v)}
                className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                {nt.instagram}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isInstagramMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-50">
                  <Link
                    href={`/${lang}/i`}
                    onClick={() => setIsInstagramMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" fill="none" strokeWidth="2"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {nt.followers}
                  </Link>
                  <Link
                    href={`/${lang}/il`}
                    onClick={() => setIsInstagramMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {nt.likes}
                  </Link>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTiktokMenuOpen((v) => !v)}
                className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                {nt.tiktok}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isTiktokMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-50">
                  <Link
                    href={`/${lang}/t`}
                    onClick={() => setIsTiktokMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {nt.followers}
                  </Link>
                  <Link
                    href={`/${lang}/tv`}
                    onClick={() => setIsTiktokMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {nt.views}
                  </Link>
                </div>
              )}
            </div>
            <Link
              href={`/${lang}/x`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              X (Twitter)
            </Link>
            <Link
              href={`/${lang}/pricing`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {lang === 'fr' ? 'Tarifs' : lang === 'de' ? 'Preise' : 'Pricing'}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {lang === 'en' ? 'Contact' : 'Contact'}
            </Link>
            <Link
              href={`/${lang}/faq`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Right side - Language & Theme */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLanguageMenuOpen((v) => !v)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                aria-label={currentLanguage.label}
                title={currentLanguage.label}
              >
                <ReactCountryFlag
                  countryCode={currentLanguage.flag}
                  svg
                  style={{
                    width: '1.3em',
                    height: '1.3em',
                  }}
                  title={currentLanguage.label}
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {lang.toUpperCase()}
                </span>
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-50">
                  {languages.map((l) => {
                    const meta = languageMeta[l];
                    const isActive = l === lang;
                    return (
                      <Link
                        key={l}
                        href={getPathForLanguage(l)}
                        onClick={() => setIsLanguageMenuOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <ReactCountryFlag
                          countryCode={meta.flag}
                          svg
                          style={{ width: '1.2em', height: '1.2em' }}
                          title={meta.label}
                        />
                        <span className="flex-1">{meta.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {l.toUpperCase()}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3 ml-auto">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              <nav className="flex flex-col space-y-4">
              <div>
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">{nt.instagram}</span>
                <div className="flex flex-col ml-4 mt-2 space-y-2">
                  <Link
                    href={`/${lang}/i`}
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {nt.followers}
                  </Link>
                  <Link
                    href={`/${lang}/il`}
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {nt.likes}
                  </Link>
                </div>
              </div>
              <div>
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">{nt.tiktok}</span>
                <div className="flex flex-col ml-4 mt-2 space-y-2">
                  <Link
                    href={`/${lang}/t`}
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {nt.followers}
                  </Link>
                  <Link
                    href={`/${lang}/tv`}
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {nt.views}
                  </Link>
                </div>
              </div>
              <Link
                href={`/${lang}/x`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                X (Twitter)
              </Link>
              <Link
                href={`/${lang}/pricing`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'fr' ? 'Tarifs' : lang === 'de' ? 'Preise' : 'Pricing'}
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'en' ? 'Contact' : 'Contact'}
              </Link>
              <Link
                href={`/${lang}/faq`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              
              {/* Language Switcher */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col space-y-3">
                  {languages.map((l) => {
                    const meta = languageMeta[l];
                    const isActive = l === lang;
                    return (
                      <Link
                        key={l}
                        href={getPathForLanguage(l)}
                        className={`flex items-center gap-2 text-base font-medium transition-colors ${
                          isActive
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ReactCountryFlag
                          countryCode={meta.flag}
                          svg
                          style={{
                            width: '1.5em',
                            height: '1.5em',
                          }}
                          title={meta.label}
                        />
                        <span>{meta.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

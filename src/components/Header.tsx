'use client';

import { useState } from 'react';
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

export default function Header({ lang }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  
  // Get the current path without the language prefix
  const getPathWithoutLang = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && languages.includes(segments[0] as Language)) {
      return '/' + segments.slice(1).join('/');
    }
    return '/';
  };

  // Get the path for a different language
  const getPathForLanguage = (targetLang: Language) => {
    const pathWithoutLang = getPathWithoutLang();
    return `/${targetLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
  };

  const languageMeta: Record<Language, { flag: string; label: string }> = {
    en: { flag: 'GB', label: 'English' },
    fr: { flag: 'FR', label: 'Français' },
    de: { flag: 'DE', label: 'Deutsch' },
  };

  const currentLanguage = languageMeta[lang];

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
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
            <Link
              href={`/${lang}/i`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {lang === 'en' ? 'Instagram' : 'Instagram'}
            </Link>
            <Link
              href={`/${lang}/t`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {lang === 'en' ? 'TikTok' : 'TikTok'}
            </Link>
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
              <Link
                href={`/${lang}/i`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'en' ? 'Instagram' : 'Instagram'}
              </Link>
              <Link
                href={`/${lang}/t`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'en' ? 'TikTok' : 'TikTok'}
              </Link>
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
  );
}

'use client';

import { useState } from 'react';
import { Language } from '@/i18n/config';
import Link from 'next/link';
import { Plus, Minus, Camera, Music, BarChart3, Calendar, MessageCircle, HeadphonesIcon } from 'lucide-react';

interface PageProps {
  params: { lang: string };
}

export default function HomePage({ params }: PageProps) {
  const lang = params.lang as Language;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };
  
  const content = {
    en: {
      hero: {
        headline: 'Grow Your Social Media Presence',
        subheadline: 'Supercharge your Instagram and TikTok accounts with our powerful automation tools',
        instagramCta: 'Instagram',
        tiktokCta: 'TikTok',
      },
      services: {
        title: 'Our Services',
        subtitle: 'Everything you need to succeed on social media',
        items: [
          {
            title: 'Instagram Growth',
            description: 'Automate your Instagram engagement and grow your followers organically with targeted interactions.',
            icon: Camera,
          },
          {
            title: 'TikTok Automation',
            description: 'Boost your TikTok presence with smart automation that engages your target audience effectively.',
            icon: Music,
          },
          {
            title: 'Analytics Dashboard',
            description: 'Track your growth with detailed analytics and insights to optimize your social media strategy.',
            icon: BarChart3,
          },
          {
            title: 'Content Scheduling',
            description: 'Plan and schedule your posts in advance to maintain a consistent presence on your channels.',
            icon: Calendar,
          },
          {
            title: 'Engagement Tools',
            description: 'Automated likes, comments, and follows to increase your visibility and reach.',
            icon: MessageCircle,
          },
          {
            title: '24/7 Support',
            description: 'Our dedicated support team is always ready to help you maximize your results.',
            icon: HeadphonesIcon,
          },
        ],
      },
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about our services',
        items: [
          {
            question: 'Is it safe to use automation tools?',
            answer: 'Yes, our tools are designed to mimic natural human behavior and comply with platform guidelines to keep your account safe.',
          },
          {
            question: 'How quickly will I see results?',
            answer: 'Most users see noticeable growth within the first 2-4 weeks, with consistent increases over time.',
          },
          {
            question: 'Can I cancel my subscription anytime?',
            answer: 'Absolutely! You can cancel your subscription at any time with no questions asked. No hidden fees or commitments.',
          },
          {
            question: 'Do you offer a free trial?',
            answer: 'Yes, we offer a 7-day free trial on all our plans so you can test our services risk-free.',
          },
          {
            question: 'What makes you different from competitors?',
            answer: 'We focus on organic growth with smart targeting, provide superior customer support, and offer transparent pricing with no hidden costs.',
          },
          {
            question: 'Which platforms do you support?',
            answer: 'Currently, we support Instagram and TikTok, with plans to expand to more platforms in the near future.',
          },
        ],
      },
    },
    fr: {
      hero: {
        headline: 'Développez Votre Présence Sur Les Réseaux Sociaux',
        subheadline: 'Boostez vos comptes Instagram et TikTok avec nos outils d\'automatisation puissants',
        instagramCta: 'Instagram',
        tiktokCta: 'TikTok',
      },
      services: {
        title: 'Nos Services',
        subtitle: 'Tout ce dont vous avez besoin pour réussir sur les réseaux sociaux',
        items: [
          {
            title: 'Croissance Instagram',
            description: 'Automatisez votre engagement Instagram et développez vos abonnés de manière organique avec des interactions ciblées.',
            icon: Camera,
          },
          {
            title: 'Automatisation TikTok',
            description: 'Boostez votre présence TikTok avec une automatisation intelligente qui engage efficacement votre public cible.',
            icon: Music,
          },
          {
            title: 'Tableau de Bord Analytique',
            description: 'Suivez votre croissance avec des analyses et des informations détaillées pour optimiser votre stratégie.',
            icon: BarChart3,
          },
          {
            title: 'Planification de Contenu',
            description: 'Planifiez et programmez vos publications à l\'avance pour maintenir une présence cohérente.',
            icon: Calendar,
          },
          {
            title: 'Outils d\'Engagement',
            description: 'J\'aime, commentaires et abonnements automatisés pour augmenter votre visibilité et votre portée.',
            icon: MessageCircle,
          },
          {
            title: 'Support 24/7',
            description: 'Notre équipe d\'assistance dédiée est toujours prête à vous aider à maximiser vos résultats.',
            icon: HeadphonesIcon,
          },
        ],
      },
      faq: {
        title: 'Questions Fréquemment Posées',
        subtitle: 'Tout ce que vous devez savoir sur nos services',
        items: [
          {
            question: 'Est-il sûr d\'utiliser des outils d\'automatisation ?',
            answer: 'Oui, nos outils sont conçus pour imiter le comportement humain naturel et respecter les directives des plateformes pour protéger votre compte.',
          },
          {
            question: 'À quelle vitesse verrai-je des résultats ?',
            answer: 'La plupart des utilisateurs constatent une croissance notable dans les 2 à 4 premières semaines, avec des augmentations constantes au fil du temps.',
          },
          {
            question: 'Puis-je annuler mon abonnement à tout moment ?',
            answer: 'Absolument ! Vous pouvez annuler votre abonnement à tout moment sans poser de questions. Aucun frais caché ni engagement.',
          },
          {
            question: 'Offrez-vous un essai gratuit ?',
            answer: 'Oui, nous offrons un essai gratuit de 7 jours sur tous nos forfaits afin que vous puissiez tester nos services sans risque.',
          },
          {
            question: 'Qu\'est-ce qui vous différencie de la concurrence ?',
            answer: 'Nous nous concentrons sur la croissance organique avec un ciblage intelligent, offrons un support client supérieur et proposons des prix transparents sans frais cachés.',
          },
          {
            question: 'Quelles plateformes supportez-vous ?',
            answer: 'Actuellement, nous supportons Instagram et TikTok, avec des plans d\'expansion vers d\'autres plateformes dans un avenir proche.',
          },
        ],
      },
    },
  };

  const t = content[lang];

  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              {t.hero.headline}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              {t.hero.subheadline}
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <Link
                href={`/${lang}/i`}
                className="rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
              >
                {t.hero.instagramCta}
              </Link>
              <Link
                href={`/${lang}/t`}
                className="rounded-md bg-purple-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-colors"
              >
                {t.hero.tiktokCta}
              </Link>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center mt-16 sm:mt-24 lg:mt-0 lg:ml-10">
            <div className="w-full h-full flex items-center justify-center">
              {/* Animated Social Media Dashboard Mockup */}
              <div className="relative w-full max-w-lg">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl rounded-full" />
                
                {/* Main Visual Container */}
                <div className="relative">
                  {/* Floating Cards Animation */}
                  <div className="relative aspect-square w-full">
                    {/* Central Profile Card */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                        <BarChart3 className="w-20 h-20 text-white" />
                      </div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl shadow-lg animate-float" style={{ animationDelay: '0s' }} />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute top-1/2 right-0 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-20" />
                    
                    {/* Floating Cards */}
                    <div className="relative w-full h-full">
                      {/* Instagram Card */}
                      <div className="absolute top-10 left-0 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Instagram</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">+2.5K followers</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* TikTok Card */}
                      <div className="absolute top-1/3 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700 animate-float-delayed">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">TikTok</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">+5.2K followers</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Engagement Stats */}
                      <div className="absolute bottom-10 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-6">
                          <div>
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">98%</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Engagement</div>
                          </div>
                          <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
                          <div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t.services.title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
              {t.services.subtitle}
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {t.services.items.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <article
                    key={index}
                    className="relative flex flex-col gap-4 rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                      {service.title}
                    </h3>
                    <p className="text-base leading-7 text-gray-600 dark:text-gray-400">
                      {service.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t.faq.title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
              {t.faq.subtitle}
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-3xl">
            <dl className="space-y-4">
              {t.faq.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-gray-50 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden"
                >
                  <dt>
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between text-left p-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.question}
                      </span>
                      {openFaqIndex === index ? (
                        <Minus className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      ) : (
                        <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                  </dt>
                  {openFaqIndex === index && (
                    <dd className="px-6 pb-6 text-base leading-7 text-gray-600 dark:text-gray-400">
                      {item.answer}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}

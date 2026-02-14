'use client';

import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PricingCardsProps {
  lang: string;
  platform?: 'instagram' | 'tiktok' | 'twitter';
}

export default function PricingCards({ lang, platform = 'instagram' }: PricingCardsProps) {
  const content = {
    en: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the perfect plan for your growth',
      plans: [
        {
          name: 'Starter',
          followers: '1,000',
          price: '$9.99',
          popular: false,
          features: [
            'Real followers',
            'Instant delivery',
            'No password required',
            '24/7 support',
          ],
        },
        {
          name: 'Growth',
          followers: '5,000',
          price: '$39.99',
          popular: true,
          features: [
            'Real followers',
            'Instant delivery',
            'No password required',
            '24/7 support',
            'Priority processing',
          ],
        },
        {
          name: 'Pro',
          followers: '10,000',
          price: '$69.99',
          popular: false,
          features: [
            'Real followers',
            'Instant delivery',
            'No password required',
            '24/7 support',
            'Priority processing',
            'Dedicated manager',
          ],
        },
      ],
      cta: 'Get Started',
      perMonth: '/month',
    },
    fr: {
      title: 'Tarifs Simples et Transparents',
      subtitle: 'Choisissez le plan parfait pour votre croissance',
      plans: [
        {
          name: 'Débutant',
          followers: '1 000',
          price: '9,99€',
          popular: false,
          features: [
            'Vrais abonnés',
            'Livraison instantanée',
            'Aucun mot de passe requis',
            'Support 24/7',
          ],
        },
        {
          name: 'Croissance',
          followers: '5 000',
          price: '39,99€',
          popular: true,
          features: [
            'Vrais abonnés',
            'Livraison instantanée',
            'Aucun mot de passe requis',
            'Support 24/7',
            'Traitement prioritaire',
          ],
        },
        {
          name: 'Pro',
          followers: '10 000',
          price: '69,99€',
          popular: false,
          features: [
            'Vrais abonnés',
            'Livraison instantanée',
            'Aucun mot de passe requis',
            'Support 24/7',
            'Traitement prioritaire',
            'Manager dédié',
          ],
        },
      ],
      cta: 'Commencer',
      perMonth: '/mois',
    },
    de: {
      title: 'Einfache, Transparente Preise',
      subtitle: 'Wählen Sie den perfekten Plan für Ihr Wachstum',
      plans: [
        {
          name: 'Starter',
          followers: '1.000',
          price: '9,99€',
          popular: false,
          features: [
            'Echte Follower',
            'Sofortige Lieferung',
            'Kein Passwort erforderlich',
            '24/7 Support',
          ],
        },
        {
          name: 'Wachstum',
          followers: '5.000',
          price: '39,99€',
          popular: true,
          features: [
            'Echte Follower',
            'Sofortige Lieferung',
            'Kein Passwort erforderlich',
            '24/7 Support',
            'Prioritätsbearbeitung',
          ],
        },
        {
          name: 'Pro',
          followers: '10.000',
          price: '69,99€',
          popular: false,
          features: [
            'Echte Follower',
            'Sofortige Lieferung',
            'Kein Passwort erforderlich',
            '24/7 Support',
            'Prioritätsbearbeitung',
            'Dedizierter Manager',
          ],
        },
      ],
      cta: 'Jetzt Starten',
      perMonth: '/Monat',
    },
  };

  const t = content[lang as keyof typeof content] || content.en;

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            {t.title}
          </h2>
          <p className="text-xl text-gray-300">
            {t.subtitle}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? 'bg-white shadow-2xl shadow-purple-500/50 scale-105 border-4 border-purple-500'
                  : 'bg-gray-800/80 border border-gray-700 hover:border-purple-500/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>MOST POPULAR</span>
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <h3 className={`text-2xl font-black mb-2 ${plan.popular ? 'text-gray-900' : 'text-white'}`}>
                {plan.name}
              </h3>

              {/* Followers */}
              <p className={`text-lg mb-6 ${plan.popular ? 'text-gray-600' : 'text-gray-400'}`}>
                {plan.followers} followers
              </p>

              {/* Price */}
              <div className="mb-8">
                <span className={`text-5xl font-black ${plan.popular ? 'text-gray-900' : 'text-white'}`}>
                  {plan.price}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-purple-600' : 'text-green-400'}`} />
                    <span className={`text-sm ${plan.popular ? 'text-gray-700' : 'text-gray-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href={`/${lang}/${platform === 'instagram' ? 'i' : platform === 'tiktok' ? 't' : 'x'}`}
                className={`block w-full text-center py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

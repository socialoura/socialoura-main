'use client';

import Image from 'next/image';
import { Shield, Zap, Lock, HeadphonesIcon } from 'lucide-react';

interface TrustBadgesProps {
  lang: string;
}

export default function TrustBadges({ lang }: TrustBadgesProps) {
  const content = {
    en: {
      title: 'Why 50,000+ Creators Trust Us',
      badges: [
        { icon: Zap, title: 'Instant Delivery', description: 'Results in 5-10 minutes' },
        { icon: Shield, title: '100% Safe', description: 'No password required' },
        { icon: Lock, title: 'Secure Payment', description: 'SSL encrypted checkout' },
        { icon: HeadphonesIcon, title: '24/7 Support', description: 'Always here to help' },
      ],
    },
    fr: {
      title: 'Pourquoi 50 000+ Créateurs Nous Font Confiance',
      badges: [
        { icon: Zap, title: 'Livraison Instantanée', description: 'Résultats en 5-10 minutes' },
        { icon: Shield, title: '100% Sûr', description: 'Aucun mot de passe requis' },
        { icon: Lock, title: 'Paiement Sécurisé', description: 'Paiement crypté SSL' },
        { icon: HeadphonesIcon, title: 'Support 24/7', description: 'Toujours là pour vous' },
      ],
    },
    de: {
      title: 'Warum 50.000+ Creators Uns Vertrauen',
      badges: [
        { icon: Zap, title: 'Sofortige Lieferung', description: 'Ergebnisse in 5-10 Minuten' },
        { icon: Shield, title: '100% Sicher', description: 'Kein Passwort erforderlich' },
        { icon: Lock, title: 'Sichere Zahlung', description: 'SSL-verschlüsselt' },
        { icon: HeadphonesIcon, title: '24/7 Support', description: 'Immer für Sie da' },
      ],
    },
  };

  const t = content[lang as keyof typeof content] || content.en;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Title */}
        <h2 className="text-4xl sm:text-5xl font-black text-center text-gray-900 mb-16">
          {t.title}
        </h2>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {t.badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="text-center p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{badge.title}</h3>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
            );
          })}
        </div>

        {/* Payment Methods */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-6 font-semibold">Secure Payment Methods</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="bg-white rounded-xl px-6 py-3 shadow-md border border-gray-200">
              <Image src="/images/visa.svg" alt="Visa" width={50} height={20} className="h-6 w-auto opacity-70" />
            </div>
            <div className="bg-white rounded-xl px-6 py-3 shadow-md border border-gray-200">
              <Image src="/images/mastercard.svg" alt="Mastercard" width={50} height={30} className="h-7 w-auto opacity-70" />
            </div>
            <div className="bg-black rounded-xl px-6 py-3 shadow-md">
              <Image src="/images/apple-pay.svg" alt="Apple Pay" width={50} height={20} className="h-6 w-auto" />
            </div>
            <div className="bg-white rounded-xl px-6 py-3 shadow-md border border-gray-200">
              <Image src="/images/google-pay.svg" alt="Google Pay" width={50} height={20} className="h-6 w-auto opacity-70" />
            </div>
            <div className="bg-white rounded-xl px-6 py-3 shadow-md border border-gray-200">
              <Image src="/images/paypal.svg" alt="PayPal" width={60} height={20} className="h-6 w-auto opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

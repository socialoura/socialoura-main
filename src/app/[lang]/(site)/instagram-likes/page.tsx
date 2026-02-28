'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Language } from '@/i18n/config';
import { Heart, Zap, Shield, TrendingUp, Eye, Clock, Star } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import TrustpilotBadge from '@/components/TrustpilotBadge';

const GoalSelectionModal = dynamic(() => import('@/components/GoalSelectionModal'), { ssr: false });
const PaymentModal = dynamic(() => import('@/components/PaymentModal'), { ssr: false });
const OrderSuccessModal = dynamic(() => import('@/components/OrderSuccessModal'), { ssr: false });
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false });
const ReviewsSection = dynamic(() => import('@/components/ReviewsSection'));
const TrustedBrands = dynamic(() => import('@/components/TrustedBrands'));
const SocialProofToast = dynamic(() => import('@/components/SocialProofToast'), { ssr: false });

interface PageProps {
  params: { lang: string };
}

interface FollowerGoal {
  followers: number;
  price: number;
  originalPrice: number;
  discount: number;
  popular?: boolean;
}

export default function InstagramLikesPage({ params }: PageProps) {
  const lang = params.lang as Language;
  
  const [postUrl, setPostUrl] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<FollowerGoal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { currency } = useCurrency();

  const handleContinue = () => {
    if (postUrl.trim().length > 0) {
      setIsGoalModalOpen(true);
    }
  };

  const handleGoalSelected = (goal: FollowerGoal, emailParam: string) => {
    setSelectedGoal(goal);
    setEmail(emailParam);
    setIsGoalModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentIntentIdParam: string) => {
    setPaymentIntentId(paymentIntentIdParam);
    setIsPaymentModalOpen(false);
    setIsSuccessModalOpen(true);
    setShowToast(true);
    
    try {
      await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: postUrl,
          email: email,
          platform: 'instagram_likes',
          followers: selectedGoal?.followers || 0,
          amount: selectedGoal?.price || 0,
          paymentId: paymentIntentIdParam,
        }),
      });
    } catch (error) {
      console.error('Error saving order:', error);
    }
    
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false);
  };
  
  const content = {
    en: {
      hero: {
        title: 'BOOST YOUR',
        highlight: 'POST ENGAGEMENT',
        subtitle: 'Launch an engagement campaign for your Instagram post to improve visibility, strengthen social proof, and support your promotion efforts.',
        badges: [
          { text: 'Engagement campaign' },
          { text: 'Instant delivery' },
          { text: 'No password required' },
        ],
        cta: 'START NOW',
        placeholder: 'Paste your Instagram post URL',
      },
      why: {
        title: 'Why run an Instagram engagement campaign?',
        cards: [
          {
            title: 'Boost Engagement',
            description: 'Stronger engagement signals help Instagram understand your content is resonating, improving distribution in Explore and Reels.',
            icon: 'TrendingUp',
          },
          {
            title: 'Build Social Proof',
            description: 'Higher visible activity can increase trust and improve how new visitors perceive your content.',
            icon: 'Eye',
          },
          {
            title: 'Instant Results',
            description: 'Get started in minutes with a fast activation that supports your launch or promotion window.',
            icon: 'Zap',
          },
        ],
      },
      howItWorks: {
        title: 'How it works',
        steps: [
          {
            title: 'PASTE YOUR LINK',
            description: 'Copy the URL of the Instagram post you want to promote and paste it above. No login or password required.',
          },
          {
            title: 'CHOOSE YOUR PACKAGE',
            description: 'Choose the campaign size that fits your goals. We offer flexible packages from 50 to 10,000+.',
          },
          {
            title: 'TRACK YOUR ENGAGEMENT',
            description: 'Your campaign begins shortly after checkout and supports your post during your promotion window.',
          },
        ],
        cta: 'START NOW',
      },
      benefits: {
        title: 'Why choose SocialOura for engagement?',
        items: [
          { title: 'High-quality activity', desc: 'Designed to support visibility with a realistic, promotion-friendly approach.' },
          { title: 'Safe & secure', desc: 'Fully compliant with Instagram guidelines. Zero risk.' },
          { title: 'Fast activation', desc: 'Campaign activation begins within minutes.' },
          { title: 'No password needed', desc: 'We only need your post URL. Your account stays safe.' },
          { title: '24/7 Support', desc: 'Our team is always available to help with any questions.' },
          { title: 'Money-back guarantee', desc: 'Not satisfied? Get a full refund, no questions asked.' },
        ],
      },
      compliance: {
        text: 'Compliance Disclaimer: All our services are based on authentic marketing strategies and visibility solutions in accordance with platform policies and terms of service.',
      },
    },
    fr: {
      hero: {
        title: 'BOOSTEZ VOS',
        highlight: 'ENGAGEMENT',
        subtitle: 'Lancez une campagne d\'engagement pour votre post Instagram afin d\'améliorer la visibilité, renforcer la preuve sociale et soutenir votre promotion.',
        badges: [
          { text: 'Campagne d\'engagement' },
          { text: 'Livraison instantanée' },
          { text: 'Aucun mot de passe requis' },
        ],
        cta: 'COMMENCER',
        placeholder: 'Collez l\'URL de votre post Instagram',
      },
      why: {
        title: 'Pourquoi lancer une campagne d\'engagement Instagram ?',
        cards: [
          {
            title: 'Booster l\'engagement',
            description: 'Des signaux d\'engagement plus forts aident Instagram à mieux diffuser votre contenu via Explorer et Reels.',
            icon: 'TrendingUp',
          },
          {
            title: 'Preuve sociale',
            description: 'Une activité plus visible peut renforcer la confiance et améliorer la perception de votre contenu.',
            icon: 'Eye',
          },
          {
            title: 'Résultats instantanés',
            description: 'Démarrage rapide, idéal pour accompagner un lancement ou une période de promotion.',
            icon: 'Zap',
          },
        ],
      },
      howItWorks: {
        title: 'Comment ça marche',
        steps: [
          {
            title: 'COLLEZ VOTRE LIEN',
            description: 'Copiez l\'URL du post Instagram que vous souhaitez promouvoir et collez-la ci-dessus. Aucun login ou mot de passe requis.',
          },
          {
            title: 'CHOISISSEZ VOTRE FORFAIT',
            description: 'Choisissez la taille de campagne qui correspond à vos objectifs. Forfaits flexibles de 50 à 10 000+.',
          },
          {
            title: 'SUIVEZ VOTRE ENGAGEMENT',
            description: 'La campagne démarre peu après le paiement et accompagne votre post pendant votre fenêtre de promotion.',
          },
        ],
        cta: 'COMMENCER MAINTENANT',
      },
      benefits: {
        title: 'Pourquoi choisir SocialOura pour l\'engagement ?',
        items: [
          { title: 'Activité de qualité', desc: 'Pensée pour accompagner une promotion de manière réaliste et cohérente.' },
          { title: 'Sûr et sécurisé', desc: 'Entièrement conforme aux directives Instagram. Zéro risque.' },
          { title: 'Activation rapide', desc: 'La campagne démarre en quelques minutes.' },
          { title: 'Aucun mot de passe', desc: 'Nous avons seulement besoin de l\'URL de votre post.' },
          { title: 'Support 24/7', desc: 'Notre équipe est toujours disponible pour vous aider.' },
          { title: 'Garantie remboursement', desc: 'Pas satisfait ? Remboursement complet, sans questions.' },
        ],
      },
      compliance: {
        text: 'Avertissement de conformité : Tous nos services sont basés sur des stratégies marketing authentiques et des solutions de visibilité conformes aux politiques et conditions de la plateforme.',
      },
    },
    de: {
      hero: {
        title: 'BOOSTEN SIE IHRE',
        highlight: 'ENGAGEMENT',
        subtitle: 'Starten Sie eine Engagement-Kampagne für Ihren Instagram-Post, um Sichtbarkeit zu verbessern, Social Proof zu stärken und Ihre Promotion zu unterstützen.',
        badges: [
          { text: 'Engagement-Kampagne' },
          { text: 'Sofortige Lieferung' },
          { text: 'Kein Passwort nötig' },
        ],
        cta: 'JETZT STARTEN',
        placeholder: 'Instagram-Post-URL einfügen',
      },
      why: {
        title: 'Warum eine Instagram Engagement-Kampagne starten?',
        cards: [
          {
            title: 'Engagement steigern',
            description: 'Stärkere Engagement-Signale helfen Instagram, Ihren Content besser zu verteilen (Explore, Reels).',
            icon: 'TrendingUp',
          },
          {
            title: 'Social Proof aufbauen',
            description: 'Mehr sichtbare Aktivität kann Vertrauen stärken und die Wahrnehmung Ihres Contents verbessern.',
            icon: 'Eye',
          },
          {
            title: 'Sofortige Ergebnisse',
            description: 'Schneller Start, ideal zur Unterstützung von Launches oder Promo-Phasen.',
            icon: 'Zap',
          },
        ],
      },
      howItWorks: {
        title: 'So funktioniert es',
        steps: [
          {
            title: 'LINK EINFÜGEN',
            description: 'Kopieren Sie die URL des Instagram-Posts, den Sie promoten möchten, und fügen Sie sie oben ein. Kein Login oder Passwort nötig.',
          },
          {
            title: 'PAKET WÄHLEN',
            description: 'Wählen Sie die Kampagnengröße passend zu Ihren Zielen. Flexible Pakete von 50 bis 10.000+.',
          },
          {
            title: 'ENGAGEMENT VERFOLGEN',
            description: 'Die Kampagne startet kurz nach dem Checkout und unterstützt Ihren Post während Ihrer Promo-Phase.',
          },
        ],
        cta: 'JETZT STARTEN',
      },
      benefits: {
        title: 'Warum SocialOura für Engagement wählen?',
        items: [
          { title: 'Hochwertige Aktivität', desc: 'Für Promotion mit einem realistischen, nachhaltigen Ansatz.' },
          { title: 'Sicher & geschützt', desc: 'Vollständig konform mit Instagram-Richtlinien. Null Risiko.' },
          { title: 'Schnelle Aktivierung', desc: 'Aktivierung innerhalb weniger Minuten.' },
          { title: 'Kein Passwort nötig', desc: 'Wir brauchen nur Ihre Post-URL. Ihr Konto bleibt sicher.' },
          { title: '24/7 Support', desc: 'Unser Team ist immer bereit zu helfen.' },
          { title: 'Geld-zurück-Garantie', desc: 'Nicht zufrieden? Volle Rückerstattung, ohne Fragen.' },
        ],
      },
      compliance: {
        text: 'Konformitätshinweis: Alle unsere Dienstleistungen basieren auf authentischen Marketingstrategien und Sichtbarkeitslösungen in Übereinstimmung mit den Plattformrichtlinien und Nutzungsbedingungen.',
      },
    },
  };

  const t = content[lang];

  const iconMap: Record<string, React.ElementType> = {
    TrendingUp,
    Eye,
    Zap,
  };

  return (
    <div className="bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[auto] sm:min-h-[70vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-950 to-pink-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-600/5 to-pink-600/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative mx-auto max-w-5xl px-6 py-8 sm:py-20 lg:px-8 w-full">
          <div className="text-center">
            {/* Heart Badge */}
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 mb-4 sm:mb-8 shadow-lg shadow-red-500/30">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white md:text-6xl mb-2 sm:mb-4 leading-tight">
              {t.hero.title}
            </h1>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight md:text-6xl mb-4 sm:mb-8 leading-tight bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              {t.hero.highlight}
            </h1>
            <p className="text-sm sm:text-lg leading-relaxed text-gray-400 max-w-2xl mx-auto mb-5 sm:mb-10">
              {t.hero.subtitle}
            </p>
            
            {/* Badges */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 mb-12">
              {t.hero.badges.map((badge, index) => (
                <div key={index} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300">
                  <svg className="w-4 h-4 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Post URL Input & CTA */}
            <div className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder={t.hero.placeholder}
                    className="w-full pl-12 pr-4 py-4 text-base bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  />
                </div>
                <button
                  onClick={handleContinue}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 via-pink-600 to-red-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-white" />
                    {t.hero.cta}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-red-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
                <TrustpilotBadge />
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>{lang === 'fr' ? 'Paiement sécurisé' : lang === 'de' ? 'Sichere Zahlung' : 'Secure payment'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{lang === 'fr' ? 'Livraison rapide' : lang === 'de' ? 'Schnelle Lieferung' : 'Fast delivery'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-20 sm:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-gray-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.why.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.why.cards.map((card, index) => {
              const IconComponent = iconMap[card.icon] || TrendingUp;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:bg-gray-800/80"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 bg-gray-950 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.howItWorks.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {t.howItWorks.steps.map((step, index) => (
              <div key={index} className="relative group">
                {index < 2 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-red-500/50 to-transparent z-0" />
                )}
                
                <div className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 h-full">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-500/30">
                    {index + 1}
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 via-pink-600 to-red-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t.howItWorks.cta}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 sm:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-gray-900" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.benefits.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.benefits.items.map((item, index) => {
              const icons = [Heart, Shield, Zap, Clock, Star, TrendingUp];
              const colors = [
                'from-red-500 to-pink-600',
                'from-emerald-500 to-teal-600',
                'from-amber-500 to-orange-600',
                'from-blue-500 to-indigo-600',
                'from-purple-500 to-violet-600',
                'from-pink-500 to-rose-600',
              ];
              const IconComp = icons[index % icons.length];
              return (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/30 transition-all duration-300"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compliance Disclaimer */}
      <section className="py-12 bg-gray-950 border-t border-gray-800">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <p className="text-xs text-center text-gray-500 leading-relaxed">
            {t.compliance.text}
          </p>
        </div>
      </section>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
          <div className="rounded-lg bg-green-600 dark:bg-green-500 p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  {lang === 'fr' ? 'Paiement Réussi !' : lang === 'de' ? 'Zahlung erfolgreich!' : 'Payment Successful!'}
                </p>
                <p className="text-xs text-green-50">
                  {lang === 'fr' ? 'Votre commande a été confirmée' : lang === 'de' ? 'Ihre Bestellung wurde bestätigt' : 'Your order has been confirmed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Selection Modal */}
      <GoalSelectionModal
        isOpen={isGoalModalOpen}
        onClose={handleCloseGoalModal}
        onSelectGoal={handleGoalSelected}
        username={postUrl}
        platform="instagram"
        serviceType="likes"
        language={lang}
      />

      {isPaymentModalOpen && selectedGoal && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          amount={selectedGoal.price * 100}
          currency={currency}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          productName={`Instagram engagement package (${selectedGoal.followers.toLocaleString()})`}
          language={lang}
          email={email}
          orderDetails={{
            platform: 'instagram_likes',
            followers: selectedGoal.followers,
            username: postUrl,
          }}
        />
      )}

      {isSuccessModalOpen && selectedGoal && (
        <OrderSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          paymentIntentId={paymentIntentId}
          productName={`Instagram engagement package (${selectedGoal.followers.toLocaleString()})`}
          amount={Math.round(selectedGoal.price * 100)}
          currency={currency}
          username={postUrl}
          language={lang}
        />
      )}

      {/* Trusted Brands */}
      <TrustedBrands lang={lang} />

      {/* Reviews Section */}
      <ReviewsSection lang={lang} platform="instagram" />

      {/* Chat Widget */}
      <ChatWidget lang={lang} />

      {/* Social Proof Toast */}
      <SocialProofToast lang={lang} />
    </div>
  );
}

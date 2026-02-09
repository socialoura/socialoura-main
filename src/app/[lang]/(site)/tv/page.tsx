'use client';

import { useState } from 'react';
import { Language } from '@/i18n/config';
import GoalSelectionModal from '@/components/GoalSelectionModal';
import PaymentModal from '@/components/PaymentModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { Eye, Zap, Shield, TrendingUp, Clock, Star, Play } from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';
import ReviewsSection from '@/components/ReviewsSection';
import TrustedBrands from '@/components/TrustedBrands';
import TrustpilotBadge from '@/components/TrustpilotBadge';
import SocialProofToast from '@/components/SocialProofToast';

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

export default function TikTokViewsPage({ params }: PageProps) {
  const lang = params.lang as Language;
  
  const [videoUrl, setVideoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<FollowerGoal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [showToast, setShowToast] = useState(false);

  const getCurrency = () => (lang === 'fr' || lang === 'de' ? 'eur' : 'usd');

  const handleContinue = () => {
    if (videoUrl.trim().length > 0) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: videoUrl,
          email: email,
          platform: 'tiktok_views',
          followers: selectedGoal?.followers || 0,
          amount: selectedGoal?.price || 0,
          paymentId: paymentIntentIdParam,
        }),
      });
    } catch (error) {
      console.error('Error saving order:', error);
    }
    
    setTimeout(() => setShowToast(false), 5000);
  };

  const content = {
    en: {
      hero: {
        title: 'BOOST YOUR',
        highlight: 'TIKTOK VIEWS',
        subtitle: 'Get real, high-quality views on your TikTok videos to boost visibility, trigger the algorithm, and land on the For You Page.',
        badges: [
          { text: 'Real & organic views' },
          { text: 'Instant delivery' },
          { text: 'No password required' },
        ],
        cta: 'GET VIEWS NOW',
        placeholder: 'https://www.tiktok.com/@user/video/...',
      },
      why: {
        title: 'Why buy TikTok Views?',
        cards: [
          {
            title: 'Trigger the Algorithm',
            description: 'More views signal TikTok that your content is engaging, pushing it to the For You Page and reaching millions of new viewers.',
            icon: 'TrendingUp',
          },
          {
            title: 'Build Credibility',
            description: 'Videos with high view counts attract more organic engagement. People are more likely to watch and share popular content.',
            icon: 'Eye',
          },
          {
            title: 'Instant Results',
            description: 'See views start appearing within minutes of your order. Fast, reliable delivery to give your videos the boost they need.',
            icon: 'Zap',
          },
        ],
      },
      howItWorks: {
        title: 'How it works',
        steps: [
          {
            title: 'PASTE YOUR VIDEO LINK',
            description: 'Copy the URL of the TikTok video you want to boost and paste it above. No login or password needed.',
          },
          {
            title: 'CHOOSE YOUR PACKAGE',
            description: 'Select the number of views that fits your goals. We offer flexible packages from 500 to 100,000+ views.',
          },
          {
            title: 'WATCH YOUR VIEWS GROW',
            description: 'Sit back and watch as real views are delivered to your video, increasing your visibility and reach.',
          },
        ],
        cta: 'START NOW',
      },
      benefits: {
        title: 'Why choose SocialOura for views?',
        items: [
          { title: 'High-quality views', desc: 'From real accounts, boosting your video authentically.' },
          { title: 'Safe & secure', desc: 'Fully compliant with TikTok guidelines. Zero risk.' },
          { title: 'Fast delivery', desc: 'Views start appearing within minutes of your purchase.' },
          { title: 'No password needed', desc: 'We only need your video URL. Your account stays safe.' },
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
        highlight: 'VUES TIKTOK',
        subtitle: 'Obtenez des vues réelles et de qualité sur vos vidéos TikTok pour booster la visibilité, déclencher l\'algorithme et atterrir sur la page Pour Toi.',
        badges: [
          { text: 'Vues réelles et organiques' },
          { text: 'Livraison instantanée' },
          { text: 'Aucun mot de passe requis' },
        ],
        cta: 'OBTENIR DES VUES',
        placeholder: 'https://www.tiktok.com/@user/video/...',
      },
      why: {
        title: 'Pourquoi acheter des Vues TikTok ?',
        cards: [
          {
            title: 'Déclencher l\'algorithme',
            description: 'Plus de vues signalent à TikTok que votre contenu est engageant, le poussant vers la page Pour Toi et touchant des millions de nouveaux spectateurs.',
            icon: 'TrendingUp',
          },
          {
            title: 'Renforcer la crédibilité',
            description: 'Les vidéos avec beaucoup de vues attirent plus d\'engagement organique. Les gens regardent et partagent davantage le contenu populaire.',
            icon: 'Eye',
          },
          {
            title: 'Résultats instantanés',
            description: 'Voyez les vues apparaître en quelques minutes. Une livraison rapide et fiable pour booster vos vidéos.',
            icon: 'Zap',
          },
        ],
      },
      howItWorks: {
        title: 'Comment ça marche',
        steps: [
          {
            title: 'COLLEZ VOTRE LIEN VIDÉO',
            description: 'Copiez l\'URL de la vidéo TikTok que vous souhaitez booster et collez-la ci-dessus. Aucune connexion ni mot de passe nécessaire.',
          },
          {
            title: 'CHOISISSEZ VOTRE FORFAIT',
            description: 'Sélectionnez le nombre de vues qui correspond à vos objectifs. Nous proposons des forfaits flexibles de 500 à 100 000+ vues.',
          },
          {
            title: 'REGARDEZ VOS VUES AUGMENTER',
            description: 'Détendez-vous et regardez les vraies vues arriver sur votre vidéo, augmentant votre visibilité et votre portée.',
          },
        ],
        cta: 'COMMENCER MAINTENANT',
      },
      benefits: {
        title: 'Pourquoi choisir SocialOura pour les vues ?',
        items: [
          { title: 'Vues de qualité', desc: 'De vrais comptes qui boostent votre vidéo authentiquement.' },
          { title: 'Sûr et sécurisé', desc: 'Entièrement conforme aux directives TikTok. Zéro risque.' },
          { title: 'Livraison rapide', desc: 'Les vues commencent à apparaître en quelques minutes.' },
          { title: 'Aucun mot de passe', desc: 'Nous avons seulement besoin de l\'URL de votre vidéo.' },
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
        highlight: 'TIKTOK VIEWS',
        subtitle: 'Erhalten Sie echte, hochwertige Views auf Ihren TikTok-Videos, um die Sichtbarkeit zu steigern, den Algorithmus auszulösen und auf der Für-Dich-Seite zu landen.',
        badges: [
          { text: 'Echte & organische Views' },
          { text: 'Sofortige Lieferung' },
          { text: 'Kein Passwort nötig' },
        ],
        cta: 'VIEWS ERHALTEN',
        placeholder: 'https://www.tiktok.com/@user/video/...',
      },
      why: {
        title: 'Warum TikTok Views kaufen?',
        cards: [
          {
            title: 'Algorithmus auslösen',
            description: 'Mehr Views signalisieren TikTok, dass Ihr Content ansprechend ist, und pushen ihn auf die Für-Dich-Seite zu Millionen neuer Zuschauer.',
            icon: 'TrendingUp',
          },
          {
            title: 'Glaubwürdigkeit aufbauen',
            description: 'Videos mit hohen Aufrufzahlen ziehen mehr organisches Engagement an. Menschen schauen und teilen eher beliebte Inhalte.',
            icon: 'Eye',
          },
          {
            title: 'Sofortige Ergebnisse',
            description: 'Sehen Sie, wie Views innerhalb von Minuten erscheinen. Schnelle, zuverlässige Lieferung für den Boost Ihrer Videos.',
            icon: 'Zap',
          },
        ],
      },
      howItWorks: {
        title: 'So funktioniert es',
        steps: [
          {
            title: 'VIDEO-LINK EINFÜGEN',
            description: 'Kopieren Sie die URL des TikTok-Videos, das Sie boosten möchten, und fügen Sie sie oben ein. Kein Login oder Passwort nötig.',
          },
          {
            title: 'PAKET WÄHLEN',
            description: 'Wählen Sie die Anzahl der Views, die zu Ihren Zielen passt. Wir bieten flexible Pakete von 500 bis 100.000+ Views.',
          },
          {
            title: 'VIEWS WACHSEN SEHEN',
            description: 'Lehnen Sie sich zurück und sehen Sie zu, wie echte Views auf Ihrem Video erscheinen und Ihre Reichweite steigern.',
          },
        ],
        cta: 'JETZT STARTEN',
      },
      benefits: {
        title: 'Warum SocialOura für Views wählen?',
        items: [
          { title: 'Hochwertige Views', desc: 'Von echten Konten, die Ihr Video authentisch boosten.' },
          { title: 'Sicher & geschützt', desc: 'Vollständig konform mit TikTok-Richtlinien. Null Risiko.' },
          { title: 'Schnelle Lieferung', desc: 'Views erscheinen innerhalb von Minuten nach dem Kauf.' },
          { title: 'Kein Passwort nötig', desc: 'Wir brauchen nur Ihre Video-URL. Ihr Konto bleibt sicher.' },
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
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-gray-950 to-teal-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-600/5 to-teal-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative mx-auto max-w-5xl px-6 py-8 sm:py-20 lg:px-8 w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 mb-4 sm:mb-8 shadow-lg shadow-cyan-500/30">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white md:text-6xl mb-2 sm:mb-4 leading-tight">
              {t.hero.title}
            </h1>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight md:text-6xl mb-4 sm:mb-8 leading-tight bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {t.hero.highlight}
            </h1>
            <p className="text-sm sm:text-lg leading-relaxed text-gray-400 max-w-2xl mx-auto mb-5 sm:mb-10">
              {t.hero.subtitle}
            </p>
            
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 mb-12">
              {t.hero.badges.map((badge, index) => (
                <div key={index} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300">
                  <svg className="w-4 h-4 mr-2 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Video URL Input — enlarged */}
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col gap-4 p-3 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder={t.hero.placeholder}
                    className="w-full pl-14 pr-6 py-5 text-lg bg-gray-900/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  />
                </div>
                <button
                  onClick={handleContinue}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 px-8 py-5 text-lg font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Play className="w-6 h-6 fill-white" />
                    {t.hero.cta}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
              
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.why.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-teal-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.why.cards.map((card, index) => {
              const IconComponent = iconMap[card.icon] || TrendingUp;
              return (
                <div key={index} className="group relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:bg-gray-800/80">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-gray-950 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.howItWorks.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-teal-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {t.howItWorks.steps.map((step, index) => (
              <div key={index} className="relative group">
                {index < 2 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent z-0" />
                )}
                <div className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 h-full">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/30">
                    {index + 1}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.benefits.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-teal-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.benefits.items.map((item, index) => {
              const icons = [Eye, Shield, Zap, Clock, Star, TrendingUp];
              const colors = [
                'from-cyan-500 to-teal-600',
                'from-emerald-500 to-teal-600',
                'from-amber-500 to-orange-600',
                'from-blue-500 to-indigo-600',
                'from-purple-500 to-violet-600',
                'from-teal-500 to-cyan-600',
              ];
              const IconComp = icons[index % icons.length];
              return (
                <div key={index} className="group p-6 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
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

      {/* Compliance */}
      <section className="py-12 bg-gray-950 border-t border-gray-800">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <p className="text-xs text-center text-gray-500 leading-relaxed">{t.compliance.text}</p>
        </div>
      </section>

      {/* Toast */}
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

      {/* Modals */}
      <GoalSelectionModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSelectGoal={handleGoalSelected}
        username={videoUrl}
        platform="tiktok"
        serviceType="views"
        language={lang}
      />

      {selectedGoal && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          amount={Math.round(selectedGoal.price * 100)}
          currency={getCurrency()}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          productName={`+${selectedGoal.followers.toLocaleString()} TikTok views`}
          language={lang}
          email={email}
          orderDetails={{
            platform: 'tiktok_views',
            followers: selectedGoal.followers,
            username: videoUrl,
          }}
        />
      )}

      {selectedGoal && (
        <OrderSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          paymentIntentId={paymentIntentId}
          productName={`+${selectedGoal.followers.toLocaleString()} TikTok views`}
          amount={Math.round(selectedGoal.price * 100)}
          currency={getCurrency()}
          username={videoUrl}
          language={lang}
        />
      )}

      <TrustedBrands lang={lang} />
      <ReviewsSection lang={lang} platform="tiktok" />
      <ChatWidget lang={lang} />

      {/* Social Proof Toast */}
      <SocialProofToast lang={lang} />
    </div>
  );
}

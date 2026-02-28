'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Language } from '@/i18n/config';
import { Bot, Clock, Shield, Package, Megaphone, BarChart3 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import Image from 'next/image';
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

export default function TikTokLikesPage({ params }: PageProps) {
  const lang = params.lang as Language;
  
  // State management
  const [videoUrl, setVideoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<FollowerGoal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { currency, convert } = useCurrency();

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };

  const handleContinue = () => {
    const trimmed = videoUrl.trim();
    if (trimmed.length === 0) return;
    
    setIsGoalModalOpen(true);
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
    
    // Save order to database
    try {
      await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: videoUrl,
          email: email,
          platform: 'tiktok-likes',
          followers: selectedGoal?.followers || 0,
          amount: selectedGoal?.price || 0,
          paymentId: paymentIntentIdParam,
        }),
      });
    } catch (error) {
      console.error('Error saving order:', error);
    }
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false);
  };
  
  const content = {
    en: {
      hero: {
        title: 'BOOST YOUR TIKTOK',
        platform: 'VIDEO ENGAGEMENT',
        subtitle: 'Amplify your video reach with our AI-powered smart distribution algorithms. Improve your engagement metrics in a fully compliant way.',
        badges: [
          { text: 'AI Smart Distribution' },
          { text: 'Compliant Methods' },
          { text: '24/7 Campaign Delivery' },
        ],
        cta: 'LAUNCH CAMPAIGN',
        inputLabel: 'Video link to promote',
        inputPlaceholder: 'https://vm.tiktok.com/...',
      },
      difference: {
        title: 'Why creators trust Socialoura',
        cards: [
          {
            title: 'AI-Powered Distribution',
            description: 'Our algorithm analyzes your video content and distributes it through targeted channels to maximize organic-looking engagement.',
            icon: 'Bot'
          },
          {
            title: 'Gradual & Natural Delivery',
            description: 'Likes are delivered progressively to mimic natural engagement patterns. Our smart system adapts to keep your content safe.',
            icon: 'Clock'
          },
          {
            title: 'Content Safety First',
            description: 'We never ask for your password. Our promotion methods are 100% compliant with TikTok guidelines — zero risk to your account.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Boost your video in 3 steps',
        cards: [
          {
            number: '1',
            title: 'PASTE YOUR VIDEO LINK',
            description: 'Just paste the TikTok video URL you want to promote — no password, no login required.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'PICK YOUR CAMPAIGN SIZE',
            description: 'Select the engagement level you want. From 50 to 10K+ likes — flexible plans for every budget and goal.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'WATCH YOUR ENGAGEMENT GROW',
            description: 'Likes start arriving within minutes. Track your campaign in real time and see the impact on your video reach.',
            icon: 'BarChart3'
          },
        ],
        cta: 'GET STARTED',
      },
      benefits: {
        title: 'Unlock your video potential',
        items: [
          'More likes = higher ranking on the For You Page',
          'Strong engagement attracts organic viewers',
          'Brands notice videos with high interaction rates',
          'Break through the algorithm with momentum',
          'Safe, private & fully encrypted process',
        ],
      },
      finalCta: {
        title: 'Join 10,000+ creators already growing with AI-powered strategies.',
        cta: 'LAUNCH MY CAMPAIGN',
      },
      compliance: {
        text: 'Compliance: Socialoura uses AI-driven content distribution strategies that are fully compliant with TikTok\'s terms of service. We never use bots, fake accounts, or any method that could put your account at risk.',
      },
    },
    fr: {
      hero: {
        title: 'PROPULSEZ VOS VIDÉOS',
        platform: 'TIKTOK',
        subtitle: 'Obtenez plus de likes grâce à nos algorithmes de diffusion intelligente. Améliorez votre engagement de manière conforme.',
        badges: [
          { text: 'Diffusion IA intelligente' },
          { text: 'Méthodes conformes' },
          { text: 'Campagne 24/7' },
        ],
        cta: 'LANCER LA CAMPAGNE',
        inputLabel: 'Lien de la vidéo à promouvoir',
        inputPlaceholder: 'https://vm.tiktok.com/...',
      },
      difference: {
        title: 'Pourquoi les créateurs font confiance à Socialoura',
        cards: [
          {
            title: 'Distribution propulsée par l\'IA',
            description: 'Notre algorithme analyse votre contenu vidéo et le distribue via des canaux ciblés pour maximiser un engagement naturel.',
            icon: 'Bot'
          },
          {
            title: 'Livraison progressive et naturelle',
            description: 'Les likes sont livrés progressivement pour imiter les schémas d\'engagement naturels. Notre système intelligent s\'adapte pour protéger votre contenu.',
            icon: 'Clock'
          },
          {
            title: 'Sécurité du contenu avant tout',
            description: 'Nous ne demandons jamais votre mot de passe. Nos méthodes de promotion sont 100% conformes aux directives TikTok — zéro risque pour votre compte.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Boostez votre vidéo en 3 étapes',
        cards: [
          {
            number: '1',
            title: 'COLLEZ LE LIEN DE VOTRE VIDÉO',
            description: 'Collez simplement l\'URL de la vidéo TikTok que vous souhaitez promouvoir — pas de mot de passe, pas de connexion requise.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'CHOISISSEZ LA TAILLE DE VOTRE CAMPAGNE',
            description: 'Sélectionnez le niveau d\'engagement souhaité. De 50 à 10K+ likes — des plans flexibles pour chaque budget.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'REGARDEZ VOTRE ENGAGEMENT GRANDIR',
            description: 'Les likes commencent à arriver en quelques minutes. Suivez votre campagne en temps réel et constatez l\'impact sur la portée de votre vidéo.',
            icon: 'BarChart3'
          },
        ],
        cta: 'COMMENCER',
      },
      benefits: {
        title: 'Débloquez le potentiel de vos vidéos',
        items: [
          'Plus de likes = meilleur classement sur la page Pour Toi',
          'Un fort engagement attire les spectateurs organiques',
          'Les marques remarquent les vidéos avec un taux d\'interaction élevé',
          'Percez l\'algorithme grâce à l\'élan',
          'Processus sûr, privé et entièrement chiffré',
        ],
      },
      finalCta: {
        title: 'Rejoignez 10 000+ créateurs qui grandissent déjà grâce à l\'IA.',
        cta: 'LANCER MA CAMPAGNE',
      },
      compliance: {
        text: 'Conformité : Socialoura utilise des stratégies de distribution de contenu propulsées par l\'IA, entièrement conformes aux conditions d\'utilisation de TikTok. Nous n\'utilisons jamais de bots, de faux comptes, ni aucune méthode pouvant mettre votre compte en danger.',
      },
    },
    de: {
      hero: {
        title: 'BOOSTEN SIE IHRE',
        platform: 'TIKTOK-VIDEOS',
        subtitle: 'Verstärken Sie die Reichweite Ihrer Videos mit unseren KI-gestützten Smart-Distribution-Algorithmen. Verbessern Sie Ihr Engagement konform.',
        badges: [
          { text: 'KI-Smart-Distribution' },
          { text: 'Konforme Methoden' },
          { text: '24/7 Kampagnen-Lieferung' },
        ],
        cta: 'KAMPAGNE STARTEN',
        inputLabel: 'Video-Link zur Promotion',
        inputPlaceholder: 'https://vm.tiktok.com/...',
      },
      difference: {
        title: 'Warum Creator Socialoura vertrauen',
        cards: [
          {
            title: 'KI-gestützte Distribution',
            description: 'Unser Algorithmus analysiert Ihren Video-Content und verteilt ihn über gezielte Kanäle, um natürlich wirkendes Engagement zu maximieren.',
            icon: 'Bot'
          },
          {
            title: 'Schrittweise & natürliche Lieferung',
            description: 'Likes werden schrittweise geliefert, um natürliche Engagement-Muster nachzuahmen. Unser smartes System passt sich an, um Ihren Content zu schützen.',
            icon: 'Clock'
          },
          {
            title: 'Content-Sicherheit an erster Stelle',
            description: 'Wir fragen nie nach Ihrem Passwort. Unsere Promotionmethoden sind 100% konform mit den TikTok-Richtlinien — null Risiko für Ihr Konto.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Boosten Sie Ihr Video in 3 Schritten',
        cards: [
          {
            number: '1',
            title: 'VIDEO-LINK EINFÜGEN',
            description: 'Fügen Sie einfach die TikTok-Video-URL ein, die Sie promoten möchten — kein Passwort, keine Anmeldung erforderlich.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'KAMPAGNENGRÖSSE WÄHLEN',
            description: 'Wählen Sie das gewünschte Engagement-Level. Von 50 bis 10K+ Likes — flexible Pläne für jedes Budget und Ziel.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'ZUSCHAUEN WIE IHR ENGAGEMENT WÄCHST',
            description: 'Likes kommen innerhalb von Minuten an. Verfolgen Sie Ihre Kampagne in Echtzeit und sehen Sie die Auswirkungen auf die Reichweite Ihres Videos.',
            icon: 'BarChart3'
          },
        ],
        cta: 'JETZT STARTEN',
      },
      benefits: {
        title: 'Entfesseln Sie das Potenzial Ihrer Videos',
        items: [
          'Mehr Likes = besseres Ranking auf der For-You-Seite',
          'Starkes Engagement zieht organische Zuschauer an',
          'Marken bemerken Videos mit hohen Interaktionsraten',
          'Durchbrechen Sie den Algorithmus mit Schwung',
          'Sicherer, privater und vollständig verschlüsselter Prozess',
        ],
      },
      finalCta: {
        title: 'Schließen Sie sich 10.000+ Creatorn an, die bereits mit KI-gestützten Strategien wachsen.',
        cta: 'MEINE KAMPAGNE STARTEN',
      },
      compliance: {
        text: 'Konformität: Socialoura nutzt KI-gesteuerte Content-Distributionsstrategien, die vollständig konform mit den Nutzungsbedingungen von TikTok sind. Wir verwenden niemals Bots, Fake-Accounts oder Methoden, die Ihr Konto gefährden könnten.',
      },
    },
    es: {
      hero: {
        title: 'IMPULSA TUS VÍDEOS',
        platform: 'DE TIKTOK',
        subtitle: 'Amplifica el alcance de tus vídeos con nuestros algoritmos de distribución inteligente. Mejora tu engagement de forma conforme.',
        badges: [
          { text: 'Distribución IA inteligente' },
          { text: 'Métodos conformes' },
          { text: 'Campaña 24/7' },
        ],
        cta: 'LANZAR CAMPAÑA',
        inputLabel: 'Enlace del vídeo a promocionar',
        inputPlaceholder: 'https://vm.tiktok.com/...',
      },
      difference: {
        title: 'Por qué los creadores confían en Socialoura',
        cards: [
          {
            title: 'Distribución con IA',
            description: 'Nuestro algoritmo analiza tu contenido de vídeo y lo distribuye a través de canales específicos para maximizar un engagement de aspecto orgánico.',
            icon: 'Bot'
          },
          {
            title: 'Entrega gradual y natural',
            description: 'Los likes se entregan progresivamente para imitar patrones de engagement natural. Nuestro sistema inteligente se adapta para mantener tu contenido seguro.',
            icon: 'Clock'
          },
          {
            title: 'Seguridad del contenido primero',
            description: 'Nunca pedimos tu contraseña. Nuestros métodos de promoción son 100% conformes con las directrices de TikTok — cero riesgo para tu cuenta.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Impulsa tu vídeo en 3 pasos',
        cards: [
          {
            number: '1',
            title: 'PEGA EL ENLACE DE TU VÍDEO',
            description: 'Solo pega la URL del vídeo de TikTok que quieres promocionar — sin contraseña, sin inicio de sesión.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'ELIGE EL TAMAÑO DE TU CAMPAÑA',
            description: 'Selecciona el nivel de engagement que quieres. De 50 a 10K+ likes — planes flexibles para cada presupuesto.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'MIRA CRECER TU ENGAGEMENT',
            description: 'Los likes empiezan a llegar en minutos. Rastrea tu campaña en tiempo real y observa el impacto en el alcance de tu vídeo.',
            icon: 'BarChart3'
          },
        ],
        cta: 'EMPEZAR',
      },
      benefits: {
        title: 'Desbloquea el potencial de tus vídeos',
        items: [
          'Más likes = mejor posición en la página Para Ti',
          'Mayor engagement atrae espectadores orgánicos',
          'Las marcas notan vídeos con altas tasas de interacción',
          'Rompe el algoritmo con impulso',
          'Proceso seguro, privado y totalmente cifrado',
        ],
      },
      finalCta: {
        title: 'Únete a más de 10.000 creadores que ya crecen con estrategias impulsadas por IA.',
        cta: 'LANZAR MI CAMPAÑA',
      },
      compliance: {
        text: 'Conformidad: Socialoura utiliza estrategias de distribución de contenido impulsadas por IA, totalmente conformes con los términos de servicio de TikTok. Nunca usamos bots, cuentas falsas ni ningún método que pueda poner en riesgo tu cuenta.',
      },
    },
  };

  const t = content[lang];

  return (
    <div className="bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[auto] sm:min-h-[70vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/20 via-gray-950 to-cyan-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-rose-600/5 to-cyan-600/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative mx-auto max-w-5xl px-6 py-8 sm:py-20 lg:px-8 w-full">
          <div className="text-center">
            {/* Platform Badge */}
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black mb-4 sm:mb-8 shadow-lg shadow-rose-500/30">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white md:text-6xl mb-2 sm:mb-4 leading-tight">
              {t.hero.title}
            </h1>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight md:text-6xl mb-4 sm:mb-8 leading-tight bg-gradient-to-r from-rose-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {t.hero.platform}
            </h1>
            <p className="text-sm sm:text-lg leading-relaxed text-gray-400 max-w-2xl mx-auto mb-5 sm:mb-10">
              {t.hero.subtitle}
            </p>
            
            {/* Badges */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 mb-12">
              {t.hero.badges.map((badge, index) => (
                <div key={index} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Video URL Input & CTA Button */}
            <div className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </span>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={handleVideoUrlChange}
                    placeholder={t.hero.inputPlaceholder}
                    className="w-full pl-12 pr-4 py-4 text-base bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  />
                </div>
                <button
                  onClick={handleContinue}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t.hero.cta}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-pink-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
                <TrustpilotBadge />
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>{lang === 'fr' ? 'Paiement sécurisé' : lang === 'de' ? 'Sichere Zahlung' : lang === 'es' ? 'Pago seguro' : 'Secure payment'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{lang === 'fr' ? 'Résultats garantis' : lang === 'de' ? 'Garantierte Ergebnisse' : lang === 'es' ? 'Resultados garantizados' : 'Guaranteed results'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Different Section */}
      <section className="py-20 sm:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-gray-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.difference.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-rose-500 to-cyan-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.difference.cards.map((card, index) => {
              const IconComponent = card.icon === 'Bot' ? Bot : card.icon === 'Clock' ? Clock : Shield;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-rose-500/50 transition-all duration-300 hover:bg-gray-800/80"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
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
            <div className="w-20 h-1 bg-gradient-to-r from-rose-500 to-cyan-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {t.howItWorks.cards.map((card, index) => {
              const IconComponent = card.icon === 'Package' ? Package : card.icon === 'Megaphone' ? Megaphone : BarChart3;
              return (
                <div key={index} className="relative group">
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-rose-500/50 to-transparent z-0" />
                  )}
                  
                  <div className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-rose-500/50 transition-all duration-300 h-full">
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-500/30">
                      {index + 1}
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-14 h-14 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-500/20 transition-colors">
                        <IconComponent className="w-7 h-7 text-rose-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">
                        {card.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-16 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-cyan-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
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

      {/* Benefits Section */}
      <section className="py-20 sm:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-gray-900" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.benefits.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-rose-500 to-cyan-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side: Bento Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[0]}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 flex items-center justify-center min-h-[160px] border border-gray-700 hover:border-rose-500/50 transition-colors">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[1]}
                </p>
              </div>
              
              <div className="col-span-2 bg-gradient-to-r from-rose-500 via-pink-600 to-cyan-500 rounded-2xl p-6 flex items-center justify-center min-h-[140px] shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[2]}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[3]}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[4]}
                </p>
              </div>
            </div>
            
            {/* Right side: Image with overlay */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-rose-500 to-cyan-500 rounded-3xl blur-2xl opacity-20" />
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-gray-700">
                <Image
                  src="/img/smiling-woman-using-her-phone-surrounded-by-social.webp"
                  alt="Woman using phone"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
              </div>
            </div>
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
                  {lang === 'fr' ? 'Paiement Réussi !' : lang === 'de' ? 'Zahlung erfolgreich!' : lang === 'es' ? '¡Pago exitoso!' : 'Payment Successful!'}
                </p>
                <p className="text-xs text-green-50">
                  {lang === 'fr' ? 'Votre commande a été confirmée' : lang === 'de' ? 'Ihre Bestellung wurde bestätigt' : lang === 'es' ? 'Tu pedido ha sido confirmado' : 'Your order has been confirmed'}
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
        username={videoUrl}
        platform="tiktok"
        serviceType="likes"
        language={lang}
        currency={currency}
      />

      {/* Payment Modal */}
      {selectedGoal && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          amount={convert(selectedGoal.price).amountInCents}
          currency={currency}
          onClose={handleClosePaymentModal}
          onSuccess={handlePaymentSuccess}
          productName={`+${selectedGoal.followers} TikTok likes`}
          language={lang}
          email={email}
          orderDetails={{
            platform: 'tiktok-likes',
            followers: selectedGoal.followers,
            username: videoUrl,
          }}
        />
      )}

      {/* Order Success Modal */}
      {selectedGoal && (
        <OrderSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleCloseSuccessModal}
          paymentIntentId={paymentIntentId}
          productName={`+${selectedGoal.followers} TikTok likes`}
          amount={convert(selectedGoal.price).amountInCents}
          currency={currency}
          username={videoUrl}
          language={lang}
        />
      )}

      {/* Trusted Brands */}
      <TrustedBrands lang={lang} />

      {/* Reviews Section */}
      <ReviewsSection lang={lang} platform="tiktok" />

      {/* Chat Widget */}
      <ChatWidget lang={lang} />

      {/* Social Proof Toast */}
      <SocialProofToast lang={lang} />
    </div>
  );
}

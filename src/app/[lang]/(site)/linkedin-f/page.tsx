'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Language } from '@/i18n/config';
import { Bot, Clock, Shield, Package, Megaphone, BarChart3 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import Image from 'next/image';
import TrustpilotBadge from '@/components/TrustpilotBadge';

import GoalSelectionModal from '@/components/GoalSelectionModal';
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

export default function LinkedInFollowersPage({ params }: PageProps) {
  const lang = params.lang as Language;
  
  // State management
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<FollowerGoal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { currency, convert } = useCurrency();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleContinue = () => {
    if (username.trim().length > 0) {
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
    
    // Save order to database
    try {
      await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          platform: 'linkedin_followers',
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
        title: 'GROW YOUR LINKEDIN',
        platform: 'FOLLOWERS',
        subtitle: 'AI-powered professional network growth that delivers real, engaged followers to your LinkedIn profile — fast, safe, and fully compliant.',
        badges: [
          { text: 'AI-Driven Growth' },
          { text: 'Real Professionals Only' },
          { text: '24/7 Smart Delivery' },
        ],
        cta: 'GET FOLLOWERS',
      },
      difference: {
        title: 'Why professionals trust Socialoura',
        cards: [
          {
            title: 'AI-Powered Targeting',
            description: 'Our algorithm analyzes your industry, content style, and professional demographics to connect you with followers who genuinely care about your expertise.',
            icon: 'Bot'
          },
          {
            title: 'Instant & Gradual Delivery',
            description: 'Choose between a quick credibility boost or natural-looking gradual growth. Our smart delivery system adapts to keep your profile safe.',
            icon: 'Clock'
          },
          {
            title: 'Profile Safety First',
            description: 'We never ask for your password. Our growth methods are 100% compliant with LinkedIn guidelines — zero risk to your professional profile.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Get followers in 3 steps',
        cards: [
          {
            number: '1',
            title: 'ENTER YOUR PROFILE URL',
            description: 'Just paste your LinkedIn profile URL — no password, no login required. We only need your public profile link to start.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'PICK YOUR GROWTH PLAN',
            description: 'Select the number of followers you want. From 100 to 10K+ — we have flexible plans for every budget and goal.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'WATCH YOUR NETWORK GROW',
            description: 'Followers start arriving within minutes. Track your growth in real time and see the impact on your professional reach.',
            icon: 'BarChart3'
          },
        ],
        cta: 'GET STARTED',
      },
      benefits: {
        title: 'Unlock your LinkedIn potential',
        items: [
          'More followers = more visibility in the LinkedIn feed',
          'Higher social proof attracts recruiters & opportunities',
          'Companies notice profiles with strong follower counts',
          'Boost your thought leadership & credibility',
          'Safe, private & fully encrypted process',
        ],
      },
      pricing: {
        title: 'Test our subscription with our trial offer',
        plan: {
          name: 'PREMIUM',
          price: '$39.90',
          period: 'per month',
          features: [
            '24h trial to explore all features',
            'AI-powered professional targeting',
            'Smart delivery optimization',
            'Priority support & monitoring',
            'Growth analytics dashboard',
          ],
          cta: 'SUBSCRIBE NOW',
        },
      },
      finalCta: {
        title: 'Join 10,000+ professionals already growing with AI-powered strategies.',
        cta: 'GET MY FOLLOWERS',
      },
      compliance: {
        text: 'Compliance: Socialoura uses AI-driven professional network growth strategies that are fully compliant with LinkedIn\'s terms of service. We never use bots, fake accounts, or any method that could put your profile at risk.',
      },
    },
    fr: {
      hero: {
        title: 'DÉVELOPPEZ VOS ABONNÉS',
        platform: 'LINKEDIN',
        subtitle: 'Croissance de réseau professionnel propulsée par l\'IA qui livre de vrais abonnés engagés sur votre profil LinkedIn — rapide, sûr et 100% conforme.',
        badges: [
          { text: 'Croissance par IA' },
          { text: 'Vrais professionnels' },
          { text: 'Livraison 24/7' },
        ],
        cta: 'OBTENIR DES ABONNÉS',
      },
      difference: {
        title: 'Pourquoi les professionnels font confiance à Socialoura',
        cards: [
          {
            title: 'Ciblage propulsé par l\'IA',
            description: 'Notre algorithme analyse votre secteur, votre style de contenu et les données démographiques professionnelles pour vous connecter avec des abonnés réellement intéressés par votre expertise.',
            icon: 'Bot'
          },
          {
            title: 'Livraison instantanée ou progressive',
            description: 'Choisissez entre un boost de crédibilité rapide ou une croissance progressive et naturelle. Notre système intelligent s\'adapte pour protéger votre profil.',
            icon: 'Clock'
          },
          {
            title: 'Sécurité du profil avant tout',
            description: 'Nous ne demandons jamais votre mot de passe. Nos méthodes de croissance sont 100% conformes aux directives LinkedIn — zéro risque pour votre profil professionnel.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Obtenez des abonnés en 3 étapes',
        cards: [
          {
            number: '1',
            title: 'COLLEZ L\'URL DE VOTRE PROFIL',
            description: 'Collez simplement l\'URL de votre profil LinkedIn — pas de mot de passe, pas de connexion requise. On a juste besoin de votre lien de profil public.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'CHOISISSEZ VOTRE PLAN',
            description: 'Sélectionnez le nombre d\'abonnés souhaité. De 100 à 10K+ — des plans flexibles pour chaque budget et objectif.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'REGARDEZ VOTRE RÉSEAU GRANDIR',
            description: 'Les abonnés commencent à arriver en quelques minutes. Suivez votre croissance en temps réel et constatez l\'impact sur votre portée professionnelle.',
            icon: 'BarChart3'
          },
        ],
        cta: 'COMMENCER',
      },
      benefits: {
        title: 'Débloquez votre potentiel LinkedIn',
        items: [
          'Plus d\'abonnés = plus de visibilité dans le fil LinkedIn',
          'Une preuve sociale forte attire recruteurs et opportunités',
          'Les entreprises remarquent les profils avec beaucoup d\'abonnés',
          'Renforcez votre leadership d\'opinion et votre crédibilité',
          'Processus sûr, privé et entièrement chiffré',
        ],
      },
      pricing: {
        title: 'Testez notre abonnement avec notre offre d\'essai',
        plan: {
          name: 'PREMIUM',
          price: '39,90€',
          period: 'par mois',
          features: [
            'Essai de 24h pour explorer toutes les fonctionnalités',
            'Ciblage professionnel propulsé par l\'IA',
            'Optimisation intelligente de la livraison',
            'Support prioritaire et monitoring',
            'Tableau de bord d\'analytics de croissance',
          ],
          cta: 'S\'ABONNER MAINTENANT',
        },
      },
      finalCta: {
        title: 'Rejoignez 10 000+ professionnels qui grandissent déjà grâce à l\'IA.',
        cta: 'OBTENIR MES ABONNÉS',
      },
      compliance: {
        text: 'Conformité : Socialoura utilise des stratégies de croissance de réseau professionnel propulsées par l\'IA, entièrement conformes aux conditions d\'utilisation de LinkedIn. Nous n\'utilisons jamais de bots, de faux comptes, ni aucune méthode pouvant mettre votre profil en danger.',
      },
    },
    de: {
      hero: {
        title: 'LINKEDIN FOLLOWER',
        platform: 'GEWINNEN',
        subtitle: 'KI-gesteuerte professionelle Netzwerk-Wachstumsstrategie, die echte, engagierte Follower auf Ihr LinkedIn-Profil bringt — schnell, sicher und vollständig konform.',
        badges: [
          { text: 'KI-gestütztes Wachstum' },
          { text: 'Nur echte Profis' },
          { text: '24/7 Smart Delivery' },
        ],
        cta: 'FOLLOWER ERHALTEN',
      },
      difference: {
        title: 'Warum Profis Socialoura vertrauen',
        cards: [
          {
            title: 'KI-gestütztes Targeting',
            description: 'Unser Algorithmus analysiert Ihre Branche, Ihren Content-Stil und die professionelle Demografie, um Sie mit Followern zu verbinden, die sich wirklich für Ihre Expertise interessieren.',
            icon: 'Bot'
          },
          {
            title: 'Sofortige oder schrittweise Lieferung',
            description: 'Wählen Sie zwischen einem schnellen Glaubwürdigkeitsboost oder natürlich aussehendem, schrittweisem Wachstum. Unser smartes System passt sich an, um Ihr Profil zu schützen.',
            icon: 'Clock'
          },
          {
            title: 'Profilsicherheit an erster Stelle',
            description: 'Wir fragen nie nach Ihrem Passwort. Unsere Wachstumsmethoden sind 100% konform mit den LinkedIn-Richtlinien — null Risiko für Ihr professionelles Profil.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Follower in 3 Schritten erhalten',
        cards: [
          {
            number: '1',
            title: 'PROFIL-URL EINGEBEN',
            description: 'Fügen Sie einfach Ihre LinkedIn-Profil-URL ein — kein Passwort, keine Anmeldung erforderlich. Wir brauchen nur Ihren öffentlichen Profillink.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'WACHSTUMSPLAN WÄHLEN',
            description: 'Wählen Sie die gewünschte Follower-Anzahl. Von 100 bis 10K+ — flexible Pläne für jedes Budget und Ziel.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'NETZWERK WACHSEN SEHEN',
            description: 'Follower kommen innerhalb von Minuten an. Verfolgen Sie Ihr Wachstum in Echtzeit und sehen Sie die Auswirkungen auf Ihre professionelle Reichweite.',
            icon: 'BarChart3'
          },
        ],
        cta: 'JETZT STARTEN',
      },
      benefits: {
        title: 'Entfesseln Sie Ihr LinkedIn-Potenzial',
        items: [
          'Mehr Follower = mehr Sichtbarkeit im LinkedIn-Feed',
          'Starker Social Proof zieht Recruiter & Chancen an',
          'Unternehmen bemerken Profile mit starken Follower-Zahlen',
          'Stärken Sie Ihre Thought Leadership & Glaubwürdigkeit',
          'Sicherer, privater und vollständig verschlüsselter Prozess',
        ],
      },
      pricing: {
        title: 'Testen Sie unser Abo mit unserem Probenangebot',
        plan: {
          name: 'PREMIUM',
          price: '39,90€',
          period: 'pro Monat',
          features: [
            '24h Probezeit zum Entdecken aller Funktionen',
            'KI-gestütztes professionelles Targeting',
            'Intelligente Lieferoptimierung',
            'Priority-Support und Monitoring',
            'Wachstums-Analytics-Dashboard',
          ],
          cta: 'JETZT ABONNIEREN',
        },
      },
      finalCta: {
        title: 'Schließen Sie sich 10.000+ Profis an, die bereits mit KI-gestützten Strategien wachsen.',
        cta: 'MEINE FOLLOWER ERHALTEN',
      },
      compliance: {
        text: 'Konformität: Socialoura nutzt KI-gesteuerte professionelle Netzwerk-Wachstumsstrategien, die vollständig konform mit den Nutzungsbedingungen von LinkedIn sind. Wir verwenden niemals Bots, Fake-Accounts oder Methoden, die Ihr Profil gefährden könnten.',
      },
    },
    es: {
      hero: {
        title: 'CONSIGUE SEGUIDORES',
        platform: 'REALES EN LINKEDIN',
        subtitle: 'Crecimiento de red profesional impulsado por IA que entrega seguidores reales y comprometidos a tu perfil de LinkedIn — rápido, seguro y totalmente conforme.',
        badges: [
          { text: 'Crecimiento con IA' },
          { text: 'Solo profesionales reales' },
          { text: 'Entrega inteligente 24/7' },
        ],
        cta: 'OBTENER SEGUIDORES',
      },
      difference: {
        title: 'Por qué los profesionales confían en Socialoura',
        cards: [
          {
            title: 'Segmentación con IA',
            description: 'Nuestro algoritmo analiza tu sector, estilo de contenido y demografía profesional para conectarte con seguidores que realmente se interesan por tu experiencia.',
            icon: 'Bot'
          },
          {
            title: 'Entrega instantánea o gradual',
            description: 'Elige entre un impulso rápido de credibilidad o un crecimiento gradual y natural. Nuestro sistema inteligente se adapta para mantener tu perfil seguro.',
            icon: 'Clock'
          },
          {
            title: 'Seguridad del perfil primero',
            description: 'Nunca pedimos tu contraseña. Nuestros métodos de crecimiento son 100% conformes con las directrices de LinkedIn — cero riesgo para tu perfil profesional.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Consigue seguidores en 3 pasos',
        cards: [
          {
            number: '1',
            title: 'PEGA LA URL DE TU PERFIL',
            description: 'Solo pega la URL de tu perfil de LinkedIn — sin contraseña, sin inicio de sesión. Solo necesitamos tu enlace de perfil público.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'ELIGE TU PLAN DE CRECIMIENTO',
            description: 'Selecciona el número de seguidores que quieres. De 100 a 10K+ — planes flexibles para cada presupuesto y objetivo.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'MIRA CRECER TU RED',
            description: 'Los seguidores empiezan a llegar en minutos. Rastrea tu crecimiento en tiempo real y observa el impacto en tu alcance profesional.',
            icon: 'BarChart3'
          },
        ],
        cta: 'EMPEZAR',
      },
      benefits: {
        title: 'Desbloquea tu potencial en LinkedIn',
        items: [
          'Más seguidores = más visibilidad en el feed de LinkedIn',
          'Mayor prueba social atrae reclutadores y oportunidades',
          'Las empresas notan perfiles con muchos seguidores',
          'Impulsa tu liderazgo de opinión y credibilidad',
          'Proceso seguro, privado y totalmente cifrado',
        ],
      },
      pricing: {
        title: 'Prueba nuestra suscripción con nuestra oferta de prueba',
        plan: {
          name: 'PREMIUM',
          price: '39,90€',
          period: 'al mes',
          features: [
            'Prueba de 24h para explorar todas las funciones',
            'Segmentación profesional con IA',
            'Optimización inteligente de entrega',
            'Soporte prioritario y monitorización',
            'Panel de analíticas de crecimiento',
          ],
          cta: 'SUSCRIBIRSE AHORA',
        },
      },
      finalCta: {
        title: 'Únete a más de 10.000 profesionales que ya crecen con estrategias impulsadas por IA.',
        cta: 'OBTENER MIS SEGUIDORES',
      },
      compliance: {
        text: 'Conformidad: Socialoura utiliza estrategias de crecimiento de red profesional impulsadas por IA, totalmente conformes con los términos de servicio de LinkedIn. Nunca usamos bots, cuentas falsas ni ningún método que pueda poner en riesgo tu perfil.',
      },
    },
  };

  const t = content[lang];

  return (
    <div className="bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[auto] sm:min-h-[70vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-gray-950 to-sky-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/5 to-sky-600/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative mx-auto max-w-5xl px-6 py-8 sm:py-20 lg:px-8 w-full">
          <div className="text-center">
            {/* Platform Badge */}
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0A66C2] mb-4 sm:mb-8 shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white md:text-6xl mb-2 sm:mb-4 leading-tight">
              {t.hero.title}
            </h1>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight md:text-6xl mb-4 sm:mb-8 leading-tight bg-gradient-to-r from-blue-400 via-sky-400 to-blue-300 bg-clip-text text-transparent">
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

            {/* Username Input & CTA Button */}
            <div className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder={lang === 'fr' ? 'https://linkedin.com/in/...' : lang === 'de' ? 'https://linkedin.com/in/...' : lang === 'es' ? 'https://linkedin.com/in/...' : 'https://linkedin.com/in/...'}
                    className="w-full pl-10 pr-4 py-4 text-base bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  />
                </div>
                <button
                  onClick={handleContinue}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A66C2] via-blue-600 to-[#0A66C2] px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t.hero.cta}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-[#0A66C2] to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.difference.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-sky-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.difference.cards.map((card, index) => {
              const IconComponent = card.icon === 'Bot' ? Bot : card.icon === 'Clock' ? Clock : Shield;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/80"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-sky-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#0A66C2] to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
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
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.howItWorks.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-sky-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {t.howItWorks.cards.map((card, index) => {
              const IconComponent = card.icon === 'Package' ? Package : card.icon === 'Megaphone' ? Megaphone : BarChart3;
              return (
                <div key={index} className="relative group">
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent z-0" />
                  )}
                  
                  <div className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 h-full">
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-[#0A66C2] to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30">
                      {index + 1}
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-14 h-14 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                        <IconComponent className="w-7 h-7 text-blue-400" />
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
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A66C2] via-blue-600 to-[#0A66C2] px-10 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.benefits.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-sky-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side: Bento Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#0A66C2] to-blue-700 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[0]}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 flex items-center justify-center min-h-[160px] border border-gray-700 hover:border-blue-500/50 transition-colors">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[1]}
                </p>
              </div>
              
              <div className="col-span-2 bg-gradient-to-r from-blue-500 via-[#0A66C2] to-sky-500 rounded-2xl p-6 flex items-center justify-center min-h-[140px] shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[2]}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-transform">
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
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-sky-500 rounded-3xl blur-2xl opacity-20" />
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
        username={username}
        platform="linkedin"
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
          productName={`+${selectedGoal.followers} LinkedIn followers`}
          language={lang}
          email={email}
          orderDetails={{
            platform: 'linkedin_followers',
            followers: selectedGoal.followers,
            username: username,
          }}
        />
      )}

      {/* Order Success Modal */}
      {selectedGoal && (
        <OrderSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleCloseSuccessModal}
          paymentIntentId={paymentIntentId}
          productName={`+${selectedGoal.followers} LinkedIn followers`}
          amount={convert(selectedGoal.price).amountInCents}
          currency={currency}
          username={username}
          language={lang}
        />
      )}

      {/* Trusted Brands */}
      <TrustedBrands lang={lang} />

      {/* Reviews Section */}
      <ReviewsSection lang={lang} platform="all" />

      {/* Chat Widget */}
      <ChatWidget lang={lang} />

      {/* Social Proof Toast */}
      <SocialProofToast lang={lang} />
    </div>
  );
}

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Language } from '@/i18n/config';
import { Bot, Clock, Shield, Package, Megaphone, BarChart3, Zap } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import Image from 'next/image';
import TrustpilotBadge from '@/components/TrustpilotBadge';
import UserSearchInput from '@/components/UserSearchInput';

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

export default function InstagramPage({ params }: PageProps) {
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
          platform: 'instagram',
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
        title: 'Buy Instagram Followers',
        subtitle: 'Instant Delivery',
        description: 'Boost your Instagram presence with real, high-quality followers. Start growing today with our premium service.',
        badges: [
          { text: 'Instant Delivery' },
          { text: '100% Safe & Secure' },
          { text: 'No Password Required' },
          { text: '24/7 Support' },
        ],
        cta: 'GET STARTED NOW',
        priceStart: 'Starting at $2.99',
      },
      difference: {
        title: 'What makes Socialoura different?',
        cards: [
          {
            title: 'Authentic Marketing Only',
            description: 'We promote your content through real partnerships and strategic collaborations. Every interaction is genuine and compliant with platform guidelines.',
            icon: 'Bot'
          },
          {
            title: 'Time-saving solutions',
            description: 'Focus on creating great content while we handle the marketing strategy. Our professional approach saves you hours of networking time.',
            icon: 'Clock'
          },
          {
            title: 'Build credibility the right way',
            description: 'Strategic promotion through trusted channels builds real authority and engagement with your target audience.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'How it works',
        cards: [
          {
            number: '1',
            title: 'CHOOSE YOUR PACKAGE',
            description: 'Select the marketing support level that aligns with your goals. Our plans offer professional promotion through our exclusive partner network.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'WE MARKET YOUR CONTENT',
            description: 'We share your content through selected platforms, creators, and communities to reach people genuinely interested in your niche.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'TRACK THE IMPACT',
            description: 'Monitor your results through your dashboard as your content reaches new audiences and builds stronger visibility.',
            icon: 'BarChart3'
          },
        ],
        cta: 'START NOW',
      },
      benefits: {
        title: '(Re)take the control now',
        items: [
          'Greater visibility for your content',
          'Stronger presence across platforms',
          'Earn audience trust through consistent exposure',
          'Reach more people interested in your niche',
          'Professional and safe process',
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
            'Audience research and targeting',
            'Content placement guidance',
            'Professional promotional outreach',
            'Strategic recommendations to improve reach',
          ],
          cta: 'SUBSCRIBE NOW',
        },
      },
      finalCta: {
        title: 'Much more than just a solution. A true partner in your success.',
        cta: 'START IT NOW',
      },
      compliance: {
        text: 'Compliance Disclaimer: All our services are based on authentic marketing strategies and visibility solutions in accordance with platform policies and terms of service.',
      },
    },
    fr: {
      hero: {
        title: 'Acheter des Abonnés Instagram',
        subtitle: 'Livraison Instantanée',
        description: 'Boostez votre présence Instagram avec de vrais abonnés de haute qualité. Commencez à grandir dès aujourd\'hui avec notre service premium.',
        badges: [
          { text: 'Livraison Instantanée' },
          { text: '100% Sûr et Sécurisé' },
          { text: 'Aucun Mot de Passe Requis' },
          { text: 'Support 24/7' },
        ],
        cta: 'COMMENCER MAINTENANT',
        priceStart: 'À partir de 2,99€',
      },
      difference: {
        title: 'Qu\'est-ce qui rend Socialoura différent ?',
        cards: [
          {
            title: 'Marketing authentique uniquement',
            description: 'Nous promouvons votre contenu via de vrais partenariats et collaborations stratégiques. Chaque interaction est authentique et conforme aux directives de la plateforme.',
            icon: 'Bot'
          },
          {
            title: 'Solutions qui font gagner du temps',
            description: 'Concentrez-vous sur la création de contenu de qualité pendant que nous gérons la stratégie marketing. Notre approche professionnelle vous fait gagner des heures.',
            icon: 'Clock'
          },
          {
            title: 'Construisez votre crédibilité de la bonne manière',
            description: 'Une promotion stratégique via des canaux de confiance construit une vraie autorité et un engagement avec votre audience cible.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Comment ça marche',
        cards: [
          {
            number: '1',
            title: 'CHOISISSEZ VOTRE FORFAIT',
            description: 'Sélectionnez le niveau de support marketing qui correspond à vos objectifs. Nos plans offrent une promotion professionnelle via notre réseau partenaire exclusif.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'NOUS PROMOUVONS VOTRE CONTENU',
            description: 'Nous partageons votre contenu via des plateformes, créateurs et communautés sélectionnés pour atteindre les personnes vraiment intéressées par votre niche.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'SUIVEZ L\'IMPACT',
            description: 'Surveillez vos résultats via votre tableau de bord pendant que votre contenu atteint de nouvelles audiences et construit une visibilité plus forte.',
            icon: 'BarChart3'
          },
        ],
        cta: 'COMMENCER MAINTENANT',
      },
      benefits: {
        title: '(Re)prenez le contrôle maintenant',
        items: [
          'Plus grande visibilité pour votre contenu',
          'Présence plus forte sur les plateformes',
          'Gagnez la confiance de votre audience par une exposition cohérente',
          'Atteignez plus de personnes intéressées par votre niche',
          'Processus professionnel et sécurisé',
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
            'Recherche et ciblage d\'audience',
            'Conseils pour le placement de contenu',
            'Promotion professionnelle',
            'Recommandations stratégiques pour améliorer la portée',
          ],
          cta: 'S\'ABONNER MAINTENANT',
        },
      },
      finalCta: {
        title: 'Bien plus qu\'une simple solution. Un véritable partenaire dans votre succès.',
        cta: 'COMMENCEZ DÈS MAINTENANT',
      },
      compliance: {
        text: 'Avertissement de conformité : Tous nos services sont basés sur des stratégies marketing authentiques et des solutions de visibilité conformes aux politiques et conditions de la plateforme.',
      },
    },
    de: {
      hero: {
        title: 'Instagram Follower Kaufen',
        subtitle: 'Sofortige Lieferung',
        description: 'Steigern Sie Ihre Instagram-Präsenz mit echten, hochwertigen Followern. Starten Sie noch heute mit unserem Premium-Service.',
        badges: [
          { text: 'Sofortige Lieferung' },
          { text: '100% Sicher & Geschützt' },
          { text: 'Kein Passwort Erforderlich' },
          { text: '24/7 Support' },
        ],
        cta: 'JETZT STARTEN',
        priceStart: 'Ab 2,99€',
      },
      difference: {
        title: 'Was macht Socialoura anders?',
        cards: [
          {
            title: 'Nur authentisches Marketing',
            description: 'Wir bewerben Ihre Inhalte durch echte Partnerschaften und strategische Kooperationen. Jede Interaktion ist echt und konform mit den Plattformrichtlinien.',
            icon: 'Bot'
          },
          {
            title: 'Zeitsparende Lösungen',
            description: 'Konzentrieren Sie sich auf die Erstellung großartiger Inhalte, während wir die Marketingstrategie übernehmen. Unser professioneller Ansatz spart Ihnen Stunden.',
            icon: 'Clock'
          },
          {
            title: 'Glaubwürdigkeit richtig aufbauen',
            description: 'Strategische Promotion über vertrauenswürdige Kanäle baut echte Autorität und Engagement mit Ihrer Zielgruppe auf.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'So funktioniert es',
        cards: [
          {
            number: '1',
            title: 'WÄHLEN SIE IHR PAKET',
            description: 'Wählen Sie die Marketing-Unterstützungsstufe, die zu Ihren Zielen passt. Unsere Pläne bieten professionelle Promotion über unser exklusives Partnernetzwerk.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'WIR BEWERBEN IHRE INHALTE',
            description: 'Wir teilen Ihre Inhalte über ausgewählte Plattformen, Creator und Communities, um Menschen zu erreichen, die sich für Ihre Nische interessieren.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'VERFOLGEN SIE DIE WIRKUNG',
            description: 'Überwachen Sie Ihre Ergebnisse über Ihr Dashboard, während Ihre Inhalte neue Zielgruppen erreichen und stärkere Sichtbarkeit aufbauen.',
            icon: 'BarChart3'
          },
        ],
        cta: 'JETZT STARTEN',
      },
      benefits: {
        title: 'Übernehmen Sie jetzt (wieder) die Kontrolle',
        items: [
          'Größere Sichtbarkeit für Ihre Inhalte',
          'Stärkere Präsenz auf allen Plattformen',
          'Gewinnen Sie das Vertrauen Ihres Publikums durch konsistente Präsenz',
          'Erreichen Sie mehr Menschen, die sich für Ihre Nische interessieren',
          'Professioneller und sicherer Prozess',
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
            'Zielgruppenrecherche und Targeting',
            'Content-Platzierungsberatung',
            'Professionelle Promotion',
            'Strategische Empfehlungen zur Reichweitensteigerung',
          ],
          cta: 'JETZT ABONNIEREN',
        },
      },
      finalCta: {
        title: 'Viel mehr als nur eine Lösung. Ein echter Partner für Ihren Erfolg.',
        cta: 'JETZT STARTEN',
      },
      compliance: {
        text: 'Konformitätshinweis: Alle unsere Dienstleistungen basieren auf authentischen Marketingstrategien und Sichtbarkeitslösungen in Übereinstimmung mit den Plattformrichtlinien und Nutzungsbedingungen.',
      },
    },
    es: {
      hero: {
        title: 'Comprar Seguidores de Instagram',
        subtitle: 'Entrega Instantánea',
        description: 'Impulsa tu presencia en Instagram con seguidores reales y de alta calidad. Empieza a crecer hoy con nuestro servicio premium.',
        badges: [
          { text: 'Entrega Instantánea' },
          { text: '100% Seguro y Protegido' },
          { text: 'Sin Contraseña' },
          { text: 'Soporte 24/7' },
        ],
        cta: 'EMPEZAR AHORA',
        priceStart: 'Desde 2,99€',
      },
      difference: {
        title: '¿Qué hace diferente a Socialoura?',
        cards: [
          {
            title: 'Solo marketing auténtico',
            description: 'Promocionamos tu contenido a través de colaboraciones reales y asociaciones estratégicas. Cada interacción es genuina y cumple con las directrices de la plataforma.',
            icon: 'Bot'
          },
          {
            title: 'Soluciones que ahorran tiempo',
            description: 'Concéntrate en crear contenido de calidad mientras nosotros gestionamos la estrategia de marketing. Nuestro enfoque profesional te ahorra horas.',
            icon: 'Clock'
          },
          {
            title: 'Construye credibilidad de la forma correcta',
            description: 'La promoción estratégica a través de canales de confianza construye autoridad real y engagement con tu audiencia objetivo.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Cómo funciona',
        cards: [
          {
            number: '1',
            title: 'ELIGE TU PAQUETE',
            description: 'Selecciona el nivel de soporte de marketing que se alinee con tus objetivos. Nuestros planes ofrecen promoción profesional a través de nuestra red de socios exclusiva.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'PROMOCIONAMOS TU CONTENIDO',
            description: 'Compartimos tu contenido a través de plataformas, creadores y comunidades seleccionadas para llegar a personas realmente interesadas en tu nicho.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'RASTREA EL IMPACTO',
            description: 'Monitoriza tus resultados a través de tu panel mientras tu contenido llega a nuevas audiencias y construye mayor visibilidad.',
            icon: 'BarChart3'
          },
        ],
        cta: 'EMPEZAR AHORA',
      },
      benefits: {
        title: '(Re)toma el control ahora',
        items: [
          'Mayor visibilidad para tu contenido',
          'Presencia más fuerte en las plataformas',
          'Gana la confianza de tu audiencia con exposición constante',
          'Llega a más personas interesadas en tu nicho',
          'Proceso profesional y seguro',
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
            'Investigación y segmentación de audiencia',
            'Guía de colocación de contenido',
            'Promoción profesional',
            'Recomendaciones estratégicas para mejorar el alcance',
          ],
          cta: 'SUSCRIBIRSE AHORA',
        },
      },
      finalCta: {
        title: 'Mucho más que una simple solución. Un verdadero socio en tu éxito.',
        cta: 'EMPIEZA YA',
      },
      compliance: {
        text: 'Aviso de conformidad: Todos nuestros servicios se basan en estrategias de marketing auténticas y soluciones de visibilidad conforme a las políticas y condiciones de servicio de las plataformas.',
      },
    },
  };

  const t = content[lang];

  return (
    <div className="bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[auto] sm:min-h-[70vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-pink-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative mx-auto max-w-5xl px-6 py-8 sm:py-20 lg:px-8 w-full">
          <div className="text-center">
            {/* Platform Badge */}
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 mb-4 sm:mb-6 shadow-lg shadow-purple-500/30">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white md:text-7xl mb-3 sm:mb-4 leading-tight">
              {t.hero.title}
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-orange-500" />
              <p className="text-lg sm:text-xl font-bold text-orange-500">
                {t.hero.subtitle}
              </p>
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8">
              {t.hero.description}
            </p>
            
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 px-4">
              {t.hero.badges.map((badge, index) => (
                <div key={index} className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Username Search Input */}
            <div className="max-w-2xl mx-auto mb-4">
              <UserSearchInput
                platform="instagram"
                onUserConfirmed={(confirmedUsername) => {
                  setUsername(confirmedUsername);
                  setIsGoalModalOpen(true);
                }}
                placeholder={lang === 'fr' ? 'nomutilisateur' : lang === 'de' ? 'Benutzername' : lang === 'es' ? 'nombreusuario' : 'username'}
                className="w-full"
                language={lang}
              />
              
              <p className="text-center text-sm text-gray-400 mt-3">
                {t.hero.priceStart}
              </p>
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
      </section>

      {/* What Makes Different Section */}
      <section className="py-20 sm:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-gray-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.difference.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.difference.cards.map((card, index) => {
              const IconComponent = card.icon === 'Bot' ? Bot : card.icon === 'Clock' ? Clock : Shield;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-800/80"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
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
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {t.howItWorks.cards.map((card, index) => {
              const IconComponent = card.icon === 'Package' ? Package : card.icon === 'Megaphone' ? Megaphone : BarChart3;
              return (
                <div key={index} className="relative group">
                  {/* Connector line */}
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent z-0" />
                  )}
                  
                  <div className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 h-full">
                    {/* Step number */}
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/30">
                      {index + 1}
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-14 h-14 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                        <IconComponent className="w-7 h-7 text-purple-400" />
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
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-10 py-4 text-base font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.benefits.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side: Bento Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[0]}
                </p>
              </div>
              {/* Card 2 */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 flex items-center justify-center min-h-[160px] border border-gray-700 hover:border-purple-500/50 transition-colors">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[1]}
                </p>
              </div>
              
              {/* Card 3 - Full width */}
              <div className="col-span-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-6 flex items-center justify-center min-h-[140px] shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[2]}
                </p>
              </div>
              
              {/* Card 4 */}
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[3]}
                </p>
              </div>
              {/* Card 5 */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[4]}
                </p>
              </div>
            </div>
            
            {/* Right side: Image with overlay */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20" />
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
        platform="instagram"
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
          productName={`+${selectedGoal.followers} Instagram followers`}
          language={lang}
          email={email}
          orderDetails={{
            platform: 'instagram',
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
          productName={`+${selectedGoal.followers} Instagram followers`}
          amount={convert(selectedGoal.price).amountInCents}
          currency={currency}
          username={username}
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

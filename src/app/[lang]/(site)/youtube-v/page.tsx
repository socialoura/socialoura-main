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

export default function YouTubeViewsPage({ params }: PageProps) {
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
          platform: 'youtube_views',
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
        title: 'BOOST YOUR YOUTUBE',
        platform: 'VIDEO VIEWS',
        subtitle: 'AI-powered visibility campaigns that deliver real, high-retention views to your YouTube videos — fast, safe, and fully compliant.',
        badges: [
          { text: 'AI-Driven Promotion' },
          { text: 'Real Views Only' },
          { text: '24/7 Smart Delivery' },
        ],
        cta: 'GET VIEWS',
      },
      difference: {
        title: 'Why creators trust Socialoura',
        cards: [
          {
            title: 'AI-Powered Promotion',
            description: 'Our algorithm analyzes your niche, video content, and target audience to promote your videos to viewers who are genuinely interested in your content.',
            icon: 'Bot'
          },
          {
            title: 'Instant & Gradual Delivery',
            description: 'Choose between a quick visibility boost or natural-looking gradual growth. Our smart delivery system adapts to keep your channel safe.',
            icon: 'Clock'
          },
          {
            title: 'Channel Safety First',
            description: 'We never ask for your password. Our promotion methods are 100% compliant with YouTube guidelines — zero risk to your channel.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Get views in 3 steps',
        cards: [
          {
            number: '1',
            title: 'PASTE YOUR VIDEO URL',
            description: 'Just paste the link to your YouTube video — no password, no login required. We only need the public video URL to start.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'PICK YOUR VIEWS PLAN',
            description: 'Select the number of views you want. From 500 to 100K+ — we have flexible plans for every budget and goal.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'WATCH YOUR VIEWS GROW',
            description: 'Views start arriving within minutes. Track your growth in real time and see the impact on your video ranking.',
            icon: 'BarChart3'
          },
        ],
        cta: 'GET STARTED',
      },
      benefits: {
        title: 'Unlock your YouTube potential',
        items: [
          'More views = higher ranking in YouTube search & suggestions',
          'Higher view count attracts organic viewers',
          'Brands notice videos with strong view counts',
          'Break through the algorithm with momentum',
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
            'AI-powered video promotion',
            'Smart delivery optimization',
            'Priority support & monitoring',
            'Growth analytics dashboard',
          ],
          cta: 'SUBSCRIBE NOW',
        },
      },
      finalCta: {
        title: 'Join 10,000+ creators already growing with AI-powered strategies.',
        cta: 'GET MY VIEWS',
      },
      compliance: {
        text: 'Compliance: Socialoura uses AI-driven video promotion strategies that are fully compliant with YouTube\'s terms of service. We never use bots, fake accounts, or any method that could put your channel at risk.',
      },
    },
    fr: {
      hero: {
        title: 'BOOSTEZ VOS VUES',
        platform: 'YOUTUBE',
        subtitle: 'Campagnes de visibilité propulsées par l\'IA qui livrent de vraies vues haute rétention sur vos vidéos YouTube — rapide, sûr et 100% conforme.',
        badges: [
          { text: 'Promotion par IA' },
          { text: 'Vraies vues uniquement' },
          { text: 'Livraison 24/7' },
        ],
        cta: 'OBTENIR DES VUES',
      },
      difference: {
        title: 'Pourquoi les créateurs font confiance à Socialoura',
        cards: [
          {
            title: 'Promotion propulsée par l\'IA',
            description: 'Notre algorithme analyse votre niche, votre contenu vidéo et votre audience cible pour promouvoir vos vidéos auprès de spectateurs réellement intéressés.',
            icon: 'Bot'
          },
          {
            title: 'Livraison instantanée ou progressive',
            description: 'Choisissez entre un boost de visibilité rapide ou une croissance progressive et naturelle. Notre système intelligent s\'adapte pour protéger votre chaîne.',
            icon: 'Clock'
          },
          {
            title: 'Sécurité de la chaîne avant tout',
            description: 'Nous ne demandons jamais votre mot de passe. Nos méthodes de promotion sont 100% conformes aux directives YouTube — zéro risque pour votre chaîne.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Obtenez des vues en 3 étapes',
        cards: [
          {
            number: '1',
            title: 'COLLEZ L\'URL DE VOTRE VIDÉO',
            description: 'Collez simplement le lien de votre vidéo YouTube — pas de mot de passe, pas de connexion requise. On a juste besoin de l\'URL publique.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'CHOISISSEZ VOTRE PLAN DE VUES',
            description: 'Sélectionnez le nombre de vues souhaité. De 500 à 100K+ — des plans flexibles pour chaque budget et objectif.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'REGARDEZ VOS VUES AUGMENTER',
            description: 'Les vues commencent à arriver en quelques minutes. Suivez votre croissance en temps réel et constatez l\'impact sur le classement de votre vidéo.',
            icon: 'BarChart3'
          },
        ],
        cta: 'COMMENCER',
      },
      benefits: {
        title: 'Débloquez votre potentiel YouTube',
        items: [
          'Plus de vues = meilleur classement dans la recherche YouTube',
          'Un compteur de vues élevé attire des spectateurs organiques',
          'Les marques remarquent les vidéos avec beaucoup de vues',
          'Percez l\'algorithme grâce à l\'élan',
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
            'Promotion vidéo propulsée par l\'IA',
            'Optimisation intelligente de la livraison',
            'Support prioritaire et monitoring',
            'Tableau de bord d\'analytics de croissance',
          ],
          cta: 'S\'ABONNER MAINTENANT',
        },
      },
      finalCta: {
        title: 'Rejoignez 10 000+ créateurs qui grandissent déjà grâce à l\'IA.',
        cta: 'OBTENIR MES VUES',
      },
      compliance: {
        text: 'Conformité : Socialoura utilise des stratégies de promotion vidéo propulsées par l\'IA, entièrement conformes aux conditions d\'utilisation de YouTube. Nous n\'utilisons jamais de bots, de faux comptes, ni aucune méthode pouvant mettre votre chaîne en danger.',
      },
    },
    de: {
      hero: {
        title: 'BOOSTEN SIE IHRE',
        platform: 'YOUTUBE VIEWS',
        subtitle: 'KI-gesteuerte Sichtbarkeitskampagnen, die echte Views mit hoher Retention auf Ihre YouTube-Videos bringen — schnell, sicher und vollständig konform.',
        badges: [
          { text: 'KI-gestützte Promotion' },
          { text: 'Nur echte Views' },
          { text: '24/7 Smart Delivery' },
        ],
        cta: 'VIEWS ERHALTEN',
      },
      difference: {
        title: 'Warum Creator Socialoura vertrauen',
        cards: [
          {
            title: 'KI-gestützte Promotion',
            description: 'Unser Algorithmus analysiert Ihre Nische, Ihren Videoinhalt und Ihre Zielgruppe, um Ihre Videos bei Zuschauern zu bewerben, die sich wirklich für Ihre Inhalte interessieren.',
            icon: 'Bot'
          },
          {
            title: 'Sofortige oder schrittweise Lieferung',
            description: 'Wählen Sie zwischen einem schnellen Sichtbarkeitsboost oder natürlich aussehendem, schrittweisem Wachstum. Unser smartes System passt sich an, um Ihren Kanal zu schützen.',
            icon: 'Clock'
          },
          {
            title: 'Kanalsicherheit an erster Stelle',
            description: 'Wir fragen nie nach Ihrem Passwort. Unsere Promotionmethoden sind 100% konform mit den YouTube-Richtlinien — null Risiko für Ihren Kanal.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Views in 3 Schritten erhalten',
        cards: [
          {
            number: '1',
            title: 'VIDEO-URL EINFÜGEN',
            description: 'Fügen Sie einfach den Link zu Ihrem YouTube-Video ein — kein Passwort, keine Anmeldung erforderlich. Wir brauchen nur die öffentliche Video-URL.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'VIEWS-PLAN WÄHLEN',
            description: 'Wählen Sie die gewünschte Anzahl an Views. Von 500 bis 100K+ — flexible Pläne für jedes Budget und Ziel.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'ZUSCHAUEN WIE VIEWS WACHSEN',
            description: 'Views kommen innerhalb von Minuten an. Verfolgen Sie Ihr Wachstum in Echtzeit und sehen Sie die Auswirkungen auf das Ranking Ihres Videos.',
            icon: 'BarChart3'
          },
        ],
        cta: 'JETZT STARTEN',
      },
      benefits: {
        title: 'Entfesseln Sie Ihr YouTube-Potenzial',
        items: [
          'Mehr Views = besseres Ranking in der YouTube-Suche',
          'Hohe View-Zahlen ziehen organische Zuschauer an',
          'Marken bemerken Videos mit starken View-Zahlen',
          'Durchbrechen Sie den Algorithmus mit Schwung',
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
            'KI-gestützte Video-Promotion',
            'Intelligente Lieferoptimierung',
            'Priority-Support und Monitoring',
            'Wachstums-Analytics-Dashboard',
          ],
          cta: 'JETZT ABONNIEREN',
        },
      },
      finalCta: {
        title: 'Schließen Sie sich 10.000+ Creatorn an, die bereits mit KI-gestützten Strategien wachsen.',
        cta: 'MEINE VIEWS ERHALTEN',
      },
      compliance: {
        text: 'Konformität: Socialoura nutzt KI-gesteuerte Video-Promotionsstrategien, die vollständig konform mit den Nutzungsbedingungen von YouTube sind. Wir verwenden niemals Bots, Fake-Accounts oder Methoden, die Ihren Kanal gefährden könnten.',
      },
    },
    es: {
      hero: {
        title: 'IMPULSA TUS VISTAS',
        platform: 'EN YOUTUBE',
        subtitle: 'Campañas de visibilidad impulsadas por IA que entregan vistas reales de alta retención a tus videos de YouTube — rápido, seguro y totalmente conforme.',
        badges: [
          { text: 'Promoción con IA' },
          { text: 'Solo vistas reales' },
          { text: 'Entrega inteligente 24/7' },
        ],
        cta: 'OBTENER VISTAS',
      },
      difference: {
        title: 'Por qué los creadores confían en Socialoura',
        cards: [
          {
            title: 'Promoción con IA',
            description: 'Nuestro algoritmo analiza tu nicho, contenido de video y audiencia objetivo para promocionar tus videos ante espectadores que realmente se interesan por tu contenido.',
            icon: 'Bot'
          },
          {
            title: 'Entrega instantánea o gradual',
            description: 'Elige entre un impulso rápido de visibilidad o un crecimiento gradual y natural. Nuestro sistema inteligente se adapta para mantener tu canal seguro.',
            icon: 'Clock'
          },
          {
            title: 'Seguridad del canal primero',
            description: 'Nunca pedimos tu contraseña. Nuestros métodos de promoción son 100% conformes con las directrices de YouTube — cero riesgo para tu canal.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Consigue vistas en 3 pasos',
        cards: [
          {
            number: '1',
            title: 'PEGA LA URL DE TU VIDEO',
            description: 'Solo pega el enlace de tu video de YouTube — sin contraseña, sin inicio de sesión. Solo necesitamos la URL pública del video.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'ELIGE TU PLAN DE VISTAS',
            description: 'Selecciona el número de vistas que quieres. De 500 a 100K+ — planes flexibles para cada presupuesto y objetivo.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'MIRA CRECER TUS VISTAS',
            description: 'Las vistas empiezan a llegar en minutos. Rastrea tu crecimiento en tiempo real y observa el impacto en el ranking de tu video.',
            icon: 'BarChart3'
          },
        ],
        cta: 'EMPEZAR',
      },
      benefits: {
        title: 'Desbloquea tu potencial en YouTube',
        items: [
          'Más vistas = mejor posicionamiento en búsqueda de YouTube',
          'Un alto conteo de vistas atrae espectadores orgánicos',
          'Las marcas notan videos con muchas vistas',
          'Rompe el algoritmo con impulso',
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
            'Promoción de video con IA',
            'Optimización inteligente de entrega',
            'Soporte prioritario y monitorización',
            'Panel de analíticas de crecimiento',
          ],
          cta: 'SUSCRIBIRSE AHORA',
        },
      },
      finalCta: {
        title: 'Únete a más de 10.000 creadores que ya crecen con estrategias impulsadas por IA.',
        cta: 'OBTENER MIS VISTAS',
      },
      compliance: {
        text: 'Conformidad: Socialoura utiliza estrategias de promoción de video impulsadas por IA, totalmente conformes con los términos de servicio de YouTube. Nunca usamos bots, cuentas falsas ni ningún método que pueda poner en riesgo tu canal.',
      },
    },
  };

  const t = content[lang];

  return (
    <div className="bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[auto] sm:min-h-[70vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-950 to-rose-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-600/5 to-rose-600/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative mx-auto max-w-5xl px-6 py-8 sm:py-20 lg:px-8 w-full">
          <div className="text-center">
            {/* Platform Badge */}
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-600 mb-4 sm:mb-8 shadow-lg shadow-red-500/30">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/>
              </svg>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white md:text-6xl mb-2 sm:mb-4 leading-tight">
              {t.hero.title}
            </h1>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight md:text-6xl mb-4 sm:mb-8 leading-tight bg-gradient-to-r from-red-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
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
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/></svg>
                  </span>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={handleVideoUrlChange}
                    placeholder={lang === 'fr' ? 'https://youtube.com/watch?v=...' : lang === 'de' ? 'https://youtube.com/watch?v=...' : lang === 'es' ? 'https://youtube.com/watch?v=...' : 'https://youtube.com/watch?v=...'}
                    className="w-full pl-10 pr-4 py-4 text-base bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  />
                </div>
                <button
                  onClick={handleContinue}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 via-rose-600 to-red-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t.hero.cta}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.difference.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.difference.cards.map((card, index) => {
              const IconComponent = card.icon === 'Bot' ? Bot : card.icon === 'Clock' ? Clock : Shield;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:bg-gray-800/80"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
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
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.howItWorks.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {t.howItWorks.cards.map((card, index) => {
              const IconComponent = card.icon === 'Package' ? Package : card.icon === 'Megaphone' ? Megaphone : BarChart3;
              return (
                <div key={index} className="relative group">
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-red-500/50 to-transparent z-0" />
                  )}
                  
                  <div className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 h-full">
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-500/30">
                      {index + 1}
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-14 h-14 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                        <IconComponent className="w-7 h-7 text-red-400" />
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
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 via-rose-600 to-red-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.benefits.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side: Bento Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[0]}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 flex items-center justify-center min-h-[160px] border border-gray-700 hover:border-red-500/50 transition-colors">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[1]}
                </p>
              </div>
              
              <div className="col-span-2 bg-gradient-to-r from-red-500 via-rose-600 to-orange-500 rounded-2xl p-6 flex items-center justify-center min-h-[140px] shadow-lg shadow-red-500/20 hover:scale-[1.01] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[2]}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-transform">
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
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl blur-2xl opacity-20" />
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
        platform="youtube"
        serviceType="views"
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
          productName={`+${selectedGoal.followers} YouTube views`}
          language={lang}
          email={email}
          orderDetails={{
            platform: 'youtube_views',
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
          productName={`+${selectedGoal.followers} YouTube views`}
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

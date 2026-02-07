'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Clock, Mail, ArrowRight, Home, Sparkles, Shield, Zap } from 'lucide-react';

interface OrderDetails {
  orderId: string;
  platform: string;
  followers: number;
  price: string;
  email: string;
  username: string;
  date: string;
}

export default function OrderConfirmationPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [mounted, setMounted] = useState(false);

  const text = {
    en: {
      title: 'Thank You for Your Order!',
      subtitle: 'Your payment was successful',
      orderConfirmed: 'Order Confirmed',
      orderNumber: 'Order Number',
      emailSent: 'Confirmation email sent to',
      orderDetails: 'Order Details',
      platform: 'Platform',
      followers: 'Followers',
      username: 'Username',
      total: 'Total',
      date: 'Date',
      whatNext: "What's Next?",
      step1Title: 'Order Processing',
      step1Desc: 'Your order is now being processed by our team',
      step2Title: 'Gradual Delivery',
      step2Desc: 'You will start seeing results within 24-48 hours',
      step3Title: 'Natural Growth',
      step3Desc: 'Followers will be added gradually for authentic engagement',
      backHome: 'Back to Home',
      viewPricing: 'View Other Plans',
      support: 'Need help?',
      contactSupport: 'Contact Support',
      thankYouMessage: 'We appreciate your trust in SocialOura. Your success is our priority!',
      securePayment: 'Secure Payment',
      fastDelivery: 'Fast Delivery',
      guarantee: '100% Guarantee',
    },
    de: {
      title: 'Vielen Dank für Ihre Bestellung!',
      subtitle: 'Ihre Zahlung war erfolgreich',
      orderConfirmed: 'Bestellung bestätigt',
      orderNumber: 'Bestellnummer',
      emailSent: 'Bestätigungs-E-Mail gesendet an',
      orderDetails: 'Bestelldetails',
      platform: 'Plattform',
      followers: 'Follower',
      username: 'Benutzername',
      total: 'Gesamt',
      date: 'Datum',
      whatNext: 'Was kommt als Nächstes?',
      step1Title: 'Bestellung wird bearbeitet',
      step1Desc: 'Ihre Bestellung wird jetzt von unserem Team bearbeitet',
      step2Title: 'Schrittweise Lieferung',
      step2Desc: 'Sie werden innerhalb von 24-48 Stunden erste Ergebnisse sehen',
      step3Title: 'Natürliches Wachstum',
      step3Desc: 'Follower werden schrittweise für authentisches Engagement hinzugefügt',
      backHome: 'Zurück zur Startseite',
      viewPricing: 'Andere Angebote ansehen',
      support: 'Brauchen Sie Hilfe?',
      contactSupport: 'Support kontaktieren',
      thankYouMessage: 'Wir schätzen Ihr Vertrauen in SocialOura. Ihr Erfolg ist unsere Priorität!',
      securePayment: 'Sichere Zahlung',
      fastDelivery: 'Schnelle Lieferung',
      guarantee: '100% Garantie',
    },
    fr: {
      title: 'Merci pour Votre Commande !',
      subtitle: 'Votre paiement a été effectué avec succès',
      orderConfirmed: 'Commande Confirmée',
      orderNumber: 'Numéro de Commande',
      emailSent: 'Email de confirmation envoyé à',
      orderDetails: 'Détails de la Commande',
      platform: 'Plateforme',
      followers: 'Abonnés',
      username: "Nom d'utilisateur",
      total: 'Total',
      date: 'Date',
      whatNext: 'Et Maintenant ?',
      step1Title: 'Traitement en cours',
      step1Desc: 'Votre commande est en cours de traitement par notre équipe',
      step2Title: 'Livraison Progressive',
      step2Desc: 'Vous commencerez à voir les résultats dans 24-48 heures',
      step3Title: 'Croissance Naturelle',
      step3Desc: 'Les abonnés seront ajoutés progressivement pour un engagement authentique',
      backHome: "Retour à l'Accueil",
      viewPricing: 'Voir les Autres Offres',
      support: 'Besoin d\'aide ?',
      contactSupport: 'Contacter le Support',
      thankYouMessage: 'Nous apprécions votre confiance en SocialOura. Votre succès est notre priorité !',
      securePayment: 'Paiement Sécurisé',
      fastDelivery: 'Livraison Rapide',
      guarantee: 'Garantie 100%',
    },
  };

  const t = text[lang as keyof typeof text] || text.en;

  useEffect(() => {
    setMounted(true);
    
    // Get order details from URL params or sessionStorage
    const storedOrder = sessionStorage.getItem('lastOrder');
    if (storedOrder) {
      try {
        const parsed = JSON.parse(storedOrder);
        setOrderDetails(parsed);
      } catch (e) {
        console.error('Error parsing order details:', e);
      }
    }

    // Also check URL params as fallback
    const orderId = searchParams.get('orderId');
    const platform = searchParams.get('platform');
    const followers = searchParams.get('followers');
    const price = searchParams.get('price');
    const email = searchParams.get('email');
    const username = searchParams.get('username');

    if (orderId && platform && followers && price) {
      setOrderDetails({
        orderId,
        platform,
        followers: parseInt(followers),
        price,
        email: email || '',
        username: username || '',
        date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      });
    }
  }, [searchParams, lang]);

  if (!mounted) {
    return null;
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: '📸',
      tiktok: '🎵',
      youtube: '🎬',
      twitter: '🐦',
      facebook: '👥',
      spotify: '🎧',
    };
    return icons[platform.toLowerCase()] || '📱';
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'from-pink-500 to-purple-600',
      tiktok: 'from-gray-900 to-pink-500',
      youtube: 'from-red-500 to-red-600',
      twitter: 'from-blue-400 to-blue-600',
      facebook: 'from-blue-600 to-blue-800',
      spotify: 'from-green-500 to-green-600',
    };
    return colors[platform.toLowerCase()] || 'from-purple-500 to-pink-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-70 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-70 animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-10">
          {/* Animated Success Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 w-28 h-28 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-20" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
              <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-700 dark:from-white dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {/* Order Details Card */}
        {orderDetails ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden mb-8">
            {/* Order Confirmed Banner */}
            <div className={`bg-gradient-to-r ${getPlatformColor(orderDetails.platform)} p-6 text-white`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getPlatformIcon(orderDetails.platform)}</span>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{t.orderConfirmed}</p>
                    <p className="text-2xl font-bold">{t.orderNumber}: #{orderDetails.orderId}</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <p className="text-sm font-medium">{orderDetails.date}</p>
                </div>
              </div>
            </div>

            {/* Email Notification */}
            {orderDetails.email && (
              <div className="px-6 py-4 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-green-700 dark:text-green-400 text-sm">
                  <span className="font-medium">{t.emailSent}</span>{' '}
                  <span className="font-semibold">{orderDetails.email}</span>
                </p>
              </div>
            )}

            {/* Order Details Grid */}
            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-500" />
                {t.orderDetails}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.platform}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                    <span>{getPlatformIcon(orderDetails.platform)}</span>
                    {orderDetails.platform}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.followers}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    +{orderDetails.followers.toLocaleString()}
                  </p>
                </div>
                {orderDetails.username && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.username}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      @{orderDetails.username}
                    </p>
                  </div>
                )}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-4 border-2 border-purple-200 dark:border-purple-700">
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">{t.total}</p>
                  <p className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {orderDetails.price}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t.thankYouMessage}
            </p>
          </div>
        )}

        {/* What's Next Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-purple-500/10 p-6 sm:p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-500" />
            {t.whatNext}
          </h3>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{t.step1Title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t.step1Desc}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/30">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{t.step2Title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t.step2Desc}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-800/30">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{t.step3Title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t.step3Desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg">
            <div className="w-10 h-10 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t.securePayment}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg">
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t.fastDelivery}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg">
            <div className="w-10 h-10 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t.guarantee}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all transform hover:-translate-y-1"
          >
            <Home className="w-5 h-5" />
            {t.backHome}
          </Link>
          <Link
            href={`/${lang}/pricing`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-700"
          >
            {t.viewPricing}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Support Link */}
        <div className="text-center mt-8">
          <p className="text-gray-500 dark:text-gray-400">
            {t.support}{' '}
            <Link href={`/${lang}/contact`} className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
              {t.contactSupport}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

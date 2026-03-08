'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import posthog from 'posthog-js';
import { trackFunnelPurchase } from '@/lib/gtag';
import { trackPurchase, getPurchaseSource } from '@/lib/posthog-tracking';

export default function PaymentSuccessPage({ params }: { params: { lang: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = params.lang || 'fr';
  const [countdown, setCountdown] = useState(10);
  const orderProcessedRef = useRef(false);

  // Handle redirect-based payments (Apple Pay full redirect)
  // Stripe appends ?payment_intent=xxx&redirect_status=succeeded
  useEffect(() => {
    const processRedirectOrder = async () => {
      if (orderProcessedRef.current) return;

      const paymentIntentId = searchParams.get('payment_intent');
      const redirectStatus = searchParams.get('redirect_status');

      if (!paymentIntentId || redirectStatus !== 'succeeded') return;

      // Check if we have pending order data from sessionStorage
      const pendingRaw = sessionStorage.getItem('pendingOrder');
      if (!pendingRaw) return;

      orderProcessedRef.current = true;
      sessionStorage.removeItem('pendingOrder');

      try {
        const pending = JSON.parse(pendingRaw);
        const { username, email, totalPrice, funnelData, funnelServices } = pending;

        // Save order
        const orderRes = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            email,
            amount: totalPrice,
            paymentId: paymentIntentId,
            orderSource: 'APP_FUNNEL',
            funnelData,
          }),
        });
        const orderResult = await orderRes.json();

        // Discord notification
        try {
          await fetch('/api/discord-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderSource: 'APP_FUNNEL',
              orderId: String(orderResult.orderId || paymentIntentId.slice(-8).toUpperCase()),
              email,
              username,
              totalPrice: `${Number(totalPrice).toFixed(2)} €`,
              services: funnelServices,
              isNewCustomer: orderResult.isNewCustomer ?? true,
              customerOrderNumber: orderResult.customerOrderNumber ?? 1,
            }),
          });
        } catch (e) { console.error('Discord notification failed:', e); }

        // Send order confirmation email
        try {
          await fetch('/api/send-order-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              username,
              orderId: String(orderResult.orderId || paymentIntentId.slice(-8).toUpperCase()),
              totalPrice: Number(totalPrice),
              services: funnelServices,
              lang: pending.lang || 'fr',
            }),
          });
        } catch (e) { console.error('Confirmation email failed:', e); }

        // Google Analytics tracking
        trackFunnelPurchase({
          value: Number(totalPrice),
          currency: 'EUR',
          transactionId: String(orderResult.orderId || paymentIntentId),
        });

        // PostHog revenue tracking with source detection
        const source = getPurchaseSource(window.location.pathname, 'APP_FUNNEL');
        trackPurchase({
          revenue: Number(totalPrice),
          currency: 'EUR',
          source,
          transactionId: String(orderResult.orderId || paymentIntentId),
          email,
          username,
          services: funnelServices,
          isNewCustomer: orderResult.isNewCustomer,
          customerOrderNumber: orderResult.customerOrderNumber,
          paymentMethod: 'express_redirect',
        });
      } catch (err) {
        console.error('Failed to process redirect order:', err);
      }
    };

    posthog.capture('payment_success_page_viewed');
    processRedirectOrder();
  }, [searchParams]);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      router.push(`/${lang}/instagram`);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router, lang]);

  const content = {
    fr: {
      title: 'Paiement confirmé !',
      subtitle: 'Votre commande a été enregistrée avec succès.',
      detail: 'Vous recevrez un reçu de paiement par email. Votre commande est en cours de traitement.',
      cta: 'Nouvelle commande',
      redirect: `Redirection automatique dans ${countdown}s`,
    },
    en: {
      title: 'Payment confirmed!',
      subtitle: 'Your order has been successfully recorded.',
      detail: 'You will receive a payment receipt by email. Your order is being processed.',
      cta: 'New order',
      redirect: `Automatic redirect in ${countdown}s`,
    },
    de: {
      title: 'Zahlung bestätigt!',
      subtitle: 'Ihre Bestellung wurde erfolgreich registriert.',
      detail: 'Sie erhalten eine Zahlungsbestätigung per E-Mail. Ihre Bestellung wird bearbeitet.',
      cta: 'Neue Bestellung',
      redirect: `Automatische Weiterleitung in ${countdown}s`,
    },
    es: {
      title: '¡Pago confirmado!',
      subtitle: 'Su pedido ha sido registrado con éxito.',
      detail: 'Recibirá un recibo de pago por correo electrónico. Su pedido está siendo procesado.',
      cta: 'Nuevo pedido',
      redirect: `Redirección automática en ${countdown}s`,
    },
  };

  const t = content[lang as keyof typeof content] || content.fr;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Success icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400" />
          </div>
          <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-500/20 animate-ping" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          {t.title}
        </h1>

        <p className="text-lg text-gray-300 font-medium mb-2">
          {t.subtitle}
        </p>

        <p className="text-sm text-gray-500 mb-10 leading-relaxed max-w-sm">
          {t.detail}
        </p>

        {/* CTA */}
        <button
          onClick={() => router.push(`/${lang}/instagram`)}
          className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 px-10 sm:px-14 py-4 sm:py-5 text-lg sm:text-xl font-black text-white shadow-2xl shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 uppercase tracking-wider flex items-center justify-center gap-3"
        >
          <span className="relative z-10">{t.cta}</span>
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>

        <p className="mt-6 text-xs text-gray-600 font-medium flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          {t.redirect}
        </p>
      </div>
    </div>
  );
}

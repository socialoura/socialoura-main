'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Mail, Loader2, Lock, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PaymentElement, ExpressCheckoutElement, useElements, useStripe } from '@stripe/react-stripe-js';
import StripeProvider from '@/components/StripeProvider';
import useTiktokUpsellStore from '@/store/useTiktokUpsellStore';
import posthog from 'posthog-js';
import { trackTiktokFunnelPurchase } from '@/lib/gtag';
import { proxyImageUrl } from '@/lib/image-proxy';
import { type Language } from '@/i18n/config';
import { getTiktokUpsellTranslations } from '@/i18n/tiktok-upsell';

interface CheckoutPaymentFormProps {
  amount: number;
  currency: string;
  email: string;
  acceptedTerms: boolean;
  lang: string;
  onSuccess?: () => void;
  onPaymentIntentId?: (id: string) => void;
  onBeforePayment?: () => void;
  i18n: {
    paymentError: string;
    secureConnect: string;
    processing: string;
    pay: string;
    encryptedPayment: string;
    guaranteesList: readonly string[];
  };
}

function CheckoutPaymentForm({ amount, email, acceptedTerms, lang, onSuccess, onPaymentIntentId, onBeforePayment, i18n }: CheckoutPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [elementsReady, setElementsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || isProcessing || !acceptedTerms || !email || !email.includes('@')) return;

    setIsProcessing(true);
    setPaymentError(null);

    posthog.capture('tiktok_step4_payment_attempted', { payment_method_type: 'card', target_platform: 'tiktok' });
    onBeforePayment?.();

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${lang}/payment-success`,
        receipt_email: email,
      },
      redirect: 'if_required',
    });

    if (error) {
      posthog.capture('tiktok_step4_payment_failed', { error_code: error.code || 'unknown', error_message: error.message || 'unknown', target_platform: 'tiktok' });
      setPaymentError(error.message || i18n.paymentError);
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentIntentId?.(paymentIntent.id);
      onSuccess?.();
    }
    setIsProcessing(false);
  };

  const handleExpressCheckout = (event: { resolve: () => void }) => {
    event.resolve();
  };

  const handleExpressConfirm = async () => {
    if (!stripe || !elements) return;
    
    posthog.capture('tiktok_step4_payment_attempted', { payment_method_type: 'express', target_platform: 'tiktok' });
    onBeforePayment?.();

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${lang}/payment-success`,
        receipt_email: email,
      },
      redirect: 'if_required',
    });

    if (error) {
      posthog.capture('tiktok_step4_payment_failed', { error_code: error.code || 'unknown', error_message: error.message || 'unknown', target_platform: 'tiktok' });
      setPaymentError(error.message || i18n.paymentError);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentIntentId?.(paymentIntent.id);
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Express Checkout (Apple Pay / Google Pay) */}
      <div>
        <ExpressCheckoutElement
          onConfirm={handleExpressConfirm}
          onClick={handleExpressCheckout}
          options={{
            buttonType: { applePay: 'buy', googlePay: 'buy' },
            buttonHeight: 48,
          }}
        />
      </div>

      {/* Separator */}
      <div className="flex items-center my-6 md:hidden">
        <div className="flex-1 border-t border-slate-700"></div>
        <span className="px-4 text-slate-400 text-sm uppercase tracking-wider">ou</span>
        <div className="flex-1 border-t border-slate-700"></div>
      </div>

      {/* Card Payment */}
      <div className="relative min-h-[180px] bg-gray-900 rounded-2xl p-5 border border-gray-800 shadow-inner">
        {!elementsReady && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-900 z-10">
            <div className="text-center flex flex-col items-center">
              <Loader2 className="animate-spin h-8 w-8 text-cyan-500 mb-3" />
              <p className="text-sm text-gray-400 font-medium">{i18n.secureConnect}</p>
            </div>
          </div>
        )}
        <div className={elementsReady ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}>
          <PaymentElement
            onReady={() => setElementsReady(true)}
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      {paymentError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-sm text-red-400 mt-1">{paymentError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing || !elementsReady || !acceptedTerms || !email || !email.includes('@')}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-pink-500 to-red-500 px-8 py-4 text-lg font-black text-white shadow-lg hover:opacity-90 transition-opacity duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>{i18n.processing}</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>{i18n.pay.replace('{amount}', (amount / 100).toFixed(2))}</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>{i18n.encryptedPayment}</span>
      </div>

      {/* Inline guarantees under pay button */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-800">
        {i18n.guaranteesList.map((text, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
            {i === 0 && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            {i === 1 && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            {i === 2 && <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            {i === 3 && <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0 rotate-180" />}
            <span>{text}</span>
          </div>
        ))}
      </div>
    </form>
  );
}

interface CheckoutSummaryProps {
  lang: Language;
}

export default function TiktokCheckoutSummary({ lang }: CheckoutSummaryProps) {
  const t = getTiktokUpsellTranslations(lang);
  const {
    selectedServices,
    selectedPostsByService,
    selectedService,
    quantity,
    price,
    avatarUrl,
    username,
    email,
    setEmail,
    acceptedTerms,
    setAcceptedTerms,
    currentStep,
    prevStep,
  } = useTiktokUpsellStore();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentInitError, setPaymentInitError] = useState<string | null>(null);
  const [orderSaved, setOrderSaved] = useState(false);
  const paymentIntentIdRef = useRef<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const serviceLabelMap = t.checkout.serviceLabels;

  const services = Object.values(selectedServices || {});
  const fallbackServices = selectedService
    ? [{ type: selectedService, quantity, price }]
    : [];
  const activeServices = services.length > 0 ? services : fallbackServices;

  const totalPrice = activeServices.reduce((sum, service) => sum + service.price, 0);
  const oldPrice = (totalPrice * 1.3).toFixed(2);

  useEffect(() => {
    if (currentStep !== 3) return;

    const primaryService = activeServices.find(s => s.type !== 'shares') || activeServices[0];
    posthog.capture('tiktok_step4_checkout_viewed', {
      final_price: totalPrice,
      final_service: primaryService?.type || 'unknown',
      target_platform: 'tiktok',
    });

    const createPaymentIntent = async () => {
      const amountInCents = Math.max(1, Math.round(totalPrice * 100));
      setIsPaymentLoading(true);
      setPaymentInitError(null);

      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountInCents, currency: 'eur', email: email || undefined }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t.checkout.stripeError);
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        const message = error instanceof Error ? error.message : t.checkout.stripeError;
        setPaymentInitError(message);
      } finally {
        setIsPaymentLoading(false);
      }
    };

    createPaymentIntent();
  }, [currentStep, totalPrice]);

  if (activeServices.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto pb-20">
      <button
        onClick={prevStep}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-8 transition-colors duration-200 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.checkout.backToSelection}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-800/50 sm:backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl">
            <div className="p-6 bg-gray-900/50 border-b border-gray-800 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 ring-2 ring-cyan-500/50 flex-shrink-0">
                <Image
                  src={proxyImageUrl(avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&size=96`}
                  alt={username}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">{t.checkout.orderFor}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <h3 className="text-xl font-bold text-white tracking-tight">@{username}</h3>
                  <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{t.checkout.serviceDetails}</h4>

              {activeServices.map((service) => {
                const label = serviceLabelMap[service.type];
                const selectedPosts = selectedPostsByService[service.type] || [];
                const isDistributable = service.type === 'likes' || service.type === 'views';

                return (
                  <div key={service.type} className="flex items-start justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                    <div>
                      <span className="font-bold text-white text-lg block">{service.quantity.toLocaleString()} {label}</span>
                      {isDistributable && selectedPosts.length > 0 && (
                        <span className="text-xs font-medium text-cyan-400 mt-1 inline-block bg-cyan-500/10 px-2 py-0.5 rounded-full">
                          {t.checkout.onPosts.replace('{count}', String(selectedPosts.length))}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-white">{service.price.toFixed(2)} €</span>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-950 border-t border-gray-800">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">{t.checkout.totalAmount}</p>
                  <p className="text-sm text-gray-500 line-through">{oldPrice} €</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black tracking-tight text-white">{totalPrice.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 sm:backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-lg sm:shadow-2xl">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-500" />
              {t.checkout.guarantees}
            </h4>
            <ul className="space-y-3">
              {t.checkout.guaranteesList.map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Payment */}
        <div className="lg:col-span-7">
          <div className="bg-gray-800/50 sm:backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-lg sm:shadow-2xl relative overflow-hidden">

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-6 sm:mb-8 relative z-10">{t.checkout.securePayment}</h2>

            <div className="space-y-8 relative z-10">
              {/* Email input */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                  {t.checkout.emailLabel} <span className="text-red-400">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors ${email && !email.includes('@') ? 'text-red-400' : 'text-gray-500 group-focus-within:text-cyan-500'}`} />
                  </div>
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.checkout.emailPlaceholder}
                    required
                    className={`block w-full pl-12 pr-4 py-4 bg-gray-900 border rounded-xl text-white placeholder-gray-500 focus:ring-2 transition-all text-lg font-medium ${
                      email && !email.includes('@')
                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-gray-700 focus:ring-cyan-500/50 focus:border-cyan-500'
                    }`}
                  />
                </div>
                {email && !email.includes('@') && (
                  <p className="mt-2 text-sm text-red-400">Veuillez saisir une adresse email valide</p>
                )}
              </div>

              <div className="w-full h-px bg-gray-800" />

              {/* Stripe Elements */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">{t.checkout.cardInfo}</label>

                {paymentInitError && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-4">
                    <p className="text-sm font-medium text-red-400">{paymentInitError}</p>
                  </div>
                )}

                {isPaymentLoading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                    <p className="text-gray-400 font-medium">{t.checkout.securePrepare}</p>
                  </div>
                )}

                {clientSecret && (
                  <div className="mt-2">
                    <StripeProvider clientSecret={clientSecret}>
                      <CheckoutPaymentForm
                        amount={Math.round(totalPrice * 100)}
                        currency="eur"
                        email={email}
                        acceptedTerms={acceptedTerms}
                        lang={lang}
                        i18n={{
                          paymentError: t.checkout.paymentError,
                          secureConnect: t.checkout.secureConnect,
                          processing: t.checkout.processing,
                          pay: t.checkout.pay,
                          encryptedPayment: t.checkout.encryptedPayment,
                          guaranteesList: t.checkout.guaranteesList,
                        }}
                        onPaymentIntentId={(id) => { paymentIntentIdRef.current = id; }}
                        onBeforePayment={() => {
                          try {
                            const { posts, selectedPostsByService: spbs } = useTiktokUpsellStore.getState();
                            const postsMap = Object.fromEntries(posts.map(p => [p.id, p]));
                            const funnelServices = activeServices.map((svc) => {
                              const isD = svc.type === 'likes' || svc.type === 'views';
                              const pIds = spbs[svc.type] || [];
                              const per = pIds.length > 0 ? Math.floor(svc.quantity / pIds.length) : 0;
                              const rem = pIds.length > 0 ? svc.quantity % pIds.length : 0;
                              return {
                                type: svc.type, quantity: svc.quantity, price: svc.price,
                                ...(isD && pIds.length > 0 ? {
                                  distribution: pIds.map((pid, i) => ({
                                    postId: pid, shortcode: postsMap[pid]?.shortCode || '',
                                    imageUrl: postsMap[pid]?.imageUrl || '',
                                    quantityAllocated: per + (i < rem ? 1 : 0),
                                  })),
                                } : {}),
                              };
                            });
                            sessionStorage.setItem('pendingOrder', JSON.stringify({
                              username, email, avatarUrl, totalPrice, lang,
                              targetPlatform: 'tiktok',
                              funnelData: { username, avatarUrl, services: funnelServices },
                              funnelServices,
                            }));
                          } catch (e) { console.error('Failed to save pending order:', e); }
                        }}
                        onSuccess={async () => {
                          if (orderSaved) return;
                          setOrderSaved(true);
                          try {
                            const { posts, selectedPostsByService } = useTiktokUpsellStore.getState();
                            const postsMap = Object.fromEntries(posts.map(p => [p.id, p]));

                            const funnelServices = activeServices.map((service) => {
                              const isDistributable = service.type === 'likes' || service.type === 'views';
                              const selectedPostIds = selectedPostsByService[service.type] || [];
                              const qty = service.quantity;
                              const perPost = selectedPostIds.length > 0 ? Math.floor(qty / selectedPostIds.length) : 0;
                              const remainder = selectedPostIds.length > 0 ? qty % selectedPostIds.length : 0;

                              return {
                                type: service.type,
                                quantity: service.quantity,
                                price: service.price,
                                ...(isDistributable && selectedPostIds.length > 0 ? {
                                  distribution: selectedPostIds.map((postId, idx) => {
                                    const post = postsMap[postId];
                                    return {
                                      postId,
                                      shortcode: post?.shortCode || '',
                                      imageUrl: post?.imageUrl || '',
                                      quantityAllocated: perPost + (idx < remainder ? 1 : 0),
                                    };
                                  }),
                                } : {}),
                              };
                            });

                            const funnelData = {
                              username,
                              avatarUrl,
                              services: funnelServices,
                            };

                            const orderRes = await fetch('/api/orders/create', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                username,
                                email,
                                amount: totalPrice,
                                paymentId: paymentIntentIdRef.current || 'unknown',
                                orderSource: 'APP_FUNNEL_TIKTOK',
                                funnelData,
                              }),
                            });
                            const orderResult = await orderRes.json();

                            try {
                              await fetch('/api/discord-notification', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  orderSource: 'APP_FUNNEL_TIKTOK',
                                  orderId: String(orderResult.orderId || paymentIntentIdRef.current?.slice(-8).toUpperCase() || 'N/A'),
                                  email,
                                  username,
                                  totalPrice: `${totalPrice.toFixed(2)} €`,
                                  services: funnelServices,
                                  isNewCustomer: orderResult.isNewCustomer ?? true,
                                  customerOrderNumber: orderResult.customerOrderNumber ?? 1,
                                }),
                              });
                            } catch (discordErr) {
                              console.error('Failed to send Discord notification:', discordErr);
                            }

                            // Send order confirmation email
                            try {
                              await fetch('/api/send-order-confirmation', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  email,
                                  username,
                                  orderId: String(orderResult.orderId || paymentIntentIdRef.current?.slice(-8).toUpperCase() || 'N/A'),
                                  totalPrice,
                                  services: funnelServices,
                                  lang,
                                }),
                              });
                            } catch (emailErr) {
                              console.error('Failed to send confirmation email:', emailErr);
                            }

                            trackTiktokFunnelPurchase({
                              value: totalPrice,
                              currency: 'EUR',
                              transactionId: String(orderResult.orderId || paymentIntentIdRef.current || 'unknown'),
                            });

                            const primarySvc = funnelServices.find(s => s.type !== 'shares') || funnelServices[0];
                            posthog.capture('tiktok_purchase_completed', {
                              revenue: totalPrice,
                              currency: 'EUR',
                              service: primarySvc?.type || 'unknown',
                              quantity: primarySvc?.quantity || 0,
                              is_new_customer: orderResult.isNewCustomer ?? true,
                              customer_order_number: orderResult.customerOrderNumber ?? 1,
                              target_platform: 'tiktok',
                            });
                          } catch (err) {
                            console.error('Failed to save order:', err);
                          }

                          // Redirect to success page
                          window.location.href = `/${lang}/payment-success`;
                        }}
                      />
                    </StripeProvider>
                  </div>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group mt-6 p-4 rounded-xl hover:bg-gray-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-5 w-5 text-cyan-500 focus:ring-cyan-500/50 border-gray-600 rounded bg-gray-900 shrink-0"
                />
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  {t.checkout.termsAccept}{' '}
                  <a href="#" className="text-white hover:text-cyan-400 underline decoration-gray-600 hover:decoration-cyan-400 transition-all font-medium">{t.checkout.termsLink}</a>{' '}
                  {t.checkout.andThe}{' '}
                  <a href="#" className="text-white hover:text-cyan-400 underline decoration-gray-600 hover:decoration-cyan-400 transition-all font-medium">{t.checkout.privacyLink}</a>.
                </span>
              </label>

              {/* Payment methods */}
              <div className="pt-8 mt-4 border-t border-gray-800 flex justify-center">
                <div className="flex items-center gap-4 opacity-80 hover:opacity-100 transition-all duration-500">
                  <Image src="/images/visa.svg" alt="Visa" width={40} height={20} className="h-6 w-auto" />
                  <Image src="/images/mastercard.webp" alt="Mastercard" width={40} height={20} className="h-6 w-auto" />
                  <Image src="/images/apple-pay.svg" alt="Apple Pay" width={40} height={20} className="h-6 w-auto" />
                  <Image src="/images/google_pay.png" alt="Google Pay" width={40} height={20} className="h-6 w-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

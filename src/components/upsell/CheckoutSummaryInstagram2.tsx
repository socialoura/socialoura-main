'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  LinkAuthenticationElement,
  AddressElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { Shield, Clock, Zap, ChevronRight, AlertCircle, Check } from 'lucide-react';
import StripeProvider from '@/components/StripeProvider';
import useUpsellStore from '@/store/useUpsellStore';
import { getUpsellTranslations } from '@/i18n/upsell';
import { formatPrice } from '@/lib/pricing';
import { trackPurchase, getPurchaseSource } from '@/lib/posthog-tracking';
import { type Language } from '@/i18n/config';

interface ServiceSelection {
  type: string;
  quantity: number;
  price: number;
}

interface CheckoutSummaryProps {
  lang: Language;
  onBeforePayment?: () => void;
  initialPaymentIntentId?: string | null;
}

function CheckoutPaymentFormInstagram2({ lang, onBeforePayment, initialPaymentIntentId }: CheckoutSummaryProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const t = getUpsellTranslations(lang);
  
  const {
    username,
    selectedServices,
    pricingCurrency,
    email,
    setEmail,
  } = useUpsellStore();

  const [paymentIntentId] = useState<string | null>(initialPaymentIntentId || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const paymentIntentIdRef = React.useRef(paymentIntentId);

  // Keep paymentIntentId in sync
  React.useEffect(() => {
    paymentIntentIdRef.current = paymentIntentId;
  }, [paymentIntentId]);

  // Calculate total price
  const calculateTotal = () => {
    let total = 0;
    Object.values(selectedServices).forEach((service) => {
      if (service.quantity > 0) {
        total += service.price * service.quantity;
      }
    });
    return total;
  };

  const totalPrice = calculateTotal();

  // Track checkout viewed on mount
  useEffect(() => {
    const primaryService = Object.values(selectedServices).find(s => s.type !== 'story-views') || Object.values(selectedServices)[0];
    posthog.capture('instagram_step4_checkout_viewed', {
      variant: 'instagram-2',
      final_price: totalPrice,
      final_service: primaryService?.type || 'unknown',
      target_platform: 'instagram',
      currency: pricingCurrency,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setPaymentError(null);

    posthog.capture('instagram_step4_payment_attempted', { 
      variant: 'instagram-2',
      payment_method_type: 'card', 
      target_platform: 'instagram' 
    });
    onBeforePayment?.();

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${lang}/instagram-2/success`,
        receipt_email: email,
      },
      redirect: 'if_required',
    });

    if (error) {
      posthog.capture('instagram_step4_payment_failed', { 
        variant: 'instagram-2',
        error_code: error.code || 'unknown', 
        error_message: error.message || 'unknown', 
        target_platform: 'instagram' 
      });
      setPaymentError(error.message || t.checkout?.paymentError || 'Payment error');
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      await handlePaymentSuccess(paymentIntent.id);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setIsComplete(true);
    setIsProcessing(false);

    // Track successful payment
    posthog.capture('instagram_step4_payment_succeeded', {
      variant: 'instagram-2',
      payment_intent_id: paymentIntentId,
      total_price: totalPrice,
      currency: pricingCurrency,
      target_platform: 'instagram',
    });

    // Create order in backend
    try {
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          services: selectedServices,
          totalAmount: totalPrice,
          currency: pricingCurrency,
          paymentIntentId,
          lang,
          source: 'APP_FUNNEL_INSTAGRAM',
          variant: 'instagram-2',
        }),
      });

      const orderResult = await orderResponse.json();

      // Send confirmation email
      if (orderResult.orderId) {
        try {
          await fetch('/api/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              username,
              orderId: String(orderResult.orderId || paymentIntentIdRef.current?.slice(-8).toUpperCase() || 'N/A'),
              totalPrice,
              services: selectedServices,
              lang,
            }),
          });
        } catch (emailErr) {
          console.error('Failed to send confirmation email:', emailErr);
        }

        // Google Analytics tracking - Instagram-2 specific
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'conversion', {
            send_to: 'AW-17964092485/Hk6VCO74u4UcEMWY-fVC',
            value: totalPrice,
            currency: pricingCurrency.toUpperCase(),
            transaction_id: String(orderResult.orderId || paymentIntentIdRef.current || 'unknown'),
          });
        }

        // PostHog revenue tracking with source detection
        const source = getPurchaseSource(window.location.pathname, 'APP_FUNNEL');
        trackPurchase({
          revenue: totalPrice,
          currency: pricingCurrency.toUpperCase() as 'USD' | 'EUR' | 'GBP' | 'CHF' | 'CAD' | 'AUD' | 'NZD' | 'JPY' | 'CNY' | 'INR' | 'BRL' | 'MXN' | 'KRW' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'TRY' | 'ZAR' | 'SGD' | 'HKD',
          source,
          transactionId: String(orderResult.orderId || paymentIntentIdRef.current || 'unknown'),
          email,
          username
        });
      }

      // Redirect to success page
      setTimeout(() => {
        router.push(`/${lang}/instagram-2/success?payment_intent=${paymentIntentId}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating order:', error);
      setPaymentError(t.checkout?.paymentError || 'Payment error');
    }
  };

  if (isComplete) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-8 text-center border border-green-500/20">
          <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Payment Successful</h3>
          <p className="text-gray-400">{t.checkout?.backToSelection || 'Redirecting...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full">
      {/* Order Summary */}
      <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">{t.checkout?.orderFor || 'Order Summary'}</h3>
        
        {/* Services */}
        {Object.values(selectedServices).map((service: ServiceSelection, index: number) => (
          service.quantity > 0 && (
            <div key={index} className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-400">
                {service.quantity}x {t.service?.[service.type as keyof typeof t.service] || service.type}
              </span>
              <span className="text-white">{formatPrice(service.price * service.quantity, pricingCurrency.toLowerCase() as 'eur' | 'usd' | 'gbp')}</span>
            </div>
          )
        ))}

        {/* Total */}
        <div className="border-t border-gray-800 pt-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">{t.checkout?.totalAmount || 'Total'}</span>
            <span className="text-xl font-bold text-white">{formatPrice(totalPrice, pricingCurrency.toLowerCase() as 'eur' | 'usd' | 'gbp')}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <LinkAuthenticationElement
              id="link-authentication-element"
              onChange={(e) => {
                if (e && typeof e === 'object' && 'value' in e) {
                  const emailValue = e.value;
                  if (typeof emailValue === 'string') {
                    setEmail(emailValue);
                  } else if (emailValue && typeof emailValue === 'object' && 'email' in emailValue) {
                    setEmail(emailValue.email || '');
                  }
                }
              }}
              options={{
                defaultValues: { email },
              }}
            />
          </div>

          {/* Address (optional) */}
          <AddressElement
            id="address-element"
            options={{
              mode: 'billing',
            }}
          />

          {/* Payment Element */}
          <PaymentElement
            id="payment-element"
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            }}
          />

          {/* Error Message */}
          {paymentError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{paymentError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || !stripe || !elements}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.checkout?.processing || 'Processing...'}
              </>
            ) : (
              <>
                {t.checkout?.backToSelection || 'Pay Now'} {formatPrice(totalPrice, pricingCurrency.toLowerCase() as 'eur' | 'usd' | 'gbp')}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

      {/* Trust Badges */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <Shield className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400">{t.checkout?.securePayment || 'Secure Payment'}</p>
        </div>
        <div className="text-center">
          <Clock className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400">{t.service?.mostPopular || 'Instant Delivery'}</p>
        </div>
        <div className="text-center">
          <Zap className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400">{t.service?.followers || 'Real Followers'}</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSummaryInstagram2({ lang, onBeforePayment }: CheckoutSummaryProps) {
  const { username, selectedServices, pricingCurrency } = useUpsellStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Calculate total price
  const calculateTotal = () => {
    let total = 0;
    Object.values(selectedServices).forEach((service) => {
      if (service.quantity > 0) {
        total += service.price * service.quantity;
      }
    });
    return total;
  };

  const totalPrice = calculateTotal();

  // Create payment intent on mount
  useEffect(() => {
    if (!clientSecret && Object.keys(selectedServices).length > 0) {
      const createPaymentIntent = async () => {
        try {
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: Math.round(totalPrice * 100),
              currency: pricingCurrency.toLowerCase(),
              metadata: {
                username,
                services: JSON.stringify(selectedServices),
                lang,
                source: 'APP_FUNNEL_INSTAGRAM',
                variant: 'instagram-2',
              },
            }),
          });

          const data = await response.json();

          if (!data.error) {
            setClientSecret(data.clientSecret);
            setPaymentIntentId(data.paymentIntentId);
          }
        } catch (error) {
          console.error('Error creating payment intent:', error);
        }
      };

      createPaymentIntent();
    }
  }, [selectedServices, clientSecret, pricingCurrency, username, lang, totalPrice]);

  if (!clientSecret) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-8 text-center border border-gray-800">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading payment system...</p>
        </div>
      </div>
    );
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <CheckoutPaymentFormInstagram2 
        lang={lang} 
        onBeforePayment={onBeforePayment}
        initialPaymentIntentId={paymentIntentId}
      />
    </StripeProvider>
  );
}

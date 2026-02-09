'use client';

import { useState, useEffect, useRef } from 'react';
import { loadStripe, Stripe, PaymentRequest } from '@stripe/stripe-js';
import {
  Elements,
  PaymentRequestButtonElement,
  useStripe,
} from '@stripe/react-stripe-js';

interface ApplePayButtonProps {
  amount: number; // Amount in EUR (e.g. 9.99)
  currency?: string;
  label?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  language?: 'en' | 'fr' | 'de';
}

// ---------------------------------------------------------------------------
// Inner component — must be rendered inside <Elements>
// ---------------------------------------------------------------------------
function ApplePayButtonInner({
  amount,
  currency = 'eur',
  label = 'Total',
  onSuccess,
  onError,
  language = 'en',
}: ApplePayButtonProps) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canPay, setCanPay] = useState(false);

  // Keep mutable refs so the one-time event handler always reads fresh values
  const amountRef = useRef(amount);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const languageRef = useRef(language);

  amountRef.current = amount;
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  languageRef.current = language;

  // 1. Create paymentRequest once when Stripe is ready
  useEffect(() => {
    if (!stripe) return;

    const amountInCents = Math.round(amount * 100);

    const pr = stripe.paymentRequest({
      country: 'FR',
      currency: currency.toLowerCase(),
      total: {
        label,
        amount: amountInCents,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check browser / wallet availability
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanPay(true);
      }
    });

    // Handle payment — registered once
    pr.on('paymentmethod', async (ev) => {
      const cents = Math.round(amountRef.current * 100);

      try {
        // Create a PaymentIntent on the server
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: cents,
            currency: currency.toLowerCase(),
          }),
        });

        if (!res.ok) {
          ev.complete('fail');
          onErrorRef.current?.('Failed to create payment');
          return;
        }

        const { clientSecret } = await res.json();

        // Confirm the card payment with the wallet's payment method
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        );

        if (error) {
          ev.complete('fail');
          onErrorRef.current?.(error.message || 'Payment failed');
          return;
        }

        // Handle 3-D Secure / additional authentication if required
        if (paymentIntent?.status === 'requires_action') {
          const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
          if (actionError) {
            ev.complete('fail');
            onErrorRef.current?.(actionError.message || 'Authentication failed');
            return;
          }
        }

        ev.complete('success');

        // Google Ads conversion tracking (same tag as PaymentModal)
        const w = window as unknown as { gtag?: (...args: unknown[]) => void };
        if (w.gtag) {
          w.gtag('event', 'conversion', {
            send_to: 'AW-17898687645/p3uTCO3hjusbEJ2Z4dZC',
            value: amountRef.current,
            currency: currency.toUpperCase(),
            transaction_id: paymentIntent?.id,
          });
        }

        onSuccessRef.current?.(paymentIntent?.id || '');

        // Redirect to order confirmation page
        window.location.href = `/${languageRef.current}/order-confirmation`;
      } catch {
        ev.complete('fail');
        onErrorRef.current?.('An unexpected error occurred');
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe]);

  // 2. Update the displayed amount when props change (without re-creating the request)
  useEffect(() => {
    if (paymentRequest) {
      paymentRequest.update({
        total: {
          label,
          amount: Math.round(amount * 100),
        },
      });
    }
  }, [paymentRequest, amount, label]);

  if (!canPay || !paymentRequest) return null;

  return (
    <div className="w-full">
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: 'default',
              theme: 'dark',
              height: '48px',
            },
          },
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wrapper — loads Stripe independently and provides <Elements> context
// ---------------------------------------------------------------------------
export default function ApplePayButton(props: ApplePayButtonProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/stripe-config');
        if (res.ok) {
          const { publishableKey } = await res.json();
          if (publishableKey) {
            setStripePromise(loadStripe(publishableKey));
          }
        }
      } catch (err) {
        console.error('Failed to load Stripe:', err);
      }
    };
    init();
  }, []);

  if (!stripePromise) return null;

  return (
    <Elements stripe={stripePromise}>
      <ApplePayButtonInner {...props} />
    </Elements>
  );
}

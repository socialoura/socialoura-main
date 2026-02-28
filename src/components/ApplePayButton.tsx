'use client';

import { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface ApplePayButtonProps {
  amount: number; // Amount in EUR (e.g. 9.99)
  currency?: string;
  forceDisplay?: boolean;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  language?: 'en' | 'fr' | 'de' | 'es';
}

// ---------------------------------------------------------------------------
// Inner component — must be rendered inside <Elements>
// ---------------------------------------------------------------------------
function ExpressCheckoutInner({
  amount,
  currency = 'eur',
  forceDisplay,
  // onSuccess is not called here — successful payments redirect via return_url
  onError,
  language = 'en',
}: ApplePayButtonProps) {
  const stripe = useStripe();
  const elements = useElements();

  const expressCheckoutOptions = (forceDisplay
    ? {
        paymentMethods: {
          applePay: 'always',
          googlePay: 'always',
        },
      }
    : {
        buttonHeight: 48,
      }) as unknown as Record<string, unknown>;

  const onConfirm = async () => {
    if (!stripe || !elements) return;

    try {
      // Create PaymentIntent on the server
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
        }),
      });

      if (!res.ok) {
        onError?.('Failed to create payment');
        return;
      }

      const { clientSecret } = await res.json();

      // Confirm the payment — Stripe handles Apple Pay / Google Pay / Link
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/${language}/order-confirmation`,
        },
      });

      // If we reach here, there was an error (successful payments redirect automatically)
      if (error) {
        onError?.(error.message || 'Payment failed');
      }
    } catch {
      onError?.('An unexpected error occurred');
    }
  };

  // Google Ads conversion tracking fires on the return_url page (order-confirmation)
  // so we don't need to track it here — the redirect handles it.

  return (
    <div className="w-full">
      <ExpressCheckoutElement
        onConfirm={onConfirm}
        options={expressCheckoutOptions}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wrapper — loads Stripe independently and provides <Elements> context
// with mode / amount / currency (required for Express Checkout)
// ---------------------------------------------------------------------------
export default function ApplePayButton(props: ApplePayButtonProps) {
  const { amount, currency = 'eur' } = props;
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

  const elementsOptions = {
    mode: 'payment' as const,
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <ExpressCheckoutInner {...props} />
    </Elements>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, AlertCircle } from 'lucide-react';

interface ApplePayButtonProps {
  amount: number;
  currency: string;
  label: string; // e.g., "Instagram Starter Plan"
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function ApplePayButton({
  amount,
  currency,
  label,
  onSuccess,
  onError,
  className = '',
}: ApplePayButtonProps) {
  const [canMakePayment, setCanMakePayment] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buttonContainer, setButtonContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!buttonContainer) return;

    const initializeApplePay = async () => {
      try {
        // Fetch Stripe publishable key
        const configResponse = await fetch('/api/stripe-config');
        if (!configResponse.ok) {
          throw new Error('Failed to fetch Stripe configuration');
        }
        
        const { publishableKey } = await configResponse.json();
        if (!publishableKey) {
          throw new Error('Stripe publishable key not found');
        }

        // Load Stripe
        const stripe = await loadStripe(publishableKey);
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }

        // Create Payment Request
        const paymentRequest = stripe.paymentRequest({
          country: 'US',
          currency: currency.toLowerCase(),
          total: {
            label: label,
            amount: amount,
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        // Check if Apple Pay is available
        const canMake = await paymentRequest.canMakePayment();
        setCanMakePayment(!!canMake);

        if (canMake) {
          // Create the button element
          const elements = stripe.elements();
          const prButton = elements.create('paymentRequestButton', {
            paymentRequest: paymentRequest,
            style: {
              paymentRequestButton: {
                type: 'buy',
                theme: 'dark',
                height: '48px',
              },
            },
          });

          // Mount the button
          prButton.mount(buttonContainer);

          // Handle payment method received
          paymentRequest.on('paymentmethod', async (event) => {
            try {
              // Create payment intent on the backend
              const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, currency }),
              });

              const { clientSecret, paymentIntentId } = await response.json();

              if (!response.ok) {
                throw new Error('Failed to create payment intent');
              }

              // Confirm the payment
              const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                { payment_method: event.paymentMethod.id },
                { handleActions: false }
              );

              if (confirmError) {
                event.complete('fail');
                setError(confirmError.message || 'Payment failed');
                if (onError) {
                  onError(confirmError.message || 'Payment failed');
                }
              } else {
                event.complete('success');
                if (paymentIntent?.status === 'requires_action') {
                  // Handle 3D Secure if needed
                  const { error: confirmError2 } = await stripe.confirmCardPayment(clientSecret);
                  if (confirmError2) {
                    setError(confirmError2.message || 'Payment failed');
                    if (onError) {
                      onError(confirmError2.message || 'Payment failed');
                    }
                  } else {
                    if (onSuccess) {
                      onSuccess(paymentIntentId);
                    }
                  }
                } else {
                  if (onSuccess) {
                    onSuccess(paymentIntentId);
                  }
                }
              }
            } catch (err) {
              event.complete('fail');
              const errorMessage = err instanceof Error ? err.message : 'Payment failed';
              setError(errorMessage);
              if (onError) {
                onError(errorMessage);
              }
            }
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Apple Pay';
        setError(errorMessage);
        console.error('Apple Pay initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApplePay();
  }, [amount, currency, label, onSuccess, onError, buttonContainer]);

  // Don't render anything if still loading
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-3 ${className}`}>
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // Don't render if Apple Pay is not available
  if (canMakePayment === false) {
    return null;
  }

  // Show error if any
  if (error) {
    return (
      <div className={`rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return <div ref={setButtonContainer} className={className} />;
}

'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { ReactNode, useMemo, useEffect, useState } from 'react';

// Cache for Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;
let cachedPublishableKey: string | null = null;

export const getStripe = async () => {
  // Fetch publishable key from API (checks database first, then env)
  try {
    const response = await fetch('/api/stripe-config');
    if (response.ok) {
      const data = await response.json();
      const publishableKey = data.publishableKey;
      
      if (publishableKey && publishableKey !== cachedPublishableKey) {
        // Reset promise if key changed
        cachedPublishableKey = publishableKey;
        stripePromise = loadStripe(publishableKey);
      } else if (!stripePromise && publishableKey) {
        // Initialize for the first time
        cachedPublishableKey = publishableKey;
        stripePromise = loadStripe(publishableKey);
      }
    } else {
      console.error('Failed to fetch Stripe configuration');
    }
  } catch (error) {
    console.error('Error fetching Stripe configuration:', error);
  }
  
  return stripePromise;
};

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ 
  children, 
  clientSecret,
}: StripeProviderProps) {
  const [stripePromiseState, setStripePromiseState] = useState<Promise<Stripe | null> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initStripe = async () => {
      await getStripe();
      setStripePromiseState(stripePromise);
      setIsLoading(false);
    };
    initStripe();
  }, []);

  // Memoize options with dark mode support
  const options = useMemo(() => {
    if (clientSecret) {
      return {
        clientSecret,
        appearance: {
          theme: 'night' as const,
          variables: {
            colorPrimary: '#8b5cf6',
            colorBackground: '#1e293b',
            colorText: '#f8fafc',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
          rules: {
            '.Input': {
              border: '1px solid #334155',
              boxShadow: 'none',
            },
            '.Input:focus': {
              border: '1px solid #8b5cf6',
            },
            '.Label': {
              color: '#e2e8f0',
              fontWeight: '500',
              fontSize: '14px',
              marginBottom: '8px',
            },
            '.Tab': {
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              color: '#94a3b8',
            },
            '.Tab--selected': {
              backgroundColor: '#334155',
              borderColor: '#8b5cf6',
              color: '#f8fafc',
            },
            '.Tab:hover': {
              backgroundColor: '#334155',
              color: '#f8fafc',
            },
          },
        },
      };
    }
    return undefined;
  }, [clientSecret]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-gray-500">Loading payment system...</p>
      </div>
    );
  }

  if (!stripePromiseState) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-gray-500">
          Stripe is not properly configured. Please check your environment variables.
        </p>
      </div>
    );
  }

  if (!clientSecret || !options) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromiseState} options={options}>
      {children}
    </Elements>
  );
}

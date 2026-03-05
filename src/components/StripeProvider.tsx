'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { ReactNode, useMemo, useEffect, useState, useCallback } from 'react';

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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  const checkDarkMode = useCallback(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    }
  }, []);

  useEffect(() => {
    const initStripe = async () => {
      await getStripe();
      setStripePromiseState(stripePromise);
      setIsLoading(false);
    };
    initStripe();
    checkDarkMode();

    // Listen for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, [checkDarkMode]);

  // Memoize options with dark mode support
  const options = useMemo(() => {
    if (clientSecret) {
      return {
        clientSecret,
        appearance: {
          theme: isDarkMode ? 'night' as const : 'stripe' as const,
          variables: {
            colorPrimary: '#8B5CF6', // Purple-500
            colorBackground: isDarkMode ? '#1f2937' : '#ffffff',
            colorText: isDarkMode ? '#f3f4f6' : '#1f2937',
            colorTextSecondary: isDarkMode ? '#d1d5db' : '#6b7280',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '12px',
            spacingUnit: '4px',
          },
          rules: {
            '.Label': {
              color: isDarkMode ? '#e5e7eb' : '#374151',
              fontWeight: '500',
              fontSize: '14px',
              marginBottom: '8px',
            },
            '.Input': {
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
              color: isDarkMode ? '#f9fafb' : '#111827',
            },
            '.Input:focus': {
              borderColor: '#8B5CF6',
              boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)',
            },
            '.Tab': {
              backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
              borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
            },
            '.Tab--selected': {
              backgroundColor: isDarkMode ? '#4b5563' : '#ffffff',
              borderColor: '#8B5CF6',
            },
            '.Tab:hover': {
              backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6',
            },
          },
        },
      };
    }
    return undefined;
  }, [clientSecret, isDarkMode]);

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

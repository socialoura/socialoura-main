'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  type SupportedCurrency,
  type ConvertedPrice,
  convertPrice,
  formatCentsToDisplay,
  CURRENCY_COOKIE_NAME,
  CURRENCIES,
} from '@/lib/pricing';

interface CurrencyContextType {
  /** Detected currency code (e.g. "gbp") */
  currency: SupportedCurrency;
  /** Convert a EUR price to the user's local currency */
  convert: (eurPrice: number) => ConvertedPrice;
  /** Format an amount in cents for display */
  formatCents: (amountInCents: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'eur',
  convert: (eurPrice) => convertPrice(eurPrice, 'eur'),
  formatCents: (amountInCents) => formatCentsToDisplay(amountInCents, 'eur'),
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<SupportedCurrency>('eur');

  useEffect(() => {
    // Read currency from cookie set by middleware
    const cookies = document.cookie.split('; ');
    const currencyCookie = cookies.find((c) => c.startsWith(`${CURRENCY_COOKIE_NAME}=`));
    if (currencyCookie) {
      const value = currencyCookie.split('=')[1] as SupportedCurrency;
      if (value in CURRENCIES) {
        setCurrency(value);
      }
    }
  }, []);

  const convert = (eurPrice: number): ConvertedPrice => {
    return convertPrice(eurPrice, currency);
  };

  const formatCents = (amountInCents: number): string => {
    return formatCentsToDisplay(amountInCents, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, convert, formatCents }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

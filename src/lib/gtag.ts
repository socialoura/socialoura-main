// Google Ads conversion tracking utilities
// Reads identifiers from environment variables for dynamic configuration via Vercel

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_AW_ID = process.env.NEXT_PUBLIC_GA_AW_ID || '';
export const GA_PURCHASE_LABEL = process.env.NEXT_PUBLIC_GA_PURCHASE_LABEL || '';

/**
 * Track a Google Ads Purchase conversion event.
 * Uses NEXT_PUBLIC_GA_AW_ID and NEXT_PUBLIC_GA_PURCHASE_LABEL to build the send_to field.
 * 
 * @param orderData.value - The total order amount (in the base currency unit, e.g. euros not cents)
 * @param orderData.currency - ISO currency code (e.g. 'EUR')
 * @param orderData.transactionId - Unique order/payment ID to prevent duplicate conversions on page reload
 */
export function trackGoogleAdsPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  if (typeof window === 'undefined') return;
  if (!GA_AW_ID || !GA_PURCHASE_LABEL) {
    console.warn('[gtag] Missing NEXT_PUBLIC_GA_AW_ID or NEXT_PUBLIC_GA_PURCHASE_LABEL — skipping conversion tracking.');
    return;
  }
  if (!window.gtag) {
    console.warn('[gtag] gtag not loaded — skipping conversion tracking.');
    return;
  }

  const sendTo = `${GA_AW_ID}/${GA_PURCHASE_LABEL}`;

  window.gtag('event', 'conversion', {
    send_to: sendTo,
    value: orderData.value,
    currency: orderData.currency.toUpperCase(),
    transaction_id: orderData.transactionId,
  });
}

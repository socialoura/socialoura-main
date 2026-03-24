// Google Ads conversion tracking utilities
// Single Google Ads account: AW-18039153001/AaXKCMevhY8cEOnC3plD

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const CONVERSION_ID = 'AW-18039153001/AaXKCMevhY8cEOnC3plD';

function sendConversion(orderData: { value: number; currency: string; transactionId: string }) {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('[gtag] gtag not loaded — skipping conversion tracking.');
    return;
  }

  window.gtag('event', 'conversion', {
    send_to: CONVERSION_ID,
    value: orderData.value,
    currency: orderData.currency.toUpperCase(),
    transaction_id: orderData.transactionId,
  });
}

/**
 * Track a Google Ads Purchase conversion event (generic).
 */
export function trackGoogleAdsPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  sendConversion(orderData);
}

/**
 * Track a Google Ads Purchase conversion event for the TikTok funnel (/tiktok).
 */
export function trackTiktokFunnelPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  sendConversion(orderData);
}

/**
 * Track a Google Ads Purchase conversion event for the Instagram funnel (/instagram).
 */
export function trackInstaFunnelPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  sendConversion(orderData);
}

/**
 * Track a Google Ads Purchase conversion event for the classic TikTok sales page (/t).
 */
export function trackTiktokClassicPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  sendConversion(orderData);
}

/**
 * Track a Google Ads Purchase conversion event for the Instagram-2 funnel (/instagram-2).
 */
export function trackInsta2FunnelPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  sendConversion(orderData);
}

/**
 * Track a Google Ads Purchase conversion event for the TikTok-2 funnel (/tiktok-2).
 */
export function trackTiktok2FunnelPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  sendConversion(orderData);
}

// Legacy function - kept for backward compatibility
export function trackFunnelPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  sendConversion(orderData);
}

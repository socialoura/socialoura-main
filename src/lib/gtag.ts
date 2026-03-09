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

// ─── Multi-account Google Ads conversion tracking ───

// Compte 1: Funnel TikTok
const GA_TIKTOK_FUNNEL_ID = process.env.NEXT_PUBLIC_GA_TIKTOK_FUNNEL_ID || '';
const GA_TIKTOK_FUNNEL_LABEL = process.env.NEXT_PUBLIC_GA_TIKTOK_FUNNEL_CONVERSION_LABEL || '';

/**
 * Track a Google Ads Purchase conversion event for the TikTok funnel (/tiktok).
 * Uses dedicated Google Ads account for TikTok funnel conversions.
 */
export function trackTiktokFunnelPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('[gtag] gtag not loaded — skipping TikTok funnel conversion tracking.');
    return;
  }
  if (!GA_TIKTOK_FUNNEL_ID || !GA_TIKTOK_FUNNEL_LABEL) {
    console.warn('[gtag] Missing NEXT_PUBLIC_GA_TIKTOK_FUNNEL_ID or NEXT_PUBLIC_GA_TIKTOK_FUNNEL_CONVERSION_LABEL — skipping TikTok funnel conversion.');
    return;
  }

  window.gtag('event', 'conversion', {
    send_to: `${GA_TIKTOK_FUNNEL_ID}/${GA_TIKTOK_FUNNEL_LABEL}`,
    value: orderData.value,
    currency: orderData.currency.toUpperCase(),
    transaction_id: orderData.transactionId,
  });
}

// Compte 2: Funnel Instagram
const GA_INSTA_FUNNEL_ID = process.env.NEXT_PUBLIC_GA_INSTA_FUNNEL_ID || '';
const GA_INSTA_FUNNEL_LABEL = process.env.NEXT_PUBLIC_GA_INSTA_FUNNEL_CONVERSION_LABEL || '';

/**
 * Track a Google Ads Purchase conversion event for the Instagram funnel (/instagram).
 * Uses dedicated Google Ads account for Instagram funnel conversions.
 */
export function trackInstaFunnelPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  console.log('[DEBUG] trackInstaFunnelPurchase called with:', orderData);
  console.log('[DEBUG] GA_INSTA_FUNNEL_ID:', GA_INSTA_FUNNEL_ID);
  console.log('[DEBUG] GA_INSTA_FUNNEL_LABEL:', GA_INSTA_FUNNEL_LABEL);
  
  if (typeof window === 'undefined' || !window.gtag) {
    console.error('[gtag] gtag not loaded — skipping Instagram funnel conversion tracking.');
    return;
  }
  if (!GA_INSTA_FUNNEL_ID || !GA_INSTA_FUNNEL_LABEL) {
    console.error('[gtag] Missing NEXT_PUBLIC_GA_INSTA_FUNNEL_ID or NEXT_PUBLIC_GA_INSTA_FUNNEL_CONVERSION_LABEL — skipping Instagram funnel conversion.');
    console.error('[gtag] GA_INSTA_FUNNEL_ID:', GA_INSTA_FUNNEL_ID);
    console.error('[gtag] GA_INSTA_FUNNEL_LABEL:', GA_INSTA_FUNNEL_LABEL);
    return;
  }

  const conversionData = {
    send_to: `${GA_INSTA_FUNNEL_ID}/${GA_INSTA_FUNNEL_LABEL}`,
    value: orderData.value,
    currency: orderData.currency.toUpperCase(),
    transaction_id: orderData.transactionId,
  };
  
  console.log('[DEBUG] Sending conversion:', conversionData);
  
  window.gtag('event', 'conversion', conversionData);
  
  console.log('[DEBUG] Conversion sent successfully!');
}

// Compte 3: Page de vente classique TikTok (/t)
const GA_TIKTOK_CLASSIC_ID = process.env.NEXT_PUBLIC_GA_TIKTOK_CLASSIC_ID || '';
const GA_TIKTOK_CLASSIC_LABEL = process.env.NEXT_PUBLIC_GA_TIKTOK_CLASSIC_CONVERSION_LABEL || '';

/**
 * Track a Google Ads Purchase conversion event for the classic TikTok sales page (/t).
 * Uses dedicated Google Ads account for classic TikTok page conversions.
 */
export function trackTiktokClassicPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('[gtag] gtag not loaded — skipping TikTok classic conversion tracking.');
    return;
  }
  if (!GA_TIKTOK_CLASSIC_ID || !GA_TIKTOK_CLASSIC_LABEL) {
    console.warn('[gtag] Missing NEXT_PUBLIC_GA_TIKTOK_CLASSIC_ID or NEXT_PUBLIC_GA_TIKTOK_CLASSIC_CONVERSION_LABEL — skipping TikTok classic conversion.');
    return;
  }

  window.gtag('event', 'conversion', {
    send_to: `${GA_TIKTOK_CLASSIC_ID}/${GA_TIKTOK_CLASSIC_LABEL}`,
    value: orderData.value,
    currency: orderData.currency.toUpperCase(),
    transaction_id: orderData.transactionId,
  });
}

// Compte 5: Instagram-2 funnel (White Hat page)
/**
 * Track a Google Ads Purchase conversion event for the Instagram-2 funnel (/instagram-2).
 * Uses hardcoded conversion ID: AW-17964092485/Hk6VCO74u4UcEMWY-fVC
 */
export function trackInsta2FunnelPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('[gtag] gtag not loaded — skipping Instagram-2 funnel conversion tracking.');
    return;
  }

  const sendTo = 'AW-17964092485/Hk6VCO74u4UcEMWY-fVC';

  window.gtag('event', 'conversion', {
    send_to: sendTo,
    value: orderData.value,
    currency: orderData.currency.toUpperCase(),
    transaction_id: orderData.transactionId,
  });
}

// Compte 6: TikTok-2 funnel (White Hat page)
/**
 * Track a Google Ads Purchase conversion event for the TikTok-2 funnel (/tiktok-2).
 * Uses same conversion ID as Instagram-2: AW-17964092485/Hk6VCO74u4UcEMWY-fVC
 */
export function trackTiktok2FunnelPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('[gtag] gtag not loaded — skipping TikTok-2 funnel conversion tracking.');
    return;
  }

  const sendTo = 'AW-17964092485/Hk6VCO74u4UcEMWY-fVC';

  window.gtag('event', 'conversion', {
    send_to: sendTo,
    value: orderData.value,
    currency: orderData.currency.toUpperCase(),
    transaction_id: orderData.transactionId,
  });
}

// Legacy function - kept for backward compatibility, will be removed after migration
export function trackFunnelPurchase(orderData: {
  value: number;
  currency: string;
  transactionId: string;
}) {
  console.warn('[gtag] trackFunnelPurchase is deprecated. Use trackInstaFunnelPurchase or trackTiktokFunnelPurchase instead.');
  trackInstaFunnelPurchase(orderData);
}

import posthog from 'posthog-js';

export interface PurchaseTrackingData {
  revenue: number; // dans la devise locale
  currency: 'USD' | 'EUR' | 'GBP' | 'CHF' | 'CAD' | 'AUD' | 'NZD' | 'JPY' | 'CNY' | 'INR' | 'BRL' | 'MXN' | 'KRW' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'TRY' | 'ZAR' | 'SGD' | 'HKD';
  source: 'instagram' | 'tiktok' | 'tiktok-single';
  transactionId?: string;
  email?: string;
  username?: string;
  services?: Array<{
    type: string;
    quantity: number;
    price: number;
  }>;
  isNewCustomer?: boolean;
  customerOrderNumber?: number;
  paymentMethod?: 'card' | 'express' | 'express_redirect';
  adsKeyword?: string;
  adsCampaign?: string;
  adsDevice?: string;
}

/**
 * Track a completed purchase in PostHog
 * This function should only be called once per successful payment
 */
export function trackPurchase(data: PurchaseTrackingData) {
  // Ensure revenue is a number (convert from cents if needed)
  const revenue = typeof data.revenue === 'number' ? data.revenue : Number(data.revenue);
  
  // Validate required fields
  if (!revenue || revenue <= 0) {
    console.error('PostHog tracking: Invalid revenue amount', data);
    return;
  }

  if (!data.source || !['instagram', 'tiktok', 'tiktok-single'].includes(data.source)) {
    console.error('PostHog tracking: Invalid source', data);
    return;
  }

  const properties: Record<string, string | number | boolean | Array<{type: string; quantity: number; price: number;}>> = {
    revenue: revenue, // PostHog expects revenue as a number
    currency: data.currency || 'EUR',
    source: data.source,
  };

  // Add optional properties if available
  if (data.transactionId) properties.transaction_id = data.transactionId;
  if (data.email) properties.email = data.email;
  if (data.username) properties.username = data.username;
  if (data.services) {
    properties.services = data.services;
    // Add primary service for easier filtering
    const primaryService = data.services.find(s => s.type !== 'story-views') || data.services[0];
    if (primaryService) {
      properties.primary_service = primaryService.type;
      properties.primary_quantity = primaryService.quantity;
    }
  }
  if (data.isNewCustomer !== undefined) properties.is_new_customer = data.isNewCustomer;
  if (data.customerOrderNumber !== undefined) properties.customer_order_number = data.customerOrderNumber;
  if (data.paymentMethod) properties.payment_method = data.paymentMethod;
  if (data.adsKeyword) properties.ads_keyword = data.adsKeyword;
  if (data.adsCampaign) properties.ads_campaign = data.adsCampaign;
  if (data.adsDevice) properties.ads_device = data.adsDevice;

  console.log('PostHog tracking: purchase_completed', properties);
  
  posthog.capture('purchase_completed', properties);
}

/**
 * Determine the purchase source based on the current path and order data
 */
export function getPurchaseSource(pathname: string, orderSource?: string): 'instagram' | 'tiktok' | 'tiktok-single' {
  // Check explicit order source first
  if (orderSource === 'APP_FUNNEL_INSTAGRAM') return 'instagram';
  if (orderSource === 'APP_FUNNEL_TIKTOK') return 'tiktok';
  if (orderSource === 'TIKTOK_SINGLE') return 'tiktok-single';
  
  // Fallback to path-based detection
  if (pathname.includes('/instagram')) return 'instagram';
  if (pathname.includes('/tiktok')) return 'tiktok';
  if (pathname.includes('/t') && !pathname.includes('/tiktok')) return 'tiktok-single';
  
  // Default fallback
  return 'instagram';
}

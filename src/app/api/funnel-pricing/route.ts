import { NextRequest, NextResponse } from 'next/server';
import { getFunnelPricing, getFunnelCurrencyPricing, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// Default funnel pricing (used when no DB config exists)
const DEFAULT_FUNNEL_PRICING = {
  followers: [
    { qty: 100, price: 2.59, oldPrice: 9.99, bonus: 10 },
    { qty: 250, price: 5.09, oldPrice: 19.99, bonus: 25 },
    { qty: 500, price: 9.99, oldPrice: 39.99, bonus: 50 },
    { qty: 1000, price: 17.99, oldPrice: 69.99, bonus: 100 },
    { qty: 2500, price: 39.99, oldPrice: 149.99, bonus: 250 },
  ],
  likes: [
    { qty: 100, price: 2.59, oldPrice: 9.99, bonus: 10 },
    { qty: 250, price: 4.99, oldPrice: 19.99, bonus: 25 },
    { qty: 500, price: 8.99, oldPrice: 29.99, bonus: 50 },
    { qty: 1000, price: 15.99, oldPrice: 59.99, bonus: 100 },
    { qty: 2500, price: 34.99, oldPrice: 129.99, bonus: 250 },
  ],
  views: [
    { qty: 500, price: 1.99, oldPrice: 9.99, bonus: 50 },
    { qty: 1000, price: 3.49, oldPrice: 14.99, bonus: 100 },
    { qty: 2500, price: 7.99, oldPrice: 34.99, bonus: 250 },
    { qty: 5000, price: 14.99, oldPrice: 59.99, bonus: 500 },
    { qty: 10000, price: 27.99, oldPrice: 99.99, bonus: 1000 },
  ],
  'story-views': [
    { qty: 1000, price: 3.99, oldPrice: 14.99, bonus: 100 },
    { qty: 2500, price: 8.99, oldPrice: 34.99, bonus: 250 },
    { qty: 5000, price: 16.99, oldPrice: 59.99, bonus: 500 },
    { qty: 10000, price: 29.99, oldPrice: 99.99, bonus: 1000 },
  ],
};

// Public GET - no auth required (frontend fetches this)
// Accepts optional ?currency=usd param to get currency-specific pricing
export async function GET(request: NextRequest) {
  try {
    const isDBConfigured = !!(process.env.DB_HOST || process.env.DATABASE_URL);
    const currency = request.nextUrl.searchParams.get('currency')?.toLowerCase();

    // If a specific currency is requested (not eur), try to fetch currency-specific pricing
    if (currency && currency !== 'eur' && isDBConfigured) {
      try {
        const currencyData = await getFunnelCurrencyPricing();
        if (currencyData && currencyData[currency]) {
          // Return currency-specific pricing with _currency metadata
          return NextResponse.json({
            ...currencyData[currency],
            _currency: currency,
          });
        }
      } catch (error) {
        console.error('DB error fetching currency pricing:', error);
      }
      // Fall through to EUR pricing if currency not configured
    }

    // Default: return EUR pricing
    if (isDBConfigured) {
      try {
        const data = await getFunnelPricing();
        if (data) {
          return NextResponse.json({ ...data, _currency: 'eur' });
        }
      } catch (error) {
        console.error('DB error fetching funnel pricing:', error);
      }
    }

    // Fallback to defaults
    return NextResponse.json({ ...DEFAULT_FUNNEL_PRICING, _currency: 'eur' });
  } catch (error) {
    console.error('Error in funnel-pricing GET:', error);
    return NextResponse.json({ ...DEFAULT_FUNNEL_PRICING, _currency: 'eur' });
  }
}

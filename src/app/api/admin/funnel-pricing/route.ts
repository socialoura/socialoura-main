import { NextRequest, NextResponse } from 'next/server';
import { getFunnelPricing, setFunnelPricing, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// Default funnel pricing
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

const isDBConfigured = () => {
  return !!(process.env.DB_HOST || process.env.DATABASE_URL);
};

// In-memory fallback for development
let memoryStore: Record<string, Array<{ qty: number; price: number; oldPrice: number; bonus: number }>> | null = null;

function verifyToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp && decoded.exp > Date.now()) {
      return decoded.role === 'admin';
    }
    return false;
  } catch {
    return false;
  }
}

// Admin GET
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isDBConfigured()) {
      try {
        const data = await getFunnelPricing();
        if (data) return NextResponse.json(data);
      } catch (error) {
        console.error('DB error:', error);
        if (memoryStore) return NextResponse.json(memoryStore);
      }
    } else if (memoryStore) {
      return NextResponse.json(memoryStore);
    }

    return NextResponse.json(DEFAULT_FUNNEL_PRICING);
  } catch (error) {
    console.error('Error in admin funnel-pricing GET:', error);
    return NextResponse.json(DEFAULT_FUNNEL_PRICING);
  }
}

// Admin PUT
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (isDBConfigured()) {
      try {
        await setFunnelPricing(body);
      } catch (error) {
        console.error('DB error, using memory:', error);
        memoryStore = body;
      }
    } else {
      memoryStore = body;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin funnel-pricing PUT:', error);
    return NextResponse.json({ error: 'Failed to save funnel pricing' }, { status: 500 });
  }
}

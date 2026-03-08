import { NextRequest, NextResponse } from 'next/server';
import { getFunnelCurrencyPricing, setFunnelCurrencyPricing, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

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

const isDBConfigured = () => {
  return !!(process.env.DB_HOST || process.env.DATABASE_URL);
};

// In-memory fallback for development
let memoryStore: Record<string, Record<string, Array<{ qty: number; price: number; oldPrice: number; bonus: number }>>> | null = null;

// Admin GET - get currency-specific funnel pricing
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isDBConfigured()) {
      try {
        const data = await getFunnelCurrencyPricing();
        if (data) return NextResponse.json(data);
      } catch (error) {
        console.error('DB error:', error);
        if (memoryStore) return NextResponse.json(memoryStore);
      }
    } else if (memoryStore) {
      return NextResponse.json(memoryStore);
    }

    // Return empty object if no currency pricing configured yet
    return NextResponse.json({});
  } catch (error) {
    console.error('Error in admin funnel-currency-pricing GET:', error);
    return NextResponse.json({});
  }
}

// Admin PUT - save currency-specific funnel pricing
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
        await setFunnelCurrencyPricing(body);
      } catch (error) {
        console.error('DB error, using memory:', error);
        memoryStore = body;
      }
    } else {
      memoryStore = body;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin funnel-currency-pricing PUT:', error);
    return NextResponse.json({ error: 'Failed to save funnel currency pricing' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getPromoBarConfig, setPromoBarConfig, initDatabase, PromoBarConfig } from '@/lib/db';

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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getPromoBarConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error fetching promo bar settings:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { config } = body as { config?: PromoBarConfig };

    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'config is required' }, { status: 400 });
    }

    await setPromoBarConfig(config);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating promo bar settings:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

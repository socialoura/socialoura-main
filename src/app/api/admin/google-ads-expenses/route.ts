import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAdsExpenses, upsertGoogleAdsExpense, initDatabase } from '@/lib/db';

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

// GET - List all Google Ads monthly expenses
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expenses = await getGoogleAdsExpenses();
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching Google Ads expenses:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// PUT - Upsert a month expense
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { month, amount } = body;

    if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'month must be in YYYY-MM format' }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json({ error: 'amount must be a non-negative number' }, { status: 400 });
    }

    await upsertGoogleAdsExpense(month, parsedAmount);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating Google Ads expense:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

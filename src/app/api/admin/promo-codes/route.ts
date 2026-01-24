import { NextRequest, NextResponse } from 'next/server';
import { getAllPromoCodes, createPromoCode, updatePromoCode, deletePromoCode, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// Verify admin token
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

// GET - List all promo codes
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promoCodes = await getAllPromoCodes();
    return NextResponse.json(promoCodes);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// POST - Create a new promo code
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, discount_type, discount_value, max_uses, expires_at } = body;

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json(
        { error: 'Code, discount_type, and discount_value are required' },
        { status: 400 }
      );
    }

    if (!['percentage', 'fixed'].includes(discount_type)) {
      return NextResponse.json(
        { error: 'discount_type must be "percentage" or "fixed"' },
        { status: 400 }
      );
    }

    if (discount_type === 'percentage' && (discount_value < 0 || discount_value > 100)) {
      return NextResponse.json(
        { error: 'Percentage discount must be between 0 and 100' },
        { status: 400 }
      );
    }

    const promoCode = await createPromoCode({
      code,
      discount_type,
      discount_value,
      max_uses: max_uses || null,
      expires_at: expires_at || null,
    });

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error('Error creating promo code:', error);
    if ((error as Error).message?.includes('duplicate')) {
      return NextResponse.json({ error: 'This promo code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// PUT - Update a promo code
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await updatePromoCode(id, updateData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// DELETE - Delete a promo code
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await deletePromoCode(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode, calculateDiscount, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// POST - Validate a promo code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, price } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const result = await validatePromoCode(code);

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
    }

    const discount = price ? calculateDiscount(price, result.promoCode!) : 0;
    const finalPrice = price ? Math.max(0, price - discount) : null;

    return NextResponse.json({
      valid: true,
      promoCode: {
        code: result.promoCode!.code,
        discount_type: result.promoCode!.discount_type,
        discount_value: result.promoCode!.discount_value,
      },
      discount,
      finalPrice,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

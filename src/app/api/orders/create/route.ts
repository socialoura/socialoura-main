import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';
import { sql } from '@vercel/postgres';

// Initialize database on module load
initDatabase().catch(console.error);

export async function POST(request: NextRequest) {
  try {
    const { username, email, platform, followers, amount, paymentId } = await request.json();

    // Validate required fields
    if (!username || !platform || !followers || !amount || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert the order
    const result = await sql`
      INSERT INTO orders (username, email, platform, followers, amount, price, payment_id, payment_intent_id, status, payment_status) 
      VALUES (${username}, ${email || null}, ${platform}, ${followers}, ${amount}, ${amount}, ${paymentId}, ${paymentId}, 'completed', 'completed')
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      orderId: result.rows[0].id
    });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json(
      { error: 'Failed to save order' },
      { status: 500 }
    );
  }
}

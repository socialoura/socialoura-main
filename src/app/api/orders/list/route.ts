import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';
import { sql } from '@vercel/postgres';

// Initialize database on module load
initDatabase().catch(console.error);

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Decode and verify token
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (decoded.exp < Date.now()) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch all orders
    const result = await sql`
      SELECT id, username, platform, followers, amount, payment_id, status, created_at 
      FROM orders 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ orders: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

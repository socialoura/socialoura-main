import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const orderId = parseInt(params.id);
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Delete the order
    await sql`
      DELETE FROM orders WHERE id = ${orderId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

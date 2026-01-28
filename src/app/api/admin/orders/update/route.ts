import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, updateOrderNotes, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// Verify admin token
function verifyToken(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    // Check if token is expired (24 hours)
    if (decoded.exp && decoded.exp > Date.now()) {
      return decoded.role === 'admin';
    }
    return false;
  } catch {
    return false;
  }
}

// PUT - Update order status or notes
export async function PUT(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, orderStatus, notes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Update status if provided
    if (orderStatus !== undefined) {
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(orderStatus)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be: pending, processing, completed, or cancelled' },
          { status: 400 }
        );
      }
      await updateOrderStatus(orderId, orderStatus);
    }

    // Update notes if provided
    if (notes !== undefined) {
      await updateOrderNotes(orderId, notes);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the order' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// In-memory fallback
const memoryOrders: Array<{
  id: number;
  email: string;
  platform: string;
  followers: number;
  price: number;
  payment_status: string;
  payment_intent_id: string | null;
  created_at: string;
}> = [];

// Check if database is configured
const isDBConfigured = () => {
  return !!(process.env.DB_HOST || process.env.DATABASE_URL);
};

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

// GET orders
export async function GET(request: NextRequest) {
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

    // Get orders from database or memory
    let orders;
    if (isDBConfigured()) {
      try {
        orders = await getAllOrders();
      } catch (error) {
        console.error('Database error, using memory:', error);
        orders = memoryOrders;
      }
    } else {
      orders = memoryOrders;
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching orders' },
      { status: 500 }
    );
  }
}

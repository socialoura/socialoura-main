import { NextRequest, NextResponse } from 'next/server';
import { getStripeSettings, updateStripeSettings, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// Verify admin token
function verifyToken(token: string | null): { username: string; role: string } | null {
  if (!token) return null;

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    // Check if token is expired (24 hours)
    if (decoded.exp && decoded.exp > Date.now() && decoded.role === 'admin') {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

// GET - Get Stripe settings
export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await getStripeSettings();
    
    // Return full keys since this is an authenticated admin endpoint
    return NextResponse.json({
      secretKey: settings.secretKey || '',
      publishableKey: settings.publishableKey || '',
      hasSecretKey: !!settings.secretKey,
      hasPublishableKey: !!settings.publishableKey,
    });
  } catch (error) {
    console.error('Error fetching Stripe settings:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching settings' },
      { status: 500 }
    );
  }
}

// PUT - Update Stripe settings
export async function PUT(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { secretKey, publishableKey } = body;

    if (!secretKey || !publishableKey) {
      return NextResponse.json(
        { error: 'Both secret key and publishable key are required' },
        { status: 400 }
      );
    }

    // Validate key formats
    if (!secretKey.startsWith('sk_')) {
      return NextResponse.json(
        { error: 'Invalid secret key format. Must start with sk_' },
        { status: 400 }
      );
    }

    if (!publishableKey.startsWith('pk_')) {
      return NextResponse.json(
        { error: 'Invalid publishable key format. Must start with pk_' },
        { status: 400 }
      );
    }

    await updateStripeSettings(secretKey, publishableKey);

    return NextResponse.json({ 
      success: true, 
      message: 'Stripe settings updated successfully' 
    });
  } catch (error) {
    console.error('Error updating Stripe settings:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating settings' },
      { status: 500 }
    );
  }
}

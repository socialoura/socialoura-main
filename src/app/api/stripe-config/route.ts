import { NextResponse } from 'next/server';
import { getStripeSettings } from '@/lib/db';

export async function GET() {
  try {
    // Get Stripe settings from database
    const dbSettings = await getStripeSettings();
    
    // Use database key if available, otherwise fall back to env variable
    const publishableKey = dbSettings.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      return NextResponse.json(
        { error: 'Stripe publishable key not configured' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ publishableKey });
  } catch (error) {
    console.error('Error fetching Stripe publishable key:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching Stripe configuration' },
      { status: 500 }
    );
  }
}

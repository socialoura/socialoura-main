import { NextResponse } from 'next/server';
import { getPromoBarConfig, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

export async function GET() {
  try {
    const config = await getPromoBarConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error fetching promo bar config:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

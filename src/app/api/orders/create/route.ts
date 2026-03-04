import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';
import { sql } from '@vercel/postgres';

// Initialize database on module load
initDatabase().catch(console.error);

async function getCountryFromIP(request: NextRequest): Promise<string | null> {
  try {
    // Vercel provides the country directly via header
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    if (vercelCountry && vercelCountry !== 'XX') {
      return vercelCountry;
    }

    // Fallback: get IP and use free geolocation API
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip');
    if (!ip || ip === '127.0.0.1' || ip === '::1') return null;

    const res = await fetch(`https://ipapi.co/${ip}/country_name/`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const country = await res.text();
      if (country && !country.includes('error') && country.length < 100) {
        return country.trim();
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, platform, followers, amount, paymentId, orderSource, funnelData } = body;

    // Validate required fields
    if (!username || !amount || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Detect client country from IP
    const country = await getCountryFromIP(request);

    // Determine order source
    const source = orderSource === 'APP_FUNNEL' ? 'APP_FUNNEL' : 'CLASSIC';

    if (source === 'APP_FUNNEL') {
      // Funnel order: store structured funnel_data as JSONB
      // funnelData is expected to contain: { username, avatarUrl, services: [...] }
      const funnelJson = JSON.stringify(funnelData || {});
      const totalFollowers = funnelData?.services?.reduce((sum: number, s: { quantity: number }) => sum + s.quantity, 0) || 0;

      const result = await sql`
        INSERT INTO orders (username, email, platform, followers, amount, price, payment_id, payment_intent_id, status, payment_status, country, order_source, funnel_data) 
        VALUES (${username}, ${email || null}, ${'instagram'}, ${totalFollowers}, ${amount}, ${amount}, ${paymentId}, ${paymentId}, 'completed', 'completed', ${country}, ${source}, ${funnelJson}::jsonb)
        RETURNING id
      `;

      return NextResponse.json({
        success: true,
        orderId: result.rows[0].id
      });
    }

    // Classic order: backward-compatible insert (no funnel_data)
    if (!platform || !followers) {
      return NextResponse.json(
        { error: 'Missing required fields for classic order' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO orders (username, email, platform, followers, amount, price, payment_id, payment_intent_id, status, payment_status, country, order_source) 
      VALUES (${username}, ${email || null}, ${platform}, ${followers}, ${amount}, ${amount}, ${paymentId}, ${paymentId}, 'completed', 'completed', ${country}, 'CLASSIC')
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

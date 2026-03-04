import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordOrderNotification, sendDiscordFunnelOrderNotification } from '@/lib/discord';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderSource } = body;

    // Funnel order notification
    if (orderSource === 'APP_FUNNEL') {
      const { orderId, email, username, totalPrice, services } = body;

      if (!orderId || !username || !totalPrice || !services) {
        return NextResponse.json(
          { error: 'Missing required fields for funnel notification' },
          { status: 400 }
        );
      }

      const result = await sendDiscordFunnelOrderNotification({
        orderId,
        email: email || '',
        username,
        totalPrice,
        services,
      });

      if (result.success) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { error: 'Failed to send Discord notification', details: result.error },
          { status: 500 }
        );
      }
    }

    // Classic order notification
    const { orderId, email, username, platform, followers, price, promoCode } = body;

    if (!orderId || !email || !username || !platform || !followers || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendDiscordOrderNotification({
      orderId,
      email,
      username,
      platform,
      followers,
      price,
      promoCode,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send Discord notification', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in discord-notification API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

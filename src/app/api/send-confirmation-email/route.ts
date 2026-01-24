import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, customerName, orderDetails, language } = body;

    if (!email || !orderDetails) {
      return NextResponse.json(
        { error: 'Email and order details are required' },
        { status: 400 }
      );
    }

    const result = await sendOrderConfirmationEmail({
      to: email,
      customerName,
      orderDetails,
      language: language || 'en',
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-confirmation-email API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface OrderService {
  type: string;
  quantity: number;
  price: number;
}

interface SendOrderConfirmationRequest {
  email: string;
  username: string;
  orderId: string;
  totalPrice: number;
  services: OrderService[];
  lang?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendOrderConfirmationRequest = await request.json();
    const { email, username, orderId, totalPrice, services, lang = 'fr' } = body;

    if (!email || !username || !orderId || !totalPrice || !services) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, skipping email');
      return NextResponse.json({ success: true, skipped: true });
    }

    const resend = new Resend(resendApiKey);

    const serviceLabels: Record<string, Record<string, string>> = {
      fr: {
        followers: 'Abonnés',
        likes: 'Likes',
        views: 'Vues',
        'story-views': 'Vues de story',
      },
      en: {
        followers: 'Followers',
        likes: 'Likes',
        views: 'Views',
        'story-views': 'Story Views',
      },
    };

    const labels = serviceLabels[lang] || serviceLabels.fr;

    const content = {
      fr: {
        subject: '✅ Confirmation de commande - SocialOura',
        title: 'Commande confirmée !',
        subtitle: 'Merci pour votre achat',
        orderDetails: 'Détails de la commande',
        account: 'Compte Instagram',
        orderNumber: 'Numéro de commande',
        services: 'Services commandés',
        total: 'Total',
        processing: 'Votre commande est en cours de traitement et sera livrée dans les plus brefs délais.',
        support: 'Besoin d\'aide ?',
        contactUs: 'Contactez notre support',
        footer: 'SocialOura - Boostez votre présence sur les réseaux sociaux',
      },
      en: {
        subject: '✅ Order Confirmation - SocialOura',
        title: 'Order confirmed!',
        subtitle: 'Thank you for your purchase',
        orderDetails: 'Order Details',
        account: 'Instagram Account',
        orderNumber: 'Order Number',
        services: 'Ordered Services',
        total: 'Total',
        processing: 'Your order is being processed and will be delivered as soon as possible.',
        support: 'Need help?',
        contactUs: 'Contact our support',
        footer: 'SocialOura - Boost your social media presence',
      },
    };

    const t = content[lang as keyof typeof content] || content.fr;

    const servicesHtml = services.map(svc => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">
          ${labels[svc.type] || svc.type}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: center;">
          ${svc.quantity.toLocaleString()}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right; font-weight: 600;">
          ${svc.price.toFixed(2)} €
        </td>
      </tr>
    `).join('');

    await resend.emails.send({
      from: 'SocialOura <noreply@socialoura.com>',
      to: [email],
      subject: t.subject,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background-color: #f3f4f6; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #fbbf24 0%, #ec4899 50%, #8b5cf6 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: white; margin: 0 0 8px; font-size: 28px; font-weight: 900;">${t.title}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">${t.subtitle}</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">
      
      <!-- Order Info -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700;">${t.orderDetails}</h2>
        
        <div style="margin-bottom: 12px;">
          <p style="margin: 0 0 4px; color: #6b7280; font-size: 14px;">📸 ${t.account}</p>
          <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">@${username}</p>
        </div>
        
        <div>
          <p style="margin: 0 0 4px; color: #6b7280; font-size: 14px;">🆔 ${t.orderNumber}</p>
          <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600; font-family: monospace;">#${orderId}</p>
        </div>
      </div>

      <!-- Services Table -->
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; color: #1f2937; font-size: 16px; font-weight: 700;">📦 ${t.services}</h3>
        <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 14px; font-weight: 600;">Service</th>
              <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 14px; font-weight: 600;">Quantité</th>
              <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px; font-weight: 600;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${servicesHtml}
          </tbody>
          <tfoot>
            <tr style="background: #EEF2FF;">
              <td colspan="2" style="padding: 16px; color: #1f2937; font-size: 16px; font-weight: 700;">${t.total}</td>
              <td style="padding: 16px; text-align: right; color: #8b5cf6; font-size: 20px; font-weight: 900;">${totalPrice.toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Processing Info -->
      <div style="background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
          ✅ ${t.processing}
        </p>
      </div>

      <!-- Support -->
      <div style="text-align: center; margin-top: 32px;">
        <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">${t.support}</p>
        <a href="mailto:support@socialoura.com" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          ${t.contactUs}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">${t.footer}</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}

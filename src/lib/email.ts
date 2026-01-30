import { Resend } from 'resend';

// Initialize Resend only when API key is available
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured. Emails will not be sent.');
    return null;
  }
  return new Resend(apiKey);
};

interface OrderConfirmationEmailProps {
  to: string;
  customerName?: string;
  orderDetails: {
    platform: string;
    followers: number;
    price: string;
    orderId: string;
    date: string;
  };
  language?: 'en' | 'fr';
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderDetails,
  language = 'en',
}: OrderConfirmationEmailProps) {
  const isEnglish = language === 'en';

  const subject = isEnglish
    ? `Order Confirmation - SocialOura #${orderDetails.orderId}`
    : `Confirmation de commande - SocialOura #${orderDetails.orderId}`;

  const platformName = orderDetails.platform.charAt(0).toUpperCase() + orderDetails.platform.slice(1);

  const logoUrl = 'https://socialoura.com/img/a-modern-flat-vector-logo-design-featuri_ZEbfVp__QiK-0wr5MrgGJg_ZFPYEbSKRM6a11TOK-IQCQ-removebg-preview.png';
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(139, 92, 246, 0.15);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #EC4899 100%); padding: 50px 30px; text-align: center;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <img src="${logoUrl}" alt="SocialOura" style="width: 80px; height: 80px; border-radius: 20px; margin-bottom: 16px;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">
                      SocialOura
                    </h1>
                    <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 500;">
                      ${isEnglish ? '✨ Order Confirmation ✨' : '✨ Confirmation de commande ✨'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Success Icon with Animation-like styling -->
          <tr>
            <td style="padding: 50px 30px 30px; text-align: center;">
              <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
                <tr>
                  <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); width: 100px; height: 100px; border-radius: 50%; text-align: center; vertical-align: middle; box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.4);">
                    <span style="color: #ffffff; font-size: 48px; line-height: 100px;">✓</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <h2 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700; line-height: 1.3;">
                ${isEnglish ? 'Thank you for your order!' : 'Merci pour votre commande !'}
              </h2>
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 17px; line-height: 1.7;">
                ${isEnglish 
                  ? `Hi${customerName ? ` <strong style="color: #374151;">${customerName}</strong>` : ''}, your payment has been successfully processed. We're excited to help you grow!`
                  : `Bonjour${customerName ? ` <strong style="color: #374151;">${customerName}</strong>` : ''}, votre paiement a été traité avec succès. Nous sommes ravis de vous aider à grandir !`
                }
              </p>
            </td>
          </tr>

          <!-- Order Details Card -->
          <tr>
            <td style="padding: 0 30px 35px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%); border-radius: 20px; overflow: hidden; border: 2px solid #e9d5ff;">
                <tr>
                  <td style="padding: 30px;">
                    <!-- Order ID Header -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); border-radius: 12px; padding: 16px 20px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                                ${isEnglish ? 'Order Number' : 'N° de commande'}
                              </td>
                              <td style="text-align: right; color: #ffffff; font-size: 20px; font-weight: 700;">
                                #${orderDetails.orderId}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Order Details Grid -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">
                                📅 ${isEnglish ? 'Date' : 'Date'}
                              </td>
                              <td style="color: #1f2937; font-size: 15px; font-weight: 600; text-align: right;">
                                ${orderDetails.date}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">
                                📱 ${isEnglish ? 'Platform' : 'Plateforme'}
                              </td>
                              <td style="color: #1f2937; font-size: 15px; font-weight: 600; text-align: right;">
                                ${platformName}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">
                                👥 ${isEnglish ? 'Followers' : 'Abonnés'}
                              </td>
                              <td style="color: #1f2937; font-size: 15px; font-weight: 600; text-align: right;">
                                <span style="background: linear-gradient(135deg, #10B981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">+${orderDetails.followers.toLocaleString()}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px 0 0;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="color: #374151; font-size: 18px; font-weight: 700;">
                                💰 ${isEnglish ? 'Total Paid' : 'Total Payé'}
                              </td>
                              <td style="text-align: right;">
                                <span style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff; font-size: 22px; font-weight: 800; padding: 8px 16px; border-radius: 10px;">
                                  ${orderDetails.price}
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next Section -->
          <tr>
            <td style="padding: 0 30px 35px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0fdf4; border-radius: 16px; border-left: 5px solid #10B981;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 12px; color: #166534; font-size: 18px; font-weight: 700;">
                      🚀 ${isEnglish ? "What's Next?" : 'Et Maintenant ?'}
                    </h3>
                    <p style="margin: 0; color: #15803d; font-size: 15px; line-height: 1.7;">
                      ${isEnglish 
                        ? 'Your order is being processed by our team. You will start seeing results within <strong>24-48 hours</strong>. The delivery will be gradual to ensure natural, authentic growth for your account.'
                        : 'Votre commande est en cours de traitement par notre équipe. Vous commencerez à voir les résultats dans <strong>24-48 heures</strong>. La livraison sera progressive pour assurer une croissance naturelle et authentique de votre compte.'
                      }
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Trust Badges -->
          <tr>
            <td style="padding: 0 30px 35px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 12px; background-color: #fefce8; border-radius: 12px;">
                    <span style="color: #854d0e; font-size: 14px;">🔒 ${isEnglish ? 'Secure Payment' : 'Paiement Sécurisé'}</span>
                  </td>
                  <td width="12"></td>
                  <td align="center" style="padding: 12px; background-color: #f0fdf4; border-radius: 12px;">
                    <span style="color: #166534; font-size: 14px;">⚡ ${isEnglish ? 'Fast Delivery' : 'Livraison Rapide'}</span>
                  </td>
                  <td width="12"></td>
                  <td align="center" style="padding: 12px; background-color: #faf5ff; border-radius: 12px;">
                    <span style="color: #6b21a8; font-size: 14px;">✅ ${isEnglish ? '100% Guarantee' : 'Garantie 100%'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="https://socialoura.com" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 18px 40px; border-radius: 14px; box-shadow: 0 10px 30px -5px rgba(139, 92, 246, 0.4);">
                ${isEnglish ? 'Visit SocialOura' : 'Visiter SocialOura'} →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 40px 30px; text-align: center;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <img src="${logoUrl}" alt="SocialOura" style="width: 50px; height: 50px; border-radius: 12px;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="margin: 0; color: #9ca3af; font-size: 15px;">
                      ${isEnglish ? 'Questions? We are here to help!' : 'Des questions ? Nous sommes là pour vous aider !'}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <a href="mailto:support@socialoura.com" style="display: inline-block; background-color: rgba(139, 92, 246, 0.2); color: #a78bfa; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 10px; border: 1px solid rgba(139, 92, 246, 0.3);">
                      📧 support@socialoura.com
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: #6b7280; font-size: 13px;">
                      © ${new Date().getFullYear()} SocialOura. ${isEnglish ? 'All rights reserved.' : 'Tous droits réservés.'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const resend = getResend();
    
    if (!resend) {
      console.warn('Email not sent: RESEND_API_KEY is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: 'SocialOura <noreply@socialoura.com>',
      to: [to],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

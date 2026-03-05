interface OrderNotificationProps {
  orderId: string;
  email: string;
  username: string;
  platform: string;
  followers: number;
  price: string;
  promoCode?: string;
}

interface FunnelDistribution {
  postId: string;
  shortcode: string;
  imageUrl: string;
  quantityAllocated: number;
}

interface FunnelService {
  type: string;
  quantity: number;
  price: number;
  distribution?: FunnelDistribution[];
}

interface FunnelOrderNotificationProps {
  orderId: string;
  email: string;
  username: string;
  totalPrice: string;
  services: FunnelService[];
  isNewCustomer: boolean;
  customerOrderNumber: number;
}

const SERVICE_EMOJI: Record<string, string> = {
  followers: '👥',
  likes: '❤️',
  views: '👁️',
  'story-views': '📱',
};

const SERVICE_LABEL: Record<string, string> = {
  followers: 'Abonnés',
  likes: 'Likes',
  views: 'Vues',
  'story-views': 'Vues de story',
};

export async function sendDiscordOrderNotification({
  orderId,
  email,
  username,
  platform,
  followers,
  price,
  promoCode,
}: OrderNotificationProps) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not configured. Discord notifications will not be sent.');
    return { success: false, error: 'Discord webhook not configured' };
  }

  const platformEmoji = platform.toLowerCase() === 'instagram' ? '📸' : '🎵';
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  const embed = {
    title: '🎉 Nouvelle Commande !',
    color: 0x8B5CF6, // Purple
    fields: [
      {
        name: '📧 Email',
        value: email,
        inline: true,
      },
      {
        name: '👤 Username',
        value: `@${username}`,
        inline: true,
      },
      {
        name: `${platformEmoji} Plateforme`,
        value: platformName,
        inline: true,
      },
      {
        name: '👥 Followers',
        value: `+${followers.toLocaleString()}`,
        inline: true,
      },
      {
        name: '💰 Prix',
        value: price,
        inline: true,
      },
      {
        name: '🆔 Order ID',
        value: `\`${orderId}\``,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'SocialOura',
    },
  };

  // Add promo code field if used
  if (promoCode) {
    embed.fields.push({
      name: '🏷️ Code Promo',
      value: promoCode,
      inline: true,
    });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error('Discord webhook error:', response.status, response.statusText);
      return { success: false, error: `Discord error: ${response.status}` };
    }

    console.log('Discord notification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    return { success: false, error };
  }
}

export async function sendDiscordFunnelOrderNotification({
  orderId,
  email,
  username,
  totalPrice,
  services,
  isNewCustomer,
  customerOrderNumber,
}: FunnelOrderNotificationProps) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not configured. Discord notifications will not be sent.');
    return { success: false, error: 'Discord webhook not configured' };
  }

  // Build service lines for the description
  const serviceLines: string[] = [];
  services.forEach((service) => {
    const emoji = SERVICE_EMOJI[service.type] || '📦';
    const label = SERVICE_LABEL[service.type] || service.type;
    serviceLines.push(`${emoji} **${service.quantity.toLocaleString()} ${label}** — ${service.price.toFixed(2)} €`);

    // If distributable (likes/views) with post distribution, list each post
    if (service.distribution && service.distribution.length > 0) {
      service.distribution.forEach((dist) => {
        const postUrl = dist.shortcode
          ? `https://www.instagram.com/p/${dist.shortcode}/`
          : `Post ${dist.postId}`;
        serviceLines.push(`  └ ${dist.quantityAllocated} ${label} sur ${postUrl}`);
      });
    }
  });

  const embed = {
    title: '🚀 Nouvelle Commande Tunnel !',
    color: 0xD946EF, // Fuchsia
    description: serviceLines.join('\n'),
    fields: [
      {
        name: '👤 Compte ciblé',
        value: `[@${username}](https://www.instagram.com/${username}/)`,
        inline: true,
      },
      {
        name: '📧 Email',
        value: email || '-',
        inline: true,
      },
      {
        name: '💰 Total',
        value: `**${totalPrice}**`,
        inline: true,
      },
      {
        name: '🆔 Order ID',
        value: `\`${orderId}\``,
        inline: true,
      },
      {
        name: '🔄 Client',
        value: isNewCustomer ? '🆕 Nouveau client' : `🔁 Client fidèle (${customerOrderNumber}ème commande)`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'SocialOura — Tunnel',
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error('Discord webhook error:', response.status, response.statusText);
      return { success: false, error: `Discord error: ${response.status}` };
    }

    console.log('Discord funnel notification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending Discord funnel notification:', error);
    return { success: false, error };
  }
}

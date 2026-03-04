'use client';

import Image from 'next/image';
import { Instagram, Heart, Eye, UserPlus, Tv, ExternalLink } from 'lucide-react';

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

interface FunnelData {
  username: string;
  avatarUrl: string;
  services: FunnelService[];
}

interface FunnelOrderSummaryProps {
  funnelData: FunnelData;
}

const SERVICE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  followers: { label: 'Abonnés', icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  likes: { label: 'Likes', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  views: { label: 'Vues', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'story-views': { label: 'Vues de story', icon: Tv, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
};

export default function FunnelOrderSummary({ funnelData }: FunnelOrderSummaryProps) {
  if (!funnelData || !funnelData.services) return null;

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          {funnelData.avatarUrl ? (
            <Image src={funnelData.avatarUrl} alt={funnelData.username} width={40} height={40} className="w-full h-full object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Instagram className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Instagram className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">@{funnelData.username}</span>
          </div>
          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400">
            APP FUNNEL
          </span>
        </div>
      </div>

      {/* Services */}
      {funnelData.services.map((service, idx) => {
        const config = SERVICE_CONFIG[service.type] || { label: service.type, icon: Eye, color: 'text-gray-600', bg: 'bg-gray-100' };
        const Icon = config.icon;
        const hasDistribution = service.distribution && service.distribution.length > 0;

        return (
          <div key={idx} className="space-y-2">
            {/* Service header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {service.quantity.toLocaleString()} {config.label}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {service.price.toFixed(2)} €
              </span>
            </div>

            {/* Distribution grid for likes/views */}
            {hasDistribution && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-9">
                {service.distribution!.map((dist, dIdx) => (
                  <div key={dIdx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {/* Post thumbnail */}
                    <div className="aspect-square relative">
                      {dist.imageUrl ? (
                        <Image src={dist.imageUrl} alt={`Post ${dist.shortcode}`} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      {/* Overlay with quantity badge */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                    {/* Info bar */}
                    <div className="p-1.5 flex items-center justify-between gap-1">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${config.bg} ${config.color}`}>
                        <Icon className="w-2.5 h-2.5" />
                        {dist.quantityAllocated.toLocaleString()}
                      </span>
                      {dist.shortcode && (
                        <a
                          href={`https://www.instagram.com/p/${dist.shortcode}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-pink-500 transition-colors"
                          title="Voir sur Instagram"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Non-distributable services (followers, story-views) → just show username target */}
            {!hasDistribution && (service.type === 'followers' || service.type === 'story-views') && (
              <p className="text-xs text-gray-500 dark:text-gray-400 pl-9">
                Cible : @{funnelData.username}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

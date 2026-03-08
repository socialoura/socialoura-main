'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import Image from 'next/image';
import { X, UserPlus, Heart, Eye, Share2, Sparkles, ArrowRight } from 'lucide-react';
import posthog from 'posthog-js';
import useTiktokUpsellStore, { TiktokServiceType } from '@/store/useTiktokUpsellStore';
import { proxyImageUrl } from '@/lib/image-proxy';
import { type Language } from '@/i18n/config';
import { getTiktokUpsellTranslations } from '@/i18n/tiktok-upsell';

type PricingTier = {
  qty: number;
  price: number;
  oldPrice: number;
  bonus: number;
};

const DEFAULT_PRICING: Record<string, PricingTier[]> = {
  followers: [
    { qty: 100, price: 2.59, oldPrice: 9.99, bonus: 10 },
    { qty: 250, price: 5.09, oldPrice: 19.99, bonus: 25 },
    { qty: 500, price: 9.99, oldPrice: 39.99, bonus: 50 },
    { qty: 1000, price: 17.99, oldPrice: 69.99, bonus: 100 },
    { qty: 2500, price: 39.99, oldPrice: 149.99, bonus: 250 },
  ],
  likes: [
    { qty: 100, price: 2.59, oldPrice: 9.99, bonus: 10 },
    { qty: 250, price: 4.99, oldPrice: 19.99, bonus: 25 },
    { qty: 500, price: 8.99, oldPrice: 29.99, bonus: 50 },
    { qty: 1000, price: 15.99, oldPrice: 59.99, bonus: 100 },
    { qty: 2500, price: 34.99, oldPrice: 129.99, bonus: 250 },
  ],
  views: [
    { qty: 500, price: 1.99, oldPrice: 9.99, bonus: 50 },
    { qty: 1000, price: 3.49, oldPrice: 14.99, bonus: 100 },
    { qty: 2500, price: 7.99, oldPrice: 34.99, bonus: 250 },
    { qty: 5000, price: 14.99, oldPrice: 59.99, bonus: 500 },
    { qty: 10000, price: 27.99, oldPrice: 99.99, bonus: 1000 },
  ],
  shares: [
    { qty: 100, price: 3.99, oldPrice: 14.99, bonus: 10 },
    { qty: 250, price: 8.99, oldPrice: 34.99, bonus: 25 },
    { qty: 500, price: 16.99, oldPrice: 59.99, bonus: 50 },
    { qty: 1000, price: 29.99, oldPrice: 99.99, bonus: 100 },
  ],
};

type ServiceConfig = {
  type: TiktokServiceType | 'shares';
  label: string;
  icon: React.ElementType;
  pricing: PricingTier[];
};

function buildServices(pricingData: Record<string, PricingTier[]>, svcT: { followers: string; likes: string; views: string; shares: string }): ServiceConfig[] {
  return [
    { type: 'followers', label: svcT.followers, icon: UserPlus, pricing: pricingData.followers || DEFAULT_PRICING.followers },
    { type: 'likes', label: svcT.likes, icon: Heart, pricing: pricingData.likes || DEFAULT_PRICING.likes },
    { type: 'views', label: svcT.views, icon: Eye, pricing: pricingData.views || DEFAULT_PRICING.views },
    { type: 'shares', label: svcT.shares, icon: Share2, pricing: pricingData.shares || DEFAULT_PRICING.shares },
  ];
}

interface ServiceSelectorProps {
  lang: Language;
}

function TiktokServiceSelector({ lang }: ServiceSelectorProps) {
  const t = getTiktokUpsellTranslations(lang);
  const {
    username,
    avatarUrl,
    fullName,
    setSelectedService,
    setQuantity,
    setPrice,
    resetProfile,
  } = useTiktokUpsellStore();

  const [SERVICES, setServices] = useState<ServiceConfig[]>(() => buildServices(DEFAULT_PRICING, t.service));
  const [, setPricingLoaded] = useState(false);
  const [defaultsLoaded, setDefaultsLoaded] = useState(false);

  // Initialize with empty values to prevent visual jump before step 2
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});

  useEffect(() => {
    // Only initialize when component is actually visible (step 2)
    // This prevents sliders from moving when user is on previous steps
    const initializeServices = async () => {
      try {
        const pricingRes = await fetch('/api/funnel-pricing');
        let pricingData = DEFAULT_PRICING;
        if (pricingRes.ok) {
          const raw = await pricingRes.json();
          // Use TikTok pricing if available, otherwise fallback to Instagram pricing
          pricingData = { ...DEFAULT_PRICING, ...raw };
          setServices(buildServices(pricingData, t.service));
        }

        // Only fetch and apply defaults if they haven't been loaded yet
        if (!defaultsLoaded) {
          const defaultsRes = await fetch('/api/funnel-defaults');
          if (defaultsRes.ok) {
            const defaultsData = await defaultsRes.json();
            // Map story-views defaults to shares for TikTok
            const tiktokDefaults: Record<string, number> = {
              followers: defaultsData.followers ?? 1,
              likes: defaultsData.likes ?? 1,
              views: defaultsData.views ?? 0,
              shares: defaultsData['story-views'] ?? defaultsData.shares ?? 0,
            };
            
            // Update store defaults first
            setSliderDefaults(tiktokDefaults);
            setSliderValues(tiktokDefaults);
            setDefaultsLoaded(true);

            const { addServiceToCart } = useTiktokUpsellStore.getState();
            const builtServices = buildServices(pricingData, t.service);

            Object.entries(tiktokDefaults).forEach(([serviceType, tierIndex]) => {
              if (typeof tierIndex === 'number' && tierIndex > 0) {
                const service = builtServices.find(s => s.type === serviceType);
                if (service && service.pricing[tierIndex]) {
                  const tier = service.pricing[tierIndex];
                  addServiceToCart(serviceType, tier.qty, tier.price);

                  if (serviceType !== 'shares') {
                    setSelectedService(serviceType as TiktokServiceType);
                    setQuantity(tier.qty);
                    setPrice(tier.price);
                  }
                }
              }
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch funnel config:', err);
      } finally {
        setPricingLoaded(true);
        if (!defaultsLoaded) setDefaultsLoaded(true);
      }
    };

    // Use a small delay to ensure the component is fully mounted and visible
    const timeoutId = setTimeout(initializeServices, 100);
    
    return () => clearTimeout(timeoutId);
  }, [defaultsLoaded, setPrice, setQuantity, setSelectedService, t.service]);

  const [localSliderValues, setLocalSliderValues] = useState(sliderValues);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setLocalSliderValues(sliderValues);
  }, [sliderValues]);

  const commitSliderValue = useCallback((service: ServiceConfig, index: number) => {
    isDraggingRef.current = false;
    setSliderValues(prev => ({ ...prev, [service.type]: index }));
    const { addServiceToCart, removeServiceFromCart } = useTiktokUpsellStore.getState();
    if (index > 0) {
      const tier = service.pricing[index];
      addServiceToCart(service.type, tier.qty, tier.price);
      if (service.type !== 'shares') {
        setSelectedService(service.type as TiktokServiceType);
        setQuantity(tier.qty);
        setPrice(tier.price);
      }
      posthog.capture('tiktok_step2_service_selected', { service_type: service.type, target_platform: 'tiktok' });
      posthog.capture('tiktok_step2_quantity_adjusted', { service_type: service.type, quantity: tier.qty, price: tier.price, target_platform: 'tiktok' });
    } else {
      removeServiceFromCart(service.type);
    }
  }, [setSelectedService, setQuantity, setPrice]);

  const handleSliderInput = useCallback((service: ServiceConfig, index: number) => {
    isDraggingRef.current = true;
    setLocalSliderValues(prev => ({ ...prev, [service.type]: index }));
  }, []);

  const getCurrentTier = useCallback((service: ServiceConfig, overrideIndex?: number) => {
    const index = overrideIndex ?? localSliderValues[service.type];
    if (index === 0) return { qty: 0, price: 0, oldPrice: 0, bonus: 0 };
    return service.pricing[index];
  }, [localSliderValues]);

  const calculateTotal = useCallback(() => {
    let total = 0;
    let oldTotal = 0;
    SERVICES.forEach(service => {
      const index = localSliderValues[service.type];
      if (index > 0) {
        const tier = service.pricing[index];
        total += tier.price;
        oldTotal += tier.oldPrice;
      }
    });
    return { total, oldTotal, savings: oldTotal - total };
  }, [SERVICES, localSliderValues]);

  const { total: totalPrice, savings } = calculateTotal();
  const hasActiveServices = SERVICES.some(s => localSliderValues[s.type] > 0);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
      {/* Profile Header Block */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 sm:mb-12 bg-gray-900/50 sm:backdrop-blur-xl border border-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-800 ring-2 ring-cyan-500/50">
              <Image
                src={proxyImageUrl(avatarUrl) || `https://ui-avatars.com/api/?name=${username}&background=random&size=64`}
                alt={username}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">@{username}</h2>
            {fullName && <p className="text-sm text-gray-400">{fullName}</p>}
          </div>
        </div>
        <button
          onClick={resetProfile}
          className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-cyan-500/10"
        >
          <X className="w-4 h-4" />
          {t.service.changeProfile}
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-1 sm:mb-2">{t.service.selectServices}</h2>
        <p className="text-sm sm:text-base text-gray-400">{t.service.selectServicesDesc}</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-28 sm:pb-32">
        {SERVICES.map((service) => {
          const localIndex = localSliderValues[service.type];
          const tier = getCurrentTier(service, localIndex);
          const isActive = localIndex > 0;
          const Icon = service.icon;
          const pct = (localIndex / (service.pricing.length - 1)) * 100;

          return (
            <div
              key={service.type}
              className={`relative overflow-visible sm:overflow-hidden rounded-2xl p-4 sm:p-8 transition-colors duration-200 ${
                isActive
                  ? 'bg-gray-800/80 sm:backdrop-blur-xl border border-cyan-500/50 shadow-lg'
                  : 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-pink-500/5 to-red-500/5 pointer-events-none" />
              )}

              {service.type === 'followers' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-3 sm:left-auto sm:right-3 sm:translate-x-0 sm:translate-y-0 z-20 border border-cyan-500/50 text-cyan-400 bg-gray-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {t.service.mostPopular}
                </div>
              )}

              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                      isActive
                        ? 'bg-gradient-to-tr from-cyan-500 via-pink-500 to-red-500'
                        : 'bg-gray-800'
                    }`}>
                      <Icon className={`w-6 h-6 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {service.label}
                      </h3>
                      <p className={`text-sm font-medium transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`}>
                        {isActive ? `${tier.qty.toLocaleString()} ${t.service.selected}` : '0 ' + t.service.selected}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-black tracking-tight transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {isActive ? tier.price.toFixed(2) : '0.00'} €
                    </div>
                    {isActive && tier.oldPrice > tier.price && (
                      <div className="text-sm font-medium text-gray-500 line-through">{tier.oldPrice.toFixed(2)} €</div>
                    )}
                  </div>
                </div>

                {isActive && tier.bonus > 0 && (
                  <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-bold text-green-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    +{tier.bonus.toLocaleString()} {t.service.bonusFree}
                  </div>
                )}

                {/* Slider */}
                <div
                  className="mt-2 select-none touch-none py-4"
                  style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none', touchAction: 'none' }}
                >
                  <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-visible flex items-center">
                    <input
                      type="range"
                      min="0"
                      max={service.pricing.length - 1}
                      step="1"
                      value={localIndex}
                      onChange={(e) => handleSliderInput(service, parseInt(e.target.value))}
                      onPointerUp={(e) => commitSliderValue(service, parseInt((e.target as HTMLInputElement).value))}
                      onMouseUp={(e) => commitSliderValue(service, parseInt((e.target as HTMLInputElement).value))}
                      onTouchEnd={(e) => commitSliderValue(service, parseInt((e.target as HTMLInputElement).value))}
                      draggable={false}
                      className="absolute w-full opacity-0 cursor-pointer z-20 touch-none select-none"
                      style={{ touchAction: 'none', height: '44px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <div
                      className={`absolute left-0 h-full rounded-full pointer-events-none ${isActive ? 'bg-gradient-to-r from-cyan-500 to-pink-500' : 'bg-gray-700'}`}
                      style={{ width: `${pct}%` }}
                    />
                    <div
                      className={`absolute w-6 h-6 -ml-3 rounded-full pointer-events-none flex items-center justify-center ${
                        isActive ? 'bg-white shadow-md scale-110' : 'bg-gray-400 scale-100'
                      }`}
                      style={{ left: `${pct}%` }}
                    >
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-500' : 'bg-gray-600'}`} />
                    </div>
                  </div>

                  <div className="flex justify-between mt-4 px-1">
                    {service.pricing.map((t, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className={`w-1 h-1 rounded-full ${idx <= localIndex ? 'bg-cyan-500/50' : 'bg-gray-800'}`} />
                        <span className={`text-[10px] font-bold ${idx <= localIndex ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t.qty >= 1000 ? `${t.qty / 1000}k` : t.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Solid Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-100 border-t border-gray-800 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-6 sm:pb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-6 w-full sm:w-auto">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-400 mb-0.5">{t.service.orderTotal}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-white tracking-tight">{totalPrice.toFixed(2)} €</span>
                {savings > 0 && (
                  <span className="text-xs font-bold text-green-400 line-through opacity-70">{(totalPrice + savings).toFixed(2)} €</span>
                )}
              </div>
            </div>
          </div>

          <button
            disabled={!hasActiveServices}
            onClick={() => {
              if (!hasActiveServices) return;
              const { addServiceToCart, removeServiceFromCart, nextStep } = useTiktokUpsellStore.getState();
              SERVICES.forEach((service) => {
                const index = localSliderValues[service.type];
                const tier = service.pricing[index];
                if (index > 0) {
                  addServiceToCart(service.type, tier.qty, tier.price);
                } else {
                  removeServiceFromCart(service.type);
                }
              });
              const activeServices = SERVICES.filter(s => localSliderValues[s.type] > 0);
              const primaryService = activeServices.find(s => s.type !== 'shares') || activeServices[0];
              posthog.capture('tiktok_step2_completed', {
                final_service: primaryService?.type || 'unknown',
                final_quantity: primaryService ? primaryService.pricing[localSliderValues[primaryService.type]].qty : 0,
                total_price: totalPrice,
                target_platform: 'tiktok',
              });
              nextStep();
            }}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 via-pink-500 to-red-500 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg hover:opacity-90 transition-opacity duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{t.service.continueOrder}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(TiktokServiceSelector);

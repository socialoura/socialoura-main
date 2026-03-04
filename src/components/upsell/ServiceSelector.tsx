'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Heart, Eye, Tv, Sparkles, ArrowRight } from 'lucide-react';
import useUpsellStore, { ServiceType } from '@/store/useUpsellStore';

type PricingTier = {
  qty: number;
  price: number;
  oldPrice: number;
  bonus: number;
};

// Fallback defaults (used while API loads or if it fails)
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
  'story-views': [
    { qty: 1000, price: 3.99, oldPrice: 14.99, bonus: 100 },
    { qty: 2500, price: 8.99, oldPrice: 34.99, bonus: 250 },
    { qty: 5000, price: 16.99, oldPrice: 59.99, bonus: 500 },
    { qty: 10000, price: 29.99, oldPrice: 99.99, bonus: 1000 },
  ],
};

type ServiceConfig = {
  type: ServiceType | 'story-views';
  label: string;
  icon: React.ElementType;
  pricing: PricingTier[];
};

function buildServices(pricingData: Record<string, PricingTier[]>): ServiceConfig[] {
  return [
    { type: 'followers', label: 'Abonnés', icon: UserPlus, pricing: pricingData.followers || DEFAULT_PRICING.followers },
    { type: 'likes', label: 'Likes', icon: Heart, pricing: pricingData.likes || DEFAULT_PRICING.likes },
    { type: 'views', label: 'Vues', icon: Eye, pricing: pricingData.views || DEFAULT_PRICING.views },
    { type: 'story-views', label: 'Vues de story', icon: Tv, pricing: pricingData['story-views'] || DEFAULT_PRICING['story-views'] },
  ];
}

export default function ServiceSelector() {
  const {
    username,
    avatarUrl,
    fullName,
    selectedService,
    quantity,
    setSelectedService,
    setQuantity,
    setPrice,
    resetProfile,
  } = useUpsellStore();

  const [SERVICES, setServices] = useState<ServiceConfig[]>(() => buildServices(DEFAULT_PRICING));
  const [pricingLoaded, setPricingLoaded] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/funnel-pricing');
        if (res.ok) {
          const data = await res.json();
          setServices(buildServices(data));
        }
      } catch (err) {
        console.error('Failed to fetch funnel pricing, using defaults:', err);
      } finally {
        setPricingLoaded(true);
      }
    };
    fetchPricing();
  }, []);

  const [sliderValues, setSliderValues] = useState<Record<string, number>>({
    followers: 1,
    likes: 1,
    views: 0,
    'story-views': 0,
  });

  const handleSliderChange = (service: ServiceConfig, index: number) => {
    const tier = service.pricing[index];
    setSliderValues(prev => ({ ...prev, [service.type]: index }));
    const { addServiceToCart, removeServiceFromCart } = useUpsellStore.getState();
    if (index > 0) {
      addServiceToCart(service.type, tier.qty, tier.price);
      if (service.type !== 'story-views') {
        setSelectedService(service.type as ServiceType);
        setQuantity(tier.qty);
        setPrice(tier.price);
      }
    } else {
      removeServiceFromCart(service.type);
    }
  };

  const getCurrentTier = (service: ServiceConfig) => {
    return service.pricing[sliderValues[service.type]];
  };

  const calculateTotal = () => {
    let total = 0;
    let oldTotal = 0;
    SERVICES.forEach(service => {
      const index = sliderValues[service.type];
      if (index > 0) {
        const tier = service.pricing[index];
        total += tier.price;
        oldTotal += tier.oldPrice;
      }
    });
    return { total, oldTotal, savings: oldTotal - total };
  };

  const { total: totalPrice, savings } = calculateTotal();
  const hasActiveServices = SERVICES.some(s => sliderValues[s.type] > 0);
  const activeCount = SERVICES.filter(s => sliderValues[s.type] > 0).length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
      {/* Profile Header Block */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 sm:mb-12 bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-800 ring-2 ring-pink-500/50">
              <img
                src={avatarUrl || `https://ui-avatars.com/api/?name=${username}&background=random&size=64`}
                alt={username}
                className="w-full h-full object-cover"
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
          className="text-sm font-medium text-gray-400 hover:text-pink-400 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-pink-500/10"
        >
          <X className="w-4 h-4" />
          Changer de profil
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Sélectionnez vos services</h2>
        <p className="text-gray-400">Ajustez les curseurs pour composer votre pack sur-mesure</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32">
        {SERVICES.map((service, i) => {
          const tier = getCurrentTier(service);
          const sliderIndex = sliderValues[service.type];
          const isActive = sliderIndex > 0;
          const Icon = service.icon;
          const pct = (sliderIndex / (service.pricing.length - 1)) * 100;

          return (
            <motion.div
              key={service.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 transition-all duration-500 ${
                isActive
                  ? 'bg-gray-800/80 backdrop-blur-xl border border-pink-500/50 shadow-2xl shadow-pink-500/10'
                  : 'bg-gray-900/50 backdrop-blur-xl border border-gray-800 hover:border-gray-700'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-pink-500/5 to-purple-500/5 pointer-events-none" />
              )}
              
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      isActive 
                        ? 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 shadow-lg shadow-pink-500/30' 
                        : 'bg-gray-800'
                    }`}>
                      <Icon className={`w-6 h-6 transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {service.label}
                      </h3>
                      <p className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-pink-400' : 'text-gray-500'}`}>
                        {tier.qty.toLocaleString()} sélectionnés
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-black tracking-tight transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {tier.price.toFixed(2)} €
                    </div>
                    {isActive && tier.oldPrice > tier.price && (
                      <div className="text-sm font-medium text-gray-500 line-through">
                        {tier.oldPrice.toFixed(2)} €
                      </div>
                    )}
                  </div>
                </div>

                {isActive && tier.bonus > 0 && (
                  <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-bold text-green-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    +{tier.bonus.toLocaleString()} bonus offerts
                  </div>
                )}

                {/* Slider */}
                <div className="mt-2">
                  <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-visible flex items-center">
                    <input
                      type="range"
                      min="0"
                      max={service.pricing.length - 1}
                      step="1"
                      value={sliderIndex}
                      onChange={(e) => handleSliderChange(service, parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    {/* Track fill */}
                    <div 
                      className={`absolute left-0 h-full rounded-full pointer-events-none transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gray-700'}`}
                      style={{ width: `${pct}%` }}
                    />
                    {/* Custom thumb */}
                    <div 
                      className={`absolute w-6 h-6 -ml-3 rounded-full pointer-events-none transition-all duration-300 flex items-center justify-center ${
                        isActive ? 'bg-white shadow-[0_0_15px_rgba(236,72,153,0.5)] scale-110' : 'bg-gray-400 scale-100'
                      }`}
                      style={{ left: `${pct}%` }}
                    >
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-pink-500' : 'bg-gray-600'}`} />
                    </div>
                  </div>
                  
                  {/* Ticks */}
                  <div className="flex justify-between mt-4 px-1">
                    {service.pricing.map((t, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${idx <= sliderIndex ? 'bg-pink-500/50' : 'bg-gray-800'}`} />
                        <span className={`text-[10px] font-bold transition-colors duration-300 ${idx <= sliderIndex ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t.qty >= 1000 ? `${t.qty / 1000}k` : t.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Solid Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-100 border-t border-gray-800 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6 w-full sm:w-auto">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-0.5">Total de votre commande</p>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-white tracking-tight">{totalPrice.toFixed(2)} €</span>
                {savings > 0 && (
                  <span className="text-xs font-bold text-green-400 line-through opacity-70">
                    {(totalPrice + savings).toFixed(2)} €
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            disabled={!hasActiveServices}
            onClick={() => {
              if (!hasActiveServices) return;
              const { addServiceToCart, removeServiceFromCart, nextStep } = useUpsellStore.getState();
              SERVICES.forEach((service) => {
                const index = sliderValues[service.type];
                const tier = service.pricing[index];
                if (index > 0) {
                  addServiceToCart(service.type, tier.qty, tier.price);
                } else {
                  removeServiceFromCart(service.type);
                }
              });
              nextStep();
            }}
            className="w-full sm:w-auto relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 uppercase tracking-wide group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="relative z-10">Continuer l&apos;achat</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

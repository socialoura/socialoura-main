'use client';

import dynamic from 'next/dynamic';
import { Language } from '@/i18n/config';
import HeroSection from '@/components/HeroSection';
import TrustBadges from '@/components/TrustBadges';
import PricingCards from '@/components/PricingCards';
import FAQSection from '@/components/FAQSection';

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false });
const ReviewsSection = dynamic(() => import('@/components/ReviewsSection'));

interface PageProps {
  params: { lang: string };
}

export default function HomePage({ params }: PageProps) {
  const lang = params.lang as Language;
  
  return (
    <div className="bg-white">
      {/* Hero Section with Interactive Service Switcher */}
      <HeroSection lang={lang} />

      {/* Trust Badges & Payment Methods */}
      <TrustBadges lang={lang} />

      {/* Pricing Cards with Psychology */}
      <PricingCards lang={lang} />

      {/* Reviews Section */}
      <ReviewsSection lang={lang} platform="all" />

      {/* FAQ Section */}
      <FAQSection lang={lang} />

      {/* Chat Widget */}
      <ChatWidget lang={lang} />
    </div>
  );
}

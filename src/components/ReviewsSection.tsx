'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '@/i18n/config';

interface ReviewsSectionProps {
  lang: Language;
  platform?: 'instagram' | 'tiktok' | 'twitter' | 'all';
}

interface Review {
  id: number;
  name: string;
  username: string;
  avatar: string;
  rating: number;
  platform: 'instagram' | 'tiktok' | 'twitter';
  followers: string;
  text: {
    en: string;
    fr: string;
    de: string;
  };
  date: string;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'Sarah M.',
    username: '@sarahcreates',
    avatar: 'SM',
    rating: 5,
    platform: 'instagram',
    followers: '+2,500',
    text: {
      en: 'Incredible service! I was skeptical at first, but the results exceeded my expectations. My engagement has increased significantly and the followers look completely organic. Highly recommend!',
      fr: 'Service incroyable ! J\'étais sceptique au début, mais les résultats ont dépassé mes attentes. Mon engagement a considérablement augmenté et les abonnés semblent totalement organiques. Je recommande vivement !',
      de: 'Unglaublicher Service! Anfangs war ich skeptisch, aber die Ergebnisse haben meine Erwartungen übertroffen. Mein Engagement ist deutlich gestiegen und die Follower sehen völlig organisch aus. Sehr empfehlenswert!',
    },
    date: '2 days ago',
    verified: true,
  },
  {
    id: 2,
    name: 'Marcus J.',
    username: '@marcusfit',
    avatar: 'MJ',
    rating: 5,
    platform: 'instagram',
    followers: '+5,000',
    text: {
      en: 'As a fitness influencer, I needed real growth. SocialOura delivered exactly that. The delivery was gradual and natural-looking. My brand partnerships have increased since using their service.',
      fr: 'En tant qu\'influenceur fitness, j\'avais besoin d\'une vraie croissance. SocialOura a livré exactement cela. La livraison était progressive et naturelle. Mes partenariats de marque ont augmenté depuis.',
      de: 'Als Fitness-Influencer brauchte ich echtes Wachstum. SocialOura hat genau das geliefert. Die Lieferung war schrittweise und natürlich. Meine Markenpartnerschaften sind seitdem gestiegen.',
    },
    date: '1 week ago',
    verified: true,
  },
  {
    id: 3,
    name: 'Emma L.',
    username: '@emmalooks',
    avatar: 'EL',
    rating: 5,
    platform: 'tiktok',
    followers: '+10,000',
    text: {
      en: 'Started with 500 followers on TikTok, now I\'m at 15K! The growth was steady and my videos started getting way more views. Best investment for my content creator journey.',
      fr: 'J\'ai commencé avec 500 abonnés sur TikTok, maintenant j\'en ai 15K ! La croissance était régulière et mes vidéos ont commencé à avoir beaucoup plus de vues. Meilleur investissement pour ma carrière de créatrice.',
      de: 'Angefangen mit 500 Followern auf TikTok, jetzt bin ich bei 15K! Das Wachstum war stetig und meine Videos bekamen viel mehr Aufrufe. Beste Investition für meine Creator-Karriere.',
    },
    date: '3 days ago',
    verified: true,
  },
  {
    id: 4,
    name: 'David K.',
    username: '@davidkphoto',
    avatar: 'DK',
    rating: 5,
    platform: 'instagram',
    followers: '+1,000',
    text: {
      en: 'Professional photography account needed a boost. Got exactly what I paid for, delivered on time. The support team was super helpful when I had questions. Will order again!',
      fr: 'Mon compte de photographie professionnelle avait besoin d\'un coup de pouce. J\'ai eu exactement ce pour quoi j\'ai payé, livré à temps. L\'équipe support était super utile. Je commanderai à nouveau !',
      de: 'Mein professionelles Fotografie-Konto brauchte einen Schub. Genau das bekommen, wofür ich bezahlt habe, pünktlich geliefert. Das Support-Team war super hilfreich. Werde wieder bestellen!',
    },
    date: '5 days ago',
    verified: true,
  },
  {
    id: 5,
    name: 'Lisa T.',
    username: '@lisatravels',
    avatar: 'LT',
    rating: 5,
    platform: 'tiktok',
    followers: '+3,000',
    text: {
      en: 'My travel content finally getting the attention it deserves! The followers are real and engaging with my posts. Customer service responded within hours. Amazing experience overall.',
      fr: 'Mon contenu voyage reçoit enfin l\'attention qu\'il mérite ! Les abonnés sont réels et interagissent avec mes posts. Le service client a répondu en quelques heures. Expérience incroyable !',
      de: 'Mein Reise-Content bekommt endlich die Aufmerksamkeit, die er verdient! Die Follower sind echt und interagieren mit meinen Beiträgen. Der Kundenservice hat innerhalb von Stunden geantwortet. Tolle Erfahrung!',
    },
    date: '1 week ago',
    verified: true,
  },
  {
    id: 6,
    name: 'Alex R.',
    username: '@alexrmusic',
    avatar: 'AR',
    rating: 5,
    platform: 'tiktok',
    followers: '+7,500',
    text: {
      en: 'As a musician, visibility is everything. SocialOura helped me reach new audiences. My music clips are now getting shared more than ever. The growth feels completely natural!',
      fr: 'En tant que musicien, la visibilité est primordiale. SocialOura m\'a aidé à atteindre de nouveaux publics. Mes clips sont maintenant partagés plus que jamais. La croissance semble totalement naturelle !',
      de: 'Als Musiker ist Sichtbarkeit alles. SocialOura hat mir geholfen, neues Publikum zu erreichen. Meine Musikclips werden jetzt mehr geteilt als je zuvor. Das Wachstum fühlt sich völlig natürlich an!',
    },
    date: '4 days ago',
    verified: true,
  },
  {
    id: 7,
    name: 'Nina P.',
    username: '@ninabeauty',
    avatar: 'NP',
    rating: 5,
    platform: 'instagram',
    followers: '+4,000',
    text: {
      en: 'Beauty brands started noticing me after my follower count grew! The process was seamless and secure. No password needed, just my username. Super safe and effective.',
      fr: 'Les marques de beauté ont commencé à me remarquer après la croissance de mes abonnés ! Le processus était fluide et sécurisé. Pas de mot de passe requis, juste mon nom d\'utilisateur. Super sûr et efficace.',
      de: 'Beauty-Marken begannen mich zu bemerken, nachdem meine Followerzahl gewachsen ist! Der Prozess war nahtlos und sicher. Kein Passwort nötig, nur mein Benutzername. Super sicher und effektiv.',
    },
    date: '6 days ago',
    verified: true,
  },
  {
    id: 8,
    name: 'Tom H.',
    username: '@tomhcooks',
    avatar: 'TH',
    rating: 5,
    platform: 'instagram',
    followers: '+2,000',
    text: {
      en: 'Food blogger here! My recipes are reaching so many more people now. The engagement on my posts has doubled. Worth every penny. Thank you SocialOura!',
      fr: 'Blogueur culinaire ici ! Mes recettes atteignent tellement plus de personnes maintenant. L\'engagement sur mes posts a doublé. Chaque centime en valait la peine. Merci SocialOura !',
      de: 'Food-Blogger hier! Meine Rezepte erreichen jetzt so viel mehr Menschen. Das Engagement auf meinen Beiträgen hat sich verdoppelt. Jeden Cent wert. Danke SocialOura!',
    },
    date: '1 week ago',
    verified: true,
  },
  {
    id: 9,
    name: 'Sarah M.',
    username: '@sarahbuilds',
    avatar: 'SM',
    rating: 5,
    platform: 'twitter',
    followers: '+1,500',
    text: {
      en: 'My posts finally started getting consistent reach. The growth felt natural and my engagement rate improved a lot.',
      fr: 'Mes posts ont enfin commencé à avoir une portée régulière. La croissance semblait naturelle et mon taux d\'engagement a beaucoup augmenté.',
      de: 'Meine Posts haben endlich konstant Reichweite bekommen. Das Wachstum wirkte natürlich und meine Engagement-Rate ist deutlich gestiegen.',
    },
    date: '3 days ago',
    verified: true,
  },
  {
    id: 10,
    name: 'Max K.',
    username: '@maxmarketing',
    avatar: 'MK',
    rating: 5,
    platform: 'twitter',
    followers: '+3,000',
    text: {
      en: 'Perfect for building credibility fast. I saw better interaction on my threads within the first week.',
      fr: 'Parfait pour gagner en crédibilité rapidement. J\'ai vu plus d\'interactions sur mes threads dès la première semaine.',
      de: 'Perfekt, um schnell Glaubwürdigkeit aufzubauen. Schon in der ersten Woche mehr Interaktionen auf meinen Threads.',
    },
    date: '5 days ago',
    verified: true,
  },
  {
    id: 11,
    name: 'Nina P.',
    username: '@ninaproduct',
    avatar: 'NP',
    rating: 5,
    platform: 'twitter',
    followers: '+900',
    text: {
      en: 'Great support and clear process. My audience quality improved and I got more profile visits.',
      fr: 'Super support et process clair. La qualité de mon audience s\'est améliorée et j\'ai eu plus de visites de profil.',
      de: 'Toller Support und klarer Ablauf. Die Qualität meiner Audience wurde besser und ich bekam mehr Profilbesuche.',
    },
    date: '2 weeks ago',
    verified: true,
  },
];

export default function ReviewsSection({ lang, platform = 'all' }: ReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const filteredReviews = platform === 'all' 
    ? reviews 
    : reviews.filter(r => r.platform === platform);

  const hasReviews = filteredReviews.length > 0;

  const content = {
    en: {
      title: 'Loved by Creators Worldwide',
      subtitle: 'Join thousands of satisfied customers who have grown their social media presence with SocialOura',
      verified: 'Verified Purchase',
      followers: 'followers gained',
    },
    fr: {
      title: 'Adoré par les Créateurs du Monde Entier',
      subtitle: 'Rejoignez des milliers de clients satisfaits qui ont développé leur présence sur les réseaux sociaux avec SocialOura',
      verified: 'Achat Vérifié',
      followers: 'abonnés gagnés',
    },
    de: {
      title: 'Beliebt bei Creators weltweit',
      subtitle: 'Schließen Sie sich Tausenden zufriedener Kunden an, die ihre Social-Media-Präsenz mit SocialOura ausgebaut haben',
      verified: 'Verifizierter Kauf',
      followers: 'Follower gewonnen',
    },
  };

  const t = content[lang];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    if (!hasReviews) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredReviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredReviews.length, hasReviews]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [platform, filteredReviews.length]);

  const nextReview = () => {
    setIsAutoPlaying(false);
    if (!hasReviews) return;
    setCurrentIndex((prev) => (prev + 1) % filteredReviews.length);
  };

  const prevReview = () => {
    setIsAutoPlaying(false);
    if (!hasReviews) return;
    setCurrentIndex((prev) => (prev - 1 + filteredReviews.length) % filteredReviews.length);
  };

  // Get visible reviews (3 on desktop, 1 on mobile)
  const getVisibleReviews = () => {
    if (!hasReviews) return [];
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % filteredReviews.length;
      visible.push(filteredReviews[index]);
    }
    return visible;
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                50K+
              </div>
              <div className="text-sm text-gray-500">{lang === 'fr' ? 'Clients Satisfaits' : lang === 'de' ? 'Zufriedene Kunden' : 'Happy Customers'}</div>
            </div>
            <div className="w-px h-12 bg-gray-700" />
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                4.9/5
              </div>
              <div className="text-sm text-gray-500">{lang === 'fr' ? 'Note Moyenne' : lang === 'de' ? 'Durchschnittsbewertung' : 'Average Rating'}</div>
            </div>
            <div className="w-px h-12 bg-gray-700" />
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                10M+
              </div>
              <div className="text-sm text-gray-500">{lang === 'fr' ? 'Abonnés Livrés' : lang === 'de' ? 'Follower geliefert' : 'Followers Delivered'}</div>
            </div>
          </div>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-gray-800/80 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-white transition-all hover:scale-110 hidden lg:flex"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-gray-800/80 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-white transition-all hover:scale-110 hidden lg:flex"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleReviews().map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 ${
                  index === 1 ? 'lg:scale-105 lg:z-10' : 'lg:opacity-90'
                }`}
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-purple-500/20">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    review.platform === 'instagram' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : review.platform === 'tiktok'
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                      : 'bg-gradient-to-br from-gray-600 to-black'
                  }`}>
                    {review.avatar}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{review.name}</h4>
                      {review.verified && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          ✓ {t.verified}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{review.username}</p>
                    
                    {/* Stars */}
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-300 leading-relaxed mb-4">
                  &ldquo;{review.text[lang]}&rdquo;
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                      review.platform === 'instagram'
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-400'
                        : review.platform === 'tiktok'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
                        : 'bg-gradient-to-r from-gray-500/20 to-gray-800/20 text-gray-300'
                    }`}>
                      {review.platform === 'instagram' ? (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram
                        </>
                      ) : review.platform === 'tiktok' ? (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                          TikTok
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          X
                        </>
                      )}
                    </span>
                    <span className="text-sm text-green-400 font-medium">
                      {review.followers} {t.followers}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8 lg:hidden">
            <button
              onClick={prevReview}
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {filteredReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-6 bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextReview}
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{lang === 'fr' ? 'Avis Vérifiés' : lang === 'de' ? 'Verifizierte Bewertungen' : 'Verified Reviews'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{lang === 'fr' ? 'Paiements Sécurisés' : lang === 'de' ? 'Sichere Zahlungen' : 'Secure Payments'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm">{lang === 'fr' ? 'Service 5 Étoiles' : lang === 'de' ? '5-Sterne-Service' : '5-Star Service'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

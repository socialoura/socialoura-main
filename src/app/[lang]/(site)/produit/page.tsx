'use client';

import { useParams } from 'next/navigation';
import ApplePayButton from '@/components/ApplePayButton';

export default function ProduitPage() {
  const params = useParams();
  const lang = (params.lang as 'en' | 'fr' | 'de' | 'es') || 'en';

  const handleSuccess = (paymentIntentId: string) => {
    console.log('Payment succeeded:', paymentIntentId);
  };

  const handleError = (error: string) => {
    console.error('Payment error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-black text-white">
          {lang === 'fr' ? 'Exemple de paiement' : lang === 'de' ? 'Zahlungsbeispiel' : lang === 'es' ? 'Ejemplo de pago' : 'Payment Example'}
        </h1>

        <p className="text-gray-400">
          {lang === 'fr'
            ? 'Testez Apple Pay / Google Pay ci-dessous :'
            : lang === 'de'
              ? 'Testen Sie Apple Pay / Google Pay unten:'
              : lang === 'es'
                ? 'Prueba Apple Pay / Google Pay a continuación:'
                : 'Test Apple Pay / Google Pay below:'}
        </p>

        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 space-y-4">
          <div className="flex justify-between text-white">
            <span className="font-medium">Total</span>
            <span className="font-bold">9,99 €</span>
          </div>

          <ApplePayButton
            amount={9.99}
            currency="eur"
            language={lang}
            onSuccess={handleSuccess}
            onError={handleError}
          />

          <p className="text-xs text-gray-500">
            {lang === 'fr'
              ? 'Apple Pay, Google Pay ou Link s\'affichera automatiquement selon votre appareil.'
              : lang === 'de'
                ? 'Apple Pay, Google Pay oder Link wird je nach Gerät automatisch angezeigt.'
                : lang === 'es'
                  ? 'Apple Pay, Google Pay o Link aparecerá automáticamente según tu dispositivo.'
                  : 'Apple Pay, Google Pay, or Link will appear automatically based on your device.'}
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { X, Check, Copy } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentIntentId: string;
  productName: string;
  amount: number;
  currency: string;
  username: string;
  language?: 'en' | 'fr' | 'de';
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  paymentIntentId,
  productName,
  amount,
  currency,
  username,
  language = 'en',
}: OrderSuccessModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [copied, setCopied] = useState(false);

  const content = {
    en: {
      title: 'Order Confirmed!',
      subtitle: 'Thank you for your purchase',
      orderSummary: 'Order Summary',
      username: 'Username',
      product: 'Product',
      amount: 'Amount',
      paymentId: 'Payment ID',
      copyId: 'Copy ID',
      copied: 'Copied!',
      nextSteps: 'What happens next?',
      step1: 'Your order is being processed',
      step2: 'You will receive a confirmation email shortly',
      step3: 'Results will be visible within 24-48 hours',
      close: 'Close',
    },
    fr: {
      title: 'Commande Confirmée !',
      subtitle: 'Merci pour votre achat',
      orderSummary: 'Résumé de la Commande',
      username: 'Nom d\'utilisateur',
      product: 'Produit',
      amount: 'Montant',
      paymentId: 'ID de Paiement',
      copyId: 'Copier l\'ID',
      copied: 'Copié !',
      nextSteps: 'Prochaines étapes ?',
      step1: 'Votre commande est en cours de traitement',
      step2: 'Vous recevrez un email de confirmation sous peu',
      step3: 'Les résultats seront visibles dans 24-48 heures',
      close: 'Fermer',
    },
    de: {
      title: 'Bestellung bestätigt!',
      subtitle: 'Vielen Dank für Ihren Einkauf',
      orderSummary: 'Bestellübersicht',
      username: 'Benutzername',
      product: 'Produkt',
      amount: 'Betrag',
      paymentId: 'Zahlungs-ID',
      copyId: 'ID kopieren',
      copied: 'Kopiert!',
      nextSteps: 'Nächste Schritte?',
      step1: 'Ihre Bestellung wird bearbeitet',
      step2: 'Sie erhalten in Kürze eine Bestätigungs-E-Mail',
      step3: 'Ergebnisse werden innerhalb von 24-48 Stunden sichtbar',
      close: 'Schließen',
    },
  };

  const t = content[language];

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentIntentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setCopied(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all duration-300 ease-out w-full max-w-md ${
            isAnimating
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t.title}
            </h2>
            <p className="text-green-50">
              {t.subtitle}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-green-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Order Details */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.orderSummary}
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{t.username}</span>
                <span className="font-medium text-gray-900 dark:text-white">@{username}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{t.product}</span>
                <span className="font-medium text-gray-900 dark:text-white">{productName}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{t.amount}</span>
                <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                  {formatAmount(amount, currency)}
                </span>
              </div>

              <div className="py-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t.paymentId}</span>
                  <button
                    onClick={copyToClipboard}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        {t.copyId}
                      </>
                    )}
                  </button>
                </div>
                <code className="block text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded break-all">
                  {paymentIntentId}
                </code>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                {t.nextSteps}
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{t.step1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{t.step2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{t.step3}</span>
                </li>
              </ul>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

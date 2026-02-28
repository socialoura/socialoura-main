import { Language } from '@/i18n/config';
import Image from 'next/image';

interface FooterProps {
  lang: Language;
}

export default function Footer({ lang }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  const footerText = lang === 'fr' 
    ? `© ${currentYear} Socialoura. Tous droits réservés.`
    : lang === 'de'
    ? `© ${currentYear} Socialoura. Alle Rechte vorbehalten.`
    : lang === 'es'
    ? `© ${currentYear} Socialoura. Todos los derechos reservados.`
    : `© ${currentYear} Socialoura. All rights reserved.`;
    
  const linksTitle = lang === 'fr' ? 'Liens rapides' : lang === 'de' ? 'Schnelllinks' : lang === 'es' ? 'Enlaces rápidos' : 'Quick Links';
  const aboutText = lang === 'fr' ? 'À propos' : lang === 'de' ? 'Über uns' : lang === 'es' ? 'Acerca de' : 'About';
  const contactText = lang === 'fr' ? 'Contact' : lang === 'de' ? 'Kontakt' : lang === 'es' ? 'Contacto' : 'Contact';
  const privacyText = lang === 'fr' ? 'Confidentialité' : lang === 'de' ? 'Datenschutz' : lang === 'es' ? 'Privacidad' : 'Privacy';
  const faqText = 'FAQ';
  const instagramText = 'Instagram';
  const tiktokText = 'TikTok';

  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/img/a-modern-flat-vector-logo-design-featuri_ZEbfVp__QiK-0wr5MrgGJg_ZFPYEbSKRM6a11TOK-IQCQ-removebg-preview.png"
                alt="Socialoura Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Socialoura
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {footerText}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {linksTitle}
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href={`/${lang}/i`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {instagramText}
                </a>
              </li>
              <li>
                <a 
                  href={`/${lang}/t`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {tiktokText}
                </a>
              </li>
              <li>
                <a 
                  href={`/${lang}/about`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {aboutText}
                </a>
              </li>
              <li>
                <a 
                  href={`/${lang}/contact`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {contactText}
                </a>
              </li>
              <li>
                <a 
                  href={`/${lang}/privacy`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {privacyText}
                </a>
              </li>
              <li>
                <a 
                  href={`/${lang}/faq`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {faqText}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {lang === 'fr' ? 'Paiement sécurisé' : lang === 'de' ? 'Sichere Zahlung' : lang === 'es' ? 'Pago seguro' : 'Secure Payment'}
            </h4>
            <div className="flex flex-wrap gap-2">
              <Image src="/images/visa.svg" alt="Visa" width={40} height={16} className="h-6 w-auto opacity-70" />
              <Image src="/images/mastercard.svg" alt="Mastercard" width={40} height={24} className="h-7 w-auto opacity-70" />
              <Image src="/images/paypal.svg" alt="PayPal" width={50} height={16} className="h-6 w-auto opacity-70" />
            </div>
            <div className="mt-6">
              <Image src="/images/norton.svg" alt="Norton Secured" width={80} height={32} className="h-8 w-auto opacity-80" />
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            {footerText}
          </p>
        </div>
      </div>
    </footer>
  );
}

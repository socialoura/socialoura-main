import { notFound } from 'next/navigation';
import { isValidLanguage, type Language } from '@/i18n/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface LayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'fr' },
  ];
}

export default function LanguageLayout({ children, params }: LayoutProps) {
  // Validate the language parameter
  if (!isValidLanguage(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} />
      <main className="flex-1">
        {children}
      </main>
      <Footer lang={lang} />
    </div>
  );
}

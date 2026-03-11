import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import PostHogProvider from "@/components/PostHogProvider";
import "./globals.css";

const GA_AW_ID = process.env.NEXT_PUBLIC_GA_AW_ID || '';
const GA_INSTA_FUNNEL_ID = process.env.NEXT_PUBLIC_GA_INSTA_FUNNEL_ID || '';

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Socialoura - Boost Your Social Media Growth",
  description: "Grow your Instagram and TikTok followers with Socialoura. Safe, reliable, and effective social media growth service.",
  keywords: ["social media", "instagram followers", "tiktok followers", "social growth", "socialoura"],
  authors: [{ name: "Socialoura" }],
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        {/* Google Ads Global Site Tag */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_AW_ID || 'AW-17979730701'}`}
          strategy="afterInteractive"
        />
        <Script
          id="google-ads-gtag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${GA_AW_ID ? `gtag('config', '${GA_AW_ID}');` : ''}
              ${GA_INSTA_FUNNEL_ID ? `gtag('config', '${GA_INSTA_FUNNEL_ID}');` : ''}
              gtag('config', 'AW-17979730701');
              gtag('config', 'AW-17964092485');
              gtag('config', 'AW-18009151319');
            `,
          }}
        />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {
                // Default to dark theme if there's an error
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} font-sans antialiased`}
        style={{ backgroundColor: '#0a0a0a', color: '#ededed' }}
      >
        <PostHogProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

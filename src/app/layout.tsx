import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Socialoura - Boost Your Social Media Growth",
  description: "Grow your Instagram and TikTok followers with Socialoura. Safe, reliable, and effective social media growth service.",
  keywords: ["social media", "instagram followers", "tiktok followers", "social growth", "socialoura"],
  authors: [{ name: "Socialoura" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                // Default to dark theme if there's an error
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

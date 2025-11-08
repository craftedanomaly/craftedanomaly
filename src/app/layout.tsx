import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import { MainLayout } from '@/components/layout/main-layout';
import { ThemeProvider } from '@/components/theme-provider';
import { NoSSR } from '@/components/no-ssr';
import { RouteLoaderWrapper } from '@/components/RouteLoaderWrapper';
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Crafted Anomaly | Design Studio",
    template: "%s | Crafted Anomaly"
  },
  description: "A multidisciplinary design studio specializing in visual design, spatial design, films, games, and books. We transform creative visions into tangible experiences.",
  keywords: [
    "design studio",
    "visual design",
    "spatial design", 
    "film production",
    "game design",
    "book design",
    "creative agency",
    "portfolio",
    "crafted anomaly"
  ],
  authors: [{ name: "Crafted Anomaly" }],
  creator: "Crafted Anomaly",
  publisher: "Crafted Anomaly",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://craftedanomaly.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Crafted Anomaly | Design Studio",
    description: "A multidisciplinary design studio specializing in visual design, spatial design, films, games, and books.",
    url: 'https://craftedanomaly.com',
    siteName: 'Crafted Anomaly',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Crafted Anomaly Design Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Crafted Anomaly | Design Studio",
    description: "A multidisciplinary design studio specializing in visual design, spatial design, films, games, and books.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when ready
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=BBH+Sans+Bartle&family=Baloo+2:wght@400..800&family=Fredoka:wght@300..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`} suppressHydrationWarning>
        <NoSSR fallback={<div className="min-h-screen bg-background" />}> 
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <RouteLoaderWrapper />
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
        </NoSSR>
      </body>
    </html>
  );
}

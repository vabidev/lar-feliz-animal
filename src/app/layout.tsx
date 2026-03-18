import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FavoritesProvider } from '@/hooks/use-favorites';
import { GoogleAnalytics } from '@/components/analytics';
import { MotionOrchestrator } from '@/components/animations/motion-orchestrator';
import { PageTransition } from '@/components/animations/page-transition';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://larfelizanimal.com';
const siteName = 'Lar Feliz Animal';
const description =
  'Conectamos corações, um focinho de cada vez. Adote um pet e mude uma vida. Encontre seu amigo para sempre.';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    'adoção de animais',
    'adotar cachorro',
    'adotar gato',
    'abrigos de animais',
    'pets para adoção',
    'resgate animal',
    'adoção responsável',
    'animais abandonados',
    'ONG animais',
    'proteção animal',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: baseUrl,
    title: siteName,
    description,
    siteName,
    images: [
      {
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${siteName} - Adote um amigo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description,
    images: [`${baseUrl}/images/og-image.jpg`],
    creator: '@larfelizanimal',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <FavoritesProvider>
              <MotionOrchestrator />
              <Header />
              <main className="flex-grow">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <Toaster />
            </FavoritesProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

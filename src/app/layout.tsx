import { auth } from '@/auth';
import Providers from '@/components/Providers';
import Navigation from '@/components/navigation/Navigation';
import LoadingProvider from '@/components/providers/LoadingProvider';
import ThemeWrapper from '@/components/ThemeWrapper';
import ConditionalThemeBubble from '@/components/ConditionalThemeBubble';
import ConditionalMainPadding from '@/components/ConditionalMainPadding';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AnnouncementProvider from '@/components/AnnouncementProvider';
import type { Metadata } from 'next';
import './globals.css';
import './theme-overrides.css';

export const metadata: Metadata = {
  title: 'LoveConnect - Find Your Perfect Match',
  description: 'Connect with amazing people who share your values, interests, and dreams. Start your journey to finding true love today.',
  keywords: 'dating, love, relationships, matchmaking, social networking',
  authors: [{ name: 'LoveConnect Team' }],
  openGraph: {
    title: 'LoveConnect - Find Your Perfect Match',
    description: 'Connect with amazing people who share your values, interests, and dreams.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LoveConnect - Find Your Perfect Match',
    description: 'Connect with amazing people who share your values, interests, and dreams.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ec4899',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userId = session?.user?.id || null;
  const profileComplete = session?.user?.profileComplete as boolean;

  return (
    <html lang='en' className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Additional Google Fonts for theme picker */}
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&family=Lato:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&family=Source+Sans+Pro:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Ubuntu:wght@300;400;500;600;700&family=Playfair+Display:wght@300;400;500;600;700&family=Merriweather:wght@300;400;500;600;700&family=Lora:wght@300;400;500;600;700&family=Crimson+Text:wght@300;400;500;600;700&family=Libre+Baskerville:wght@300;400;500;600;700&family=Dancing+Script:wght@300;400;500;600;700&family=Pacifico:wght@300;400;500;600;700&family=Caveat:wght@300;400;500;600;700&family=Kalam:wght@300;400;500;600;700&family=Satisfy:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600;700&family=Source+Code+Pro:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600;700&family=Inconsolata:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        <ThemeWrapper>
          <LoadingProvider>
            <Providers userId={userId} profileComplete={profileComplete}>
              <Navigation />
              <AdminNavigation />
              <ConditionalMainPadding>
                {children}
              </ConditionalMainPadding>
              <ConditionalThemeBubble />
              <AnnouncementProvider />
            </Providers>
          </LoadingProvider>
        </ThemeWrapper>
      </body>
    </html>
  );
}

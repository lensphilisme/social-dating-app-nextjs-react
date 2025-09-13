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
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import './theme-overrides.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

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
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`} suppressHydrationWarning={true}>
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

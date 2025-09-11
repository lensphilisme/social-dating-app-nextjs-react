import { auth } from '@/auth';
import Providers from '@/components/Providers';
import ProfessionalNav from '@/components/navigation/ProfessionalNav';
import LoadingProvider from '@/components/providers/LoadingProvider';
import type { Metadata } from 'next';
import './globals.css';

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
      </head>
      <body className="font-sans antialiased">
        <LoadingProvider>
          <Providers userId={userId} profileComplete={profileComplete}>
            <ProfessionalNav />
            <main className="min-h-screen">{children}</main>
          </Providers>
        </LoadingProvider>
      </body>
    </html>
  );
}

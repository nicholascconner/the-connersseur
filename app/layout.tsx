import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Connersseur - Cocktail Menu',
  description: 'Crafted cocktails and drinks menu with real-time ordering',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#8B1538',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'The Connersseur',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

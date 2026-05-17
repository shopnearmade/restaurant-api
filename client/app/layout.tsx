import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Restaurant Management System',
  description: 'Manage your restaurant menu, customers, and orders',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* suppressHydrationWarning prevents mismatches from localStorage reads on first paint */}
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-gray-50">
        {children}
      </body>
    </html>
  );
}

/**
 * ============================================================
 * ROOT LAYOUT — App-wide providers and metadata
 * Wraps the entire application with Auth, Account, Trade,
 * and Toast context providers.
 * ============================================================
 */
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { AuthProvider } from '@/contexts/AuthContext';
import { AccountProvider } from '@/contexts/AccountContext';
import { TradeProvider } from '@/contexts/TradeContext';
import { StrategyProvider } from '@/contexts/StrategyContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/components/ui/Toast';

/* ---- Google Fonts via next/font ---- */
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/* ---- SEO Metadata ---- */
export const metadata: Metadata = {
  title: 'TradeVault — Professional Trading Journal',
  description:
    'Track, analyze, and improve your trading performance with TradeVault. Log trades, view equity curves, and gain insights from comprehensive analytics.',
  keywords: ['trading journal', 'trading analytics', 'equity curve', 'PnL tracker', 'crypto trading'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
    >
      <body className="font-sans antialiased bg-base-900 text-text-primary min-h-screen">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AccountProvider>
                <TradeProvider>
                  <StrategyProvider>
                    <ToastProvider>
                      {children}
                    </ToastProvider>
                  </StrategyProvider>
                </TradeProvider>
              </AccountProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import React from 'react';
import './globals.css';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FarmProvider } from '../contexts/FarmContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Noto_Sans_Telugu } from 'next/font/google';

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-sans-telugu',
  display: 'swap',
});

export const metadata = {
  title: 'AgroCast AI — AI-Powered Agricultural Intelligence for Andhra Pradesh Farmers',
  description: 'Bilingual (Telugu/English) agricultural intelligence platform providing location-specific weather, personalized AI farming advice, pesticide guides, and market intelligence.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="te">
      <body className={`${notoSansTelugu.variable} min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-200`}>
        <AuthProvider>
          <LanguageProvider>
            <FarmProvider>
              <Header />
              <main className="flex-1 pb-16">{children}</main>
              <Footer />
            </FarmProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

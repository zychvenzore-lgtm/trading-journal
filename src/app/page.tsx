'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import InteractiveCandles from '@/components/InteractiveCandles';
import FeatureCard from '@/components/FeatureCard';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RootPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If we received an email confirmation code at the root URL, 
      // redirect it to the server callback to establish the session.
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      
      if (code) {
        window.location.href = `/auth/callback?code=${code}`;
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Logged in users go straight to the dashboard
        router.replace('/dashboard');
      } else {
        // Unauthenticated users stay on the landing page
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-base-900 text-text-primary selection:bg-accent/30 overflow-x-hidden">
      {/* 1. Background Interactive Physics Engine (Fixed) */}
      <InteractiveCandles />

      {/* 2. Top Navigation Bar (Fixed to top of screen) */}
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between bg-gradient-to-b from-base-900 to-transparent">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-lg sm:text-xl font-bold tracking-wide text-white drop-shadow-md shrink-0">
            Trade<span className="text-accent">Vault</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <Link 
            href="/login" 
            className="text-sm font-medium text-text-secondary hover:text-white transition-colors drop-shadow-md whitespace-nowrap"
          >
            {t('login.signIn')}
          </Link>
          <Link 
            href="/login?mode=signup" 
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-accent text-base-900 text-xs sm:text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] hover:bg-accent-light transition-all duration-300 whitespace-nowrap"
          >
            {t('login.createAccount')}
          </Link>
        </div>
      </nav>

      {/* 3. Hero Section (Sticky Parallax) */}
      <div className="relative h-[150vh] z-10 pointer-events-none">
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-4 pointer-events-none">
          <div className="max-w-3xl text-center space-y-6 sm:space-y-8 pointer-events-auto">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-white drop-shadow-2xl">
              {t('landing.heroTitleMaster')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#00a3ff]">{t('landing.heroTitleEdge')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto font-light drop-shadow-md">
              {t('landing.heroSubtitle')}
            </p>
            
            <div className="pt-6 sm:pt-8">
              <Link 
                href="/login?mode=signup" 
                className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-base-800 border border-base-600 rounded-xl text-white font-medium hover:bg-base-700 hover:border-accent transition-all duration-300 group shadow-2xl"
              >
                {t('landing.startJournaling')}
                <svg 
                  className="w-5 h-5 ml-2 text-accent group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Scroll Down Hint */}
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-text-muted text-sm flex flex-col items-center gap-2 animate-bounce opacity-70 pointer-events-auto hover:text-white transition-colors focus:outline-none"
          >
            <span>{t('landing.scrollDiscover')}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </div>

      {/* 4. Features Section (Slides over background) */}
      <div id="features" className="relative z-20 bg-base-900/60 backdrop-blur-xl min-h-screen py-20 md:py-32 px-4 border-t border-base-600/30 pointer-events-none">
        <div className="max-w-6xl mx-auto pointer-events-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight">{t('landing.featuresTitle')}</h2>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
              {t('landing.featuresSubtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title={t('landing.feature1Title')}
              preview={t('landing.feature1Preview')}
              details={t('landing.feature1Details')}
              icon={
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            
            <FeatureCard 
              title={t('landing.feature2Title')}
              preview={t('landing.feature2Preview')}
              details={t('landing.feature2Details')}
              icon={
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            
            <FeatureCard 
              title={t('landing.feature3Title')}
              preview={t('landing.feature3Preview')}
              details={t('landing.feature3Details')}
              icon={
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

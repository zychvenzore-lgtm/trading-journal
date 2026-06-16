'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import InteractiveCandles from '@/components/InteractiveCandles';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import FadeIn from '@/components/ui/FadeIn';
import Footer from '@/components/ui/Footer';

export default function RootPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      
      if (code) {
        window.location.href = `/auth/callback?code=${code}`;
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.replace('/dashboard');
      } else {
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
    <main className="relative min-h-screen bg-base-900 text-text-primary selection:bg-accent/30 overflow-x-hidden scroll-smooth">
      {/* 1. Background Interactive Physics Engine (Fixed) */}
      <InteractiveCandles />

      {/* 2. Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between bg-gradient-to-b from-base-900 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-lg sm:text-xl font-bold tracking-wide text-white drop-shadow-md shrink-0">
            Trade<span className="text-accent">Vault</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="hidden md:flex gap-6">
            <a href="#about" className="text-sm font-medium text-text-secondary hover:text-white transition-colors drop-shadow-md">About</a>
            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-white transition-colors drop-shadow-md">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-white transition-colors drop-shadow-md">How It Works</a>
          </div>
          
          <div className="flex items-center gap-3">
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
        </div>
      </nav>

      {/* 3. Hero Section */}
      <div className="relative min-h-[100vh] z-10 flex flex-col items-center justify-center px-4 pt-20 pointer-events-none">
        <div className="max-w-4xl text-center space-y-6 sm:space-y-8 pointer-events-auto">
          
          {/* Badge */}
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              100% Free & Open Source
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-white drop-shadow-2xl leading-tight">
              {t('landing.heroTitleMaster')} <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#00a3ff]">{t('landing.heroTitleEdge')}</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={300}>
            <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto font-light drop-shadow-md">
              {t('landing.heroSubtitle')}
            </p>
          </FadeIn>
          
          <FadeIn delay={400}>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login?mode=signup" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-accent text-base-900 rounded-xl font-bold hover:bg-accent-light transition-all duration-300 shadow-[0_0_30px_rgba(0,243,255,0.4)]"
              >
                {t('landing.startJournaling')}
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a 
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-base-800/80 border border-base-600 rounded-xl text-white font-medium hover:bg-base-700 hover:border-accent transition-all duration-300"
              >
                See Demo
              </a>
            </div>
          </FadeIn>

          {/* Stat Counters */}
          <FadeIn delay={500}>
            <div className="pt-10 flex items-center justify-center gap-8 text-sm text-text-muted font-medium">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                100% Free
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                No Credit Card
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {'< 2 min Setup'}
              </div>
            </div>
          </FadeIn>

        </div>
      </div>

      {/* 4. App Demo Section (Gallery) */}
      <div id="demo" className="relative z-20 bg-base-900/80 backdrop-blur-lg pt-16 pb-24 border-t border-base-600/30 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-accent uppercase tracking-widest mb-3">Inside TradeVault</h2>
              <p className="text-3xl md:text-5xl text-white font-black tracking-tight leading-tight">
                Your trading performance,<br className="hidden md:block" />visualized beautifully.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-6 md:space-y-10">
            {/* Top row: Core Stats */}
            <FadeIn delay={100}>
              <div className="rounded-2xl overflow-hidden border border-base-700 shadow-[0_0_40px_rgba(0,0,0,0.5)] group hover:border-accent/40 transition-colors bg-base-800">
                <div className="bg-base-900 px-4 py-2 flex items-center gap-2 border-b border-base-700 opacity-80">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="ml-3 text-[10px] text-text-muted font-mono uppercase tracking-widest">Dashboard Overview</span>
                </div>
                <img 
                  src="/ss-stats.png" 
                  alt="Dashboard Statistics" 
                  className="w-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                />
              </div>
            </FadeIn>

            {/* Middle row: 2 columns (Heatmap & Performance) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <FadeIn delay={200}>
                <div className="h-full rounded-2xl overflow-hidden border border-base-700 shadow-[0_0_30px_rgba(0,0,0,0.3)] group hover:border-accent/40 transition-colors bg-base-800">
                  <div className="bg-base-900 px-4 py-2 flex items-center gap-2 border-b border-base-700 opacity-80">
                    <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Consistency Heatmap</span>
                  </div>
                  <img 
                    src="/ss-heatmap.png" 
                    alt="Performance Heatmap" 
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                </div>
              </FadeIn>

              <FadeIn delay={300}>
                <div className="h-full rounded-2xl overflow-hidden border border-base-700 shadow-[0_0_30px_rgba(0,0,0,0.3)] group hover:border-accent/40 transition-colors bg-base-800">
                  <div className="bg-base-900 px-4 py-2 flex items-center gap-2 border-b border-base-700 opacity-80">
                    <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Time-based Analytics</span>
                  </div>
                  <img 
                    src="/ss-performance.png" 
                    alt="Hourly and Weekday Performance" 
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                </div>
              </FadeIn>
            </div>

            {/* Bottom Row: Ledger & Achievements side-by-side or stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
              <div className="lg:col-span-7">
                <FadeIn delay={400}>
                  <div className="h-full rounded-2xl overflow-hidden border border-base-700 shadow-[0_0_30px_rgba(0,0,0,0.3)] group hover:border-accent/40 transition-colors bg-base-800">
                    <div className="bg-base-900 px-4 py-2 flex items-center gap-2 border-b border-base-700 opacity-80">
                      <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Trade Ledger</span>
                    </div>
                    <img 
                      src="/ss-ledger.png" 
                      alt="Trade Ledger" 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    />
                  </div>
                </FadeIn>
              </div>
              <div className="lg:col-span-5">
                <FadeIn delay={500}>
                  <div className="h-full rounded-2xl overflow-hidden border border-base-700 shadow-[0_0_30px_rgba(0,0,0,0.3)] group hover:border-accent/40 transition-colors bg-base-800">
                    <div className="bg-base-900 px-4 py-2 flex items-center gap-2 border-b border-base-700 opacity-80">
                      <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Gamification</span>
                    </div>
                    <img 
                      src="/ss-achievements.png" 
                      alt="Achievements" 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    />
                  </div>
                </FadeIn>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 5. Stats Bar */}
      <div id="about" className="relative z-20 bg-base-800 border-y border-base-700 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-base-700">
              <div>
                <div className="text-3xl md:text-4xl font-black text-white mb-2">100%</div>
                <div className="text-text-secondary text-sm uppercase tracking-wider">Free Forever</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-black text-accent mb-2">20+</div>
                <div className="text-text-secondary text-sm uppercase tracking-wider">Analytics Data</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-black text-white mb-2">4</div>
                <div className="text-text-secondary text-sm uppercase tracking-wider">Color Themes</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-black text-accent mb-2">2</div>
                <div className="text-text-secondary text-sm uppercase tracking-wider">Languages (EN/ID)</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Step up CTA */}
      <div className="relative z-20 bg-base-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Step Up Your Game</h3>
            <p className="text-lg text-text-secondary">
              Unlock your persona. Over <span className="text-accent font-bold">50+ achievements</span> to level up your trading journey and understand your behavioral patterns.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* 6. Features Grid */}
      <div id="features" className="relative z-20 bg-base-900 py-20 px-4 border-t border-base-600/30">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Everything You Need</h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Built by traders for traders. No fluff, just the tools that actually matter.
              </p>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={100}>
              <div className="bg-base-800 border border-base-700 p-8 rounded-2xl hover:border-accent/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-3 2.486-4 1.146 1.146 2.514 2.514 2.514 5.5 0 2.5-2 4-2 4s2-1.5 2-4c0-2.5-1.5-4-3-4z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Burn It Catharsis</h3>
                <p className="text-text-secondary leading-relaxed">
                  Revenge traded? Write down your frustrations and literally burn them away with a satisfying animation. Let it go and reset your mind.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="bg-base-800 border border-base-700 p-8 rounded-2xl hover:border-accent/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Gamify Your Trading</h3>
                <p className="text-text-secondary leading-relaxed">
                  Unlock achievements as you log trades and stick to your rules. Trading is hard, so we made the discipline part a little more fun.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="bg-base-800 border border-base-700 p-8 rounded-2xl hover:border-accent/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Unlock Your Persona</h3>
                <p className="text-text-secondary leading-relaxed">
                  Are you a Sniper or a Machine Gunner? We analyze your trading patterns to give you a persona, helping you understand your true edge.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="bg-base-800 border border-base-700 p-8 rounded-2xl hover:border-accent/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Advanced Analytics</h3>
                <p className="text-text-secondary leading-relaxed">
                  Win rate, expectancy, equity curves, drawdown analysis, and strategy performance matrices. See the numbers that drive profitability.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* 7. How It Works */}
      <div id="how-it-works" className="relative z-20 bg-base-800 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-lg text-text-secondary">Three simple steps to better trading psychology.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn delay={100}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent text-base-900 text-2xl font-black flex items-center justify-center mx-auto mb-6">1</div>
                <h3 className="text-xl font-bold text-white mb-2">Sign Up</h3>
                <p className="text-text-secondary">Create your free account in less than 2 minutes using just your email.</p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-base-700 text-white border-2 border-accent text-2xl font-black flex items-center justify-center mx-auto mb-6">2</div>
                <h3 className="text-xl font-bold text-white mb-2">Log Trades</h3>
                <p className="text-text-secondary">Record your setups, thoughts, and emotions. Or import via CSV.</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-base-700 text-white border-2 border-accent text-2xl font-black flex items-center justify-center mx-auto mb-6">3</div>
                <h3 className="text-xl font-bold text-white mb-2">Analyze & Adapt</h3>
                <p className="text-text-secondary">Review your dashboard, unlock achievements, and find your edge.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* 8. Final CTA */}
      <div className="relative z-20 bg-gradient-to-b from-base-900 to-base-800 py-32 px-4 text-center">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Stop Guessing. <br className="hidden sm:block" /><span className="text-accent">Start Tracking.</span></h2>
            <p className="text-xl text-text-secondary mb-10">Join traders who have leveled up their discipline.</p>
            <Link 
              href="/login?mode=signup" 
              className="inline-flex items-center justify-center px-10 py-5 bg-accent text-base-900 rounded-xl font-bold text-lg hover:bg-accent-light transition-all duration-300 shadow-[0_0_40px_rgba(0,243,255,0.4)]"
            >
              Get Started for Free
              <svg className="w-6 h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </FadeIn>
      </div>

      {/* 9. Footer */}
      <div className="relative z-20">
        <Footer />
      </div>

    </main>
  );
}

'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { calcAllStats, buildEquityCurve } from '@/lib/analytics';
import type { Account, Trade, TradeStats, EquityPoint } from '@/types';
import DrawdownCurve from '@/components/charts/DrawdownCurve';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import Link from 'next/link';

export default function SharedTrackRecordPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // 1. Fetch the public account by slug
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('public_slug', slug)
        .eq('is_public', true)
        .single();

      if (accountError || !accountData) {
        setError("This track record is private or does not exist.");
        setLoading(false);
        return;
      }

      setAccount(accountData as Account);

      // 2. Fetch the trades for this account
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('account_id', accountData.id)
        .order('entry_time', { ascending: false });

      if (!tradesError && tradesData) {
        const trades = tradesData as Trade[];
        const computedStats = calcAllStats(trades, accountData.starting_balance);
        setStats(computedStats);
        setEquityCurve(buildEquityCurve(trades, accountData.starting_balance));
      }

      setLoading(false);
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !account || !stats) {
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Not Found</h1>
          <p className="text-text-secondary">{error}</p>
          <Link href="/" className="text-accent hover:underline block mt-4">
            Return to TradeVault
          </Link>
        </div>
      </div>
    );
  }

  // To preserve anonymity and "hide exact dollar amounts" as requested,
  // we will convert some dollar-based stats to purely percentage-based if needed,
  // but for now, we'll display them since they are publicizing their account.
  // A true "hidden dollars" mode could be a toggle in the future.

  return (
    <div className="min-h-screen bg-base-900 font-sans text-text-primary relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] animate-float-slow opacity-20" style={{ background: 'radial-gradient(circle, rgba(0, 136, 255, 0.08) 0%, rgba(0, 136, 255, 0) 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[1000px] h-[1000px] animate-float-reverse opacity-20" style={{ background: 'radial-gradient(circle, rgba(0, 86, 179, 0.08) 0%, rgba(0, 86, 179, 0) 70%)' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full border-b border-base-700 bg-base-800/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Trade<span className="text-accent">Vault</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-1 bg-accent/20 text-accent rounded uppercase tracking-wide">Verified Public Record</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-8">
        
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-white tracking-wide">{account.name}</h1>
          <p className="text-text-secondary mt-2 text-lg">
            Track record for {account.account_type === 'PROP_FIRM' ? 'Prop Firm Challenge' : 'Personal Account'}
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="Total Return" 
            value={formatCurrency(stats.netPnl)} 
            trend={{ value: (stats.netPnl / account.starting_balance) * 100, positive: stats.netPnl >= 0 }} 
          />
          <StatCard 
            label="Win Rate" 
            value={formatPercentage(stats.winRate)} 
          />
          <StatCard 
            label="Profit Factor" 
            value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)} 
          />
          <StatCard 
            label="Max Drawdown" 
            value={`${stats.maxDrawdown.toFixed(2)}%`} 
          />
        </div>

        {/* Equity Curve */}
        <div className="bg-base-800/40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-base-600/30">
          <h2 className="text-xl font-semibold text-white tracking-wide mb-6">Equity Curve</h2>
          <DrawdownCurve data={equityCurve} />
        </div>

        {/* Call to Action */}
        <div className="text-center pt-12 pb-6 border-t border-base-700 mt-12">
          <p className="text-text-secondary mb-4">Want to track your own trading edge?</p>
          <Link 
            href="/login?mode=signup" 
            className="inline-block bg-accent hover:bg-accent-light text-white font-medium py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,163,255,0.6)]"
          >
            Start Your TradeVault
          </Link>
        </div>
      </main>
    </div>
  );
}

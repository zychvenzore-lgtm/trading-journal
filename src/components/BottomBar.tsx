'use client';

import React from 'react';
import { useAccounts } from '@/contexts/AccountContext';
import { useTrades } from '@/contexts/TradeContext';
import { calcAllStats } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';

export default function BottomBar() {
  const { activeAccount } = useAccounts();
  const { trades } = useTrades();
  const stats = calcAllStats(trades, activeAccount?.starting_balance ?? 0);

  return (
    <footer className="h-8 shrink-0 bg-[#0A0D14] border-t border-base-700/50 flex items-center justify-between px-4 text-[11px] font-medium text-text-muted select-none z-50 relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-text-secondary cursor-pointer transition-colors">
          <span className={`w-2 h-2 rounded-full ${activeAccount ? 'bg-accent' : 'bg-base-600'} shadow-[0_0_8px_currentColor] opacity-80`} />
          <span>{activeAccount ? 'Operational' : 'No Account'}</span>
        </div>
        <div className="w-px h-3 bg-base-700" />
        <span className="hover:text-text-secondary cursor-pointer transition-colors">Market: Open</span>
      </div>

      <div className="flex items-center gap-4">
        {activeAccount && (
          <>
            <span className="flex gap-1.5"><span className="text-text-secondary">Balance:</span> <span className="font-mono text-text-primary">{formatCurrency(activeAccount.starting_balance)}</span></span>
            <div className="w-px h-3 bg-base-700" />
            <span className="flex gap-1.5"><span className="text-text-secondary">Equity:</span> <span className={`font-mono ${stats.netPnl > 0 ? 'text-accent' : stats.netPnl < 0 ? 'text-danger' : 'text-text-primary'}`}>{formatCurrency(stats.totalEquity)}</span></span>
          </>
        )}
        <div className="w-px h-3 bg-base-700" />
        <span className="text-text-secondary">UTC {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </footer>
  );
}

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAccounts } from '@/contexts/AccountContext';
import { useTrades } from '@/contexts/TradeContext';
import { useAuth } from '@/contexts/AuthContext';
import { PositionType, TradeDirection } from '@/types';

/**
 * WelcomeSetup
 * 
 * Automatically detects if a user has zero accounts and hasn't seen the setup before.
 * If so, it creates a "DEMO" account and populates it with dummy trades so the user
 * isn't greeted by an empty blank screen on their first login.
 */
export default function WelcomeSetup() {
  const { user } = useAuth();
  const { accounts, loading: accountsLoading, createAccount } = useAccounts();
  const { bulkAddTrades } = useTrades();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    // Wait until we have a user and accounts have finished loading
    if (!user || accountsLoading || initialized.current || isSettingUp) return;

    const setupKey = `tradevault_demo_setup_${user.id}`;
    const hasSetup = localStorage.getItem(setupKey);

    // If the user has accounts or has already gone through this process, skip.
    if (accounts.length > 0 || hasSetup === 'true') {
      initialized.current = true;
      return;
    }

    initialized.current = true; // Prevent double execution in StrictMode
    const runSetup = async () => {
      setIsSettingUp(true);
      try {
        console.log('[WelcomeSetup] Creating initial DEMO account...');
        const newAccount = await createAccount('Demo Portfolio', 10000, 'USD', 'DEMO');
        
        if (!newAccount) {
          throw new Error('Failed to create account');
        }

        console.log('[WelcomeSetup] Populating with dummy trades...');
        const now = new Date();
        const dummyTrades = [];
        
        // Generate 15 dummy trades
        for (let i = 0; i < 15; i++) {
          const isCrypto = Math.random() > 0.4;
          const isForex = !isCrypto && Math.random() > 0.5;
          
          let position_type: PositionType;
          let ticker: string;
          let entry_price: number;
          let exit_price: number;
          let position_size: number;
          let leverage: number = 1;
          
          const isProfitable = Math.random() > 0.3; // 70% win rate for demo
          
          if (isCrypto) {
             position_type = 'MARGIN';
             ticker = Math.random() > 0.5 ? 'BTCUSDT' : 'ETHUSDT';
             entry_price = ticker === 'BTCUSDT' ? 65000 + (Math.random() * 2000 - 1000) : 3500 + (Math.random() * 100 - 50);
             const pnlPercent = isProfitable ? (Math.random() * 0.05 + 0.01) : -(Math.random() * 0.03 + 0.005);
             exit_price = entry_price * (1 + pnlPercent);
             position_size = Math.floor(Math.random() * 500) + 50; 
             leverage = Math.floor(Math.random() * 20) + 1;
          } else if (isForex) {
             position_type = 'LOTS';
             ticker = Math.random() > 0.5 ? 'EURUSD' : 'GBPUSD';
             entry_price = ticker === 'EURUSD' ? 1.1000 + (Math.random() * 0.02 - 0.01) : 1.3000 + (Math.random() * 0.02 - 0.01);
             const pnlPoints = isProfitable ? (Math.random() * 0.01 + 0.002) : -(Math.random() * 0.005 + 0.001);
             exit_price = entry_price + pnlPoints;
             position_size = Math.round((Math.random() * 2 + 0.1) * 10) / 10; 
          } else {
             position_type = 'QUANTITY';
             ticker = Math.random() > 0.5 ? 'AAPL' : 'TSLA';
             entry_price = ticker === 'AAPL' ? 180 + (Math.random() * 20 - 10) : 200 + (Math.random() * 20 - 10);
             const pnlPercent = isProfitable ? (Math.random() * 0.04 + 0.01) : -(Math.random() * 0.02 + 0.005);
             exit_price = entry_price * (1 + pnlPercent);
             position_size = Math.floor(Math.random() * 100) + 10;
          }

          const direction: TradeDirection = Math.random() > 0.5 ? 'LONG' : 'SHORT';
          
          if (direction === 'SHORT' && isProfitable) {
            exit_price = entry_price - Math.abs(entry_price - exit_price);
          } else if (direction === 'SHORT' && !isProfitable) {
            exit_price = entry_price + Math.abs(entry_price - exit_price);
          }

          const entry_time = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
          const close_time = new Date(entry_time.getTime() + (Math.random() * 48 + 1) * 60 * 60 * 1000);

          dummyTrades.push({
            account_id: newAccount.id,
            user_id: user.id,
            ticker,
            direction,
            position_type,
            entry_price,
            exit_price,
            position_size,
            leverage,
            entry_time: entry_time.toISOString(),
            close_time: close_time.toISOString(),
            fees: Math.round(Math.random() * 5 * 100) / 100,
            stop_loss: null,
            take_profit: null,
            strategy: null,
            reason: 'My first simulated trade! Setting up the environment.',
            chart_link: null,
            realized_pnl: null,
          });
        }
        
        await bulkAddTrades(dummyTrades);
        
        // Mark as completed
        localStorage.setItem(setupKey, 'true');
        initialized.current = true;
        console.log('[WelcomeSetup] Setup complete!');

      } catch (e) {
        console.error("[WelcomeSetup] Failed to auto-setup demo account", e);
      } finally {
        setIsSettingUp(false);
      }
    };

    runSetup();
  }, [accounts, accountsLoading, user, createAccount, bulkAddTrades, isSettingUp]);

  // Display a full-screen loading overlay while this happens
  if (isSettingUp) {
    return (
      <div className="fixed inset-0 bg-base-900/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(0,243,255,0.5)]" />
        <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">Building your workspace...</h2>
        <p className="text-text-muted text-sm max-w-sm text-center">Creating a demo portfolio and analyzing initial market data. Please wait a moment.</p>
      </div>
    );
  }

  return null;
}

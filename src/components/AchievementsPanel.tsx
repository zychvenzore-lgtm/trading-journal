'use client';

import React, { useMemo } from 'react';
import { useTrades } from '@/contexts/TradeContext';
import { useAccounts } from '@/contexts/AccountContext';
import { evaluateAchievements, determinePersona } from '@/lib/gamification';

export default function AchievementsPanel() {
  const { trades } = useTrades();
  const { activeAccount } = useAccounts();
  const startingBalance = activeAccount?.starting_balance || 0;

  const achievements = useMemo(() => evaluateAchievements(trades, startingBalance), [trades, startingBalance]);
  const persona = useMemo(() => determinePersona(trades), [trades]);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="mt-12 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-base-700/50 pb-4">
        <div className="p-3 bg-accent/10 rounded-xl">
          <svg className="w-8 h-8 text-accent drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">My Achievements</h2>
          <p className="text-sm text-text-secondary">Unlocked {unlockedCount} of {totalCount} milestones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Persona Card (Takes up 1 column on LG) */}
        <div className="lg:col-span-1">
          <div className="bg-base-800/40 backdrop-blur-xl border border-base-600/30 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-accent/30 transition-colors">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {!persona ? (
              <div className="space-y-4 z-10 relative">
                <div className="w-16 h-16 mx-auto bg-base-700/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold text-lg">Persona Locked</h3>
                  <p className="text-xs text-text-muted mt-2 px-4 leading-relaxed">
                    Log 30 trades to reveal your true Trading Persona based on your analytics.
                  </p>
                </div>
                <div className="w-full bg-base-900 rounded-full h-2 mt-4 overflow-hidden border border-base-700">
                  <div className="bg-accent h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((trades.length / 30) * 100, 100)}%` }} />
                </div>
                <p className="text-[10px] text-text-muted font-mono">{trades.length} / 30 TRADES</p>
              </div>
            ) : (
              <div className="space-y-4 z-10 relative">
                <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(0,243,255,0.4)] animate-bounce-slow">
                  {persona.icon}
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest text-accent uppercase mb-1">Your Persona</div>
                  <h3 className="text-white font-bold text-2xl">{persona.name}</h3>
                  <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                    {persona.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Grid (Takes up 3 columns on LG) */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col ${
                achievement.isUnlocked 
                  ? 'bg-base-800 border-accent/30 shadow-[0_4px_20px_rgba(0,243,255,0.05)] hover:border-accent/50' 
                  : 'bg-base-900/50 border-base-700/50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-xl shadow-inner ${
                  achievement.isUnlocked ? 'bg-accent/20 border border-accent/30' : 'bg-base-800 border border-base-700'
                }`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${achievement.isUnlocked ? 'text-white' : 'text-text-secondary'}`}>
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2" title={achievement.description}>
                    {achievement.description}
                  </p>
                </div>
              </div>
              
              {achievement.progress && !achievement.isUnlocked && (
                <div className="mt-auto pt-3">
                  <div className="w-full bg-base-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-accent h-1.5 rounded-full" 
                      style={{ width: `${(achievement.progress.current / achievement.progress.target) * 100}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted mt-1.5 font-mono">
                    <span>{achievement.progress.current}</span>
                    <span>{achievement.progress.target}</span>
                  </div>
                </div>
              )}

              {achievement.isUnlocked && (
                <div className="absolute top-3 right-3 text-accent">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

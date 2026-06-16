import { useEffect, useRef } from 'react';
import { useTrades } from '@/contexts/TradeContext';
import { useAccounts } from '@/contexts/AccountContext';
import { useToast } from '@/components/ui/Toast';
import { evaluateAchievements } from '@/lib/gamification';

const STORAGE_KEY = 'tradevault_unlocked_achievements';

export function useAchievementNotifications() {
  const { trades } = useTrades();
  const { activeAccount } = useAccounts();
  const { showToast } = useToast();
  
  // Use a ref to avoid infinite loops and unnecessary re-renders
  const initialized = useRef(false);

  useEffect(() => {
    if (!trades) return;
    
    if (trades.length === 0) {
      initialized.current = true;
      return;
    }

    // Load previously unlocked achievements from local storage
    const stored = localStorage.getItem(STORAGE_KEY);
    const previouslyUnlocked: string[] = stored ? JSON.parse(stored) : [];

    // Calculate current achievements
    const startingBalance = activeAccount?.starting_balance || 0;
    const currentAchievements = evaluateAchievements(trades, startingBalance);
    
    const currentlyUnlocked = currentAchievements.filter(a => a.isUnlocked);
    const newUnlocks = currentlyUnlocked.filter(a => !previouslyUnlocked.includes(a.id));

    if (newUnlocks.length > 0) {
      // If this is the very first load, we don't want to spam 20 toasts for past achievements.
      // We just quietly sync them to local storage.
      if (!initialized.current && previouslyUnlocked.length === 0) {
        const allUnlockedIds = currentlyUnlocked.map(a => a.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allUnlockedIds));
      } else {
        // Otherwise, it's a genuine new achievement unlocked during this session!
        newUnlocks.forEach(achievement => {
          showToast(`🏆 Achievement Unlocked: ${achievement.name}`, 'success');
        });
        
        // Update storage
        const updatedUnlockedIds = [...previouslyUnlocked, ...newUnlocks.map(a => a.id)];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUnlockedIds));
      }
    }

    initialized.current = true;
  }, [trades, activeAccount, showToast]);
}

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { CustomStrategy } from '@/types';

// For local storage, we just omit id, created_at, user_id (though user_id isn't strictly needed for local, we keep the type signature the same)
type NewStrategyData = Omit<CustomStrategy, 'id' | 'created_at' | 'user_id'>;

interface StrategyContextValue {
  strategies: CustomStrategy[];
  loading: boolean;
  addStrategy: (data: NewStrategyData) => Promise<CustomStrategy | null>;
  updateStrategy: (id: string, updates: Partial<NewStrategyData>) => Promise<CustomStrategy | null>;
  deleteStrategy: (id: string) => Promise<boolean>;
}

const StrategyContext = createContext<StrategyContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'tradevault_custom_strategies';

export function StrategyProvider({ children }: { children: ReactNode }) {
  const [strategies, setStrategies] = useState<CustomStrategy[]>([]);
  const [loading, setLoading] = useState(true);

  // Load strategies from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setStrategies(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load strategies from local storage', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper to save to local storage
  const saveToStorage = (newStrategies: CustomStrategy[]) => {
    setStrategies(newStrategies);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newStrategies));
    } catch (err) {
      console.error('Failed to save strategies to local storage', err);
    }
  };

  const addStrategy = useCallback(
    async (data: NewStrategyData): Promise<CustomStrategy | null> => {
      // Simulate network delay for UI consistency
      await new Promise(res => setTimeout(res, 300));
      
      const newStrategy: CustomStrategy = {
        ...data,
        id: crypto.randomUUID(),
        user_id: 'local-user', // Mock user ID for local storage
        created_at: new Date().toISOString(),
      };

      saveToStorage([newStrategy, ...strategies]);
      return newStrategy;
    },
    [strategies]
  );

  const updateStrategy = useCallback(
    async (id: string, updates: Partial<NewStrategyData>): Promise<CustomStrategy | null> => {
      await new Promise(res => setTimeout(res, 300));

      const index = strategies.findIndex(s => s.id === id);
      if (index === -1) return null;

      const updatedStrategy = { ...strategies[index], ...updates };
      const newStrategies = [...strategies];
      newStrategies[index] = updatedStrategy;
      
      saveToStorage(newStrategies);
      return updatedStrategy;
    },
    [strategies]
  );

  const deleteStrategy = useCallback(
    async (id: string): Promise<boolean> => {
      await new Promise(res => setTimeout(res, 300));
      
      const newStrategies = strategies.filter(s => s.id !== id);
      saveToStorage(newStrategies);
      return true;
    },
    [strategies]
  );

  const value = {
    strategies,
    loading,
    addStrategy,
    updateStrategy,
    deleteStrategy,
  };

  return <StrategyContext.Provider value={value}>{children}</StrategyContext.Provider>;
}

export function useStrategies() {
  const context = useContext(StrategyContext);
  if (context === undefined) {
    throw new Error('useStrategies must be used within a StrategyProvider');
  }
  return context;
}

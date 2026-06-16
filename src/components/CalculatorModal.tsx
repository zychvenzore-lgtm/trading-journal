'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface CalculatorModalProps {
  onClose: () => void;
}

export default function CalculatorModal({ onClose }: CalculatorModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-base-800 border border-base-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-base-700">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" strokeWidth="2" />
              <line x1="8" y1="6" x2="16" y2="6" strokeWidth="2" />
              <line x1="16" y1="14" x2="16" y2="14.01" strokeWidth="2" />
              <line x1="16" y1="18" x2="16" y2="18.01" strokeWidth="2" />
              <line x1="12" y1="14" x2="12" y2="14.01" strokeWidth="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
              <line x1="8" y1="14" x2="8" y2="14.01" strokeWidth="2" />
              <line x1="8" y1="18" x2="8" y2="18.01" strokeWidth="2" />
            </svg>
            Position Calculator
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Coming Soon</h3>
          <p className="text-text-muted text-sm mb-6">
            The advanced Lot Size & Margin Calculator is currently under development. It will be available in the next update!
          </p>
          <Button onClick={onClose} variant="primary" className="w-full">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}

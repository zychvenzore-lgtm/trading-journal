'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface BurnItModalProps {
  onClose: () => void;
}

export default function BurnItModal({ onClose }: BurnItModalProps) {
  const [content, setContent] = useState('');
  const [isBurning, setIsBurning] = useState(false);

  const handleBurn = () => {
    if (!content.trim()) return;
    
    // Trigger haptic feedback if supported (mostly on mobile)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200, 50, 300]); // intense vibration
    }

    setIsBurning(true);

    // Simulate burning duration, then close
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-lg transition-all duration-1000 ${
          isBurning ? 'scale-90 opacity-0 blur-xl translate-y-10 brightness-200' : 'scale-100 opacity-100 blur-0'
        }`}
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-red-500 mb-2 uppercase tracking-widest">
            Burn It
          </h2>
          <p className="text-text-muted text-sm max-w-sm mx-auto">
            Write down your frustration, stupid mistakes, or anger. 
            Once burned, it's permanently deleted. Let it go.
          </p>
        </div>

        <div className="bg-[#2A1D1D] border border-red-900/50 rounded-xl p-1 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)]">
          {/* Flame gradient effect in background */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent pointer-events-none" />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="I revenge traded because..."
            className="w-full h-48 bg-transparent text-red-100/90 placeholder-red-500/30 p-5 focus:outline-none resize-none font-serif text-lg leading-relaxed relative z-10"
            autoFocus
          />
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isBurning}
          >
            Cancel
          </Button>
          <button
            onClick={handleBurn}
            disabled={!content.trim() || isBurning}
            className={`px-8 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 ${
              !content.trim() || isBurning
                ? 'bg-base-700 text-base-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_40px_rgba(239,68,68,0.7)]'
            }`}
          >
            {isBurning ? 'BURNING...' : 'BURN IT'}
          </button>
        </div>
      </div>
    </div>
  );
}

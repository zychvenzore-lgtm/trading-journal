'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface BurnItModalProps {
  onClose: () => void;
}

export default function BurnItModal({ onClose }: BurnItModalProps) {
  const [content, setContent] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [firePos, setFirePos] = useState('100%');

  const handleBurn = () => {
    if (!content.trim()) return;
    
    // Trigger haptic feedback if supported (mostly on mobile)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200, 50, 300, 100, 400]); // intense vibration
    }

    setIsBurning(true);

    // Start the fire rising animation immediately
    setTimeout(() => setFirePos('-150%'), 50);

    // Simulate burning duration, then close
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-lg transition-transform duration-75 ${
          isBurning ? 'scale-[1.02]' : 'scale-100'
        }`}
        style={isBurning ? {
          animation: 'shake 0.5s linear infinite'
        } : {}}
      >
        <style>{`
          @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
          }
        `}</style>

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
          {/* Fire Effect Overlay (Rises from bottom to top) */}
          <div 
            className="absolute left-0 right-0 w-full z-20 pointer-events-none flex flex-col justify-start"
            style={{
              height: '300%',
              top: firePos,
              transition: 'top 2.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, #ffeb3b 3%, #ff9800 6%, #f44336 9%, #111111 20%, #000000 100%)'
            }}
          >
            {/* Cartoonish flames edge */}
            <div className="w-full flex justify-around items-end pt-2 pb-1 opacity-90">
              <span className="text-3xl animate-pulse">🔥</span>
              <span className="text-5xl animate-bounce">🔥</span>
              <span className="text-4xl animate-pulse" style={{ animationDelay: '0.1s' }}>🔥</span>
              <span className="text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>🔥</span>
              <span className="text-3xl animate-pulse" style={{ animationDelay: '0.3s' }}>🔥</span>
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0.1s' }}>🔥</span>
              <span className="text-4xl animate-pulse" style={{ animationDelay: '0.2s' }}>🔥</span>
            </div>
          </div>

          {/* Flame gradient effect in background */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent pointer-events-none" />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="I revenge traded because..."
            className="w-full h-48 bg-transparent text-red-100/90 placeholder-red-500/30 p-5 focus:outline-none resize-none font-serif text-lg leading-relaxed relative z-10"
            autoFocus
            disabled={isBurning}
          />
        </div>

        <div className="mt-8 flex justify-center gap-4 relative z-30">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isBurning}
            className={isBurning ? 'opacity-0 transition-opacity' : ''}
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
            } ${isBurning ? 'opacity-0' : ''}`}
          >
            {isBurning ? 'BURNING...' : 'BURN IT'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface BurnItModalProps {
  onClose: () => void;
}

export default function BurnItModal({ onClose }: BurnItModalProps) {
  const [content, setContent] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [flames, setFlames] = useState<any[]>([]);

  const handleBurn = () => {
    if (!content.trim()) return;
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200, 50, 300, 100, 400]);
    }

    // Generate 70 flames that shoot up individually over time
    const newFlames = Array.from({ length: 70 }).map((_, i) => {
      const progress = i / 70; // 0 to 1
      
      // Delay starts small, gets denser and more chaotic at the end
      const delay = Math.pow(progress, 1.5) * 2.2; 
      
      // Early flames are tiny (0.4), late flames are MASSIVE (5.0) to engulf the screen
      const scale = 0.4 + Math.pow(progress, 2) * 5.0;
      
      // Random horizontal position
      const left = Math.random() * 100;
      
      // Speed (duration) they fly up
      const duration = 1.0 + Math.random() * 0.8 + (1 - progress) * 0.5;

      return { id: i, delay, scale, left, duration };
    });

    setFlames(newFlames);
    setIsBurning(true);

    setTimeout(() => {
      onClose();
    }, 3400); // 3.4 seconds total to allow the final ash to cover
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-hidden">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(1px, 1px) rotate(0deg); }
          25% { transform: translate(-2px, -2px) rotate(-1deg); }
          50% { transform: translate(0px, 2px) rotate(1deg); }
          75% { transform: translate(2px, -1px) rotate(-1deg); }
        }

        @keyframes shootUp {
          0% { bottom: -20%; transform: translateX(-50%) scale(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; transform: translateX(-60%) scale(var(--scale)) rotate(-5deg); }
          30% { transform: translateX(-40%) scale(var(--scale)) rotate(5deg); }
          50% { transform: translateX(-60%) scale(var(--scale)) rotate(-5deg); }
          70% { transform: translateX(-40%) scale(var(--scale)) rotate(5deg); }
          90% { opacity: 1; }
          100% { bottom: 130%; transform: translateX(-50%) scale(var(--scale)) rotate(0deg); opacity: 0; }
        }

        @keyframes ashFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* The Individual Shooting Flames Overlay */}
      {isBurning && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
          {flames.map((f) => (
            <div 
              key={f.id}
              className="absolute flex items-center justify-center"
              style={{
                left: `${f.left}%`,
                bottom: '-20%',
                animation: `shootUp ${f.duration}s ease-in forwards`,
                animationDelay: `${f.delay}s`,
                '--scale': f.scale,
                opacity: 0,
              } as React.CSSProperties}
            >
              <div className="relative w-[40px] h-[60px]">
                {/* Red Outer Flame */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60px] h-[60px] bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)] rounded-[50%_0_50%_50%] -rotate-45 origin-center" />
                {/* Orange Middle Flame */}
                <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[40px] h-[40px] bg-orange-500 rounded-[50%_0_50%_50%] -rotate-45 origin-center" />
                {/* Yellow Inner Flame */}
                <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2 w-[20px] h-[20px] bg-yellow-400 rounded-[50%_0_50%_50%] -rotate-45 origin-center" />
              </div>
            </div>
          ))}

          {/* Solid Black Ash that fades in to completely cover everything at the climax */}
          <div 
            className="absolute inset-0 bg-[#0A0A0A] z-40 pointer-events-none"
            style={{
              animation: 'ashFadeIn 0.8s ease-in forwards',
              animationDelay: '2.4s',
              opacity: 0
            }}
          />
        </div>
      )}

      {/* Main Modal Container */}
      <div 
        className={`w-full max-w-lg transition-transform duration-75 relative z-10 ${
          isBurning ? 'scale-[1.01]' : 'scale-100'
        }`}
        style={isBurning ? {
          animation: 'shake 0.3s linear infinite'
        } : {}}
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
            className={`transition-all duration-300 ${isBurning ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100'}`}
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
            } ${isBurning ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100'}`}
          >
            {isBurning ? 'BURNING...' : 'BURN IT'}
          </button>
        </div>
      </div>
    </div>
  );
}

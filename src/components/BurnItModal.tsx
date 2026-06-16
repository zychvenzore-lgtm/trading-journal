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
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200, 50, 300, 100, 400]);
    }

    setIsBurning(true);

    setTimeout(() => {
      onClose();
    }, 2400); // Close exactly as the fire covers the screen
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-hidden">
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
        
        @keyframes riseUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }

        @keyframes flameWiggle {
          0% { transform: translateX(-50%) rotate(-45deg) scale(1); }
          50% { transform: translateX(-50%) rotate(-45deg) scale(1.1) skew(5deg, 5deg); }
          100% { transform: translateX(-50%) rotate(-45deg) scale(1); }
        }

        @keyframes smokeRise {
          0% { transform: translateY(0) scale(1); opacity: 0.9; }
          100% { transform: translateY(-150px) scale(1.5); opacity: 0; }
        }

        .flame-shape {
          border-radius: 50% 0 50% 50%;
          animation: flameWiggle 0.6s infinite alternate;
          transform-origin: center center;
        }

        .animate-smoke {
          animation: smokeRise 1.2s infinite ease-out;
        }
      `}</style>

      {/* The Cartoon Fire Overlay */}
      {isBurning && (
        <div 
          className="absolute left-0 w-full z-50 pointer-events-none flex flex-col justify-start"
          style={{
            height: '250%',
            animation: 'riseUp 2.5s cubic-bezier(0.5, 0, 0.2, 1) forwards',
          }}
        >
          {/* Flame Wall */}
          <div className="w-[120%] left-[-10%] relative h-[150px] flex items-end justify-around shrink-0 pb-4">
            
            {/* Smoke Bubbles */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`smoke-${i}`}
                className="absolute rounded-full bg-gray-900/90 animate-smoke z-10 blur-[2px]"
                style={{
                  width: `${40 + Math.random() * 60}px`,
                  height: `${40 + Math.random() * 60}px`,
                  left: `${Math.random() * 100}%`,
                  bottom: `${Math.random() * 40 + 40}px`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}

            {/* Fire Tears */}
            {Array.from({ length: 18 }).map((_, i) => {
              const scale = 0.8 + (Math.random() * 1); // 0.8 to 1.8
              const isOffset = i % 2 !== 0;
              const delay = Math.random() * 0.3;
              
              return (
                <div 
                  key={`flame-${i}`} 
                  className="relative flex-shrink-0 z-20" 
                  style={{ 
                    width: '35px', 
                    height: '100px', 
                    transform: `scale(${scale}) translateY(${isOffset ? '25px' : '0px'})`,
                  }}
                >
                  <div 
                    className="flame-shape absolute bottom-[-10px] left-1/2 w-24 h-24 bg-red-600 border-[3px] border-red-800/30"
                    style={{ animationDelay: `${delay}s` }}
                  />
                  <div 
                    className="flame-shape absolute bottom-[0px] left-1/2 w-16 h-16 bg-orange-500"
                    style={{ animationDelay: `${delay + 0.1}s` }}
                  />
                  <div 
                    className="flame-shape absolute bottom-[10px] left-1/2 w-8 h-8 bg-yellow-400"
                    style={{ animationDelay: `${delay + 0.2}s` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Solid Ash Block */}
          <div className="w-full flex-1 bg-[#0A0A0A] relative z-20">
             <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-red-900/50 to-transparent" />
          </div>
        </div>
      )}

      {/* Main Modal Container */}
      <div 
        className={`w-full max-w-lg transition-transform duration-75 relative z-10 ${
          isBurning ? 'scale-[1.02]' : 'scale-100'
        }`}
        style={isBurning ? {
          animation: 'shake 0.4s linear infinite'
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

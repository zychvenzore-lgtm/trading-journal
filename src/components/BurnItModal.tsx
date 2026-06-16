'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from '@/components/ui/Button';

interface BurnItModalProps {
  onClose: () => void;
}

interface Ember {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
}

export default function BurnItModal({ onClose }: BurnItModalProps) {
  const [content, setContent] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [burnProgress, setBurnProgress] = useState(0); // 0 to 1
  const [embers, setEmbers] = useState<Ember[]>([]);
  const animRef = useRef<number>(0);
  const emberIdRef = useRef(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleBurn = () => {
    if (!content.trim()) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200, 50, 300, 100, 400]);
    }

    setIsBurning(true);
  };

  // Main burn animation loop
  useEffect(() => {
    if (!isBurning) return;

    const startTime = performance.now();
    const totalDuration = 3200; // 3.2 seconds total

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / totalDuration, 1);

      // Eased: starts slow, accelerates in the middle, then slows at top
      const progress = raw < 0.5
        ? 2 * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 2) / 2;

      setBurnProgress(progress);

      // Spawn embers at the fire line
      if (raw < 0.95 && Math.random() < 0.4) {
        const newEmber: Ember = {
          id: emberIdRef.current++,
          x: Math.random() * 100,
          y: 0, // will be positioned relative to fire line
          size: 2 + Math.random() * 4,
          speed: 0.5 + Math.random() * 1.5,
          drift: (Math.random() - 0.5) * 2,
          opacity: 0.8 + Math.random() * 0.2,
        };
        setEmbers(prev => [...prev.slice(-25), newEmber]); // keep max 25
      }

      if (raw < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Done burning
        setTimeout(() => onCloseRef.current(), 400);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isBurning]);

  // The fire line Y position (percentage from bottom). Goes from 0% to ~130%
  const fireLineY = burnProgress * 130;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Hidden SVG filter for organic flame edge distortion */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="fire-distort" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.06"
              numOctaves="4"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.015 0.06;0.02 0.08;0.015 0.06"
                dur="0.8s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="45"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* ======= BURNING OVERLAY ======= */}
      {isBurning && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          {/* The rising fire+ash layer with SVG turbulence distortion on the edge */}
          <div
            className="absolute left-[-20%] w-[140%]"
            style={{
              bottom: 0,
              height: `${fireLineY}%`,
              filter: 'url(#fire-distort)',
            }}
          >
            {/* Yellow-white hot edge (topmost) */}
            <div
              className="absolute top-0 left-0 right-0 h-[8px]"
              style={{ background: 'linear-gradient(to bottom, #fff8e1, #ffcc02)' }}
            />
            {/* Orange fire band */}
            <div
              className="absolute left-0 right-0 h-[18px]"
              style={{ top: '6px', background: 'linear-gradient(to bottom, #ff9800, #f44336)' }}
            />
            {/* Dark red ember band */}
            <div
              className="absolute left-0 right-0 h-[14px]"
              style={{ top: '22px', background: 'linear-gradient(to bottom, #d32f2f, #4a0000)' }}
            />
            {/* Solid black burned area */}
            <div
              className="absolute left-0 right-0 bg-black"
              style={{ top: '34px', bottom: 0 }}
            />
          </div>

          {/* Ambient orange glow above the fire line (not distorted) */}
          <div
            className="absolute left-0 right-0 h-[120px] transition-opacity duration-300"
            style={{
              bottom: `${fireLineY}%`,
              background: 'linear-gradient(to top, rgba(255,152,0,0.25), rgba(255,87,34,0.08), transparent)',
              opacity: burnProgress < 0.95 ? 1 : 0,
            }}
          />

          {/* Ember particles floating up from the fire line */}
          {embers.map((ember) => (
            <div
              key={ember.id}
              className="absolute rounded-full"
              style={{
                left: `${ember.x}%`,
                bottom: `calc(${fireLineY}% + 10px)`,
                width: ember.size,
                height: ember.size,
                background: `radial-gradient(circle, #ffcc02, #ff6600)`,
                boxShadow: '0 0 6px 2px rgba(255,165,0,0.6)',
                opacity: ember.opacity,
                animation: `ember-float ${1 + ember.speed}s ease-out forwards`,
                '--drift': `${ember.drift * 30}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          20% { transform: translate(-1px, 1px) rotate(-0.5deg); }
          40% { transform: translate(1px, -1px) rotate(0.5deg); }
          60% { transform: translate(-1px, -1px) rotate(-0.5deg); }
          80% { transform: translate(1px, 1px) rotate(0.5deg); }
        }

        @keyframes ember-float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-80px) translateX(var(--drift, 0px)) scale(0);
            opacity: 0;
          }
        }
      `}</style>

      {/* ======= MAIN MODAL ======= */}
      <div
        className={`w-full max-w-lg relative z-10 ${isBurning ? '' : ''}`}
        style={isBurning ? { animation: 'shake 0.25s linear infinite' } : {}}
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-red-500 mb-2 uppercase tracking-widest">
            Burn It
          </h2>
          <p className="text-text-muted text-sm max-w-sm mx-auto">
            Write down your frustration, stupid mistakes, or anger.
            Once burned, it&apos;s permanently deleted. Let it go.
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
            className={`transition-all duration-500 ${isBurning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
            } ${isBurning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            {isBurning ? 'BURNING...' : 'BURN IT'}
          </button>
        </div>
      </div>
    </div>
  );
}

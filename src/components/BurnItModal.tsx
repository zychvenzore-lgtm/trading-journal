'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';

interface BurnItModalProps {
  onClose: () => void;
}

/**
 * Fire-line equation (Fourier-inspired sum of sine waves):
 *
 *   y(x, t) = baseY
 *     + A₁·sin(ω₁·x + φ₁·t)     // slow, large undulation
 *     + A₂·sin(ω₂·x + φ₂·t + δ₂) // medium wave
 *     + A₃·sin(ω₃·x + φ₃·t + δ₃) // fast, small flicker
 *     + A₄·sin(ω₄·x + φ₄·t + δ₄) // high-freq noise
 *     + A₅·cos(ω₅·x + φ₅·t + δ₅) // asymmetric break
 *
 * Where baseY rises from cardHeight → -40 over the burn duration.
 * This produces an organic, ever-changing wavy edge.
 */

export default function BurnItModal({ onClose }: BurnItModalProps) {
  const [content, setContent] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [burnDone, setBurnDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleBurn = () => {
    if (!content.trim()) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200, 50, 300, 100, 400]);
    }

    setIsBurning(true);
  };

  useEffect(() => {
    if (!isBurning || !canvasRef.current || !cardRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const cardRect = cardRef.current.getBoundingClientRect();

    // Set canvas resolution (2x for retina sharpness)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cardRect.width * dpr;
    canvas.height = cardRect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = cardRect.width;
    const H = cardRect.height;

    const startTime = performance.now();
    const burnDuration = 3000; // 3 seconds to consume the card

    // Ember particles array
    const embers: {
      x: number; y: number;
      vx: number; vy: number;
      size: number; life: number; maxLife: number;
    }[] = [];

    // ─── Fire-line equation ───
    const fireLineY = (x: number, t: number, baseY: number): number => {
      return baseY
        + 14 * Math.sin(x * 0.035 + t * 2.8)          // A₁: slow large wave
        +  9 * Math.sin(x * 0.07  + t * 4.5 + 1.2)    // A₂: medium wave
        +  6 * Math.sin(x * 0.14  + t * 7.0 + 2.8)    // A₃: fast flicker
        +  3 * Math.sin(x * 0.28  + t * 11.0 + 4.1)   // A₄: high-freq noise
        +  5 * Math.cos(x * 0.05  + t * 3.5 + 0.9);   // A₅: asymmetric
    };

    // ─── Helper: trace the fire-line path ───
    const traceLine = (t: number, baseY: number, yOffset: number) => {
      ctx.beginPath();
      ctx.moveTo(-10, H + 10); // bottom-left (with margin)
      for (let x = -10; x <= W + 10; x += 2) {
        ctx.lineTo(x, fireLineY(x, t, baseY) + yOffset);
      }
      ctx.lineTo(W + 10, H + 10); // bottom-right
      ctx.closePath();
    };

    // ─── Animation loop ───
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = elapsed / 1000; // seconds
      const rawProgress = Math.min(elapsed / burnDuration, 1);

      // Smooth cubic ease-in-out for the rising speed
      const progress = rawProgress < 0.5
        ? 4 * rawProgress * rawProgress * rawProgress
        : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      // baseY: starts at H (bottom of card) → goes to -40 (above top)
      const baseY = H - progress * (H + 40);

      ctx.clearRect(0, 0, W, H);

      // ── Layer 1: Dark red glow (widest, most above fire line) ──
      traceLine(t, baseY, -28);
      ctx.fillStyle = 'rgba(80, 0, 0, 0.35)';
      ctx.fill();

      // ── Layer 2: Red fire ──
      traceLine(t, baseY, -18);
      ctx.fillStyle = 'rgba(200, 30, 0, 0.65)';
      ctx.fill();

      // ── Layer 3: Orange fire ──
      traceLine(t, baseY, -10);
      ctx.fillStyle = 'rgba(255, 130, 0, 0.85)';
      ctx.fill();

      // ── Layer 4: Yellow-white hot tips (narrowest) ──
      traceLine(t, baseY, -4);
      ctx.fillStyle = 'rgba(255, 230, 60, 0.95)';
      ctx.fill();

      // ── Layer 5: Solid black burned area (from fire line down) ──
      traceLine(t, baseY, 0);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // ── Ember particles ──
      // Spawn embers along the fire line
      if (rawProgress > 0.03 && rawProgress < 0.92 && Math.random() < 0.35) {
        const ex = Math.random() * W;
        embers.push({
          x: ex,
          y: fireLineY(ex, t, baseY) - 8,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -(0.8 + Math.random() * 2.0),
          size: 1.5 + Math.random() * 2.5,
          life: 0,
          maxLife: 25 + Math.random() * 35,
        });
      }

      // Update and draw embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.vy -= 0.02; // slight upward acceleration
        e.life++;

        const alpha = Math.max(0, 1 - e.life / e.maxLife);
        if (alpha <= 0) {
          embers.splice(i, 1);
          continue;
        }

        const r = e.size * alpha;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);

        // Color shifts from yellow → orange → red as ember cools
        const hue = 50 - (e.life / e.maxLife) * 30; // 50 (yellow) → 20 (orange-red)
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
        ctx.fill();
      }

      if (rawProgress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Fire has consumed the entire card
        setBurnDone(true);
        setTimeout(() => onCloseRef.current(), 600);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isBurning]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Main Modal Container */}
      <div className="w-full max-w-lg relative z-10">
        {/* Title (does NOT burn) */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-red-500 mb-2 uppercase tracking-widest">
            Burn It
          </h2>
          <p className="text-text-muted text-sm max-w-sm mx-auto">
            Write down your frustration, stupid mistakes, or anger.
            Once burned, it&apos;s permanently deleted. Let it go.
          </p>
        </div>

        {/* ═══ THE CARD THAT BURNS ═══ */}
        <div
          ref={cardRef}
          className={`relative rounded-xl overflow-hidden transition-opacity duration-500 ${
            burnDone ? 'opacity-0 scale-95' : 'opacity-100'
          }`}
          style={isBurning && !burnDone ? {
            animation: 'cardShake 0.2s linear infinite',
          } : {}}
        >
          {/* Card background */}
          <div className="bg-[#2A1D1D] border border-red-900/50 p-1 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
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

          {/* Canvas overlaid exactly on the card */}
          {isBurning && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full z-20 pointer-events-none"
            />
          )}
        </div>

        {/* Buttons (disappear when burning) */}
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

      <style>{`
        @keyframes cardShake {
          0%   { transform: translate( 0.0px,  0.0px) rotate(0.0deg); }
          20%  { transform: translate(-0.8px,  0.5px) rotate(-0.3deg); }
          40%  { transform: translate( 0.8px, -0.5px) rotate( 0.3deg); }
          60%  { transform: translate(-0.5px, -0.3px) rotate(-0.2deg); }
          80%  { transform: translate( 0.5px,  0.3px) rotate( 0.2deg); }
          100% { transform: translate( 0.0px,  0.0px) rotate(0.0deg); }
        }
      `}</style>
    </div>
  );
}

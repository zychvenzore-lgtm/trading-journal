'use client';

import React, { useEffect, useRef } from 'react';

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
  isBullish: boolean;
}

export default function InteractiveCandles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on base
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Physics state
    let targetY = height / 2;
    let currentY = height / 2;
    
    // Mouse tracking
    let mouseX = -1000;
    let mouseY = -1000;
    let isHovering = false;
    let marketWander = 0;
    
    // Market Simulation State
    let trendDirection = 1; 
    let trendStrength = 0;
    let ticksInCurrentTrend = 0;

    // Candle configuration
    const candleWidth = 14;
    const candleSpacing = 6;
    const totalCandleWidth = candleWidth + candleSpacing;
    const candles: Candle[] = [];
    
    let tickCounter = 0;
    const ticksPerCandle = 15; // Speed of candle creation
    let currentCandle: Candle | null = null;
    let scrollOffset = 0;

    // Colors: Blue neon for bullish, Red for bearish
    const colorBullish = '#0088ff';
    const colorBullishGlow = 'rgba(0, 136, 255, 0.6)';
    const colorBearish = '#ff2a2a';
    const colorBearishGlow = 'rgba(255, 42, 42, 0.5)';
    const gridColor = 'rgba(255, 255, 255, 0.04)';
    const bgColor = '#0f1115'; // Very dark background matching base-900

    // Resize handler
    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      if (!isHovering) {
        targetY = height / 2;
      }
      
      // Initialize if empty
      if (candles.length === 0) {
        currentY = height / 2;
        const maxCandles = Math.ceil(width / totalCandleWidth) + 2;
        for (let i = 0; i < maxCandles; i++) {
          candles.push(generateRandomCandle(currentY));
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovering = true;
      targetY = mouseY;
    };

    const handleMouseLeave = () => {
      isHovering = false;
      targetY = height / 2; // Return to equilibrium
      mouseX = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Generators
    function generateRandomCandle(baseY: number): Candle {
      const open = baseY;
      const close = open + (Math.random() - 0.5) * 40; 
      const high = Math.min(open, close) - Math.random() * 30;
      const low = Math.max(open, close) + Math.random() * 30;
      
      return {
        open,
        close,
        high,
        low,
        isBullish: close < open
      };
    }

    function createNewTick(baseY: number, target: number): Candle {
      const open = baseY;
      const distance = target - open;
      
      // Move a percentage towards the mouse + some noise
      const moveAmount = (distance * 0.08) + (Math.random() - 0.5) * 20;
      const close = open + moveAmount;
      
      const high = Math.min(open, close);
      const low = Math.max(open, close);

      return {
        open,
        close,
        high,
        low,
        isBullish: close < open
      };
    }

    // Main animation loop
    const render = () => {
      // Solid background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw subtle background grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      
      const gridOffset = scrollOffset % 40;
      for (let x = width - gridOffset; x > -40; x -= 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Equilibrium/Target line
      ctx.beginPath();
      ctx.moveTo(0, targetY);
      ctx.lineTo(width, targetY);
      ctx.strokeStyle = isHovering ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)';
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Update physics
      tickCounter++;
      scrollOffset += totalCandleWidth / ticksPerCandle;

      // Momentum-based market simulation (Trends & Pullbacks)
      if (ticksInCurrentTrend <= 0) {
        // 40% chance to reverse current trend (creates pullbacks)
        if (Math.random() > 0.6) {
          trendDirection *= -1;
        }
        // Trend lasts between 1 and 4 candles
        ticksInCurrentTrend = (Math.floor(Math.random() * 4) + 1) * ticksPerCandle;
        // Strength: Big push or small push
        trendStrength = (Math.random() * 80 + 20) * trendDirection;
      }
      
      ticksInCurrentTrend--;

      // Apply trend momentum + intra-candle volatility
      marketWander += (trendStrength / ticksPerCandle) + (Math.random() - 0.5) * 20;
      
      // Soft constraint to keep it loosely anchored to the cursor / center
      if (marketWander > 250) marketWander -= Math.abs(trendStrength / ticksPerCandle) + 2;
      if (marketWander < -250) marketWander += Math.abs(trendStrength / ticksPerCandle) + 2;
      
      const effectiveTargetY = targetY + marketWander;

      const lastClosedCandle = candles[candles.length - 1];
      if (!currentCandle) {
        currentCandle = createNewTick(lastClosedCandle.close, effectiveTargetY);
      } else {
        const distance = effectiveTargetY - currentCandle.open;
        const noise = (Math.random() - 0.5) * 20; // Increased noise for more natural wicks
        currentCandle.close = currentCandle.open + (distance * (tickCounter / ticksPerCandle)) + noise;
        currentCandle.isBullish = currentCandle.close < currentCandle.open;
        
        // Wicks are created naturally by the price (close) reaching an extreme and pulling back
        currentCandle.high = Math.min(currentCandle.high, currentCandle.close);
        currentCandle.low = Math.max(currentCandle.low, currentCandle.close);
      }

      // Lock candle in
      if (tickCounter >= ticksPerCandle) {
        candles.push({ ...currentCandle });
        currentCandle = null;
        tickCounter = 0;
        scrollOffset = 0;
        
        const maxCandles = Math.ceil(width / totalCandleWidth) + 2;
        if (candles.length > maxCandles) {
          candles.shift();
        }
      }

      // 4. Draw candles
      const drawCandle = (c: Candle, xPos: number) => {
        const color = c.isBullish ? colorBullish : colorBearish;
        const glowColor = c.isBullish ? colorBullishGlow : colorBearishGlow;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // Wick
        ctx.beginPath();
        ctx.moveTo(xPos + candleWidth / 2, c.high);
        ctx.lineTo(xPos + candleWidth / 2, c.low);
        ctx.stroke();

        // Body
        const bodyTop = Math.min(c.open, c.close);
        let bodyHeight = Math.abs(c.open - c.close);
        if (bodyHeight < 2) bodyHeight = 2; // Min body

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = glowColor;
        ctx.fillRect(xPos, bodyTop, candleWidth, bodyHeight);
        ctx.shadowBlur = 0;
      };

      const startX = width * 0.75;
      let x = startX - scrollOffset - totalCandleWidth;
      for (let i = candles.length - 1; i >= 0; i--) {
        drawCandle(candles[i], x);
        x -= totalCandleWidth;
      }

      if (currentCandle) {
        drawCandle(currentCandle, startX - scrollOffset);
      }

      // 5. Cursor visual
      if (isHovering && mouseX > 0) {
        ctx.beginPath();
        ctx.arc(mouseX, targetY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'white';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden bg-[#0f1115] pointer-events-auto z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair opacity-70"
      />
      {/* Edge fading to blend seamlessly with the rest of the UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-base-900 via-transparent to-base-900/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-base-900 via-transparent to-base-900/50 pointer-events-none" />
    </div>
  );
}

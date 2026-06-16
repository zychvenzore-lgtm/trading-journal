'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/** Plus-Circle / Journal icon */
const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

/** Clipboard / Notes icon */
const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

/** Calculator icon */
const CalculatorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="16" y1="14" x2="16" y2="14.01" />
    <line x1="16" y1="18" x2="16" y2="18.01" />
    <line x1="12" y1="14" x2="12" y2="14.01" />
    <line x1="12" y1="18" x2="12" y2="18.01" />
    <line x1="8" y1="14" x2="8" y2="14.01" />
    <line x1="8" y1="18" x2="8" y2="18.01" />
  </svg>
);

/** Flame / Burn icon */
const FlameIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

/** Main TradeVault T Icon */
const TIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`font-black tracking-tighter ${className}`}>T</div>
);

export default function MobileBubbleMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [positionY, setPositionY] = useState(typeof window !== 'undefined' ? window.innerHeight / 2 : 400);
  const [isDragging, setIsDragging] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  // Drag handling variables
  const dragStartY = useRef(0);
  const dragStartPosY = useRef(0);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartPosY.current = positionY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY.current;
    
    // Boundary check (keep within screen, approx 60px padding)
    let newY = dragStartPosY.current + deltaY;
    newY = Math.max(80, Math.min(window.innerHeight - 80, newY));
    
    setPositionY(newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // If it was just a click (moved very little), toggle open state
    if (Math.abs(e.clientY - dragStartY.current) < 5) {
      setIsOpen(!isOpen);
    }
  };

  const triggerEvent = (eventName: string) => {
    window.dispatchEvent(new Event(eventName));
    setIsOpen(false);
  };

  return (
    <div 
      className="md:hidden fixed right-4 z-50 pointer-events-none"
      style={{ 
        top: `${positionY}px`, 
        transform: 'translateY(-50%)'
      }}
    >
      <div 
        ref={bubbleRef} 
        className="relative pointer-events-auto"
      >
        {/* Radial Menu Items (Semi-circle) */}
        <div className={`absolute right-full top-1/2 -translate-y-1/2 mr-4 transition-all duration-300 origin-right ${
          isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-50 invisible'
        }`}>
          <div className="relative w-40 h-40">
            {/* 1. New Trade (Top Left) */}
            <button 
              onClick={() => triggerEvent('open-trade-form')}
              className="absolute top-0 right-10 w-12 h-12 bg-base-800 border border-base-600 rounded-full flex items-center justify-center text-accent shadow-lg active:scale-95 transition-transform"
            >
              <PlusCircleIcon className="w-5 h-5" />
            </button>
            
            {/* 2. Quick Note (Middle Left) */}
            <button 
              onClick={() => triggerEvent('open-notes-panel')}
              className="absolute top-1/2 -translate-y-1/2 right-[4.5rem] w-12 h-12 bg-base-800 border border-base-600 rounded-full flex items-center justify-center text-blue-400 shadow-lg active:scale-95 transition-transform"
            >
              <ClipboardIcon className="w-5 h-5" />
            </button>
            
            {/* 3. Calculator (Bottom Left) */}
            <button 
              onClick={() => triggerEvent('open-calculator-modal')}
              className="absolute bottom-0 right-10 w-12 h-12 bg-base-800 border border-base-600 rounded-full flex items-center justify-center text-purple-400 shadow-lg active:scale-95 transition-transform"
            >
              <CalculatorIcon className="w-5 h-5" />
            </button>
            
            {/* 4. Burn It (Center Left / Highest) */}
            <button 
              onClick={() => triggerEvent('open-burn-modal')}
              className="absolute -top-6 right-0 w-12 h-12 bg-base-800 border border-red-500/50 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95 transition-transform"
            >
              <FlameIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Draggable Bubble */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-grab active:cursor-grabbing transition-colors duration-200 select-none touch-none ${
            isOpen ? 'bg-accent text-base-900' : 'bg-base-800 border border-base-600 text-accent'
          }`}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <TIcon className="text-2xl" />
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [positionY, setPositionY] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setPositionY(window.innerHeight / 2);
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

  const radius = 100;
  const buttons = [
    { id: 'trade', icon: <PlusCircleIcon className="w-5 h-5" />, angle: -65, color: 'bg-accent text-base-900', event: 'open-trade-form' },
    { id: 'burn', icon: <FlameIcon className="w-5 h-5" />, angle: -22, color: 'bg-red-500 text-white', event: 'open-burn-modal' },
    { id: 'notes', icon: <ClipboardIcon className="w-5 h-5" />, angle: 22, color: 'bg-blue-500 text-white', event: 'open-notes-panel' },
    { id: 'calc', icon: <CalculatorIcon className="w-5 h-5" />, angle: 65, color: 'bg-purple-500 text-white', event: 'open-calculator-modal' },
  ];

  const getPosition = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    const x = -radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    return { x, y };
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
        {/* Radial Menu Container, exactly centered on main bubble */}
        <div className="absolute left-1/2 top-1/2 w-0 h-0 pointer-events-none">
          
          {/* SVG Thread (Benang Lingkaran) */}
          <div 
            className={`absolute left-1/2 top-1/2 w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
              isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          >
            <svg width="200" height="200" className="absolute top-0 left-0">
              <path 
                d="M 57.8 9.4 A 100 100 0 0 0 57.8 190.6" 
                fill="none" 
                stroke="currentColor"
                className="text-accent/40"
                strokeWidth="2" 
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* Radial Buttons */}
          {buttons.map((btn, index) => {
            const { x, y } = getPosition(btn.angle);
            return (
              <button
                key={btn.id}
                onClick={() => triggerEvent(btn.event)}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95 transition-all duration-300 pointer-events-auto ${btn.color} ${
                  isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-50 invisible'
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  transitionDelay: isOpen ? `${index * 40}ms` : '0ms'
                }}
              >
                {btn.icon}
              </button>
            );
          })}
        </div>

        {/* Main Draggable Bubble — Yellow (+) that rotates to (×) */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center bg-yellow-400 text-gray-900 shadow-[0_4px_20px_rgba(250,204,21,0.4)] cursor-grab active:cursor-grabbing select-none touch-none"
        >
          <svg 
            className="w-7 h-7 transition-transform duration-300 ease-in-out"
            style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>
    </div>
  );
}

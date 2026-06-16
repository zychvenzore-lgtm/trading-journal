'use client';

import React, { useState } from 'react';

interface FeatureCardProps {
  title: string;
  preview: string;
  details: string;
  icon: React.ReactNode;
}

export default function FeatureCard({ title, preview, details, icon }: FeatureCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-80 group perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`absolute w-full h-full transition-transform duration-700 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of the card (Preview) */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full glass rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-base-600/30 hover:border-accent/50 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
            {/* Subtle glow behind icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
            
            <div className="text-accent mb-6 z-10">
              {icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 z-10">{title}</h3>
            <p className="text-text-secondary z-10">{preview}</p>
            
            <div className="absolute bottom-4 text-xs text-text-muted flex items-center gap-1 z-10 opacity-60">
              <span>Click to flip</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Back of the card (Details) */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full glass-strong rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-accent/50 shadow-[0_0_40px_rgba(0,243,255,0.15)] relative overflow-hidden">
            {/* Inner glow on the back */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            
            <h3 className="text-xl font-bold text-white mb-4 z-10">{title}</h3>
            <p className="text-text-primary text-sm leading-relaxed z-10">
              {details}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

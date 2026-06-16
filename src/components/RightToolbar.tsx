'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/** Plus-Circle / Journal icon */
const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

/** Settings / Gear icon */
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/** Clipboard / Notes icon */
const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

export type RightPanelType = 'NONE' | 'ORDER' | 'SETTINGS' | 'PROFILE' | 'NOTES';

interface RightToolbarProps {
  activePanel: RightPanelType;
  onTogglePanel: (panel: RightPanelType) => void;
}

export default function RightToolbar({ activePanel, onTogglePanel }: RightToolbarProps) {
  const { t } = useLanguage();
  return (
    <aside className="hidden md:flex md:flex-col shrink-0 bg-base-800 border-l border-base-700 z-30 w-14 pb-4">
      <div className="flex-1 overflow-y-auto pt-4 flex flex-col items-center gap-2">
        <button
          onClick={() => onTogglePanel(activePanel === 'ORDER' ? 'NONE' : 'ORDER')}
          className={[
            'p-2.5 rounded-lg transition-all duration-200 focus:outline-none relative group',
            activePanel === 'ORDER'
              ? 'bg-accent/10 text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-base-700',
          ].join(' ')}
          aria-label="Toggle Order Panel"
        >
          <PlusCircleIcon className="w-6 h-6" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 px-2 py-1 bg-base-800 text-text-primary text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap border border-base-600 shadow-xl">
            {t('rightSidebar.orderPanel')}
          </div>
        </button>

        <button
          onClick={() => onTogglePanel(activePanel === 'NOTES' ? 'NONE' : 'NOTES')}
          className={[
            'p-2.5 rounded-lg transition-all duration-200 focus:outline-none relative group',
            activePanel === 'NOTES'
              ? 'bg-accent/10 text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-base-700',
          ].join(' ')}
          aria-label="Toggle Notes Panel"
        >
          <ClipboardIcon className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 px-2 py-1 bg-base-800 text-text-primary text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap border border-base-600 shadow-xl">
            Notes
          </div>
        </button>
      </div>

      {/* Bottom Settings Icon */}
      <div className="flex flex-col items-center gap-2 mt-auto border-t border-base-700 pt-4">
        <button
          onClick={() => onTogglePanel(activePanel === 'SETTINGS' ? 'NONE' : 'SETTINGS')}
          className={[
            'p-2.5 rounded-lg transition-all duration-200 focus:outline-none relative group',
            activePanel === 'SETTINGS'
              ? 'bg-accent/10 text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-base-700',
          ].join(' ')}
          aria-label="Toggle Settings Panel"
        >
          <SettingsIcon className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 px-2 py-1 bg-base-800 text-text-primary text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap border border-base-600 shadow-xl">
            {t('rightSidebar.settings')}
          </div>
        </button>
      </div>
    </aside>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import TradeForm from '@/components/forms/TradeForm';

import type { RightPanelType } from '@/components/RightToolbar';
import Button from '@/components/ui/Button';
import { useTheme, AppTheme } from '@/contexts/ThemeContext';
import { useLanguage, AppLanguage } from '@/contexts/LanguageContext';

interface RightSidebarProps {
  /** Which panel is currently active */
  activePanel: RightPanelType;
  /** Callback to close the sidebar */
  onClose: () => void;
}

/** Close icon (X) */
const CloseIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

/**
 * RightSidebar – A sliding panel on the right side for Settings and quick actions.
 */
const RightSidebar: React.FC<RightSidebarProps> = ({ activePanel, onClose }) => {
  const isOpen = activePanel !== 'NONE';
  const { theme, setTheme } = useTheme();
  const { language: activeLang, setLanguage, t } = useLanguage();
  
  const [editId, setEditId] = useState<string | undefined>(undefined);
  
  // Language State
  const [pendingLang, setPendingLang] = useState<AppLanguage | null>(null);

  useEffect(() => {
    const handleOpen = (e: any) => setEditId(e.detail?.tradeId);
    window.addEventListener('open-trade-form', handleOpen);
    return () => window.removeEventListener('open-trade-form', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) setEditId(undefined);
  }, [isOpen]);

  const themes: { id: AppTheme; label: string; desc: string }[] = [
    { id: 'cyberpunk', label: t('rightSidebar.cyberpunk'), desc: t('rightSidebar.cyberpunkDesc') },
    { id: 'technical', label: t('rightSidebar.technical'), desc: t('rightSidebar.technicalDesc') },
    { id: 'light', label: t('rightSidebar.light'), desc: t('rightSidebar.lightDesc') },
    { id: 'pastel', label: t('rightSidebar.pastel'), desc: t('rightSidebar.pastelDesc') },
  ];

  const languages = [
    { id: 'en', label: t('rightSidebar.english') },
    { id: 'id', label: t('rightSidebar.indonesian') },
  ];

  const handleLangClick = (langId: AppLanguage) => {
    if (langId !== activeLang) {
      setPendingLang(langId);
    }
  };

  const confirmLangChange = () => {
    if (pendingLang) {
      setLanguage(pendingLang);
      setPendingLang(null);
    }
  };

  return (
    <>
      {/* -------- Backdrop (Mobile only) -------- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* -------- Sidebar Panel -------- */}
      <aside
        className={[
          'shrink-0 bg-base-800 border-l border-base-700 z-40',
          'flex flex-col overflow-hidden',
          'transition-all duration-300 ease-in-out',
          isOpen ? 'w-[400px]' : 'w-0 border-none',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-700 shrink-0 bg-base-800">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            {activePanel === 'ORDER' ? t('rightSidebar.orderPanel') : t('rightSidebar.settings')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-base-700 transition-colors focus:outline-none"
            aria-label="Close panel"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-base-900 custom-scrollbar">
          {activePanel === 'ORDER' && <TradeForm editId={editId} onClose={onClose} />}
          
          {activePanel === 'SETTINGS' && (
            <div className="p-6 space-y-8">
              {/* Section: Appearance */}
              <section>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">{t('rightSidebar.appearance')}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex flex-col text-left p-3 rounded-lg border transition-all duration-200 ${
                        theme === t.id 
                          ? 'bg-accent/10 border-accent' 
                          : 'bg-base-800 border-base-600 hover:border-accent/50'
                      }`}
                    >
                      <span className="text-sm font-bold text-text-primary">{t.label}</span>
                      <span className="text-xs text-text-muted mt-1">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Section: Language */}
              <section>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">{t('rightSidebar.language')}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {languages.map((lang) => {
                    const isActive = activeLang === lang.id;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => handleLangClick(lang.id as AppLanguage)}
                        className={`flex flex-col text-left p-3 rounded-lg border transition-all duration-200 ${
                          isActive
                            ? 'bg-accent/10 border-accent'
                            : 'bg-base-800 border-base-600 hover:border-accent/50'
                        }`}
                      >
                        <span className="text-sm font-bold text-text-primary">{lang.label}</span>
                        {isActive && <span className="text-xs text-accent mt-1">{t('rightSidebar.active')}</span>}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </div>
      </aside>

      {/* -------- Language Confirmation Modal -------- */}
      {pendingLang && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-base-800 border border-base-600 rounded-xl max-w-sm w-full p-6 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-text-primary mb-2">{t('rightSidebar.changeLang')}</h3>
            <p className="text-text-secondary text-sm mb-6">
              {t('rightSidebar.changeLangConfirm').replace('{lang}', languages.find(l => l.id === pendingLang)?.label || '')}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPendingLang(null)}>
                {t('rightSidebar.cancel')}
              </Button>
              <Button variant="primary" onClick={confirmLangChange}>
                {t('rightSidebar.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RightSidebar;

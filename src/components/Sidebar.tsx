'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

/* -------------------------------------------------------------------------- */
/*                                   Icons                                    */
/* -------------------------------------------------------------------------- */

/** Grid/Overview icon */
const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

/** Settings / Gear icon */
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/** Plus-Circle / Journal icon */
const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

/** List / Ledger icon */
const ListIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

/** Book / Strategies icon */
const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

/** Chart / Analytics icon */
const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                              Navigation data                               */
/* -------------------------------------------------------------------------- */

interface NavItem {
  href: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const getNavItems = (t: (key: string) => string): NavItem[] => [
  { href: '/dashboard', label: t('sidebar.overview'), icon: GridIcon },
  { href: '/dashboard/ledger', label: t('sidebar.ledger'), icon: ListIcon },
  { href: '/dashboard/analytics', label: t('sidebar.analytics'), icon: ChartIcon },
  { href: '/dashboard/strategies', label: t('sidebar.strategies'), icon: BookIcon },
];

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

interface SidebarProps {
  /** Whether the mobile drawer is currently open */
  mobileOpen: boolean;
  /** Callback to close the mobile drawer */
  onMobileClose: () => void;
  /** Whether the desktop sidebar is collapsed */
  collapsed?: boolean;
  /** Callback to toggle the desktop sidebar collapse state */
  onToggleCollapse?: () => void;
}

/**
 * Sidebar – Fixed left navigation sidebar.
 *
 * - On desktop (md+): always visible, 256px wide
 * - On mobile (<md): hidden by default; rendered as a full-height overlay
 *   drawer controlled by the `mobileOpen` prop
 * - Active link is detected via Next.js `usePathname`
 * - An exact match is required for `/dashboard`; other routes use `startsWith`
 *
 * @example
 * <Sidebar mobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />
 */
const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose, collapsed = false, onToggleCollapse }) => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const navItems = getNavItems(t);

  /**
   * Determine if a nav item is currently active.
   * For the root `/dashboard` route we require an exact match to avoid
   * highlighting "Overview" when visiting sub-routes.
   */
  const isActive = (href: string): boolean => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  /** Shared navigation link list used by both desktop and mobile variants */
  const renderNavLinks = (isMobile = false) => (
    <nav className="flex flex-col gap-1 px-3 mt-6">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        const hideText = collapsed && !isMobile;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={isMobile ? onMobileClose : undefined}
            title={hideText ? item.label : undefined}
            className={[
              'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium relative group',
              'transition-all duration-200',
              hideText ? 'justify-center px-0' : 'px-3',
              active
                ? 'bg-accent/10 text-accent border-l-2 border-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-base-700',
            ].join(' ')}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!hideText && <span>{item.label}</span>}
            
            {/* Tooltip for collapsed state */}
            {hideText && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-base-700 text-text-primary text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap border border-base-600">
                {item.label}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );

  /** Footer with version info and collapse toggle */
  const renderFooter = (isMobile = false) => {
    const hideText = collapsed && !isMobile;
    return (
      <div className={`px-4 py-4 border-t border-base-700 flex items-center ${hideText ? 'justify-center' : 'justify-between'}`}>
        {!hideText && <p className="text-text-muted text-xs pl-2">{t('sidebar.version')}</p>}
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-base-600 transition-colors focus:outline-none"
            aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            <svg className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* -------- Desktop sidebar (md+) -------- */}
      <aside 
        className={`hidden md:flex md:flex-col shrink-0 bg-base-800 border-r border-base-700 z-30 transition-all duration-300 ease-in-out w-14`}
      >
        {/* Logo area */}
        <div className={`py-5 border-b border-base-700 flex items-center justify-center h-[56px]`}>
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold">
            T
          </div>
        </div>

        {/* renderNavLinks hardcoded to isMobile=false, hideText=true */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-2 px-2 mt-4">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={[
                    'flex items-center justify-center py-2.5 rounded-lg text-sm font-medium relative group',
                    'transition-all duration-200',
                    active
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-base-700',
                  ].join(' ')}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-4 px-2 py-1 bg-base-800 text-text-primary text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap border border-base-600 shadow-xl">
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* -------- Mobile drawer (<md) -------- */}
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 w-64 bg-base-800 border-r border-base-700 z-50',
          'flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-700">
          <h1 className="text-xl font-bold text-text-primary">
            Trade<span className="text-accent">Vault</span>
          </h1>
          <button
            type="button"
            onClick={onMobileClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-base-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label={t('sidebar.close')}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto">
          {renderNavLinks(true)}
        </div>

        {/* Mobile Action Buttons (Log Trade / Settings) */}
        <div className="md:hidden p-4 flex flex-col gap-3 border-t border-base-700">
          <button 
             onClick={() => {
               window.dispatchEvent(new Event('open-trade-form'));
               onMobileClose();
             }}
             className="w-full py-3 bg-accent text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-accent/90 active:scale-95 transition-all"
          >
             <PlusCircleIcon className="w-5 h-5" /> {t('rightSidebar.orderPanel')}
          </button>
          <button 
             onClick={() => {
               window.dispatchEvent(new Event('open-settings-panel'));
               onMobileClose();
             }}
             className="w-full py-3 bg-base-700 text-text-primary rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-base-600 active:scale-95 transition-all"
          >
             <SettingsIcon className="w-5 h-5" /> {t('rightSidebar.settings')}
          </button>
        </div>

        {renderFooter(true)}
      </aside>
    </>
  );
};

export default Sidebar;

'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AccountSwitcher from '@/components/AccountSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

/* -------------------------------------------------------------------------- */
/*                                   Icons                                    */
/* -------------------------------------------------------------------------- */

/** Settings / Gear icon */
const SettingsIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/** Hamburger menu icon for mobile sidebar toggle */
const MenuIcon: React.FC = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

/** Logout / sign-out icon */
const LogoutIcon: React.FC = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

interface NavbarProps {
  /** Callback to toggle the mobile sidebar drawer */
  onMenuToggle: () => void;
}

/**
 * Navbar – Sticky top navigation bar.
 *
 * Layout:
 * - Left: hamburger button (mobile only) + "TradeVault" logo
 * - Centre-right: AccountSwitcher dropdown
 * - Right: user avatar (image or initials fallback), display name, sign-out button
 *
 * The navbar uses a semi-transparent background with backdrop blur to
 * achieve a frosted-glass look consistent with the app's design language.
 *
 * @example
 * <Navbar onMenuToggle={() => setIsSidebarOpen((v) => !v)} />
 */
const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { profile, signOut } = useAuth();
  const { t } = useLanguage();

  /**
   * Extract up to two initials from the display name for the avatar fallback.
   * E.g. "John Doe" → "JD", "alice" → "A"
   */
  const initials = React.useMemo(() => {
    if (!profile?.display_name) return '?';
    return profile.display_name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [profile?.display_name]);

  return (
    <header className="sticky top-0 z-40 w-full bg-base-800/80 backdrop-blur-md border-b border-base-700">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* ---- Left section ---- */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-base-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </button>

          {/* Logo – visible on mobile only since the sidebar has it on desktop */}
          <h1 className="text-lg font-bold text-text-primary md:hidden">
            Trade<span className="text-accent">Vault</span>
          </h1>
        </div>

        {/* ---- Right section ---- */}
        <div className="flex items-center gap-4">
          {/* Saweria Button */}
          <div className="shrink-0 mr-1 sm:mr-2">
            <a
              href="https://saweria.co/Zychvenzore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 text-amber-500 text-xs sm:text-sm font-bold tracking-wide rounded-lg transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.15)] group"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="hidden sm:inline">Support on Saweria</span>
              <span className="sm:hidden">Support</span>
            </a>
          </div>

          {/* Account switcher (hidden on mobile) */}
          <div className="hidden sm:block">
            <AccountSwitcher />
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-base-600" />

          {/* User info */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-base-600"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center ring-2 ring-base-600">
                <span className="text-xs font-bold text-accent">
                  {initials}
                </span>
              </div>
            )}

            {/* Display name – hidden on very small screens */}
            <span className="hidden sm:block text-sm text-text-secondary font-medium">
              {profile?.display_name}
            </span>

            {/* Sign out */}
            <button
              type="button"
              onClick={signOut}
              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-base-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
              aria-label={t('topbar.signOut')}
              title={t('topbar.signOut')}
            >
              <LogoutIcon />
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-base-600 mx-1" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

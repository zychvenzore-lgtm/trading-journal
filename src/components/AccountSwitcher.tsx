'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAccounts } from '@/contexts/AccountContext';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

/* -------------------------------------------------------------------------- */
/*                                   Icons                                    */
/* -------------------------------------------------------------------------- */

/** Chevron for the dropdown trigger */
const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

/** Plus icon for the create button */
const PlusIcon: React.FC = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

/** Wallet icon for the trigger button */
const WalletIcon: React.FC = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M16 12h.01" />
    <path d="M2 10h20" />
  </svg>
);

/** Trash icon for the delete button */
const TrashIcon: React.FC = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm3.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                             Currency options                               */
/* -------------------------------------------------------------------------- */

const currencyOptions = [
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'GBP', label: 'GBP – British Pound' },
  { value: 'BTC', label: 'BTC – Bitcoin' },
];

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * AccountSwitcher – Dropdown component for switching between trading accounts.
 *
 * Features:
 * - Displays the currently active account name with a chevron trigger
 * - Dropdown lists all accounts with a radio-style indicator
 * - "Create New Account" button opens a modal with a form
 * - Click-outside or Escape closes the dropdown
 * - Modal form creates an account via the AccountContext
 *
 * @example
 * <AccountSwitcher />
 */
interface AccountSwitcherProps {
  variant?: 'navbar' | 'sidebar';
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({ variant = 'navbar' }) => {
  const { accounts, activeAccount, switchAccount, createAccount, deleteAccount, loading } =
    useAccounts();
  const { t } = useLanguage();

  /* ---- Local state ---- */
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formBalance, setFormBalance] = useState('');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formType, setFormType] = useState<'PERSONAL' | 'PROP_FIRM' | 'DEMO'>('PERSONAL');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  /* ---- Click-outside handler ---- */
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  /* ---- Escape key handler for dropdown ---- */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };
    if (isDropdownOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isDropdownOpen]);

  /* ---- Account selection & deletion ---- */
  const handleSelectAccount = (accountId: string) => {
    switchAccount(accountId);
    setIsDropdownOpen(false);
  };

  const handleDeleteAccount = async (e: React.MouseEvent, accountId: string, accountName: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${accountName}" and all its trades? This action cannot be undone.`)) {
      await deleteAccount(accountId);
    }
  };

  /* ---- Modal open/close ---- */
  const openCreateModal = () => {
    setIsDropdownOpen(false);
    setIsModalOpen(true);
    // Reset form
    setFormName('');
    setFormBalance('');
    setFormCurrency('USD');
    setFormType('PERSONAL');
    setFormErrors({});
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
  };

  /* ---- Form validation & submission ---- */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formName.trim()) {
      errors.name = 'Account name is required';
    }

    const balanceNum = parseFloat(formBalance);
    if (!formBalance || isNaN(balanceNum) || balanceNum < 0) {
      errors.balance = 'Enter a valid starting balance';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await createAccount(
        formName.trim(),
        parseFloat(formBalance),
        formCurrency,
        formType
      );
      closeCreateModal();
    } catch {
      setFormErrors({ name: 'Failed to create account. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ---- Dropdown wrapper ---- */}
      <div ref={wrapperRef} className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen((v) => !v)}
          className={[
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
            'bg-base-700 border border-base-600',
            'text-text-secondary hover:text-text-primary',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent/50',
            variant === 'sidebar' ? 'w-full justify-between' : '',
          ].join(' ')}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <WalletIcon />
            <span className={variant === 'sidebar' ? 'truncate text-left' : 'max-w-[120px] truncate'}>
            {loading ? 'Loading...' : activeAccount?.name ?? 'No account'}
            </span>
          </div>
          <ChevronDown
            className={[
              'h-4 w-4 transition-transform duration-200',
              isDropdownOpen ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>

        {/* Dropdown panel */}
        {isDropdownOpen && (
          <div
            className={[
              'absolute mt-2 rounded-xl overflow-hidden',
              variant === 'sidebar' ? 'left-0 w-full' : 'right-0 w-64',
              'bg-base-800 border border-base-600 shadow-xl',
              'animate-[modalFadeIn_150ms_ease-out]',
              'z-50',
            ].join(' ')}
            role="listbox"
          >
            {/* Account label */}
            <div className="px-4 py-2.5 border-b border-base-700">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {t('topbar.accounts')}
              </p>
            </div>

            {/* Account list */}
            <div className="max-h-48 overflow-y-auto">
              {accounts.length === 0 && (
                <p className="px-4 py-3 text-sm text-text-muted">
                  {t('topbar.noAccountsYet')}
                </p>
              )}

              {accounts.map((account) => {
                const isActive = account.id === activeAccount?.id;
                return (
                  <div
                    key={account.id}
                    className={[
                      'group flex items-center justify-between w-full px-4 py-2.5 text-left text-sm',
                      'transition-all duration-200 cursor-pointer',
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-secondary hover:bg-base-700 hover:text-text-primary',
                    ].join(' ')}
                  >
                    {/* Clickable area for selection */}
                    <div 
                      className="flex items-center gap-3 flex-1 min-w-0" 
                      onClick={() => handleSelectAccount(account.id)}
                      role="option"
                      aria-selected={isActive}
                    >
                      {/* Radio-style indicator */}
                      <span
                        className={[
                          'h-3.5 w-3.5 rounded-full border-2 shrink-0 flex items-center justify-center',
                          isActive ? 'border-accent' : 'border-base-500',
                        ].join(' ')}
                      >
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        )}
                      </span>

                      {/* Account info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{account.name}</p>
                          {account.account_type === 'PROP_FIRM' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00a3ff]/20 text-[#00a3ff] uppercase tracking-wider">
                              PROP
                            </span>
                          )}
                          {account.account_type === 'DEMO' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-warning/20 text-warning uppercase tracking-wider">
                              DEMO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          {account.currency} · {account.starting_balance.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteAccount(e, account.id, account.name)}
                      className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                      aria-label={`Delete ${account.name}`}
                      title="Delete Account"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Create new account button */}
            <div className="border-t border-base-700 p-2">
              <button
                type="button"
                onClick={openCreateModal}
                className={[
                  'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm',
                  'text-accent hover:bg-accent/10',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-accent/50',
                ].join(' ')}
              >
                <PlusIcon />
                <span>{t('topbar.createAccount')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Inline animation keyframe (reused from Modal) */}
        {isDropdownOpen && (
          <style>{`
            @keyframes modalFadeIn {
              from { opacity: 0; transform: scale(0.95) translateY(-4px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        )}
      </div>

      {/* ---- Create Account Modal ---- */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeCreateModal}
        title={t('topbar.createAccount')}
        maxWidth="sm"
      >
        <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
          {/* Account Name */}
          <Input
            label={t('topbar.accountName')}
            placeholder="e.g. Main Futures Account"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            error={formErrors.name}
            required
          />

          {/* Starting Balance */}
          <Input
            label={t('topbar.balance')}
            type="number"
            placeholder="e.g. 10000"
            value={formBalance}
            onChange={(e) => setFormBalance(e.target.value)}
            error={formErrors.balance}
            min="0"
            step="0.01"
            required
          />

          {/* Currency & Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('topbar.currency')}
              options={currencyOptions}
              value={formCurrency}
              onChange={(e) => setFormCurrency(e.target.value)}
              required
            />
            
            <Select
              label={t('topbar.accountType')}
              options={[
                { value: 'PERSONAL', label: t('topbar.personal') },
                { value: 'PROP_FIRM', label: t('topbar.propFirm') },
                { value: 'DEMO', label: t('topbar.demo') }
              ]}
              value={formType}
              onChange={(e) => setFormType(e.target.value as 'PERSONAL' | 'PROP_FIRM' | 'DEMO')}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeCreateModal}
            >
              {t('topbar.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              {t('topbar.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AccountSwitcher;

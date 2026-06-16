/**
 * ============================================================
 * JOURNAL PAGE — Trade Entry Form
 * Full-featured form for logging trades with validation.
 * ============================================================
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTrades } from '@/contexts/TradeContext';
import { useAccounts } from '@/contexts/AccountContext';
import { useStrategies } from '@/contexts/StrategyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ImageUpload from '@/components/ui/ImageUpload';
import type { TradeDirection, Strategy, TradeFormData, PositionType } from '@/types';

/** Default form values */
const INITIAL_FORM: TradeFormData = {
  ticker: '',
  direction: 'LONG',
  position_type: 'MARGIN',
  entry_price: '',
  stop_loss: '',
  take_profit: '',
  position_size: '',
  leverage: '1',
  entry_time: '',
  close_time: '',
  exit_price: '',
  fees: '0',
  strategy: '',
  reason: '',
  chart_link: '',
  realized_pnl: '',
};

interface TradeFormProps {
  editId?: string;
  onClose?: () => void;
}

export default function TradeForm({ editId, onClose }: TradeFormProps) {
  const { addTrade, updateTrade, trades } = useTrades();
  const { activeAccount } = useAccounts();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { strategies } = useStrategies();

  const [form, setForm] = useState<TradeFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TradeFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  /** Update a single form field */
  const setField = useCallback(
    <K extends keyof TradeFormData>(key: K, value: TradeFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear error on change
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  /** Populate form if editing */
  useEffect(() => {
    if (editId && trades.length > 0) {
      const tradeToEdit = trades.find(t => t.id === editId);
      if (tradeToEdit) {
        setForm({
          ticker: tradeToEdit.ticker,
          direction: tradeToEdit.direction,
          position_type: tradeToEdit.position_type || 'MARGIN',
          entry_price: tradeToEdit.entry_price.toString(),
          stop_loss: tradeToEdit.stop_loss ? tradeToEdit.stop_loss.toString() : '',
          take_profit: tradeToEdit.take_profit ? tradeToEdit.take_profit.toString() : '',
          position_size: tradeToEdit.position_size.toString(),
          leverage: tradeToEdit.leverage.toString(),
          entry_time: tradeToEdit.entry_time.slice(0, 16), // datetime-local format
          close_time: tradeToEdit.close_time ? tradeToEdit.close_time.slice(0, 16) : '',
          exit_price: tradeToEdit.exit_price ? tradeToEdit.exit_price.toString() : '',
          fees: tradeToEdit.fees.toString(),
          strategy: tradeToEdit.strategy || '',
          reason: tradeToEdit.reason || '',
          chart_link: tradeToEdit.chart_link || '',
          realized_pnl: tradeToEdit.realized_pnl ? tradeToEdit.realized_pnl.toString() : '',
        });
      }
    }
  }, [editId, trades]);

  /** Validate form fields */
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TradeFormData, string>> = {};

    if (!form.ticker.trim()) newErrors.ticker = 'Ticker is required';
    if (!form.entry_price || Number(form.entry_price) <= 0)
      newErrors.entry_price = 'Valid entry price is required';
    if (!form.position_size || Number(form.position_size) <= 0)
      newErrors.position_size = 'Valid position size is required';
    if (!form.entry_time) newErrors.entry_time = 'Entry time is required';
    if (Number(form.leverage) < 1) newErrors.leverage = 'Leverage must be ≥ 1';

    // If exit price is provided, close time should be too
    if (form.exit_price && !form.close_time) {
      newErrors.close_time = 'Close time required when exit price is set';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Handle form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !activeAccount || !user) return;

    setSubmitting(true);
    try {
      const tradeData = {
        ticker: form.ticker.toUpperCase().trim(),
        direction: form.direction,
        position_type: form.position_type,
        entry_price: Number(form.entry_price),
        stop_loss: form.stop_loss ? Number(form.stop_loss) : null,
        take_profit: form.take_profit ? Number(form.take_profit) : null,
        position_size: Number(form.position_size),
        leverage: form.position_type === 'MARGIN' ? Number(form.leverage) : 1,
        entry_time: new Date(form.entry_time).toISOString(),
        close_time: form.close_time ? new Date(form.close_time).toISOString() : null,
        exit_price: form.exit_price ? Number(form.exit_price) : null,
        fees: Number(form.fees) || 0,
        strategy: (form.strategy as Strategy) || null,
        reason: form.reason.trim() || null,
        chart_link: form.chart_link.trim() || null,
        realized_pnl: form.realized_pnl ? Number(form.realized_pnl) : null,
      };

      if (editId) {
        await updateTrade(editId, tradeData);
        // showToast('Trade updated successfully!', 'success');
        if (onClose) onClose();
      } else {
        await addTrade({
          account_id: activeAccount.id,
          user_id: user.id,
          ...tradeData,
        });
        // showToast('Trade logged successfully!', 'success');
        setForm(INITIAL_FORM);
        if (onClose) onClose();
      }
    } catch (err) {
      console.error('Failed to save trade:', err);
      showToast('Failed to save trade. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in p-4 md:p-6 pb-24">
      {/* ---- Page Header ---- */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {editId ? t('tradeForm.editTrade') : t('tradeForm.newTradeEntry')}
        </h1>
        <p className="text-text-secondary mt-1">
          {editId ? t('tradeForm.updateTradeDetails') : t('tradeForm.logNewTrade')}{' '}
          {activeAccount && (
            <span className="text-accent">{activeAccount.name}</span>
          )}
        </p>
      </div>

      {!activeAccount ? (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-text-muted">
            {t('tradeForm.pleaseCreateAccount')}
          </p>
        </div>
      ) : activeAccount.account_type === 'DEMO' && trades.length >= 15 && !editId ? (
        <div className="glass rounded-xl p-8 text-center border-warning/20">
          <svg className="w-12 h-12 text-warning mx-auto mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-text-primary font-bold mb-2">{t('tradeForm.demoLimitReached')}</p>
          <p className="text-text-muted text-sm">
            {t('tradeForm.demoLimitDesc')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---- Section: Asset & Direction ---- */}
          <div className="glass rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              {t('tradeForm.assetDirection')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Ticker */}
              <Input
                label={t('tradeForm.ticker')}
                name="ticker"
                placeholder="e.g. BTCUSDT"
                value={form.ticker}
                onChange={(e) => setField('ticker', e.target.value.toUpperCase())}
                error={errors.ticker}
                required
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
              />

              {/* Direction Toggle */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {t('tradeForm.direction')}
                </label>
                <div className="flex rounded-lg overflow-hidden border border-base-600">
                  <button
                    type="button"
                    onClick={() => setField('direction', 'LONG')}
                    className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-200 ${
                      form.direction === 'LONG'
                        ? 'bg-accent text-white shadow-lg shadow-accent/25'
                        : 'bg-base-700 text-text-muted hover:text-text-primary hover:bg-base-600'
                    }`}
                  >
                    ▲ LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setField('direction', 'SHORT')}
                    className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-200 ${
                      form.direction === 'SHORT'
                        ? 'bg-danger text-white shadow-lg shadow-danger/25'
                        : 'bg-base-700 text-text-muted hover:text-text-primary hover:bg-base-600'
                    }`}
                  >
                    ▼ SHORT
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Section: Price Data ---- */}
          <div className="glass rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              {t('tradeForm.priceData')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                label={t('tradeForm.entryPrice')}
                name="entry_price"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={form.entry_price}
                onChange={(e) => setField('entry_price', e.target.value)}
                error={errors.entry_price}
                required
              />
              <Input
                label={t('tradeForm.stopLoss')}
                name="stop_loss"
                type="number"
                step="any"
                min="0"
                placeholder="Optional"
                value={form.stop_loss}
                onChange={(e) => setField('stop_loss', e.target.value)}
              />
              <Input
                label={t('tradeForm.takeProfit')}
                name="take_profit"
                type="number"
                step="any"
                min="0"
                placeholder="Optional"
                value={form.take_profit}
                onChange={(e) => setField('take_profit', e.target.value)}
              />
            </div>
          </div>

          {/* ---- Section: Position Sizing ---- */}
          <div className="glass rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
                {t('tradeForm.positionSizing')}
              </h2>
              {/* Position Type Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-base-600 bg-base-800 p-1">
                {(['MARGIN', 'QUANTITY', 'LOTS'] as PositionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setField('position_type', type)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      form.position_type === type
                        ? 'bg-base-600 text-text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-secondary hover:bg-base-700/50'
                    }`}
                  >
                    {type === 'MARGIN' ? t('tradeForm.cryptoMargin') : type === 'QUANTITY' ? t('tradeForm.spotShares') : t('tradeForm.forexLots')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label={
                  form.position_type === 'MARGIN' 
                    ? t('tradeForm.marginAmount') 
                    : form.position_type === 'QUANTITY' 
                    ? t('tradeForm.quantity') 
                    : t('tradeForm.numberOfLots')
                }
                name="position_size"
                type="number"
                step="any"
                min="0"
                placeholder={form.position_type === 'MARGIN' ? "e.g. 100" : form.position_type === 'LOTS' ? "e.g. 1.5" : "e.g. 2.5"}
                value={form.position_size}
                onChange={(e) => setField('position_size', e.target.value)}
                error={errors.position_size}
                required
              />
              {form.position_type === 'MARGIN' && (
                <Input
                  label={t('tradeForm.leverageMultiplier')}
                  name="leverage"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="20"
                  value={form.leverage}
                  onChange={(e) => setField('leverage', e.target.value)}
                  error={errors.leverage}
                />
              )}
            </div>
          </div>

          {/* ---- Section: Timestamps ---- */}
          <div className="glass rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              {t('tradeForm.timestamps')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label={t('tradeForm.entryTime')}
                name="entry_time"
                type="datetime-local"
                value={form.entry_time}
                onChange={(e) => setField('entry_time', e.target.value)}
                error={errors.entry_time}
                required
              />
              <Input
                label={t('tradeForm.closeTime')}
                name="close_time"
                type="datetime-local"
                value={form.close_time}
                onChange={(e) => setField('close_time', e.target.value)}
                error={errors.close_time}
              />
            </div>
          </div>

          {/* ---- Section: Exit & Fees ---- */}
          <div className="glass rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              {t('tradeForm.exitDataFees')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                label={t('tradeForm.actualExitPrice')}
                name="exit_price"
                type="number"
                step="any"
                min="0"
                placeholder="Leave empty for open trades"
                value={form.exit_price}
                onChange={(e) => setField('exit_price', e.target.value)}
              />
              <Input
                label={t('tradeForm.tradingFees')}
                name="fees"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={form.fees}
                onChange={(e) => setField('fees', e.target.value)}
              />
              <Input
                label={t('tradeForm.realizedPnlOpt')}
                name="realized_pnl"
                type="number"
                step="any"
                placeholder="Override auto-calculation"
                value={form.realized_pnl}
                onChange={(e) => setField('realized_pnl', e.target.value)}
              />
            </div>
          </div>

          {/* ---- Section: Context & Classification ---- */}
          <div className="glass rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              {t('tradeForm.tradeContext')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label={t('tradeForm.strategyTag')}
                name="strategy"
                value={form.strategy}
                onChange={(e) => setField('strategy', e.target.value as Strategy | '')}
                placeholder={t('tradeForm.selectStrategy')}
                options={strategies.map((s) => ({ value: s.name, label: s.name }))}
              />
              <ImageUpload
                label={t('tradeForm.chartScreenshot')}
                value={form.chart_link}
                onChange={(url) => setField('chart_link', url)}
              />
            </div>

            {/* Reason for Entry */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('tradeForm.reasonForEntry')}
              </label>
              <textarea
                name="reason"
                rows={4}
                placeholder={t('tradeForm.reasonPlaceholder')}
                value={form.reason}
                onChange={(e) => setField('reason', e.target.value)}
                className="w-full bg-base-800 border border-base-600 rounded-lg px-4 py-3 
                           text-text-primary placeholder:text-text-muted text-sm
                           focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50
                           transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* ---- Submit Button ---- */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  setForm(INITIAL_FORM);
                  setErrors({});
                }
              }}
            >
              {editId ? t('tradeForm.cancel') : t('tradeForm.reset')}
            </Button>
            <Button type="submit" variant="primary" size="lg" loading={submitting}>
              {editId ? t('tradeForm.updateTrade') : t('tradeForm.logTrade')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

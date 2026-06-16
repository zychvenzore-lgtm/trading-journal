/**
 * ============================================================
 * LEDGER PAGE — Trade History Log
 * Sortable, filterable data table of all trades.
 * ============================================================
 */
'use client';

import { useState, useMemo, useCallback } from 'react';

import { useTrades } from '@/contexts/TradeContext';
import { useToast } from '@/components/ui/Toast';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CSVManager from '@/components/CSVManager';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { calcPnL, getOutcome } from '@/lib/analytics';
import { formatCurrency, formatDateTime, formatDuration } from '@/lib/utils';
import type { Trade, TradeOutcome, Strategy } from '@/types';
import { STRATEGY_OPTIONS } from '@/types';

/** Sort column keys */
type SortKey = 'entry_time' | 'ticker' | 'pnl' | 'duration';
type SortDir = 'asc' | 'desc';

export default function LedgerPage() {
  const { trades, deleteTrade, loading } = useTrades();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();

  /* ---- Filter state ---- */
  const [filterTicker, setFilterTicker] = useState('');
  const [filterStrategy, setFilterStrategy] = useState<Strategy | ''>('');
  const [filterOutcome, setFilterOutcome] = useState<TradeOutcome | ''>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  /* ---- Sort state ---- */
  const [sortKey, setSortKey] = useState<SortKey>('entry_time');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* ---- Detail modal ---- */
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  /* ---- Quick Close State ---- */
  const [isClosing, setIsClosing] = useState(false);
  const [closePrice, setClosePrice] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [closeFees, setCloseFees] = useState('');
  const { updateTrade } = useTrades();

  /** Toggle sort on column header click */
  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('desc');
      }
    },
    [sortKey]
  );

  /** Sort indicator icon */
  const SortIcon = ({ column }: { column: SortKey }) => (
    <span className="ml-1 inline-block">
      {sortKey === column ? (
        sortDir === 'asc' ? '↑' : '↓'
      ) : (
        <span className="opacity-30">↕</span>
      )}
    </span>
  );

  /** Compute PnL & outcome for each trade, then filter & sort */
  const processedTrades = useMemo(() => {
    // Enrich trades with computed fields
    const enriched = trades.map((t) => ({
      ...t,
      _pnl: calcPnL(t),
      _outcome: getOutcome(t),
      _duration:
        t.close_time && t.entry_time
          ? new Date(t.close_time).getTime() - new Date(t.entry_time).getTime()
          : 0,
    }));

    // Apply filters
    let filtered = enriched;

    if (filterTicker) {
      const q = filterTicker.toUpperCase();
      filtered = filtered.filter((t) => t.ticker.includes(q));
    }

    if (filterStrategy) {
      filtered = filtered.filter((t) => t.strategy === filterStrategy);
    }

    if (filterOutcome) {
      filtered = filtered.filter((t) => t._outcome === filterOutcome);
    }

    if (filterDateFrom) {
      const from = new Date(filterDateFrom).getTime();
      filtered = filtered.filter((t) => new Date(t.entry_time).getTime() >= from);
    }

    if (filterDateTo) {
      const to = new Date(filterDateTo).getTime();
      filtered = filtered.filter((t) => new Date(t.entry_time).getTime() <= to);
    }

    // Apply sort
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'entry_time':
          cmp = new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime();
          break;
        case 'ticker':
          cmp = a.ticker.localeCompare(b.ticker);
          break;
        case 'pnl':
          cmp = a._pnl - b._pnl;
          break;
        case 'duration':
          cmp = a._duration - b._duration;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [trades, filterTicker, filterStrategy, filterOutcome, filterDateFrom, filterDateTo, sortKey, sortDir]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTrade(id);
      showToast('Trade deleted', 'info');
      setDeleteConfirm(null);
      setSelectedTrade(null);
      setIsClosing(false);
    } catch {
      showToast('Failed to delete trade', 'error');
    }
  };

  /** Handle quick close submission */
  const handleQuickClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade) return;

    const exitPriceNum = parseFloat(closePrice);
    if (isNaN(exitPriceNum)) {
      showToast('Invalid exit price', 'error');
      return;
    }

    try {
      const updated = await updateTrade(selectedTrade.id, {
        exit_price: exitPriceNum,
        close_time: new Date(closeTime).toISOString(),
        fees: closeFees ? parseFloat(closeFees) : 0,
      });

      if (updated) {
        showToast('Position closed successfully!', 'success');
        setSelectedTrade(updated); // Update modal to show closed details
        setIsClosing(false);
      } else {
        showToast('Failed to close position.', 'error');
      }
    } catch {
      showToast('An error occurred.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in bg-base-900">
      {/* ---- Page Header ---- */}
      <div className="shrink-0 flex items-center justify-between gap-3 p-4 border-b border-base-700">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-text-primary">{t('ledger.title')}</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {processedTrades.length} {processedTrades.length !== 1 ? t('ledger.tradesFound') : t('ledger.tradeFound')}
          </p>
        </div>

        {/* Right side: icon buttons on mobile, full CSVManager on desktop */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile: small icon buttons for export/import + filter toggle */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                showFilters
                  ? 'bg-accent/20 border-accent/50 text-accent'
                  : 'bg-base-800 border-base-600 text-text-muted'
              }`}
              title="Filters"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>

          {/* Desktop: full CSVManager */}
          <div className="hidden md:block">
            <CSVManager />
          </div>
        </div>
      </div>

      {/* ---- Filters Bar (collapsible on mobile) ---- */}
      <div className={`shrink-0 bg-base-800 border-b border-base-700 overflow-hidden transition-all duration-300 ease-in-out ${
        showFilters ? 'max-h-[500px] p-3' : 'max-h-0 p-0 md:max-h-[500px] md:p-3'
      }`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Ticker Search */}
          <input
            type="text"
            placeholder={t('ledger.searchPlaceholder')}
            value={filterTicker}
            onChange={(e) => setFilterTicker(e.target.value)}
            className="bg-base-800 border border-base-600 rounded-lg px-3 py-2 text-sm text-text-primary
                       placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50
                       transition-all duration-200"
          />

          {/* Strategy Filter */}
          <select
            value={filterStrategy}
            onChange={(e) => setFilterStrategy(e.target.value as Strategy | '')}
            className="bg-base-800 border border-base-600 rounded-lg px-3 py-2 text-sm text-text-primary
                       focus:outline-none focus:border-accent transition-all duration-200"
          >
            <option value="">{t('ledger.allStrategies')}</option>
            {STRATEGY_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Outcome Filter */}
          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value as TradeOutcome | '')}
            className="bg-base-800 border border-base-600 rounded-lg px-3 py-2 text-sm text-text-primary
                       focus:outline-none focus:border-accent transition-all duration-200"
          >
            <option value="">{t('ledger.allOutcomes')}</option>
            <option value="WIN">{t('ledger.filterWin')}</option>
            <option value="LOSS">{t('ledger.filterLoss')}</option>
            <option value="BREAKEVEN">{t('ledger.filterBreakeven')}</option>
            <option value="OPEN">{t('ledger.filterOpen')}</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="bg-base-800 border border-base-600 rounded-lg px-3 py-2 text-sm text-text-primary
                       focus:outline-none focus:border-accent transition-all duration-200"
          />

          {/* Date To */}
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="bg-base-800 border border-base-600 rounded-lg px-3 py-2 text-sm text-text-primary
                       focus:outline-none focus:border-accent transition-all duration-200"
          />

          {/* Clear Filters */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterTicker('');
              setFilterStrategy('');
              setFilterOutcome('');
              setFilterDateFrom('');
              setFilterDateTo('');
              setShowFilters(false);
            }}
          >
            {t('ledger.clear')}
          </Button>
        </div>
      </div>

      {/* ---- Data Table ---- */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {processedTrades.length === 0 ? (
          <div className="px-6 py-16 text-center text-text-muted">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg">{t('ledger.noTradesFound')}</p>
            <p className="text-sm mt-1">{t('ledger.tryAdjusting')}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar">
            {/* Desktop Table View */}
            <table className="w-full text-sm text-left hidden md:table">
              <thead className="sticky top-0 bg-base-800 z-10 border-b border-base-700">
                <tr className="text-text-muted text-xs uppercase tracking-wider">
                  <th
                    className="text-left px-5 py-3.5 font-medium cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => toggleSort('entry_time')}
                  >
                    {t('dashboard.date')} <SortIcon column="entry_time" />
                  </th>
                  <th
                    className="text-left px-5 py-3.5 font-medium cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => toggleSort('ticker')}
                  >
                    {t('dashboard.ticker')} <SortIcon column="ticker" />
                  </th>
                  <th className="text-left px-5 py-3.5 font-medium">{t('dashboard.direction')}</th>
                  <th className="text-right px-5 py-3.5 font-medium">{t('dashboard.entry')}</th>
                  <th className="text-right px-5 py-3.5 font-medium">{t('dashboard.exit')}</th>
                  <th className="text-left px-5 py-3.5 font-medium">{t('ledger.strategy')}</th>
                  <th
                    className="text-right px-5 py-3.5 font-medium cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => toggleSort('pnl')}
                  >
                    {t('dashboard.pnl')} <SortIcon column="pnl" />
                  </th>
                  <th
                    className="text-right px-5 py-3.5 font-medium cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => toggleSort('duration')}
                  >
                    {t('ledger.duration')} <SortIcon column="duration" />
                  </th>
                  <th className="text-center px-5 py-3.5 font-medium">{t('dashboard.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-700/30">
                {processedTrades.map((trade) => (
                  <tr
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade)}
                    className="hover:bg-base-700/20 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3 text-text-secondary whitespace-nowrap flex items-center gap-2">
                      {trade._outcome === 'OPEN' && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                      )}
                      {formatDateTime(trade.entry_time)}
                    </td>
                    <td className="px-5 py-3 text-text-primary font-mono font-medium">
                      {trade.ticker}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-bold text-xs ${trade.direction === 'LONG' ? 'text-accent' : 'text-danger'}`}>
                        {trade.direction === 'LONG' ? '▲' : '▼'} {trade.direction}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-text-secondary font-mono text-xs">
                      {trade.entry_price.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-text-secondary font-mono text-xs">
                      {trade.exit_price?.toLocaleString() ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-text-muted text-xs">
                      {trade.strategy || '—'}
                    </td>
                    <td className={`px-5 py-3 text-right font-mono font-medium ${
                      trade._pnl > 0 ? 'text-accent' : trade._pnl < 0 ? 'text-danger' : 'text-text-muted'
                    }`}>
                      {trade._pnl > 0 ? '+' : ''}{formatCurrency(trade._pnl)}
                    </td>
                    <td className="px-5 py-3 text-right text-text-muted text-xs">
                      {trade._duration > 0 ? formatDuration(trade._duration) : '—'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={trade._outcome.toLowerCase() as 'win' | 'loss' | 'breakeven' | 'open'}>
                        {trade._outcome === 'WIN' ? t('ledger.filterWin') : trade._outcome === 'LOSS' ? t('ledger.filterLoss') : trade._outcome === 'BREAKEVEN' ? t('ledger.filterBreakeven') : t('ledger.filterOpen')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col p-4 gap-4 pb-20">
              {processedTrades.map((trade) => (
                <div 
                  key={trade.id}
                  onClick={() => setSelectedTrade(trade)}
                  className="bg-base-800 border border-base-700 rounded-xl p-4 flex flex-col gap-3 shadow-md hover:border-accent/40 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg tracking-wide">{trade.ticker}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${trade.direction === 'LONG' ? 'text-accent border-accent/30 bg-accent/10' : 'text-danger border-danger/30 bg-danger/10'}`}>
                        {trade.direction}
                      </span>
                    </div>
                    <Badge variant={trade._outcome.toLowerCase() as any}>
                      {trade._outcome === 'WIN' ? t('ledger.filterWin') : trade._outcome === 'LOSS' ? t('ledger.filterLoss') : trade._outcome === 'BREAKEVEN' ? t('ledger.filterBreakeven') : t('ledger.filterOpen')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm bg-base-900/50 rounded-lg p-3">
                    <div>
                      <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-0.5">{t('dashboard.entry')}</span>
                      <span className="font-mono text-text-primary">{trade.entry_price.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-0.5">{t('dashboard.exit')}</span>
                      <span className="font-mono text-text-primary">{trade.exit_price?.toLocaleString() ?? '—'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-text-muted text-xs truncate max-w-[140px]">{formatDateTime(trade.entry_time)}</span>
                    <span className={`font-mono font-bold text-lg ${trade._pnl > 0 ? 'text-accent' : trade._pnl < 0 ? 'text-danger' : 'text-text-muted'}`}>
                      {trade._pnl > 0 ? '+' : ''}{formatCurrency(trade._pnl)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- Trade Detail Modal ---- */}
      <Modal
        isOpen={!!selectedTrade}
        onClose={() => {
          setSelectedTrade(null);
          setDeleteConfirm(null);
          setIsClosing(false);
        }}
        title={t('ledger.tradeDetails')}
        maxWidth="lg"
      >
        {selectedTrade && (() => {
          const pnl = calcPnL(selectedTrade);
          const outcome = getOutcome(selectedTrade);
          const duration =
            selectedTrade.close_time && selectedTrade.entry_time
              ? new Date(selectedTrade.close_time).getTime() - new Date(selectedTrade.entry_time).getTime()
              : 0;

          return (
            <div className="space-y-5">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold font-mono text-text-primary">{selectedTrade.ticker}</span>
                  <span className={`font-bold text-sm ${selectedTrade.direction === 'LONG' ? 'text-accent' : 'text-danger'}`}>
                    {selectedTrade.direction}
                  </span>
                  <Badge variant={outcome.toLowerCase() as 'win' | 'loss' | 'breakeven' | 'open'}>
                    {outcome === 'WIN' ? t('ledger.filterWin') : outcome === 'LOSS' ? t('ledger.filterLoss') : outcome === 'BREAKEVEN' ? t('ledger.filterBreakeven') : t('ledger.filterOpen')}
                  </Badge>
                </div>
                <span className={`text-xl font-bold font-mono ${pnl > 0 ? 'text-accent' : pnl < 0 ? 'text-danger' : 'text-text-muted'}`}>
                  {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
                </span>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div><span className="text-text-muted block">{t('tradeForm.entryPrice')}</span><span className="text-text-primary font-mono">{selectedTrade.entry_price.toLocaleString()}</span></div>
                <div><span className="text-text-muted block">{t('tradeForm.exitPrice')}</span><span className="text-text-primary font-mono">{selectedTrade.exit_price?.toLocaleString() ?? '—'}</span></div>
                <div><span className="text-text-muted block">Stop Loss</span><span className="text-text-primary font-mono">{selectedTrade.stop_loss?.toLocaleString() ?? '—'}</span></div>
                <div><span className="text-text-muted block">Take Profit</span><span className="text-text-primary font-mono">{selectedTrade.take_profit?.toLocaleString() ?? '—'}</span></div>
                <div>
                  <span className="text-text-muted block">{t('tradeForm.positionSize')}</span>
                  <span className="text-text-primary font-mono">{selectedTrade.position_size.toLocaleString()}</span>
                </div>
                {selectedTrade.position_type === 'MARGIN' ? (
                  <div><span className="text-text-muted block">Leverage</span><span className="text-text-primary font-mono">{selectedTrade.leverage}x</span></div>
                ) : (
                  <div><span className="text-text-muted block">Position Type</span><span className="text-text-primary uppercase text-xs">{selectedTrade.position_type}</span></div>
                )}
                <div><span className="text-text-muted block">{t('tradeForm.entryTime')}</span><span className="text-text-primary">{formatDateTime(selectedTrade.entry_time)}</span></div>
                <div><span className="text-text-muted block">{t('tradeForm.exitTime')}</span><span className="text-text-primary">{selectedTrade.close_time ? formatDateTime(selectedTrade.close_time) : '—'}</span></div>
                <div><span className="text-text-muted block">{t('ledger.duration')}</span><span className="text-text-primary">{duration > 0 ? formatDuration(duration) : '—'}</span></div>
                <div><span className="text-text-muted block">{t('ledger.fees')}</span><span className="text-text-primary font-mono">{formatCurrency(selectedTrade.fees)}</span></div>
                <div><span className="text-text-muted block">{t('ledger.strategy')}</span><span className="text-text-primary">{selectedTrade.strategy || '—'}</span></div>
              </div>

              {/* Reason */}
              {selectedTrade.reason && (
                <div className="bg-base-800 rounded-lg p-4">
                  <span className="text-text-muted text-xs uppercase tracking-wider block mb-2">{t('ledger.tradeThesis')}</span>
                  <p className="text-text-secondary text-sm leading-relaxed">{selectedTrade.reason}</p>
                </div>
              )}

              {/* Chart Link */}
              {selectedTrade.chart_link && (
                <a
                  href={selectedTrade.chart_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent text-sm hover:text-accent-light transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {t('ledger.viewChartSetup')}
                </a>
              )}

              {/* Quick Close Form OR Actions */}
              {isClosing ? (
                <form onSubmit={handleQuickClose} className="bg-base-900 border border-accent/30 rounded-xl p-5 mt-4 space-y-4 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <h3 className="text-accent font-bold mb-2">{t('ledger.closePosition')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">{t('tradeForm.exitPrice')}</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={closePrice}
                        onChange={(e) => setClosePrice(e.target.value)}
                        className="w-full bg-base-800 border border-base-600 rounded px-3 py-2 text-sm focus:border-accent outline-none font-mono"
                        placeholder="e.g. 66000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">{t('tradeForm.exitTime')}</label>
                      <input
                        type="datetime-local"
                        required
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="w-full bg-base-800 border border-base-600 rounded px-3 py-2 text-sm focus:border-accent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">{t('ledger.additionalFees')}</label>
                      <input
                        type="number"
                        step="any"
                        value={closeFees}
                        onChange={(e) => setCloseFees(e.target.value)}
                        className="w-full bg-base-800 border border-base-600 rounded px-3 py-2 text-sm focus:border-accent outline-none font-mono"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">{t('ledger.estPnl')}</label>
                      <div className={`w-full px-3 py-2 text-sm font-bold font-mono border border-transparent rounded ${
                        closePrice && !isNaN(parseFloat(closePrice)) ? (
                          (() => {
                            const estPnl = calcPnL({
                              ...selectedTrade,
                              exit_price: parseFloat(closePrice),
                              fees: closeFees ? parseFloat(closeFees) : 0,
                            });
                            return estPnl > 0 ? 'text-accent bg-accent/10' : estPnl < 0 ? 'text-danger bg-danger/10' : 'text-text-muted bg-base-800';
                          })()
                        ) : 'text-text-muted bg-base-800'
                      }`}>
                        {closePrice && !isNaN(parseFloat(closePrice)) ? (
                          (() => {
                            const estPnl = calcPnL({
                              ...selectedTrade,
                              exit_price: parseFloat(closePrice),
                              fees: closeFees ? parseFloat(closeFees) : 0,
                            });
                            return formatCurrency(estPnl);
                          })()
                        ) : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsClosing(false)}>{t('ledger.cancel')}</Button>
                    <Button type="submit" variant="primary" size="sm">{t('ledger.saveClose')}</Button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center pt-3 border-t border-base-600/50">
                  {outcome === 'OPEN' ? (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => {
                        setIsClosing(true);
                        setCloseTime(new Date().toISOString().slice(0, 16));
                        setClosePrice('');
                        setCloseFees('0');
                      }}
                      className="shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    >
                      {t('ledger.closePosition')}
                    </Button>
                  ) : <div></div> /* empty div for flex spacing */}
                  
                  <div className="flex gap-3">
                    {deleteConfirm === selectedTrade.id ? (
                      <>
                        <span className="text-danger text-sm self-center mr-2">{t('ledger.confirmDeletePrompt')}</span>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                          {t('ledger.cancel')}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(selectedTrade.id)}>
                          {t('ledger.delete')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent('open-trade-form', { detail: { tradeId: selectedTrade.id } })
                            );
                          }}
                        >
                          {t('ledger.editTrade')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteConfirm(selectedTrade.id)}
                        >
                          {t('ledger.deleteTrade')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

'use client';

import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { useTrades } from '@/contexts/TradeContext';
import Button from '@/components/ui/Button';
import type { Trade, TradeDirection, Strategy } from '@/types';

/**
 * CSVManager handles exporting current trades to CSV and importing trades from CSV.
 * Supports our native export format.
 */
const CSVManager: React.FC = () => {
  const { trades, bulkAddTrades } = useTrades();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Exports the current trades to a downloadable CSV file.
   */
  const handleExport = () => {
    if (!trades || trades.length === 0) {
      alert("No trades to export.");
      return;
    }

    // Pick only the fields we want to export
    const exportData = trades.map(t => ({
      ticker: t.ticker,
      direction: t.direction,
      entry_price: t.entry_price,
      stop_loss: t.stop_loss || '',
      take_profit: t.take_profit || '',
      position_size: t.position_size,
      leverage: t.leverage,
      entry_time: t.entry_time,
      close_time: t.close_time || '',
      exit_price: t.exit_price || '',
      fees: t.fees,
      strategy: t.strategy || '',
      reason: t.reason || '',
      realized_pnl: t.realized_pnl || ''
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tradevault_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Triggers the hidden file input
   */
  const triggerImport = () => {
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handles the file selection and parsing
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedTrades = results.data as any[];
          const tradesToInsert = parsedTrades.map(row => {
            // Very basic mapping for our own exported format
            return {
              ticker: String(row.ticker || 'UNKNOWN'),
              direction: (row.direction === 'SHORT' ? 'SHORT' : 'LONG') as TradeDirection,
              entry_price: parseFloat(row.entry_price) || 0,
              stop_loss: row.stop_loss ? parseFloat(row.stop_loss) : null,
              take_profit: row.take_profit ? parseFloat(row.take_profit) : null,
              position_size: parseFloat(row.position_size) || 0,
              leverage: parseFloat(row.leverage) || 1,
              entry_time: row.entry_time || new Date().toISOString(),
              close_time: row.close_time || null,
              exit_price: row.exit_price ? parseFloat(row.exit_price) : null,
              fees: parseFloat(row.fees) || 0,
              strategy: (row.strategy as Strategy) || null,
              reason: row.reason || null,
              chart_link: row.chart_link || null,
              realized_pnl: row.realized_pnl ? parseFloat(row.realized_pnl) : null
            };
          });

          const success = await bulkAddTrades(tradesToInsert);
          if (success) {
            alert(`Successfully imported ${tradesToInsert.length} trades!`);
          } else {
            setError("Failed to import trades. Please try again.");
          }
        } catch (err) {
          console.error(err);
          setError("Invalid CSV format.");
        } finally {
          setIsImporting(false);
          // Reset file input
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (err) => {
        setError(err.message);
        setIsImporting(false);
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      
      <Button 
        variant="outline" 
        onClick={handleExport}
        className="w-full sm:w-auto flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export CSV
      </Button>

      <Button 
        variant="outline" 
        onClick={triggerImport}
        loading={isImporting}
        className="w-full sm:w-auto flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        Import CSV
      </Button>

      {error && <span className="text-danger text-sm">{error}</span>}
    </div>
  );
};

export default CSVManager;

'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';

interface QuickNoteFormProps {
  onClose: () => void;
}

export default function QuickNoteForm({ onClose }: QuickNoteFormProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const { t } = useLanguage();

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!content.trim() || !user) return;
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          content: content.trim()
        });

      if (insertError) throw insertError;
      
      // Dispatch event to refresh gallery if it's open
      window.dispatchEvent(new Event('refresh-notes'));
      
      setContent('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-900">
      <div className="p-6 flex-1 flex flex-col">
        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          New Quick Note
        </label>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your trading note, idea, or reflection here..."
          className="w-full flex-1 bg-base-800 border border-base-600 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors resize-none custom-scrollbar text-sm"
          autoFocus
        />
      </div>

      <div className="p-6 border-t border-base-700 bg-base-800 flex justify-end gap-3 shrink-0">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          type="button" 
          variant="primary" 
          onClick={handleSave}
          disabled={loading || !content.trim()}
        >
          {loading ? 'Saving...' : 'Save Note'}
        </Button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Note } from '@/types';
import { format } from 'date-fns';

export default function GalleryPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();

    const handleRefresh = () => fetchNotes();
    window.addEventListener('refresh-notes', handleRefresh);
    return () => window.removeEventListener('refresh-notes', handleRefresh);
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await supabase.from('notes').delete().eq('id', id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Gallery</h1>
          <p className="text-text-muted mt-1">Your centralized hub for notes, ideas, and reflections.</p>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6 border-b border-base-700 pb-2">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Quick Notes
            </h2>
            <button 
              onClick={() => window.dispatchEvent(new Event('open-notes-panel'))}
              className="text-sm text-accent hover:text-white transition-colors"
            >
              + Add Note
            </button>
          </div>

          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-2 bg-base-700 rounded w-3/4"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-base-700 rounded col-span-2"></div>
                    <div className="h-2 bg-base-700 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-base-700 rounded"></div>
                </div>
              </div>
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-base-800 border border-base-700 rounded-xl p-12 text-center">
              <p className="text-text-muted mb-4">No notes saved yet.</p>
              <button 
                onClick={() => window.dispatchEvent(new Event('open-notes-panel'))}
                className="px-6 py-2 bg-accent text-base-900 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              >
                Create your first note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {notes.map(note => (
                <div 
                  key={note.id} 
                  className="bg-base-800 border border-base-700 rounded-xl p-5 hover:border-accent/50 transition-colors group relative"
                >
                  <button 
                    onClick={() => handleDelete(note.id)}
                    className="absolute top-3 right-3 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <p className="text-text-primary text-sm whitespace-pre-wrap break-words pr-6">
                    {note.content}
                  </p>
                  <div className="mt-4 text-xs text-text-muted font-mono">
                    {format(new Date(note.created_at), 'MMM dd, yyyy • HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Future sections (e.g. Images, Screenshots) can go here */}
        
      </div>
    </div>
  );
}

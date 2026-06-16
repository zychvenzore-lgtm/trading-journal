'use client';

import React, { useState } from 'react';
import { useStrategies } from '@/contexts/StrategyContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import type { CustomStrategy } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import AchievementsPanel from '@/components/AchievementsPanel';

export default function StrategiesPage() {
  const { strategies, loading, addStrategy, updateStrategy, deleteStrategy } = useStrategies();
  const { showToast } = useToast();
  const { t } = useLanguage();
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<CustomStrategy | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setError('');
    setEditingId(null);
  };

  const handleOpenFormModal = (strategy?: CustomStrategy) => {
    resetForm();
    if (strategy) {
      setEditingId(strategy.id);
      setName(strategy.name);
      setDescription(strategy.description || '');
      setImageUrl(strategy.image_url || '');
    }
    setIsFormModalOpen(true);
    setIsViewModalOpen(false);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
  };

  const handleViewStrategy = (strategy: CustomStrategy) => {
    setSelectedStrategy(strategy);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedStrategy(null);
  };

  const handleAddStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Strategy name is required');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateStrategy(editingId, {
          name: name.trim(),
          description: description.trim() || null,
          image_url: imageUrl || null
        });
        if (res) {
          showToast(t('strategies.updateSuccess'), 'success');
          handleCloseFormModal();
        } else {
          showToast(t('strategies.updateError'), 'error');
        }
      } else {
        const res = await addStrategy({
          account_id: null, // Global for the user
          name: name.trim(),
          description: description.trim() || null,
          image_url: imageUrl || null
        });
        if (res) {
          showToast(t('strategies.createSuccess'), 'success');
          handleCloseFormModal();
        } else {
          showToast(t('strategies.createError'), 'error');
        }
      }
    } catch (err) {
      showToast('An error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(t('strategies.deleteConfirmDesc'))) {
      const success = await deleteStrategy(id);
      if (success) {
        showToast(t('strategies.deleteSuccess'), 'success');
        if (selectedStrategy?.id === id) {
          handleCloseViewModal();
        }
      } else {
        showToast(t('strategies.deleteError'), 'error');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in p-4 md:p-6 lg:p-8 bg-base-900 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{t('strategies.title')}</h1>
          <p className="text-text-secondary mt-2">
            {t('strategies.subtitle')}
          </p>
        </div>
        <Button onClick={() => handleOpenFormModal()} variant="primary" className="shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('strategies.newStrategy')}
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : strategies.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-dashed border-base-600/50">
          <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-semibold text-text-primary mb-2">{t('strategies.noStrategiesFound')}</h3>
          <p className="text-text-secondary max-w-md mx-auto mb-6">
            {t('strategies.createStrategyPrompt')}
          </p>
          <Button onClick={() => handleOpenFormModal()} variant="outline">
            {t('strategies.createStrategy')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy) => (
            <div 
              key={strategy.id} 
              onClick={() => handleViewStrategy(strategy)}
              className="bg-base-800/40 backdrop-blur-xl border border-base-600/30 rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 group flex flex-col cursor-pointer"
            >
              {/* Image Header */}
              <div className="h-48 bg-base-900 border-b border-base-700/50 relative flex-shrink-0">
                {strategy.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={strategy.image_url} 
                    alt={strategy.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-text-muted bg-base-800/20">
                    <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="absolute text-xs opacity-50 mt-16 font-mono tracking-widest uppercase">{t('strategies.noImage')}</span>
                  </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-base-900 to-transparent opacity-80" />
                <h3 className="absolute bottom-4 left-5 right-5 text-xl font-bold text-white drop-shadow-md truncate">
                  {strategy.name}
                </h3>
                
                {/* Delete button (shows on hover) */}
                <button 
                  onClick={(e) => handleDelete(strategy.id, e)}
                  className="absolute top-3 right-3 p-2 bg-base-900/80 hover:bg-danger text-text-secondary hover:text-white rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                  title="Delete strategy"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-text-secondary text-sm leading-relaxed mb-4 whitespace-pre-wrap flex-1 line-clamp-3">
                  {strategy.description ? strategy.description : <span className="italic opacity-50">{t('strategies.noDescription')}</span>}
                </div>
                <div className="text-xs text-text-muted font-mono uppercase tracking-widest pt-4 border-t border-base-700/50 mt-auto">
                  {t('strategies.added')} {new Date(strategy.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gamification Panel */}
      <AchievementsPanel />

      {/* Modal for creating / editing a strategy */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={handleCloseFormModal} 
        title={editingId ? t('strategyForm.editStrategy') : t('strategyForm.createStrategy')}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddStrategy} className="space-y-6">
          <Input
            label={t('strategyForm.strategyName')}
            name="name"
            placeholder={t('strategyForm.strategyNamePlaceholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            error={error}
            required
            autoFocus
          />
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('strategyForm.rules')}
            </label>
            <textarea
              name="description"
              rows={5}
              placeholder={t('strategyForm.rulesPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-base-800 border border-base-600 rounded-lg px-4 py-3 
                         text-text-primary placeholder:text-text-muted text-sm
                         focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50
                         transition-all duration-200 resize-none"
            />
          </div>

          <ImageUpload
            label={t('strategyForm.idealSetupImage')}
            value={imageUrl}
            onChange={setImageUrl}
          />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-base-700/50">
            <Button type="button" variant="ghost" onClick={handleCloseFormModal}>
              {t('strategies.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingId ? t('strategyForm.saveStrategy') : t('strategyForm.saveStrategy')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal for viewing a full breakdown */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title={t('strategies.breakdown')}
        maxWidth="max-w-4xl"
      >
        {selectedStrategy && (
          <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-2xl font-bold text-text-primary">{selectedStrategy.name}</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleOpenFormModal(selectedStrategy)}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {t('strategies.edit')}
                </Button>
                <Button variant="ghost" onClick={() => handleDelete(selectedStrategy.id)} className="text-danger hover:bg-danger/10 hover:text-danger">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('strategies.delete')}
                </Button>
              </div>
            </div>

            {selectedStrategy.image_url && (
              <div className="rounded-xl overflow-hidden border border-base-700 bg-base-900/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedStrategy.image_url} alt={selectedStrategy.name} className="w-full object-contain max-h-[500px]" />
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">{t('strategies.mechanicalRules')}</h3>
              <div className="bg-base-800/50 rounded-xl p-5 border border-base-700/50">
                <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                  {selectedStrategy.description ? selectedStrategy.description : <span className="italic opacity-50">{t('strategies.noRules')}</span>}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

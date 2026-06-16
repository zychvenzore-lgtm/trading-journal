'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ModalMaxWidth = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean;
  /** Callback fired when the modal should close */
  onClose: () => void;
  /** Title displayed at the top of the modal panel */
  title?: string;
  /** Modal body content */
  children: React.ReactNode;
  /** Maximum width of the modal panel */
  maxWidth?: ModalMaxWidth;
}

/** Tailwind max-width classes for each size variant */
const maxWidthClasses: Record<ModalMaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * CloseIcon – An ✕ SVG icon for the close button.
 */
const CloseIcon: React.FC = () => (
  <svg
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

/**
 * Modal – A full-screen dialog overlay with backdrop blur.
 *
 * Features:
 * - Blurred dark backdrop that closes the modal on click
 * - Escape key closes the modal
 * - Animated entrance via CSS keyframe
 * - Configurable max-width (sm / md / lg / xl)
 * - Close button in the top-right corner
 * - Body scroll is locked while the modal is open
 *
 * @example
 * <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Trade">
 *   <TradeForm />
 * </Modal>
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Close on Escape key press */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Lock body scroll while modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Don't render anything when closed or on server
  if (!isOpen || !mounted) return null;

  /** Close when clicking the backdrop (outside the panel) */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          'relative w-full',
          maxWidthClasses[maxWidth],
          'bg-base-800 md:border md:border-base-600 rounded-t-3xl md:rounded-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] md:shadow-2xl',
          'p-6 pb-10 md:pb-6 max-h-[90vh] overflow-y-auto custom-scrollbar',
          // Entrance animation
          'animate-[bottomSheetSlideIn_300ms_cubic-bezier(0.32,0.72,0,1)] md:animate-[modalFadeIn_200ms_ease-out]',
        ].join(' ')}
        style={{
          /* Inline keyframe for the entrance animation so we don't need
             a global CSS file addition. Tailwind v4 arbitrary values
             reference this via the animate utility above. */
        }}
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-base-600 rounded-full mx-auto mb-6 md:hidden" />

        {/* Header row: title + close button */}
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-text-primary">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className={[
              'ml-auto p-1 rounded-lg text-text-muted',
              'hover:text-text-primary hover:bg-base-600',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent/50',
            ].join(' ')}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div>{children}</div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bottomSheetSlideIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default Modal;

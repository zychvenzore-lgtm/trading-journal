'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

/** Visual type of the toast determining its colour accent. */
type ToastType = 'success' | 'error' | 'info' | 'achievement';

/** Internal representation of a single toast notification. */
interface Toast {
  /** Unique identifier */
  id: string;
  /** The message body */
  message: string;
  /** The visual type */
  type: ToastType;
  /** Timestamp the toast was created (for auto-dismiss tracking) */
  createdAt: number;
  /** Whether the toast is in the process of being dismissed (triggers exit anim) */
  exiting: boolean;
}

/** Value exposed by the toast context. */
interface ToastContextValue {
  /** Show a new toast notification */
  showToast: (message: string, type?: ToastType) => void;
}

/* -------------------------------------------------------------------------- */
/*                                  Context                                   */
/* -------------------------------------------------------------------------- */

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*                                   Hook                                     */
/* -------------------------------------------------------------------------- */

/**
 * useToast – Access the toast notification system.
 *
 * Must be used inside a `<ToastProvider>`.
 *
 * @example
 * const { showToast } = useToast();
 * showToast('Trade saved!', 'success');
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*                              Colour helpers                                */
/* -------------------------------------------------------------------------- */

/** Border-left colour class for each toast type */
const borderClasses: Record<ToastType, string> = {
  success: 'border-l-4 border-success',
  error: 'border-l-4 border-danger',
  info: 'border-l-4 border-accent',
  achievement: 'border-2 border-accent shadow-[0_0_20px_rgba(0,243,255,0.4)]',
};

/** Progress bar colour class for each toast type */
const progressClasses: Record<ToastType, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-accent',
  achievement: 'bg-accent',
};

/** Icon colour class */
const iconClasses: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-accent',
  achievement: 'text-yellow-400 drop-shadow-lg',
};

/* -------------------------------------------------------------------------- */
/*                                 Icons                                      */
/* -------------------------------------------------------------------------- */

const SuccessIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  </svg>
);

const ErrorIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
      clipRule="evenodd"
    />
  </svg>
);

const AchievementIcon: React.FC = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
);

const typeIcons: Record<ToastType, React.FC> = {
  success: SuccessIcon,
  error: ErrorIcon,
  info: InfoIcon,
  achievement: AchievementIcon,
};

/* -------------------------------------------------------------------------- */
/*                            Single Toast Item                               */
/* -------------------------------------------------------------------------- */

/** Auto-dismiss duration in milliseconds */
const DISMISS_MS = 4000;

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const Icon = typeIcons[toast.type];

  return (
    <div
      className={[
        // Layout & shape
        'relative overflow-hidden rounded-lg shadow-lg',
        'min-w-[320px] max-w-sm',
        // Colours
        'bg-base-700',
        borderClasses[toast.type],
        // Animation
        toast.exiting
          ? 'animate-toast-fade-out'
          : 'animate-toast-slide-in',
      ].join(' ')}
      role="alert"
    >
      {/* Content */}
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <span className={`mt-0.5 shrink-0 ${iconClasses[toast.type]}`}>
          <Icon />
        </span>

        {/* Message */}
        <p className={`text-sm flex-1 ${toast.type === 'achievement' ? 'text-white font-bold tracking-wide' : 'text-text-primary'}`}>{toast.message}</p>

        {/* Close button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 text-text-muted hover:text-text-primary transition-colors duration-200 focus:outline-none"
          aria-label="Dismiss notification"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Progress bar – shrinks over DISMISS_MS */}
      {!toast.exiting && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-base-600">
          <div
            className={`h-full ${progressClasses[toast.type]}`}
            style={{
              animation: `toastProgress ${DISMISS_MS}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Toast Provider                                */
/* -------------------------------------------------------------------------- */

/**
 * ToastProvider – Wraps your app to provide the toast notification system.
 *
 * Place this near the root of your component tree (e.g. in your layout).
 * Any descendant can call `useToast()` to trigger notifications.
 *
 * @example
 * // layout.tsx
 * <ToastProvider>
 *   {children}
 * </ToastProvider>
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /** Remove a toast immediately (called after exit animation) */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  /** Begin the exit animation, then remove after 300ms */
  const dismissToast = useCallback(
    (id: string) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );
      // Wait for exit animation to complete before removing from DOM
      setTimeout(() => removeToast(id), 300);
    },
    [removeToast],
  );

  /** Show a new toast */
  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const toast: Toast = {
        id,
        message,
        type,
        createdAt: Date.now(),
        exiting: false,
      };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after DISMISS_MS
      const timer = setTimeout(() => dismissToast(id), DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  /** Cleanup all timers on unmount */
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const bottomRightToasts = toasts.filter(t => t.type !== 'achievement');
  const topCenterToasts = toasts.filter(t => t.type === 'achievement');

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Top-center container (Achievements) */}
      {topCenterToasts.length > 0 && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-auto">
          {topCenterToasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={dismissToast}
            />
          ))}
        </div>
      )}

      {/* Bottom-right container (Standard notifications) */}
      {bottomRightToasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-auto">
          {bottomRightToasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={dismissToast}
            />
          ))}
        </div>
      )}

    </ToastContext.Provider>
  );
};

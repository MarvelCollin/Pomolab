  import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  onClick?: () => void;
  onDismiss?: () => void;
  userData?: any;
}

interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

interface SingleToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

const SingleToast: React.FC<SingleToastProps> = React.memo(({ toast, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!toast.persistent && !isHovered) {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, toast.persistent, isHovered, onRemove]);

  const toastStyles = useMemo(() => {
    const baseStyles = "backdrop-blur-md border shadow-2xl";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-500/20 border-green-400/30 text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-500/20 border-red-400/30 text-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-500/20 border-yellow-400/30 text-yellow-100`;
      case 'info':
        return `${baseStyles} bg-blue-500/20 border-blue-400/30 text-blue-100`;
      default:
        return `${baseStyles} bg-gray-500/20 border-gray-400/30 text-gray-100`;
    }
  }, [toast.type]);

  const icon = useMemo(() => {
    switch (toast.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  }, [toast.type]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative max-w-sm w-full rounded-lg p-4 ${toastStyles} ${toast.onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => toast.onClick && toast.onClick()}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <i className={`${icon} text-lg`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm leading-5">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="mt-1 text-xs opacity-80 leading-4">
              {toast.message}
            </p>
          )}
          
          {toast.onClick && toast.onDismiss && (
            <motion.div 
              className="flex gap-2 mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.onClick && toast.onClick();
                }}
                className="px-2 py-1 bg-green-500/30 hover:bg-green-500/50 border border-green-400/50 rounded text-xs font-medium transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Accept
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  if (toast.onDismiss) {
                    toast.onDismiss();
                  }
                  onRemove(toast.id);
                }}
                className="px-2 py-1 bg-red-500/30 hover:bg-red-500/50 border border-red-400/50 rounded text-xs font-medium transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Decline
              </motion.button>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            if (toast.onDismiss) {
              toast.onDismiss();
            }
            onRemove(toast.id);
          }}
          className="flex-shrink-0 ml-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
          whileTap={{ scale: 0.9 }}
        >
          <i className="fas fa-times text-xs text-white/80 hover:text-white" />
        </motion.button>
      </div>

      {!toast.persistent && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: isHovered ? '100%' : '0%' }}
          transition={{ 
            duration: isHovered ? 0.2 : (toast.duration || 5000) / 1000,
            ease: "linear"
          }}
        />
      )}
    </motion.div>
  );
});

const Toast: React.FC<ToastProps> = React.memo(({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-h-screen overflow-hidden">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <SingleToast
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

export default Toast;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<ToastItem>) => {
    addToast({ type: 'success', title, message, ...options });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, options?: Partial<ToastItem>) => {
    addToast({ type: 'error', title, message, ...options });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<ToastItem>) => {
    addToast({ type: 'warning', title, message, ...options });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<ToastItem>) => {
    addToast({ type: 'info', title, message, ...options });
  }, [addToast]);

  const ToastContainer = useMemo(() => 
    () => <Toast toasts={toasts} onRemove={removeToast} />, 
    [toasts, removeToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer
  };
};

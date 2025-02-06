import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="glass p-4 rounded-lg shadow-lg flex items-center gap-3 pr-12 min-w-[300px]">
        {type === 'success' ? (
          <CheckCircle className="text-green-400" size={20} />
        ) : (
          <XCircle className="text-red-400" size={20} />
        )}
        <p className="text-white">{message}</p>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
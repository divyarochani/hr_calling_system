import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-6 w-6" />,
    error: <XCircle className="h-6 w-6" />,
    warning: <AlertCircle className="h-6 w-6" />,
    info: <Info className="h-6 w-6" />,
  };

  const styles = {
    success: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-green-500',
      icon: 'text-green-500',
      text: 'text-gray-900 dark:text-white'
    },
    error: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-red-500',
      icon: 'text-red-500',
      text: 'text-gray-900 dark:text-white'
    },
    warning: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-yellow-500',
      icon: 'text-yellow-500',
      text: 'text-gray-900 dark:text-white'
    },
    info: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-blue-500',
      icon: 'text-blue-500',
      text: 'text-gray-900 dark:text-white'
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} ${style.border} rounded-lg shadow-lg p-4 mb-3 min-w-[320px] max-w-md animate-slide-in-right`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${style.icon}`}>
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${style.text}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

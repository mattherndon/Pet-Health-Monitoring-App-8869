import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiX } = FiIcons;

/**
 * Modern toast notification component with animations
 * Accessibility improvements:
 * - Added proper ARIA roles and attributes
 * - Improved keyboard focus for close button
 * - Better screen reader support
 * - Auto-focus on appearance
 */
const Toast = ({
  id,
  title,
  message,
  type = 'default',
  duration = 5000,
  position = 'top-right',
  onClose,
  showProgress = true,
  action,
  ...props
}) => {
  // Define toast types with their respective styles and icons
  const types = {
    default: {
      bgColor: 'bg-white',
      iconColor: 'text-gray-500',
      icon: FiInfo,
      borderColor: 'border-gray-200',
      role: 'status',
    },
    success: {
      bgColor: 'bg-white',
      iconColor: 'text-green-500',
      icon: FiCheckCircle,
      borderColor: 'border-l-4 border-green-500',
      role: 'status',
    },
    error: {
      bgColor: 'bg-white',
      iconColor: 'text-red-500',
      icon: FiAlertCircle,
      borderColor: 'border-l-4 border-red-500',
      role: 'alert',
    },
    warning: {
      bgColor: 'bg-white',
      iconColor: 'text-yellow-500',
      icon: FiAlertTriangle,
      borderColor: 'border-l-4 border-yellow-500',
      role: 'alert',
    },
    info: {
      bgColor: 'bg-white',
      iconColor: 'text-blue-500',
      icon: FiInfo,
      borderColor: 'border-l-4 border-blue-500',
      role: 'status',
    },
  };
  
  const selectedType = types[type] || types.default;
  const toastRef = React.useRef(null);
  
  // Handle auto-dismiss
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, id]);
  
  // Focus the toast when it appears
  useEffect(() => {
    if (toastRef.current) {
      toastRef.current.focus();
    }
  }, []);
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  // Create a descriptive announcement for screen readers
  const getToastAnnouncement = () => {
    let announcement = type === 'error' ? 'Error: ' : 
                       type === 'warning' ? 'Warning: ' : 
                       type === 'success' ? 'Success: ' : '';
    announcement += title ? title + '. ' : '';
    announcement += message || '';
    return announcement;
  };
  
  return (
    <AnimatePresence>
      <motion.div
        ref={toastRef}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`
          shadow-lg rounded-lg max-w-sm w-full pointer-events-auto
          ${selectedType.bgColor}
          ${selectedType.borderColor}
          border
        `}
        role={selectedType.role}
        aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
        tabIndex={-1}
        {...props}
      >
        <div className="relative overflow-hidden rounded-lg">
          {/* Progress bar */}
          {showProgress && duration > 0 && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-primary"
              aria-hidden="true"
            />
          )}
          
          <div className="p-4">
            {/* Screen reader announcement */}
            <span className="sr-only">{getToastAnnouncement()}</span>
            
            <div className="flex items-start">
              {/* Icon */}
              <div className={`flex-shrink-0 ${selectedType.iconColor}`}>
                <SafeIcon icon={selectedType.icon} className="w-5 h-5" aria-hidden="true" />
              </div>
              
              {/* Content */}
              <div className="ml-3 w-0 flex-1 pt-0.5">
                {title && (
                  <p className="text-sm font-medium text-gray-900">
                    {title}
                  </p>
                )}
                {message && (
                  <p className="mt-1 text-sm text-gray-600">
                    {message}
                  </p>
                )}
                
                {/* Action buttons */}
                {action && (
                  <div className="mt-3 flex gap-3">
                    {action}
                  </div>
                )}
              </div>
              
              {/* Close button */}
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  type="button"
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => onClose && onClose(id)}
                  aria-label="Close notification"
                >
                  <span className="sr-only">Close</span>
                  <SafeIcon icon={FiX} className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

Toast.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(['default', 'success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center']),
  onClose: PropTypes.func,
  showProgress: PropTypes.bool,
  action: PropTypes.node
};

export default Toast;
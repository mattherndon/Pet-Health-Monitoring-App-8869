import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiInfo, FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiX } = FiIcons;

/**
 * Modern alert component with various styles and animations
 */
const Alert = ({
  children,
  title,
  variant = 'info',
  icon,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}) => {
  // Define variants with their respective styles and icons
  const variants = {
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      titleColor: 'text-blue-800',
      icon: icon || FiInfo,
      iconColor: 'text-blue-500',
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      titleColor: 'text-green-800',
      icon: icon || FiCheckCircle,
      iconColor: 'text-green-500',
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      titleColor: 'text-yellow-800',
      icon: icon || FiAlertTriangle,
      iconColor: 'text-yellow-500',
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      titleColor: 'text-red-800',
      icon: icon || FiAlertCircle,
      iconColor: 'text-red-500',
    },
    neutral: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-800',
      titleColor: 'text-gray-800',
      icon: icon || FiInfo,
      iconColor: 'text-gray-500',
    },
  };
  
  const selectedVariant = variants[variant] || variants.info;
  
  const alertClasses = `
    flex items-start p-4 rounded-lg border ${selectedVariant.bgColor} ${selectedVariant.borderColor} ${className}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={alertClasses}
      role="alert"
      {...props}
    >
      <div className={`flex-shrink-0 ${selectedVariant.iconColor} mt-0.5`}>
        <SafeIcon icon={selectedVariant.icon} className="w-5 h-5" />
      </div>
      
      <div className="ml-3 flex-grow">
        {title && (
          <h3 className={`text-sm font-medium ${selectedVariant.titleColor} mb-1`}>
            {title}
          </h3>
        )}
        <div className={`text-sm ${selectedVariant.textColor}`}>
          {children}
        </div>
      </div>
      
      {dismissible && onDismiss && (
        <button
          type="button"
          className={`ml-auto -mx-1.5 -my-1.5 ${selectedVariant.bgColor} ${selectedVariant.textColor} rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-${variant}-50 focus:ring-${variant}-400`}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <SafeIcon icon={FiX} className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'neutral']),
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string
};

export default Alert;
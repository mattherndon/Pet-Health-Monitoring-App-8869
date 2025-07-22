import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';

/**
 * Modern stat component for displaying metrics
 */
const Stat = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  variant = 'default',
  className = '',
  ...props
}) => {
  // Define variants
  const variants = {
    default: 'bg-white border border-gray-100',
    primary: 'bg-primary-50 border border-primary-100',
    secondary: 'bg-secondary-50 border border-secondary-100',
    success: 'bg-green-50 border border-green-100',
    warning: 'bg-yellow-50 border border-yellow-100',
    danger: 'bg-red-50 border border-red-100',
    info: 'bg-blue-50 border border-blue-100',
  };
  
  // Define trend colors
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };
  
  const variantClass = variants[variant] || variants.default;
  const trendColor = trendColors[trend] || trendColors.neutral;
  
  const statClasses = `
    p-4 rounded-xl shadow-subtle
    ${variantClass} ${className}
  `;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={statClasses}
      {...props}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">
              {value}
            </p>
            {trendValue && (
              <p className={`ml-2 flex items-baseline text-sm ${trendColor}`}>
                <span>{trendValue}</span>
              </p>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-500">
              {description}
            </p>
          )}
        </div>
        
        {icon && (
          <div className={`
            p-2 rounded-lg 
            ${variant === 'default' ? 'bg-gray-100' : `bg-${variant}-100`}
          `}>
            <SafeIcon 
              icon={icon} 
              className={`w-5 h-5 ${variant === 'default' ? 'text-gray-600' : `text-${variant}-600`}`} 
            />
          </div>
        )}
      </div>
      
      {trend && trendValue && (
        <div className={`mt-2 flex items-center text-sm ${trendColor}`}>
          <SafeIcon 
            icon={trend === 'up' ? FiIcons.FiArrowUp : trend === 'down' ? FiIcons.FiArrowDown : FiIcons.FiMinus} 
            className="mr-1 w-4 h-4 flex-shrink-0" 
          />
          <span>{trendValue}</span>
        </div>
      )}
    </motion.div>
  );
};

Stat.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  description: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info']),
  className: PropTypes.string
};

export default Stat;
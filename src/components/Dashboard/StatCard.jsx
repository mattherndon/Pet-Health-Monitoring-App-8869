import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Card } from '../ui';
import SafeIcon from '../../common/SafeIcon';

/**
 * Modernized stat card component for dashboard metrics
 * Accessibility improvements:
 * - Added proper ARIA attributes
 * - Better screen reader support
 * - Enhanced keyboard navigation for interactive cards
 */
const StatCard = ({
  title,
  value,
  icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary-50',
  change,
  changeType = 'neutral',
  onClick,
  className = '',
  ...props
}) => {
  // Define change type colors
  const changeColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };
  
  const changeColor = changeColors[changeType] || changeColors.neutral;
  const isInteractive = !!onClick;
  
  // Generate a descriptive label for screen readers
  const getAriaLabel = () => {
    let label = `${title}: ${value}`;
    
    if (change) {
      label += `, ${change} ${
        changeType === 'up' ? 'increase' : 
        changeType === 'down' ? 'decrease' : ''
      }`;
    }
    
    return label;
  };
  
  return (
    <Card 
      interactive={isInteractive}
      onClick={onClick}
      className={`p-4 ${className}`}
      {...props}
      aria-label={getAriaLabel()}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          
          {change && (
            <div className={`mt-2 flex items-center text-sm ${changeColor}`} role="status">
              <SafeIcon 
                icon={
                  changeType === 'up' 
                    ? 'ArrowUp' 
                    : changeType === 'down' 
                    ? 'ArrowDown' 
                    : 'Minus'
                }
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              />
              <span>{change}</span>
              <span className="sr-only">
                {changeType === 'up' ? 'increase' : 
                 changeType === 'down' ? 'decrease' : 'change'}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-lg ${iconBg}`} aria-hidden="true">
            <SafeIcon icon={icon} className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
      </div>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  iconColor: PropTypes.string,
  iconBg: PropTypes.string,
  change: PropTypes.string,
  changeType: PropTypes.oneOf(['up', 'down', 'neutral']),
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default StatCard;
import React from 'react';
import PropTypes from 'prop-types';
import SafeIcon from '../../common/SafeIcon';

/**
 * Modern badge component with various styles
 * Accessibility improvements:
 * - Added proper ARIA attributes
 * - Better keyboard support for removable badges
 * - Enhanced screen reader support
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  removable = false,
  onRemove,
  className = '',
  ...props
}) => {
  // Define variants
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    outline: 'bg-white border border-gray-200 text-gray-800',
  };

  // Define sizes
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };
  
  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.md;
  
  const badgeClasses = `
    inline-flex items-center gap-1 font-medium rounded-full
    ${variantClass} ${sizeClass} ${className}
  `;

  // Handle keyboard events for remove button
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRemove && onRemove();
    }
  };

  return (
    <span 
      className={badgeClasses} 
      {...props}
      role={removable ? 'status' : undefined}
    >
      {icon && (
        <SafeIcon 
          icon={icon} 
          className={`w-${size === 'sm' ? '3' : size === 'md' ? '4' : '5'} h-${size === 'sm' ? '3' : size === 'md' ? '4' : '5'}`}
          aria-hidden="true"
        />
      )}
      {children}
      {removable && (
        <button 
          type="button"
          onClick={onRemove}
          onKeyDown={handleKeyDown}
          className={`ml-0.5 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-black/20
            ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`}
          aria-label="Remove"
        >
          <span className="sr-only">Remove</span>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  className: PropTypes.string
};

export default Badge;
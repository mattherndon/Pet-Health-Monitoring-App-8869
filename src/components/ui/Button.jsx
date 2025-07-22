import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import SafeIcon from '../../common/SafeIcon';

/**
 * Modern button component with various styles and animations
 * Accessibility improvements:
 * - Added proper ARIA attributes
 * - Improved focus indicators
 * - Enhanced keyboard navigation
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  ...props
}) => {
  // Define variants
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary/50',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400/50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-400/50',
    danger: 'bg-accent-red text-white hover:bg-accent-red/90 focus:ring-accent-red/50',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500/50',
    accent: 'bg-accent-yellow text-neutral-black hover:bg-accent-yellow/90 focus:ring-accent-yellow/50',
  };

  // Define sizes
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Determine the appropriate classes
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  
  const buttonClasses = `
    inline-flex items-center justify-center gap-2 font-medium rounded-xl
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    ${variantClass} ${sizeClass}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}
    ${className}
  `;

  // Generate a descriptive ARIA label if not provided
  const computedAriaLabel = ariaLabel || (
    loading ? `Loading ${children}` : 
    typeof children === 'string' ? children : undefined
  );

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' } : {}}
      whileTap={!disabled && !loading ? { y: 0 } : {}}
      aria-label={computedAriaLabel}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" 
              role="status" aria-label="Loading">
          <span className="sr-only">Loading...</span>
        </span>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <SafeIcon icon={icon} className={`w-${size === 'sm' ? '4' : '5'} h-${size === 'sm' ? '4' : '5'}`} aria-hidden="true" />
      )}
      
      <span>{children}</span>
      
      {icon && iconPosition === 'right' && !loading && (
        <SafeIcon icon={icon} className={`w-${size === 'sm' ? '4' : '5'} h-${size === 'sm' ? '4' : '5'}`} aria-hidden="true" />
      )}
    </motion.button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'accent']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string
};

export default Button;
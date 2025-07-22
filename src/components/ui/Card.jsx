import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Modern card component with hover animations
 * Accessibility improvements:
 * - Added proper ARIA attributes for interactive cards
 * - Better focus management
 * - Enhanced keyboard navigation
 */
const Card = ({
  children,
  variant = 'default',
  interactive = false,
  onClick,
  className = '',
  ...props
}) => {
  // Define variants
  const variants = {
    default: 'bg-white border border-gray-100',
    primary: 'bg-white border border-primary/20',
    secondary: 'bg-white border border-secondary/20',
    accent: 'bg-white border border-accent-yellow/20',
    subtle: 'bg-gray-50 border border-gray-100',
  };

  const variantClass = variants[variant] || variants.default;
  
  const baseClasses = `
    rounded-xl shadow-subtle
    ${variantClass}
    ${interactive ? 'cursor-pointer' : ''}
    ${className}
  `;

  // If interactive, use motion.div for animations
  if (interactive) {
    return (
      <motion.div
        className={`${baseClasses} ${interactive ? 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2' : ''}`}
        onClick={onClick}
        whileHover={{ 
          y: -4, 
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)' 
        }}
        whileTap={{ y: -2 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20 
        }}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick && onClick(e);
          }
        } : undefined}
        aria-pressed={interactive ? false : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  
  // Non-interactive card
  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'accent', 'subtle']),
  interactive: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default Card;
import React from 'react';
import PropTypes from 'prop-types';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser } = FiIcons;

/**
 * Modern avatar component with various styles
 * Accessibility improvements:
 * - Added proper ARIA attributes
 * - Improved alt text for images
 * - Better screen reader support
 */
const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  variant = 'circle',
  status,
  icon,
  className = '',
  ...props
}) => {
  // Define sizes
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };
  
  // Define variants
  const variants = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };
  
  // Define status indicators
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  const variantClass = variants[variant] || variants.circle;
  
  // Get initials from name
  const getInitials = () => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Generate a deterministic color based on the name
  const getColorFromName = () => {
    if (!name) return 'bg-gray-400';
    
    const colors = [
      'bg-gradient-to-br from-blue-400 to-purple-500',
      'bg-gradient-to-br from-green-400 to-blue-500',
      'bg-gradient-to-br from-primary to-primary-dark',
      'bg-gradient-to-br from-secondary to-blue-600',
      'bg-gradient-to-br from-purple-400 to-pink-500',
      'bg-gradient-to-br from-red-400 to-orange-500',
    ];
    
    // Simple hash function to pick a color based on name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  const avatarClasses = `
    inline-flex items-center justify-center
    ${sizeClass} ${variantClass} ${className}
  `;
  
  // Generate a descriptive alt text if none is provided
  const getAltText = () => {
    if (alt) return alt;
    if (name) return `Avatar for ${name}`;
    return 'Avatar';
  };
  
  // Generate appropriate ARIA label
  const getAriaLabel = () => {
    let label = '';
    
    if (name) {
      label = `Avatar for ${name}`;
      if (status) label += `, status: ${status}`;
    } else if (status) {
      label = `Avatar with status: ${status}`;
    }
    
    return label || undefined;
  };
  
  const renderAvatar = () => {
    // If src is provided, render image
    if (src) {
      return (
        <div className={`${avatarClasses} overflow-hidden border-2 border-white`} aria-label={getAriaLabel()}>
          <img src={src} alt={getAltText()} className="w-full h-full object-cover" />
        </div>
      );
    }
    
    // If name is provided, render initials
    if (name) {
      return (
        <div 
          className={`${avatarClasses} ${getColorFromName()} text-white font-bold`}
          aria-label={getAriaLabel()}
          role="img"
        >
          {getInitials()}
        </div>
      );
    }
    
    // If icon is provided, render icon
    if (icon) {
      return (
        <div 
          className={`${avatarClasses} bg-gray-200`}
          aria-label={getAriaLabel() || "Icon avatar"}
          role="img"
        >
          <SafeIcon icon={icon} className="w-1/2 h-1/2 text-gray-600" aria-hidden="true" />
        </div>
      );
    }
    
    // Default fallback
    return (
      <div 
        className={`${avatarClasses} bg-gray-200`}
        aria-label={getAriaLabel() || "Default avatar"}
        role="img"
      >
        <SafeIcon icon={FiUser} className="w-1/2 h-1/2 text-gray-600" aria-hidden="true" />
      </div>
    );
  };
  
  return (
    <div className="relative inline-flex">
      {renderAvatar()}
      
      {status && (
        <span 
          className={`absolute ${size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'} ${statusColors[status] || 'bg-gray-400'} rounded-full ring-2 ring-white
            ${variant === 'circle' ? 'bottom-0 right-0' : 'top-0 right-0 -translate-y-1/3 translate-x-1/3'}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  variant: PropTypes.oneOf(['circle', 'square']),
  status: PropTypes.oneOf(['online', 'offline', 'busy', 'away']),
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  className: PropTypes.string
};

export default Avatar;
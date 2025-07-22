import React from 'react';
import PropTypes from 'prop-types';

/**
 * Modern skeleton loader component with various shapes
 */
const Skeleton = ({
  variant = 'rectangle',
  width,
  height,
  className = '',
  ...props
}) => {
  // Define variants
  const variants = {
    rectangle: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded-md h-4',
    avatar: 'rounded-full w-10 h-10',
    button: 'rounded-lg h-10',
    card: 'rounded-xl w-full h-32',
  };
  
  const variantClass = variants[variant] || variants.rectangle;
  
  const skeletonClasses = `
    animate-pulse bg-gray-200 
    ${variantClass} ${className}
  `;

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div 
      className={skeletonClasses}
      style={style}
      {...props}
    />
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['rectangle', 'circle', 'text', 'avatar', 'button', 'card']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string
};

/**
 * Skeleton loader for text with multiple lines
 */
export const SkeletonText = ({ lines = 3, lastLineWidth = '75%', className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          variant="text"
          className={index === lines - 1 ? lastLineWidth : 'w-full'}
        />
      ))}
    </div>
  );
};

SkeletonText.propTypes = {
  lines: PropTypes.number,
  lastLineWidth: PropTypes.string,
  className: PropTypes.string
};

export default Skeleton;
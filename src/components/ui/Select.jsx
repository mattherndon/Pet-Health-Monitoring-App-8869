import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiChevronDown, FiAlertCircle } = FiIcons;

/**
 * Modern select component with various styles and states
 * Accessibility improvements:
 * - Added proper ARIA attributes
 * - Enhanced focus indicators
 * - Better keyboard navigation
 * - Improved error messaging
 */
const Select = ({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  helpText,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Generate a unique ID if none is provided
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  // Generate an ID for the help/error text for aria-describedby
  const descriptionId = `${selectId}-description`;
  
  const selectClasses = `
    w-full px-4 py-3 bg-white appearance-none
    border rounded-xl transition-all duration-200
    pr-10 /* Space for the dropdown icon */
    ${isFocused ? 'ring-2 ring-primary/30 border-primary' : 'border-gray-200'}
    ${error ? 'border-red-300 ring-2 ring-red-100' : ''}
    ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
    focus:outline-none focus:ring-2 focus:ring-primary/50
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-accent-red ml-1" aria-hidden="true">*</span>}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={selectClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={(error || helpText) ? descriptionId : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => {
            // Handle both string options and {value, label} objects
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {error ? (
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500" aria-hidden="true" />
          ) : (
            <SafeIcon icon={FiChevronDown} className="w-5 h-5 text-gray-400" aria-hidden="true" />
          )}
        </div>
      </div>
      
      {(error || helpText) && (
        <p 
          id={descriptionId}
          className={`mt-2 text-sm ${
            error ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {error || helpText}
        </p>
      )}
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired
      })
    ])
  ),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  helpText: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string
};

export default Select;
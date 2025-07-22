import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEye, FiEyeOff, FiAlertCircle, FiCheck } = FiIcons;

/**
 * Modern input component with various styles and states
 * Accessibility improvements:
 * - Added proper ARIA attributes
 * - Enhanced keyboard support for password visibility toggle
 * - Better focus management
 * - More descriptive labels and error messages
 */
const Input = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  success,
  helpText,
  icon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Determine if we're handling a password field
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  
  // Generate a unique ID if none is provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  // Generate an ID for the help/error text for aria-describedby
  const descriptionId = `${inputId}-description`;
  
  const inputClasses = `
    w-full px-4 py-3 bg-white 
    border rounded-xl transition-all duration-200
    ${isFocused ? 'ring-2 ring-primary/30 border-primary' : 'border-gray-200'}
    ${error ? 'border-red-300 ring-2 ring-red-100' : ''}
    ${success ? 'border-green-300 ring-2 ring-green-100' : ''}
    ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
    ${icon ? 'pl-11' : ''}
    ${className}
  `;
  
  const handlePasswordToggle = () => {
    setShowPassword(prev => !prev);
  };

  // Handle keyboard events for the password toggle button
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePasswordToggle();
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-accent-red ml-1" aria-hidden="true">*</span>}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SafeIcon icon={icon} className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={(error || helpText || success) ? descriptionId : undefined}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={handlePasswordToggle}
            onKeyDown={handleKeyDown}
            className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
            tabIndex="0"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            <SafeIcon 
              icon={showPassword ? FiEyeOff : FiEye} 
              className="w-5 h-5 text-gray-400 hover:text-gray-600" 
              aria-hidden="true"
            />
          </button>
        )}
        
        {error && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500" aria-hidden="true" />
          </div>
        )}
        
        {success && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500" aria-hidden="true" />
          </div>
        )}
      </div>
      
      {(error || helpText || success) && (
        <p 
          id={descriptionId}
          className={`mt-2 text-sm ${
            error ? 'text-red-600' : 
            success ? 'text-green-600' : 
            'text-gray-500'
          }`}
        >
          {error || helpText || (success && typeof success === 'string' ? success : '')}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  success: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  helpText: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string
};

export default Input;
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX } = FiIcons;

/**
 * Modern modal component with animations
 * Accessibility improvements:
 * - Added proper ARIA roles and attributes
 * - Focus trapping for keyboard navigation
 * - Focus returns to trigger element when closed
 * - ESC key support
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
  footer,
  initialFocusRef,
  returnFocusRef,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const firstFocusableElementRef = useRef(null);
  const lastFocusableElementRef = useRef(null);
  
  // Store the element that had focus before the modal was opened
  const previousFocusRef = useRef(null);
  
  // Define sizes
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  // Handle click outside
  const handleClickOutside = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Set up focus trapping and key handlers
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element so we can return to it later
      previousFocusRef.current = document.activeElement;
      
      // Focus the specified element, close button, or first focusable element
      if (initialFocusRef && initialFocusRef.current) {
        initialFocusRef.current.focus();
      } else if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else if (firstFocusableElementRef.current) {
        firstFocusableElementRef.current.focus();
      }
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Event listener for escape key
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      // Handle focus trapping
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          firstFocusableElementRef.current = firstElement;
          lastFocusableElementRef.current = lastElement;
          
          // If shift+tab and on first element, wrap to last
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } 
          // If tab and on last element, wrap to first
          else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleTabKey);
      
      // Cleanup
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.removeEventListener('keydown', handleTabKey);
        document.body.style.overflow = 'auto';
        
        // Return focus to the element that had it before the modal opened
        if (returnFocusRef && returnFocusRef.current) {
          returnFocusRef.current.focus();
        } else if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose, initialFocusRef, returnFocusRef]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby={title ? "modal-title" : undefined}
          role="dialog"
          aria-modal="true"
          onClick={handleClickOutside}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            aria-hidden="true"
          />
          
          {/* Modal container */}
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`
                relative w-full ${sizeClass} transform overflow-hidden rounded-xl
                bg-white text-left shadow-xl transition-all
                ${className}
              `}
              {...props}
            >
              {/* Header */}
              {title && (
                <div className="bg-white px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900" id="modal-title">
                      {title}
                    </h2>
                    {showCloseButton && (
                      <button
                        ref={closeButtonRef}
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        onClick={onClose}
                        aria-label="Close"
                      >
                        <span className="sr-only">Close</span>
                        <SafeIcon icon={FiX} className="h-6 w-6" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Body */}
              <div className="p-6">
                {children}
              </div>
              
              {/* Footer */}
              {footer && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  closeOnClickOutside: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  footer: PropTypes.node,
  initialFocusRef: PropTypes.shape({ current: PropTypes.any }),
  returnFocusRef: PropTypes.shape({ current: PropTypes.any }),
  className: PropTypes.string
};

export default Modal;
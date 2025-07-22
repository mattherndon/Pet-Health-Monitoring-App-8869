import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';

/**
 * Modern tabs component with animations
 * Accessibility improvements:
 * - Implemented WAI-ARIA Tab Pattern
 * - Added keyboard navigation
 * - Better focus management
 * - Proper ARIA roles and attributes
 */
const Tabs = ({
  tabs = [],
  defaultTab = 0,
  onChange,
  variant = 'default',
  className = '',
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tabsRef = useRef([]);
  
  // Define variants
  const variants = {
    default: {
      tabClass: 'px-4 py-2',
      activeTabClass: 'text-primary border-b-2 border-primary',
      inactiveTabClass: 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent',
      containerClass: 'border-b border-gray-200',
    },
    pills: {
      tabClass: 'px-4 py-2 rounded-full',
      activeTabClass: 'bg-primary text-white',
      inactiveTabClass: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      containerClass: '',
    },
    boxed: {
      tabClass: 'px-4 py-2 rounded-t-lg',
      activeTabClass: 'bg-white text-gray-800 border-t border-r border-l border-gray-200',
      inactiveTabClass: 'text-gray-500 hover:text-gray-700 bg-gray-50 border border-transparent',
      containerClass: 'border-b border-gray-200',
    },
  };
  
  const selectedVariant = variants[variant] || variants.default;
  
  // Handle tab click
  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, index) => {
    let newIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (index + 1) % tabs.length;
        tabsRef.current[newIndex]?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (index - 1 + tabs.length) % tabs.length;
        tabsRef.current[newIndex]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        tabsRef.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        tabsRef.current[tabs.length - 1]?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabClick(index);
        break;
      default:
        break;
    }
  };

  // Focus active tab on mount and when active tab changes
  useEffect(() => {
    if (tabsRef.current[activeTab]) {
      // Timeout to ensure DOM is ready
      setTimeout(() => {
        tabsRef.current[activeTab]?.focus();
      }, 0);
    }
  }, []);
  
  const tabpanelId = `tabpanel-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={className} {...props}>
      <div 
        className={`flex ${selectedVariant.containerClass}`}
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;
          const tabId = `tab-${index}-${Math.random().toString(36).substr(2, 5)}`;
          const panelId = `${tabpanelId}-${index}`;
          
          return (
            <button
              ref={el => tabsRef.current[index] = el}
              key={index}
              id={tabId}
              className={`
                relative font-medium text-sm transition-colors duration-200 
                ${selectedVariant.tabClass}
                ${isActive ? selectedVariant.activeTabClass : selectedVariant.inactiveTabClass}
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 focus:z-10
              `}
              onClick={() => handleTabClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <SafeIcon icon={tab.icon} className="w-4 h-4" aria-hidden="true" />}
                {tab.label}
                {tab.badge && (
                  <span className="ml-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    {tab.badge}
                  </span>
                )}
              </div>
              
              {variant === 'default' && isActive && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                  layoutId="activeTabIndicator"
                />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="py-4">
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;
          const panelId = `${tabpanelId}-${index}`;
          const tabId = `tab-${index}-${Math.random().toString(36).substr(2, 5)}`;
          
          return (
            <div
              key={index}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              hidden={!isActive}
              tabIndex={0}
            >
              {isActive && tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  defaultTab: PropTypes.number,
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'pills', 'boxed']),
  className: PropTypes.string
};

export default Tabs;
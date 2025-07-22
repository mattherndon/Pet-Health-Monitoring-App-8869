/**
 * PetVue Design System
 * This file contains theme constants and utility functions for maintaining a consistent design
 */

// Color palette
export const colors = {
  // Primary Colors
  primary: {
    50: '#EDFAF6',
    100: '#D0F2E6',
    200: '#A4E9D2',
    300: '#70DBBA',
    400: '#4DCDA3',
    500: '#3BB594', // Brand primary
    600: '#2A9478',
    700: '#1F7259',
    800: '#136F63', // Brand primary dark
    900: '#0A3C35',
  },
  
  // Secondary Colors
  secondary: {
    50: '#E9F6FA',
    100: '#C7E8F2',
    200: '#93D1E5',
    300: '#65BAD8',
    400: '#3EA3CA',
    500: '#227C9D', // Brand secondary
    600: '#1B637D',
    700: '#154B5E',
    800: '#0F323E',
    900: '#07191F',
  },
  
  // Accent Colors
  accent: {
    yellow: '#FFCB77',
    red: '#E45858',
  },
  
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#041B15',
  },
  
  // Gray Scale
  gray: {
    50: '#F9FAFB',
    100: '#F7F9F9', // Fogtail
    200: '#EAEFF0',
    300: '#D1D8D8',
    400: '#A5B1B0', // Pupash
    500: '#6B7775',
    600: '#4D5553',
    700: '#3A403E',
    800: '#272A29',
    900: '#131515',
  },
};

// Typography
export const typography = {
  fontFamily: {
    heading: '"Baloo 2", cursive',
    sans: '"Inter", system-ui, -apple-system, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

// Spacing
export const spacing = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
};

// Shadows
export const shadows = {
  subtle: '0 2px 6px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)',
  medium: '0 4px 12px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)',
  prominent: '0 8px 20px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(0, 0, 0, 0.12)',
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Breakpoints
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-index
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
};

// Animation
export const animation = {
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
    slowest: '1000ms',
  },
};

// Helper function to get color value
export const getColor = (colorPath) => {
  if (!colorPath) return null;
  
  const parts = colorPath.split('.');
  let result = colors;
  
  for (const part of parts) {
    if (result[part] === undefined) {
      return null;
    }
    result = result[part];
  }
  
  return typeof result === 'string' ? result : null;
};

// Helper function for responsive values
export const responsive = (values) => {
  return Object.entries(values).reduce((acc, [breakpoint, value]) => {
    const mediaQuery = breakpoints[breakpoint];
    if (!mediaQuery) return acc;
    
    acc[`@media (min-width: ${mediaQuery})`] = value;
    return acc;
  }, {});
};
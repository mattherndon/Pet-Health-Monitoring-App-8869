/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          light: '#A4E9D2', // MintyFade
          DEFAULT: '#3BB594', // Minteeth
          dark: '#136F63', // Grassure
        },
        // Secondary Color
        secondary: {
          DEFAULT: '#227C9D', // Barkkd
        },
        // Accent Colors
        accent: {
          yellow: '#FFCB77', // Bonish
          red: '#E45858', // Flamepup
        },
        // Neutral Colors
        neutral: {
          white: '#FFFFFF', // White
          black: '#041B15', // Darkhut
        },
        // Gray Scale
        gray: {
          100: '#F7F9F9', // Fogtail
          400: '#A5B1B0', // Pupash
        }
      },
      fontFamily: {
        'heading': ['Baloo 2', 'cursive'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
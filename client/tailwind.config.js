/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        accent: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          'bg-hover': 'rgba(255, 255, 255, 0.15)',
          'bg-strong': 'rgba(255, 255, 255, 0.2)',
          border: 'rgba(255, 255, 255, 0.2)',
          'border-strong': 'rgba(255, 255, 255, 0.3)',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #8b5cf6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
        'gradient-accent': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      },
      boxShadow: {
        'glass-sm': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'glass-md': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'glass-lg': '0 8px 25px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}

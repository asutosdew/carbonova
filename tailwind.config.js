/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#061c11',
          900: '#0c3823',
          850: '#0f442b',
          800: '#145335',
          700: '#1b6d47',
          600: '#238a5b',
          500: '#2ea870',
        },
        brand: {
          green: '#1e7e44',
          emerald: '#10b981',
          leaf: '#22c55e',
          light: '#e8f5ed',
          badge: '#dcfce7',
          border: '#dce8dc',
          bg: '#f3f6f3',
          cream: '#f9faf8',
          card: '#ffffff',
          dark: '#111827',
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(12, 56, 35, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.25)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}



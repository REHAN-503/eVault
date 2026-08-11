/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F8FAFC', // slate-50
          dim: '#F1F5F9', // slate-100
        },
        ink: {
          DEFAULT: '#0F172A', // slate-900
          2: '#1E293B', // slate-800
          3: '#334155', // slate-700
        },
        slate: {
          DEFAULT: '#64748B', // slate-500
          light: '#94A3B8', // slate-400
        },
        line: '#E2E8F0', // slate-200
        verified: {
          DEFAULT: '#059669', // emerald-600
          dark: '#047857',
          bg: '#ECFDF5',
        },
        maroon: {
          DEFAULT: '#DC2626', // red-600
          dark: '#B91C1C',
        },
        seal: {
          DEFAULT: '#2563EB', // blue-600 (institutional blue)
          dark: '#1D4ED8',
        }
      },
      fontFamily: {
        display: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        serif: ['"Playfair Display"', 'Georgia', 'ui-serif', 'serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
}

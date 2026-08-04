import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          50: '#F5F5F7',
          100: '#E8E8ED',
          200: '#D2D2D7',
          300: '#86868B',
          900: '#1D1D1F',
          blue: '#0066CC',
          blueHover: '#0071E3',
        },
        glass: {
          border: 'rgba(0, 0, 0, 0.05)',
          panel: 'rgba(255, 255, 255, 0.7)',
        },
        // Added missing luxury colors
        'elegant-blue': {
          DEFAULT: '#1e3a8a',
          light: '#3b82f6',
          dark: '#172554',
          50: '#eff6ff',
        },
        'premium-gold': {
          DEFAULT: '#d4af37',
          light: '#fde047',
          dark: '#b8860b',
        },
        'lux-ivory': '#fdfbf7',
        'lux-silver': '#e5e7eb',
        'lux-navy': '#0f172a',
        'luxury-gray': '#9ca3af',
        'surface-card': '#ffffff',
        'surface-elevated': '#fafafa',
        'status-success': {
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        'status-error': {
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
        },
        'status-warning': {
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        },
      },
      backgroundImage: {
        'ambient-glow': 'radial-gradient(circle at 50% 0%, rgba(0, 102, 204, 0.03) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(0, 0, 0, 0.02) 0%, transparent 50%)',
      },
      boxShadow: {
        'apple-card': '0 8px 30px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.6)',
        'apple-card-hover': '0 20px 40px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.8)',
        'apple-btn': '0 4px 14px rgba(0, 0, 0, 0.1)',
        // Added missing luxury shadows
        'luxury': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'luxury-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'luxury-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'premium': '0 4px 14px 0 rgba(212, 175, 55, 0.15)',
        'premium-lg': '0 10px 25px -3px rgba(212, 175, 55, 0.25)',
        'premium-xl': '0 20px 35px -5px rgba(212, 175, 55, 0.3)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.5)',
        'glow-blue-lg': '0 0 25px rgba(59, 130, 246, 0.6)',
        'glow-gold': '0 0 15px rgba(212, 175, 55, 0.5)',
        'glow-gold-lg': '0 0 25px rgba(212, 175, 55, 0.6)',
      },
      transitionTimingFunction: {
        'apple-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    }
  },
  plugins: [],
}
export default config

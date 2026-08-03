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
        }
      },
      backgroundImage: {
        'ambient-glow': 'radial-gradient(circle at 50% 0%, rgba(0, 102, 204, 0.03) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(0, 0, 0, 0.02) 0%, transparent 50%)',
      },
      boxShadow: {
        'apple-card': '0 8px 30px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.6)',
        'apple-card-hover': '0 20px 40px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.8)',
        'apple-btn': '0 4px 14px rgba(0, 0, 0, 0.1)',
      },
      transitionTimingFunction: {
        'apple-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    }
  },
  plugins: [],
}
export default config

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
        obsidian: {
          900: '#000000',
          800: '#09090b',
          700: '#121214',
          600: '#1c1c1f',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.16)',
          panel: 'rgba(255, 255, 255, 0.03)',
        },
        apple: {
          blue: '#0A84FF',
          blueHover: '#409CFF',
          gray: '#8E8E93',
          lightGray: '#D1D1D6',
        }
      },
      backgroundImage: {
        'ambient-glow': 'radial-gradient(circle at 50% 0%, rgba(10, 132, 255, 0.15) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
      },
      boxShadow: {
        'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'apple-btn': '0 4px 14px 0 rgba(0, 0, 0, 0.39)',
      },
      transitionTimingFunction: {
        'apple-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    }
  },
  plugins: [],
}
export default config

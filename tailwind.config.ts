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
        // Primary ultra-premium white theme colors
        white: '#FFFFFF',
        
        // Deep elegant blue spectrum (primary brand)
        elegant: {
          blue: '#1E3A8A',
          'blue-light': '#3B82F6',
          'blue-dark': '#1E40AF',
          'blue-50': '#EFF6FF',
          'blue-100': '#DBEAFE',
          'blue-200': '#BFDBFE',
          'blue-300': '#93C5FD',
          'blue-400': '#60A5FA',
          'blue-500': '#3B82F6',
          'blue-600': '#2563EB',
          'blue-700': '#1D4ED8',
          'blue-800': '#1E40AF',
          'blue-900': '#1E3A8A',
          silver: '#94A3B8',
          'silver-light': '#E2E8F0',
        },
        
        // Premium gold accents
        premium: {
          gold: '#F59E0B',
          'gold-light': '#FCD34D',
          'gold-dark': '#D97706',
          'gold-50': '#FFFBEB',
          'gold-100': '#FEF3C7',
          'gold-200': '#FDE68A',
          'gold-300': '#FCD34D',
          'gold-400': '#FBBF24',
          'gold-500': '#F59E0B',
          'gold-600': '#D97706',
          'gold-700': '#B45309',
          'gold-800': '#92400E',
          'gold-900': '#78350F',
        },
        
        // Soft premium grays for depth
        luxury: {
          white: '#FFFFFF',
          offWhite: '#F9FAFB',
          lightGray: '#F3F4F6',
          gray: '#E5E7EB',
          mediumGray: '#9CA3AF',
          darkGray: '#6B7280',
          charcoal: '#374151',
          dark: '#1F2937',
        },
        
        // Status colors
        status: {
          success: '#10B981',
          'success-light': '#34D399',
          'success-dark': '#059669',
          error: '#EF4444',
          'error-light': '#F87171',
          'error-dark': '#DC2626',
          warning: '#F59E0B',
          'warning-light': '#FBBF24',
          'warning-dark': '#D97706',
          info: '#3B82F6',
          'info-light': '#60A5FA',
          'info-dark': '#2563EB',
        },
        
        // Legacy gold support (keeping for backwards compatibility)
        gold: {
          DEFAULT: '#D4AF37',
          50: '#F9F6F0',
          100: '#F4EED9',
          200: '#E8D9B3',
          300: '#DCC48D',
          400: '#D0AF67',
          500: '#D4AF37',
          600: '#B8941F',
          700: '#8B7018',
          800: '#5E4C10',
          900: '#312808',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'system-ui', 'sans-serif'],
      },
      animation: {
        // Premium gradient animations
        'gradient': 'gradient 8s linear infinite',
        'gradient-slow': 'gradient 15s linear infinite',
        'gradient-fast': 'gradient 4s linear infinite',
        
        // Shimmer effects
        'shimmer': 'shimmer 2s linear infinite',
        'shimmer-slow': 'shimmer 3s linear infinite',
        'shimmer-fast': 'shimmer 1.5s linear infinite',
        
        // Float animations
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        
        // Glow effects
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-soft': 'glowSoft 3s ease-in-out infinite alternate',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        
        // Slide animations
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        
        // Fade animations
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-slow': 'fadeIn 1s ease-out',
        'fade-out': 'fadeOut 0.5s ease-out',
        
        // Scale animations
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-in-slow': 'scaleIn 0.6s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        
        // Blur animations
        'blur-in': 'blurIn 0.8s ease-out',
        'blur-out': 'blurOut 0.4s ease-out',
        
        // Pulse animations
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        
        // Spin animations
        'spin-slow': 'spin 3s linear infinite',
        'spin-slower': 'spin 6s linear infinite',
        
        // Bounce animations
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(30, 58, 138, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(30, 58, 138, 0.6)' },
        },
        glowSoft: {
          '0%': { boxShadow: '0 0 10px rgba(30, 58, 138, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(30, 58, 138, 0.4)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(30, 58, 138, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(30, 58, 138, 0.5)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        blurIn: {
          '0%': { filter: 'blur(10px)', opacity: '0' },
          '100%': { filter: 'blur(0px)', opacity: '1' },
        },
        blurOut: {
          '0%': { filter: 'blur(0px)', opacity: '1' },
          '100%': { filter: 'blur(10px)', opacity: '0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(30, 58, 138, 0.2)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 25px rgba(30, 58, 138, 0.5)',
            transform: 'scale(1.02)'
          },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        // Radial & Conic gradients
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        
        // Ultra-premium white theme gradients
        'luxury-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 50%, #FFFFFF 100%)',
        'luxury-gradient-blue': 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 50%, #FFFFFF 100%)',
        'luxury-gradient-gold': 'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 50%, #FFFFFF 100%)',
        
        // Premium brand gradients
        'premium-blue': 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
        'premium-gold': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'premium-white': 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
        
        // Glassmorphism backgrounds
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
        'glass-blue': 'linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
        'glass-gold': 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
        
        // Multi-color gradients
        'rainbow': 'linear-gradient(90deg, #1E3A8A 0%, #3B82F6 25%, #10B981 50%, #F59E0B 75%, #EF4444 100%)',
        
        // Legacy support
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
      },
      boxShadow: {
        // Premium soft shadows
        'luxury': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'luxury-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'luxury-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'luxury-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
        
        // Premium brand shadows
        'premium': '0 4px 14px 0 rgba(30, 58, 138, 0.15)',
        'premium-lg': '0 10px 25px 0 rgba(30, 58, 138, 0.2)',
        'premium-xl': '0 20px 40px 0 rgba(30, 58, 138, 0.25)',
        
        // Glow shadows
        'glow-blue': '0 0 20px rgba(30, 58, 138, 0.3)',
        'glow-blue-lg': '0 0 40px rgba(30, 58, 138, 0.4)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-gold-lg': '0 0 40px rgba(245, 158, 11, 0.4)',
        
        // Inner shadows (neumorphism)
        'inner-luxury': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-luxury-lg': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'luxury': '12px',
        'luxury-lg': '16px',
        'luxury-xl': '20px',
        'luxury-2xl': '24px',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
export default config


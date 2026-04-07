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
        white: '#FFFFFF',

        // White Luxury Core
        'lux-white':    '#FFFFFF',
        'lux-pearl':    '#F8F9FC',
        'lux-ivory':    '#F0F2F8',
        'lux-silver':   '#E8EAF2',
        'lux-slate':    '#64748B',
        'lux-muted':    '#94A3B8',

        // Deep Navy + Royal Blue
        'lux-navy':     '#0A1628',
        'lux-royal':    '#1A2F5E',
        'lux-sapphire': '#1E3A8A',
        'lux-azure':    '#2563EB',
        'lux-sky':      '#3B82F6',
        'lux-mist':     '#EFF6FF',
        'lux-frost':    '#DBEAFE',

        // Gold Accents
        'lux-gold':       '#B8960C',
        'lux-champagne':  '#D4AF37',
        'lux-bronze':     '#8B6914',
        'lux-gold-light': '#FEF3C7',

        // UIverse Neon Accents (use sparingly — focus/hover only)
        'neon-blue':   '#00D4FF',
        'neon-purple': '#7C3AED',
        'neon-cyan':   '#06B6D4',
        'neon-indigo': '#4F46E5',

        // White luxury surface system (light backgrounds)
        surface: {
          base: '#F0F2F8',
          card: '#FFFFFF',
          elevated: '#F8F9FC',
        },

        // Deep elegant blue spectrum (primary brand)
        elegant: {
          blue: '#2563EB',
          'blue-light': '#3B82F6',
          'blue-dark': '#1D4ED8',
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
          silver: '#64748B',
          'silver-light': '#94A3B8',
        },

        // Premium gold accents
        premium: {
          gold: '#D4AF37',
          'gold-light': '#E5C76B',
          'gold-dark': '#B8941F',
          'gold-50': '#FEF3C7',
          'gold-100': '#FDE68A',
          'gold-200': '#FCD34D',
          'gold-300': '#FBBF24',
          'gold-400': '#D4AF37',
          'gold-500': '#D4AF37',
          'gold-600': '#B8941F',
          'gold-700': '#8B7018',
          'gold-800': '#5E4C10',
          'gold-900': '#312808',
        },

        // White luxury grays (for white theme)
        luxury: {
          white: '#FFFFFF',
          offWhite: '#F8F9FC',
          lightGray: '#E8EAF2',
          gray: '#CBD5E1',
          mediumGray: '#94A3B8',
          darkGray: '#64748B',
          charcoal: '#374151',
          dark: '#0A1628',
        },

        // Status colors
        status: {
          success: '#059669',
          'success-light': '#10B981',
          'success-dark': '#047857',
          error: '#DC2626',
          'error-light': '#EF4444',
          'error-dark': '#B91C1C',
          warning: '#D97706',
          'warning-light': '#F59E0B',
          'warning-dark': '#B45309',
          info: '#2563EB',
          'info-light': '#3B82F6',
          'info-dark': '#1D4ED8',
        },

        // Border colors for white theme
        border: {
          DEFAULT: '#E8EAF2',
          active: 'rgba(37, 99, 235, 0.5)',
          hover: '#CBD5E1',
        },

        // Gold accent
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FEF3C7',
          100: '#FDE68A',
          200: '#FCD34D',
          300: '#FBBF24',
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
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',

        // White luxury gradients
        'luxury-gradient': 'linear-gradient(135deg, #F0F2F8 0%, #FFFFFF 50%, #F8F9FC 100%)',
        'luxury-gradient-blue': 'linear-gradient(135deg, #F0F2F8 0%, #EFF6FF 50%, #F8F9FC 100%)',
        'luxury-gradient-gold': 'linear-gradient(135deg, #F8F9FC 0%, #FEF3C7 50%, #FFFFFF 100%)',

        // Premium brand gradients
        'premium-blue': 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
        'premium-gold': 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
        'premium-dark': 'linear-gradient(135deg, #0A1628 0%, #1E3A8A 100%)',

        // White glassmorphism backgrounds
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,252,0.7) 100%)',
        'glass-blue': 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(59,130,246,0.03) 100%)',
        'glass-gold': 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(184,148,31,0.04) 100%)',

        'rainbow': 'linear-gradient(90deg, #2563EB 0%, #3B82F6 25%, #059669 50%, #D4AF37 75%, #DC2626 100%)',
        'gradient-gold': 'linear-gradient(135deg, #B8960C 0%, #D4AF37 100%)',
      },
      boxShadow: {
        // Subtle white luxury shadows
        'luxury': '0 1px 4px rgba(10,22,40,0.06)',
        'luxury-lg': '0 4px 24px rgba(10,22,40,0.08), 0 1px 4px rgba(10,22,40,0.04)',
        'luxury-xl': '0 12px 48px rgba(10,22,40,0.14), 0 4px 12px rgba(10,22,40,0.06)',
        'luxury-2xl': '0 25px 50px -12px rgba(10,22,40,0.18)',

        // Premium CTA shadows
        'premium': '0 4px 14px 0 rgba(30,58,138,0.15)',
        'premium-lg': '0 10px 25px 0 rgba(30,58,138,0.20)',
        'premium-xl': '0 20px 40px 0 rgba(30,58,138,0.25)',

        // Subtle glow for white theme
        'glow-blue': '0 0 20px rgba(37,99,235,0.15)',
        'glow-blue-lg': '0 0 40px rgba(37,99,235,0.20)',
        'glow-gold': '0 0 20px rgba(212,175,55,0.20)',
        'glow-gold-lg': '0 0 40px rgba(212,175,55,0.25)',

        // Inner shadows
        'inner-luxury': 'inset 0 2px 4px 0 rgba(10,22,40,0.05)',
        'inner-luxury-lg': 'inset 0 4px 8px 0 rgba(10,22,40,0.08)',
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


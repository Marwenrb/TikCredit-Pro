'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-elegant-blue/50 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group',
  {
    variants: {
      variant: {
        // Primary gradient button (default)
        default: 'bg-gradient-to-r from-elegant-blue to-elegant-blue-light text-white hover:from-elegant-blue-dark hover:to-elegant-blue shadow-luxury-lg hover:shadow-luxury-xl transform hover:scale-[1.02] active:scale-[0.98]',
        
        // Outline variants
        outline: 'border-2 border-elegant-blue text-elegant-blue hover:bg-elegant-blue hover:text-white shadow-luxury hover:shadow-luxury-lg',
        'outline-gold': 'border-2 border-premium-gold text-premium-gold hover:bg-premium-gold hover:text-white shadow-luxury hover:shadow-luxury-lg',
        
        // Ghost variants
        ghost: 'text-elegant-blue hover:bg-elegant-blue/10 hover:shadow-lg',
        'ghost-gold': 'text-premium-gold hover:bg-premium-gold/10 hover:shadow-lg',
        
        // White & Premium variants
        white: 'bg-white text-elegant-blue hover:bg-luxury-offWhite shadow-luxury-xl hover:shadow-2xl border-2 border-elegant-blue/10 hover:border-elegant-blue/30',
        premium: 'bg-gradient-to-br from-white via-luxury-lightGray to-luxury-offWhite text-elegant-blue shadow-premium hover:shadow-luxury-xl border border-elegant-blue/20 hover:border-elegant-blue/40 backdrop-blur-sm',
        
        // Glass variants (glassmorphism)
        glass: 'bg-white/70 backdrop-blur-lg text-elegant-blue border border-white/30 shadow-luxury-lg hover:bg-white/90 hover:shadow-luxury-xl',
        'glass-blue': 'bg-elegant-blue/10 backdrop-blur-lg text-elegant-blue border border-elegant-blue/20 shadow-luxury-lg hover:bg-elegant-blue/20 hover:shadow-luxury-xl',
        'glass-gold': 'bg-premium-gold/10 backdrop-blur-lg text-premium-gold border border-premium-gold/20 shadow-luxury-lg hover:bg-premium-gold/20 hover:shadow-luxury-xl',
        
        // Gradient variants
        gradient: 'bg-gradient-to-r from-elegant-blue via-elegant-blue-light to-premium-gold text-white shadow-premium-lg hover:shadow-premium-xl bg-[length:200%_auto] hover:bg-right transition-all duration-500',
        'gradient-gold': 'bg-gradient-to-r from-premium-gold to-premium-gold-dark text-white shadow-lg hover:shadow-xl hover:from-premium-gold-dark hover:to-premium-gold',
        
        // Neon glow variant
        neon: 'bg-elegant-blue text-white shadow-glow-blue hover:shadow-glow-blue-lg border border-elegant-blue-light/50',
        'neon-gold': 'bg-premium-gold text-white shadow-glow-gold hover:shadow-glow-gold-lg border border-premium-gold-light/50',
        
        // Status variants
        success: 'bg-gradient-to-r from-status-success to-status-success-dark text-white hover:from-status-success-dark hover:to-status-success shadow-lg hover:shadow-xl',
        danger: 'bg-gradient-to-r from-status-error to-status-error-dark text-white hover:from-status-error-dark hover:to-status-error shadow-lg hover:shadow-xl',
        warning: 'bg-gradient-to-r from-status-warning to-status-warning-dark text-white hover:from-status-warning-dark hover:to-status-warning shadow-lg hover:shadow-xl',
        
        // Gold variants (legacy support)
        gold: 'bg-gradient-to-r from-premium-gold to-premium-gold-dark text-white hover:from-premium-gold-dark hover:to-premium-gold shadow-lg hover:shadow-xl',
        
        // Magnetic variant (special hover effect)
        magnetic: 'bg-white text-elegant-blue border-2 border-elegant-blue/20 shadow-premium hover:shadow-premium-xl hover:border-elegant-blue/50 hover:translate-x-1 transition-all',
      },
      size: {
        default: 'px-6 py-3 text-base',
        sm: 'px-4 py-2 text-sm',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    // Extract motion-specific props
    const { onDrag, onDragEnd, onDragStart, ...buttonProps } = props as any
    
    // Determine shimmer color based on variant
    const isWhiteVariant = variant === 'white' || variant === 'premium' || variant === 'glass' || variant === 'magnetic'
    const isGlassVariant = variant?.includes('glass')
    const isOutlineVariant = variant?.includes('outline')
    const isGhostVariant = variant?.includes('ghost')
    
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
        {...buttonProps}
      >
        <span className="relative z-10 flex items-center gap-2 font-semibold">
          {loading && (
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {children}
        </span>
        {/* Premium shine effect - blue tint for white variants, white for colored variants */}
        <span 
          className={cn(
            "absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out",
            isWhiteVariant 
              ? "bg-gradient-to-r from-transparent via-elegant-blue/10 to-transparent" 
              : "bg-gradient-to-r from-transparent via-white/25 to-transparent"
          )} 
        />
        {/* Subtle glow effect on hover */}
        <motion.span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: isWhiteVariant 
              ? 'radial-gradient(circle at center, rgba(30, 58, 138, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%)'
          }}
        />
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button


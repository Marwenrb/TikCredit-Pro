'use client'

import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Ultra-Premium Card Component
 * Features: Glassmorphism, neumorphism, hover animations, shimmer effects
 */

const cardVariants = cva(
  'relative overflow-hidden transition-all duration-300',
  {
    variants: {
      variant: {
        // Default luxury white card
        default: 'bg-white border border-luxury-lightGray shadow-luxury-lg hover:shadow-luxury-xl hover:border-elegant-blue/20',
        
        // Premium gradient card
        premium: 'bg-gradient-to-br from-white via-luxury-offWhite to-white border border-elegant-blue/10 shadow-premium hover:shadow-premium-lg hover:border-elegant-blue/30',
        
        // Glassmorphism variants
        glass: 'bg-white/70 backdrop-blur-lg border border-white/30 shadow-luxury-xl hover:bg-white/90',
        'glass-blue': 'bg-elegant-blue-50/30 backdrop-blur-lg border border-elegant-blue/10 shadow-luxury-lg hover:bg-elegant-blue-50/50',
        'glass-gold': 'bg-premium-gold-50/30 backdrop-blur-lg border border-premium-gold/10 shadow-luxury-lg hover:bg-premium-gold-50/50',
        'glass-strong': 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-luxury-xl hover:bg-white',
        
        // Neumorphism (soft 3D effect)
        neumorphism: 'bg-white shadow-[8px_8px_16px_rgba(0,0,0,0.08),-8px_-8px_16px_rgba(255,255,255,0.9)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,0.9)]',
        'neumorphism-inset': 'bg-luxury-offWhite shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]',
        
        // Elevated cards
        elevated: 'bg-white shadow-luxury-2xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-luxury-gray',
        
        // Gradient border card
        'gradient-border': 'bg-white border-2 border-transparent bg-gradient-to-br from-elegant-blue to-premium-gold bg-clip-padding shadow-luxury-lg hover:shadow-luxury-xl',
        
        // Outlined cards
        outlined: 'bg-white border-2 border-elegant-blue/20 hover:border-elegant-blue/40 shadow-luxury hover:shadow-luxury-lg',
        'outlined-gold': 'bg-white border-2 border-premium-gold/20 hover:border-premium-gold/40 shadow-luxury hover:shadow-luxury-lg',
        
        // Flat (no shadow)
        flat: 'bg-white border border-luxury-lightGray hover:border-elegant-blue/20',
      },
      size: {
        sm: 'p-4 rounded-luxury',
        md: 'p-6 rounded-luxury-lg',
        lg: 'p-8 rounded-luxury-xl',
        xl: 'p-10 rounded-luxury-2xl',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-2',
        'lift-strong': 'hover:-translate-y-4',
        scale: 'hover:scale-[1.02]',
        glow: 'hover:shadow-glow-blue',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hover: 'lift',
    },
  }
)

export interface CardProps
  extends Omit<HTMLMotionProps<'div'>, 'variants'>,
    VariantProps<typeof cardVariants> {
  shimmer?: boolean
  borderGlow?: boolean
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, hover, shimmer = false, borderGlow = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, size, hover, className }))}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        {/* Premium shimmer effect */}
        {shimmer && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'linear',
            }}
          />
        )}
        
        {/* Border glow on hover */}
        {borderGlow && (
          <motion.div
            className="absolute -inset-[1px] rounded-luxury-lg bg-gradient-to-r from-elegant-blue via-premium-gold to-elegant-blue opacity-0 group-hover:opacity-100 blur-sm"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

/**
 * Stat Card Component (for dashboard statistics)
 */
export interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'blue' | 'gold' | 'success' | 'error'
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  variant = 'default',
}) => {
  const variantColors = {
    default: 'from-elegant-blue to-elegant-blue-light',
    blue: 'from-elegant-blue to-elegant-blue-light',
    gold: 'from-premium-gold to-premium-gold-dark',
    success: 'from-status-success to-status-success-dark',
    error: 'from-status-error to-status-error-dark',
  }

  return (
    <Card variant="premium" hover="lift" shimmer>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-luxury-darkGray mb-2">{title}</p>
          <p className="text-3xl font-bold text-elegant-blue">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                'text-sm font-semibold',
                trend === 'up' ? 'text-status-success' : trend === 'down' ? 'text-status-error' : 'text-luxury-mediumGray'
              )}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <motion.div
            className={cn(
              'p-3 rounded-luxury-lg bg-gradient-to-br shadow-luxury',
              variantColors[variant]
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="text-white">{icon}</div>
          </motion.div>
        )}
      </div>
    </Card>
  )
}

export default Card





'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface GlassCardProps {
  variant?: 'default' | 'gold' | 'dark' | 'elevated'
  hover3D?: boolean
  glow?: boolean
  shimmer?: boolean
  className?: string
  children: React.ReactNode
}

const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  hover3D = false,
  glow = false,
  shimmer = false,
  className,
  children,
}) => {
  const variants = {
    default: 'bg-surface-card/90 backdrop-blur-md border border-gray-200 shadow-luxury-lg',
    gold: 'bg-gradient-to-br from-surface-card to-surface-elevated backdrop-blur-md border border-premium-gold/30 shadow-premium',
    dark: 'bg-surface-elevated backdrop-blur-md border border-gray-400 shadow-luxury',
    elevated: 'bg-surface-card backdrop-blur-lg border border-elegant-blue/20 shadow-luxury-xl',
  }

  return (
    <motion.div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variants[variant],
        glow && 'shadow-[0_0_30px_rgba(37,99,235,0.25)]',
        shimmer && 'relative overflow-hidden',
        className
      )}
      whileHover={hover3D ? { rotateY: 5, rotateX: 5, scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {shimmer && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-lux-azure/5 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

export interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
}) => {
  return (
    <GlassCard variant="gold" hover3D glow className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1 font-medium">{title}</p>
          <p className="text-3xl font-bold text-lux-navy">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs mt-2 font-semibold',
              trend.isPositive ? 'text-status-success' : 'text-status-error'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-lux-azure">{icon}</div>
        )}
      </div>
    </GlassCard>
  )
}

export default GlassCard


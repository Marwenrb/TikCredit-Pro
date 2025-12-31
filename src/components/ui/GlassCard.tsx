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
    default: 'bg-dark-50/30 backdrop-blur-md border border-gold-500/20',
    gold: 'bg-gradient-to-br from-gold-500/20 to-gold-600/10 backdrop-blur-md border border-gold-500/40',
    dark: 'bg-dark-100/50 backdrop-blur-md border border-gray-700/50',
    elevated: 'bg-dark-50/40 backdrop-blur-lg border border-gold-500/30 shadow-2xl',
  }

  return (
    <motion.div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variants[variant],
        glow && 'shadow-[0_0_30px_rgba(212,175,55,0.3)]',
        shimmer && 'relative overflow-hidden',
        className
      )}
      whileHover={hover3D ? { rotateY: 5, rotateX: 5, scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {shimmer && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
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
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gold-400">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs mt-2',
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gold-500">{icon}</div>
        )}
      </div>
    </GlassCard>
  )
}

export default GlassCard


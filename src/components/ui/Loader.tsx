'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'
  className?: string
  label?: string
}

const spinnerSizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-16 h-16 border-3',
  fullscreen: 'w-16 h-16 border-3',
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  className,
  label,
}) => {
  const spinner = (
    <motion.div
      className={cn(
        'rounded-full border-elegant-blue border-t-transparent',
        spinnerSizes[size],
        className,
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  )

  if (size === 'fullscreen') {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-base/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {spinner}
        {label && (
          <motion.p
            className="mt-4 text-sm font-medium text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {label}
          </motion.p>
        )}
      </motion.div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {spinner}
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  )
}

export default Loader

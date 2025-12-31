'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  progress: number
  total: number
  className?: string
  showLabel?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  className,
  showLabel = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (progress / total) * 100))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">الخطوة {progress} من {total}</span>
          <span className="text-sm font-medium text-gold-400">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-dark-100/50 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default ProgressBar


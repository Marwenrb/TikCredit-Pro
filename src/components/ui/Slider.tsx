'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

export interface SliderProps {
  min?: number
  max?: number
  value: number
  onChange: (value: number) => void
  step?: number
  label?: string
  className?: string
}

const Slider: React.FC<SliderProps> = ({
  min = 1000000,
  max = 20000000,
  value,
  onChange,
  step = 100000,
  label,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const percentage = ((value - min) / (max - min)) * 100

  const bubbleOffset = useMemo(() => {
    const clamped = Math.min(100, Math.max(0, percentage))
    return `calc(${clamped}% - 36px)`
  }, [percentage])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-luxury-charcoal mb-4">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-luxury-darkGray font-medium">{formatCurrency(min)}</span>
          <motion.div
            className="px-4 py-2 bg-elegant-blue/10 backdrop-blur-sm border border-elegant-blue/30 rounded-lg shadow-sm"
            animate={{ scale: isDragging ? 1.05 : 1 }}
          >
            <span className="text-lg font-bold text-elegant-blue">
              {formatCurrency(value)}
            </span>
          </motion.div>
          <span className="text-sm text-luxury-darkGray font-medium">{formatCurrency(max)}</span>
        </div>
        <div className="relative h-4 bg-gradient-to-r from-white via-luxury-offWhite to-white rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border border-luxury-lightGray/60">
          <motion.div
            className="absolute h-full bg-gradient-to-r from-elegant-blue via-elegant-blue-light to-premium-gold rounded-full shadow-[0_0_18px_rgba(30,58,138,0.35)]"
            style={{ width: `${percentage}%` }}
            transition={{ duration: 0.2 }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer z-10"
          />
          {/* Premium thumb with live value bubble */}
          <motion.div
            className="absolute top-1/2 w-8 h-8 bg-white rounded-full shadow-[0_10px_20px_rgba(30,58,138,0.18)] border-2 border-elegant-blue flex items-center justify-center"
            style={{ left: `calc(${percentage}% - 16px)`, transform: 'translateY(-50%)' }}
            animate={{
              scale: isDragging ? 1.15 : 1,
              boxShadow: isDragging
                ? '0 14px 28px rgba(30,58,138,0.28)'
                : '0 10px 20px rgba(30,58,138,0.18)',
            }}
            transition={{ duration: 0.18 }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-elegant-blue" />
          </motion.div>

          {/* Floating bubble showing current amount */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              key={value}
              className="absolute -top-12 px-3 py-2 rounded-2xl bg-gradient-to-r from-elegant-blue via-elegant-blue-light to-premium-gold text-white text-sm font-semibold shadow-premium"
              style={{ left: bubbleOffset }}
            >
              {formatCurrency(value)}
              <motion.span
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-elegant-blue via-elegant-blue-light to-premium-gold rotate-45"
                layout
              />
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="absolute inset-0 pointer-events-none rounded-full bg-gradient-to-r from-elegant-blue/0 via-elegant-blue/8 to-premium-gold/0"
            animate={{
              opacity: isDragging ? 1 : 0,
              scale: isDragging ? 1 : 0.98,
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  )
}

export default Slider


'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
        <div className="relative h-2 bg-luxury-lightGray rounded-full">
          <motion.div
            className="absolute h-full bg-gradient-to-r from-elegant-blue to-elegant-blue-light rounded-full"
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
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer z-10"
          />
          <motion.div
            className="absolute top-1/2 w-6 h-6 bg-elegant-blue rounded-full shadow-lg border-2 border-white"
            style={{ left: `calc(${percentage}% - 12px)`, transform: 'translateY(-50%)' }}
            animate={{
              scale: isDragging ? 1.2 : 1,
              boxShadow: isDragging
                ? '0 0 20px rgba(30, 58, 138, 0.6)'
                : '0 4px 12px rgba(30, 58, 138, 0.3)',
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  )
}

export default Slider


'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface RadioOption {
  value: string
  label: string
}

export interface RadioGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  name: string
  className?: string
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <motion.label
            key={option.value}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300',
              'bg-dark-50/30 backdrop-blur-sm border-2',
              isSelected
                ? 'border-gold-500 bg-gold-500/10'
                : 'border-gold-500/20 hover:border-gold-500/40'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected
                  ? 'border-gold-500 bg-gold-500'
                  : 'border-gray-400'
              )}
            >
              {isSelected && (
                <motion.div
                  className="w-2.5 h-2.5 bg-white rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </div>
            <span className={cn(
              'flex-1 text-base',
              isSelected ? 'text-gold-400 font-medium' : 'text-gray-300'
            )}>
              {option.label}
            </span>
          </motion.label>
        )
      })}
    </div>
  )
}

export default RadioGroup


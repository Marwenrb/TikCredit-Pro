'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  labelPosition?: 'start' | 'end'
  className?: string
}

const sizes = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 15 },
  md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 27 },
}

const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  labelPosition = 'end',
  className,
}) => {
  const s = sizes[size]

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  const track = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={handleToggle}
      className={cn(
        'relative rounded-full transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center',
        'focus:outline-none focus:ring-2 focus:ring-elegant-blue/40 focus:ring-offset-2 focus:ring-offset-surface-base',
        s.track,
        checked ? 'bg-elegant-blue shadow-glow-blue' : 'bg-luxury-gray',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      <motion.div
        className={cn(
          'absolute rounded-full bg-white shadow-md',
          s.thumb,
        )}
        initial={false}
        animate={{ x: checked ? s.translate : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )

  if (!label) return <div className={className}>{track}</div>

  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'cursor-not-allowed', className)}>
      {labelPosition === 'start' && <span className="text-sm font-medium text-lux-navy">{label}</span>}
      {track}
      {labelPosition === 'end' && <span className="text-sm font-medium text-lux-navy">{label}</span>}
    </label>
  )
}

export default Toggle

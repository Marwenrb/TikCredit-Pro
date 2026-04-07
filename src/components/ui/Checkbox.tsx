'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface CheckboxProps {
  label?: string
  description?: string
  checked?: boolean
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  error?: string
  name?: string
  className?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked = false, indeterminate = false, onChange, disabled = false, error, name, className }, ref) => {
    const handleChange = () => {
      if (!disabled && onChange) {
        onChange(!checked)
      }
    }

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <button
          type="button"
          role="checkbox"
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-disabled={disabled}
          onClick={handleChange}
          className={cn(
            'relative w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
            'focus:outline-none focus:ring-2 focus:ring-elegant-blue/40 focus:ring-offset-2 focus:ring-offset-surface-base',
            checked || indeterminate
              ? 'bg-elegant-blue border-elegant-blue'
              : 'bg-surface-card border-luxury-gray hover:border-elegant-blue/50',
            disabled && 'opacity-40 cursor-not-allowed',
            error && 'border-status-error',
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={() => {}}
            className="sr-only"
            tabIndex={-1}
          />
          {checked && (
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <motion.path
                d="M2 6L5 9L10 3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            </motion.svg>
          )}
          {indeterminate && !checked && (
            <motion.div
              className="w-2.5 h-0.5 bg-white rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </button>
        {(label || description) && (
          <div
            className={cn('flex-1 cursor-pointer', disabled && 'cursor-not-allowed opacity-40')}
            onClick={handleChange}
          >
            {label && (
              <span className="text-sm font-medium text-lux-navy">{label}</span>
            )}
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
        {error && (
          <p className="text-xs text-status-error mt-1" role="alert">{error}</p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox

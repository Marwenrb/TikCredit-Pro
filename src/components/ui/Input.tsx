'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-luxury-charcoal mb-2">
            {label}
          </label>
        )}
        <motion.input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-4 py-3 bg-white backdrop-blur-sm border border-luxury-lightGray rounded-xl shadow-sm',
            'text-luxury-charcoal placeholder:text-luxury-mediumGray',
            'focus:outline-none focus:ring-2 focus:ring-elegant-blue focus:border-elegant-blue',
            'transition-all duration-300',
            error && 'border-status-error focus:ring-status-error',
            className
          )}
          whileFocus={{ scale: 1.01 }}
          {...(props as any)}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-status-error font-medium"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }
>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <motion.label
          className="block text-sm font-medium text-luxury-charcoal mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {label}
        </motion.label>
      )}
      <motion.textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-4 bg-white backdrop-blur-sm border-2 rounded-xl shadow-sm',
          'text-luxury-charcoal placeholder:text-luxury-mediumGray resize-none',
          'focus:outline-none focus:ring-2 focus:ring-elegant-blue/20 focus:border-elegant-blue',
          'transition-all duration-300',
          error ? 'border-status-error focus:ring-status-error/20 focus:border-status-error' : 'border-luxury-lightGray',
          className
        )}
        whileFocus={{ scale: 1.01 }}
        {...(props as any)}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className="mt-2 text-sm text-status-error flex items-center gap-1 font-medium"
        >
          <span className="w-1 h-1 bg-status-error rounded-full" />
          {error}
        </motion.p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }
>(({ className, label, error, children, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-luxury-charcoal mb-2">
          {label}
        </label>
      )}
      <motion.select
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-white backdrop-blur-sm border border-luxury-lightGray rounded-xl shadow-sm',
          'text-luxury-charcoal',
          'focus:outline-none focus:ring-2 focus:ring-elegant-blue focus:border-elegant-blue',
          'transition-all duration-300',
          error && 'border-status-error focus:ring-status-error',
          className
        )}
        whileFocus={{ scale: 1.01 }}
        {...(props as any)}
      >
        {children}
      </motion.select>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-status-error font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Input


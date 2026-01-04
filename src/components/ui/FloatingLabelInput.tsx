'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, error, icon, className, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      setHasValue(!!value || (inputRef.current?.value?.length ?? 0) > 0)
    }, [value])

    const isActive = isFocused || hasValue

    return (
      <div className="relative w-full group">
        <div className="relative">
          {icon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-elegant-blue/50 group-focus-within:text-elegant-blue transition-colors z-10">
              {icon}
            </div>
          )}
          <motion.input
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node)
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
              }
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
            }}
            className={cn(
              'w-full px-4 pt-6 pb-2 bg-white backdrop-blur-sm border-2 rounded-xl shadow-sm',
              'text-luxury-charcoal placeholder:text-transparent',
              'focus:outline-none focus:border-elegant-blue focus:ring-2 focus:ring-elegant-blue/20',
              'transition-all duration-300',
              error ? 'border-status-error focus:border-status-error focus:ring-status-error/20' : 'border-luxury-lightGray',
              icon && 'pr-12',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0)
              props.onChange?.(e)
            }}
            value={value}
            {...(props as any)}
          />
          <motion.label
            className={cn(
              'absolute right-4 pointer-events-none transition-all duration-300',
              isActive
                ? 'top-2 text-xs text-elegant-blue font-semibold'
                : 'top-1/2 -translate-y-1/2 text-base text-luxury-mediumGray'
            )}
            animate={{
              y: isActive ? 0 : 0,
            }}
          >
            {label}
          </motion.label>
        </div>
        <AnimatePresence>
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
        </AnimatePresence>
      </div>
    )
  }
)

FloatingLabelInput.displayName = 'FloatingLabelInput'

export default FloatingLabelInput



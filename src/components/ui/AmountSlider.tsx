'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, AlertCircle, CheckCircle2, Sparkles, Edit3 } from 'lucide-react'

export interface AmountSliderProps {
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (value: number) => void
  label?: string
  className?: string
  showTooltip?: boolean
  error?: string
  disabled?: boolean
}

/**
 * Ultra-Premium Amount Slider with Manual Input
 * 
 * Features:
 * - Fully functional range slider (5M - 20M DZD)
 * - Manual input field for typing the exact amount
 * - Luxury grayscale gradients with blue/gold accents
 * - Smooth animations with Framer Motion
 * - Full ARIA accessibility
 */
const AmountSlider: React.FC<AmountSliderProps> = memo(({
  min = 5_000_000,
  max = 20_000_000,
  step = 500_000,
  value,
  onChange,
  label = 'المبلغ المطلوب',
  className = '',
  showTooltip = true,
  error,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sliderRef = useRef<HTMLInputElement>(null)

  // Calculate percentage for slider fill
  const percentage = useMemo(() => {
    const clamped = Math.min(max, Math.max(min, value))
    return ((clamped - min) / (max - min)) * 100
  }, [value, min, max])

  // Format value for display
  const formattedValue = useMemo(() => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value)
  }, [value])

  // Validation state
  const isValid = value >= min && value <= max

  // Handle slider change
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    onChange(newValue)
  }, [onChange])

  // Handle manual input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    setInputValue(raw)
  }, [])

  // Handle input blur - apply the value
  const handleInputBlur = useCallback(() => {
    setIsEditing(false)
    const numValue = parseInt(inputValue, 10)
    if (!isNaN(numValue)) {
      // Clamp to valid range
      const clampedValue = Math.min(max, Math.max(min, numValue))
      onChange(clampedValue)
    }
    setInputValue('')
  }, [inputValue, min, max, onChange])

  // Handle input key press
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setInputValue('')
    }
  }, [handleInputBlur])

  // Start editing mode
  const startEditing = useCallback(() => {
    setIsEditing(true)
    setInputValue(value.toString())
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [value])

  // Handle keyboard navigation on slider
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return

    let newValue = value
    const largeStep = step * 5

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault()
        newValue = Math.min(max, value + step)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault()
        newValue = Math.max(min, value - step)
        break
      case 'PageUp':
        e.preventDefault()
        newValue = Math.min(max, value + largeStep)
        break
      case 'PageDown':
        e.preventDefault()
        newValue = Math.max(min, value - largeStep)
        break
      case 'Home':
        e.preventDefault()
        newValue = min
        break
      case 'End':
        e.preventDefault()
        newValue = max
        break
      default:
        return
    }

    onChange(newValue)
  }, [value, min, max, step, onChange, disabled])

  const quickAmounts = useMemo(() => [
    { label: '5 مليون', value: 5_000_000 },
    { label: '10 مليون', value: 10_000_000 },
    { label: '15 مليون', value: 15_000_000 },
    { label: '20 مليون', value: 20_000_000 },
  ], [])

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-lg font-bold text-luxury-charcoal">
          <Sparkles className="w-5 h-5 text-premium-gold" />
          {label}
          <span className="text-status-error">*</span>
        </label>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {quickAmounts.map((qa) => (
          <motion.button
            key={qa.value}
            type="button"
            onClick={() => onChange(qa.value)}
            disabled={disabled}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`
              px-3 py-3 text-sm font-bold rounded-xl transition-all duration-200
              ${value === qa.value
                ? 'bg-gradient-to-r from-elegant-blue to-elegant-blue-light text-white shadow-lg shadow-elegant-blue/30'
                : 'bg-luxury-offWhite text-luxury-charcoal hover:bg-elegant-blue/10 hover:text-elegant-blue border-2 border-luxury-gray/50 hover:border-elegant-blue/50'
              }
              focus:outline-none focus:ring-2 focus:ring-elegant-blue/50
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {qa.label}
          </motion.button>
        ))}
      </div>

      {/* Main Amount Display with Manual Input */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className={`
            relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer
            ${isDragging || isEditing
              ? 'border-elegant-blue bg-gradient-to-br from-elegant-blue/5 via-white to-premium-gold/5 shadow-lg shadow-elegant-blue/20'
              : error || !isValid
                ? 'border-status-error bg-status-error/5'
                : 'border-luxury-gray bg-gradient-to-br from-luxury-offWhite via-white to-luxury-lightGray hover:border-elegant-blue/50'
            }
          `}
          onClick={!isEditing ? startEditing : undefined}
        >
          {/* Edit Icon */}
          <div className="absolute top-4 left-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-full bg-elegant-blue/10 text-elegant-blue"
            >
              <Edit3 className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Amount Display / Input */}
          <div className="text-center">
            {isEditing ? (
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  placeholder={formattedValue}
                  className="w-full text-center text-4xl md:text-5xl font-bold bg-transparent border-none outline-none text-elegant-blue placeholder:text-luxury-gray"
                  autoFocus
                />
                <p className="text-sm text-luxury-darkGray mt-2">
                  اكتب المبلغ ثم اضغط Enter
                </p>
              </div>
            ) : (
              <>
                <motion.p
                  key={value}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-elegant-blue via-elegant-blue-light to-premium-gold bg-clip-text text-transparent"
                >
                  {formattedValue}
                </motion.p>
                <p className="text-lg font-medium text-luxury-darkGray mt-2">دينار جزائري</p>
                <p className="text-xs text-luxury-mediumGray mt-1">
                  اضغط للكتابة يدوياً
                </p>
              </>
            )}
          </div>

          {/* Validation Status */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {isValid ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-status-success bg-status-success/10 px-4 py-1.5 rounded-full"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">المبلغ صحيح</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-status-error bg-status-error/10 px-4 py-1.5 rounded-full"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {value < min ? `الحد الأدنى ${formatCurrency(min)}` : `الحد الأقصى ${formatCurrency(max)}`}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Slider Section */}
      <div className="mb-8">
        {/* Min/Max Labels */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-luxury-darkGray px-3 py-1.5 bg-luxury-offWhite rounded-xl border border-luxury-gray/30">
            {formatCurrency(min)}
          </span>
          <span className="text-xs text-luxury-mediumGray">اسحب المؤشر لتحديد المبلغ</span>
          <span className="text-sm font-semibold text-luxury-darkGray px-3 py-1.5 bg-luxury-offWhite rounded-xl border border-luxury-gray/30">
            {formatCurrency(max)}
          </span>
        </div>

        {/* Slider Track Container */}
        <div className="relative h-6 flex items-center">
          {/* Background Track */}
          <div className="absolute inset-0 h-3 top-1.5 bg-gradient-to-r from-luxury-lightGray via-luxury-gray to-luxury-lightGray rounded-full shadow-inner" />

          {/* Active Fill */}
          <motion.div
            className="absolute h-3 top-1.5 left-0 rounded-full bg-gradient-to-r from-elegant-blue via-elegant-blue-light to-premium-gold shadow-md"
            style={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Shimmer Effect */}
          <motion.div
            className="absolute h-3 top-1.5 left-0 rounded-full overflow-hidden"
            style={{ width: `${percentage}%` }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut'
              }}
            />
          </motion.div>

          {/* Native Range Input */}
          <input
            ref={sliderRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label="Sélectionnez le montant du prêt"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={formatCurrency(value)}
            role="slider"
            className="
              absolute inset-0 w-full h-6 opacity-0 cursor-pointer z-10
              disabled:cursor-not-allowed
            "
            style={{ touchAction: 'none' }}
          />

          {/* Custom Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-20"
            style={{
              left: `calc(${percentage}% - ${percentage * 0.28}px)`,
            }}
            animate={{
              scale: isDragging ? 1.3 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div
              className={`
                w-7 h-7 rounded-full bg-white shadow-xl border-[3px] border-elegant-blue 
                flex items-center justify-center
                ${isDragging ? 'ring-4 ring-elegant-blue/30' : 'ring-2 ring-elegant-blue/10'}
              `}
            >
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-elegant-blue to-premium-gold" />
            </div>

            {/* Tooltip on Drag */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-elegant-blue text-white px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap text-sm font-bold"
                >
                  {formatCurrency(value)}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-elegant-blue" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Step Indicator */}
        <p className="text-center text-xs text-luxury-mediumGray mt-3">
          الخطوة: {formatCurrency(step)}
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-sm text-status-error flex items-center gap-2 bg-status-error/10 px-4 py-2 rounded-lg"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Screen Reader Description */}
      <p className="sr-only">
        اختر المبلغ المطلوب بين {formatCurrency(min)} و {formatCurrency(max)}.
        استخدم مفاتيح الأسهم للتعديل أو اضغط على المبلغ للكتابة يدوياً.
      </p>
    </div>
  )
})

AmountSlider.displayName = 'AmountSlider'

export default AmountSlider

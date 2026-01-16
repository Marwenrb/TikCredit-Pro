'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, Info, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'

export interface AmountSliderProps {
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (value: number) => void
  label?: string
  className?: string
  showTooltip?: boolean
  estimatedMonthlyPayment?: (amount: number) => number
  error?: string
  disabled?: boolean
}

// Interest rate for estimation (can be made configurable)
const ANNUAL_INTEREST_RATE = 0.095 // 9.5%
const LOAN_TERM_MONTHS = 60 // 5 years

/**
 * Calculate estimated monthly payment
 */
function calculateMonthlyPayment(principal: number): number {
  const monthlyRate = ANNUAL_INTEREST_RATE / 12
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, LOAN_TERM_MONTHS)) / 
                  (Math.pow(1 + monthlyRate, LOAN_TERM_MONTHS) - 1)
  return Math.round(payment)
}

/**
 * Ultra-Premium Amount Slider Component
 * 
 * Features:
 * - Dual input (slider + numeric field) synchronized
 * - Full accessibility: ARIA labels, keyboard navigation, screen reader support
 * - Touch-friendly for mobile devices
 * - Real-time value tooltip with smooth animations
 * - Estimated monthly payment display
 * - Real-time validation feedback
 * - RTL (Arabic) support
 * - Gradient backgrounds with premium design
 * - Framer Motion spring animations
 */
const AmountSlider: React.FC<AmountSliderProps> = ({
  min = 5_000_000,
  max = 20_000_000,
  step = 500_000,
  value,
  onChange,
  label = 'المبلغ المطلوب',
  className = '',
  showTooltip = true,
  estimatedMonthlyPayment = calculateMonthlyPayment,
  error,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())
  const [showInfo, setShowInfo] = useState(false)
  const [showValueBubble, setShowValueBubble] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Spring animation for smooth value changes
  const springValue = useSpring(value, { stiffness: 300, damping: 30 })
  const animatedPercentage = useTransform(springValue, [min, max], [0, 100])
  
  // Calculate percentage for slider fill
  const percentage = useMemo(() => {
    const clamped = Math.min(max, Math.max(min, value))
    return ((clamped - min) / (max - min)) * 100
  }, [value, min, max])
  
  // Update spring when value changes
  useEffect(() => {
    springValue.set(value)
  }, [value, springValue])
  
  // Sync input value with slider value
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toLocaleString('ar-DZ'))
    }
  }, [value, isFocused])
  
  // Show value bubble when dragging
  useEffect(() => {
    if (isDragging) {
      setShowValueBubble(true)
    } else {
      const timer = setTimeout(() => setShowValueBubble(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isDragging, value])
  
  // Handle slider change
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    onChange(newValue)
  }, [onChange])
  
  // Handle numeric input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    setInputValue(raw)
    
    const numValue = parseInt(raw, 10)
    if (!isNaN(numValue)) {
      // Clamp value to min/max
      const clampedValue = Math.min(max, Math.max(min, numValue))
      onChange(clampedValue)
    }
  }, [min, max, onChange])
  
  // Handle input blur - format the number
  const handleInputBlur = useCallback(() => {
    setIsFocused(false)
    // Ensure value is within bounds
    const clampedValue = Math.min(max, Math.max(min, value))
    if (clampedValue !== value) {
      onChange(clampedValue)
    }
    setInputValue(clampedValue.toLocaleString('ar-DZ'))
  }, [value, min, max, onChange])
  
  // Handle keyboard navigation for slider
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
  
  // Calculate thumb position accounting for thumb width
  const thumbPosition = useMemo(() => {
    const thumbWidth = 32 // 2rem = 32px
    return `calc(${percentage}% - ${(percentage / 100) * thumbWidth}px)`
  }, [percentage])
  
  // Validation state
  const isValid = value >= min && value <= max
  const monthlyPayment = estimatedMonthlyPayment(value)
  
  // Quick amount buttons
  const quickAmounts = useMemo(() => [
    { label: 'الحد الأدنى', value: min, icon: '💰' },
    { label: '10 مليون', value: 10_000_000, icon: '📈' },
    { label: '15 مليون', value: 15_000_000, icon: '🎯' },
    { label: 'الحد الأقصى', value: max, icon: '🏆' },
  ], [min, max])

  return (
    <div className={`w-full ${className}`}>
      {/* Label with info button */}
      <div className="flex items-center justify-between mb-4">
        <label 
          id="amount-slider-label"
          className="flex items-center gap-2 text-sm font-semibold text-luxury-charcoal"
        >
          <Sparkles className="w-4 h-4 text-premium-gold" />
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="p-1.5 text-luxury-darkGray hover:text-elegant-blue transition-colors focus:outline-none focus:ring-2 focus:ring-elegant-blue/50 rounded-full hover:bg-elegant-blue/5"
          aria-label="معلومات حول المبلغ"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
      
      {/* Info tooltip */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="p-4 bg-gradient-to-r from-elegant-blue/5 via-elegant-blue/10 to-premium-gold/5 border border-elegant-blue/20 rounded-2xl text-sm text-luxury-charcoal overflow-hidden"
          >
            <p className="leading-relaxed">💡 نصيحة: اختر المبلغ الذي يناسب قدرتك على السداد الشهري. القسط المقدر يعتمد على فترة سداد 5 سنوات بمعدل فائدة 9.5%.</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick amount buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {quickAmounts.map((qa) => (
          <motion.button
            key={qa.value}
            type="button"
            onClick={() => onChange(qa.value)}
            disabled={disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all duration-200
              ${value === qa.value 
                ? 'bg-gradient-to-r from-elegant-blue to-elegant-blue-light text-white shadow-lg shadow-elegant-blue/25' 
                : 'bg-luxury-offWhite text-luxury-charcoal hover:bg-elegant-blue/10 hover:text-elegant-blue border border-luxury-gray/50'
              }
              focus:outline-none focus:ring-2 focus:ring-elegant-blue/50
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="mr-1">{qa.icon}</span> {qa.label}
          </motion.button>
        ))}
      </div>
      
      {/* Main amount display with input */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <DollarSign className="w-5 h-5 text-elegant-blue" />
          </div>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true)
              setInputValue(value.toString())
            }}
            onBlur={handleInputBlur}
            disabled={disabled}
            aria-labelledby="amount-slider-label"
            aria-describedby="amount-description amount-error"
            aria-invalid={!!error || !isValid}
            className={`w-full text-center text-2xl md:text-3xl font-bold py-4 px-12 
              bg-luxury-offWhite border-2 rounded-2xl transition-all duration-200
              focus:outline-none focus:ring-4
              ${error || !isValid
                ? 'border-status-error focus:border-status-error focus:ring-status-error/20 text-status-error'
                : 'border-luxury-mediumGray/30 focus:border-elegant-blue focus:ring-elegant-blue/20 text-elegant-blue'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="text-sm font-medium text-luxury-darkGray">د.ج</span>
          </div>
        </div>
        
        {/* Validation status */}
        <div className="flex items-center justify-center gap-2 mt-2">
          {isValid ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-status-success"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">المبلغ صحيح</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-status-error"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">
                {value < min ? 'أقل من الحد الأدنى' : 'أكثر من الحد الأقصى'}
              </span>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Slider track */}
      <div 
        ref={sliderRef}
        className="relative mb-4"
        role="presentation"
      >
        {/* Min/Max labels */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-medium text-luxury-darkGray px-2 py-1 bg-luxury-offWhite rounded-lg">
            {formatCurrency(min)}
          </span>
          <span className="text-xs font-medium text-luxury-darkGray px-2 py-1 bg-luxury-offWhite rounded-lg">
            {formatCurrency(max)}
          </span>
        </div>
        
        {/* Track container with premium gradient */}
        <div className="relative h-4 bg-gradient-to-r from-luxury-lightGray via-luxury-gray to-luxury-lightGray rounded-full shadow-inner overflow-hidden">
          {/* Active fill with premium gradient */}
          <motion.div
            className="absolute h-full rounded-full bg-gradient-to-r from-elegant-blue via-elegant-blue-light to-premium-gold shadow-lg"
            style={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          
          {/* Shimmer effect on the active fill */}
          <motion.div
            className="absolute h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '500%'] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatDelay: 2,
              ease: 'easeInOut' 
            }}
            style={{ width: `${percentage}%` }}
          />
          
          {/* Glow effect when dragging */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-elegant-blue/30 via-transparent to-transparent rounded-full"
                style={{ width: `${percentage}%` }}
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* Native range input (invisible but accessible) */}
        <input
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
          aria-labelledby="amount-slider-label"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${formatCurrency(value)}`}
          className="absolute top-3 left-0 w-full h-4 opacity-0 cursor-pointer z-20 
            disabled:cursor-not-allowed touch-pan-y"
        />
        
        {/* Custom premium thumb */}
        <motion.div
          className="absolute top-1/2 mt-3 w-8 h-8 -translate-y-1/2 pointer-events-none z-10"
          style={{ left: thumbPosition }}
          animate={{
            scale: isDragging ? 1.25 : 1,
            boxShadow: isDragging
              ? '0 10px 30px -5px rgba(30, 58, 138, 0.5)'
              : '0 6px 20px -4px rgba(30, 58, 138, 0.35)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className="w-full h-full bg-white rounded-full shadow-xl border-[3px] border-elegant-blue flex items-center justify-center ring-4 ring-elegant-blue/10">
            <motion.div 
              className="w-3 h-3 rounded-full bg-gradient-to-br from-elegant-blue via-elegant-blue-light to-premium-gold"
              animate={{ rotate: isDragging ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Value bubble above thumb */}
          <AnimatePresence>
            {(showValueBubble || isDragging) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-r from-elegant-blue to-elegant-blue-light text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl whitespace-nowrap"
              >
                {formatCurrency(value)}
                {/* Arrow pointing down */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-elegant-blue" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Estimated monthly payment tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-5 bg-gradient-to-br from-elegant-blue/5 via-elegant-blue/10 to-premium-gold/10 
            border border-elegant-blue/20 rounded-2xl backdrop-blur-sm relative overflow-hidden"
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,_#1E3A8A_1px,_transparent_0)] bg-[size:20px_20px]" />
          
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-luxury-darkGray mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                القسط الشهري المقدر
              </p>
              <motion.p 
                key={monthlyPayment}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xl font-bold bg-gradient-to-r from-elegant-blue to-elegant-blue-light bg-clip-text text-transparent"
              >
                {formatCurrency(monthlyPayment)}
              </motion.p>
            </div>
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-luxury-gray to-transparent" />
            <div className="text-right flex-1">
              <p className="text-xs text-luxury-darkGray mb-1.5">مدة السداد</p>
              <p className="text-lg font-semibold text-luxury-charcoal">5 سنوات</p>
              <p className="text-xs text-luxury-mediumGray">(60 شهر)</p>
            </div>
          </div>
          <div className="relative mt-4 pt-3 border-t border-luxury-gray/30">
            <p className="text-xs text-luxury-darkGray flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              التقدير للإرشاد فقط. القسط الفعلي يعتمد على الموافقة والشروط.
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id="amount-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-status-error flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      
      {/* Hidden description for screen readers */}
      <p id="amount-description" className="sr-only">
        اختر المبلغ المطلوب بين {formatCurrency(min)} و {formatCurrency(max)}. 
        استخدم مفاتيح الأسهم للتعديل بخطوات {formatCurrency(step)}.
      </p>
    </div>
  )
}

export default AmountSlider

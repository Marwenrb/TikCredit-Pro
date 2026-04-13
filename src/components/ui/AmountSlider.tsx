'use client'

import React, { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Sparkles, PenLine, Infinity as InfinityIcon, ArrowLeft } from 'lucide-react'

export interface AmountSliderProps {
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (value: number) => void
  onCustomModeChange?: (isCustom: boolean) => void
  label?: string
  className?: string
  showTooltip?: boolean
  error?: string
  disabled?: boolean
}

/**
 * Ultra-Premium Amount Selector
 *
 * Two distinct modes:
 * - Preset mode: range slider 5M–20M + 4 quick-select buttons
 * - Custom mode: free-form numeric input with NO upper bound
 *
 * Switching to "مبلغ آخر" hides the slider entirely and presents
 * a dedicated "Montant Libre" panel that accepts any value ≥ MIN.
 *
 * @param min     - Minimum allowed amount (default: 5_000_000)
 * @param max     - Slider max for preset mode only (default: 20_000_000)
 * @param step    - Slider step (default: 500_000)
 * @param value   - Controlled value
 * @param onChange - Callback with new value
 * @param onCustomModeChange - Fires when custom mode toggles
 */
const AmountSlider: React.FC<AmountSliderProps> = memo(({
  min = 5_000_000,
  max = 20_000_000,
  step = 500_000,
  value,
  onChange,
  onCustomModeChange,
  label = 'المبلغ المطلوب',
  className = '',
  error,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sliderRef = useRef<HTMLInputElement>(null)

  // ── Derived ───────────────────────────────────────────────────────────────
  const percentage = useMemo(() => {
    const clamped = Math.min(max, Math.max(min, value))
    return ((clamped - min) / (max - min)) * 100
  }, [value, min, max])

  const formattedValue = useMemo(() => (
    new Intl.NumberFormat('fr-DZ', { style: 'decimal', maximumFractionDigits: 0 }).format(value)
  ), [value])

  const formattedInputPreview = useMemo(() => {
    const num = parseInt(inputValue, 10)
    if (isNaN(num) || num === 0) return ''
    return new Intl.NumberFormat('fr-DZ', { style: 'decimal', maximumFractionDigits: 0 }).format(num)
  }, [inputValue])

  // custom mode: any value > 0 is valid (min enforced at submit); preset: must be in [min, max]
  const isValid = isCustomMode
    ? (value >= min)
    : (value >= min && value <= max)

  const quickAmounts = useMemo(() => [
    { label: '5 مليون',  value: 5_000_000  },
    { label: '10 مليون', value: 10_000_000 },
    { label: '15 مليون', value: 15_000_000 },
    { label: '20 مليون', value: 20_000_000 },
  ], [])

  const isQuickAmount = quickAmounts.some(qa => qa.value === value) && !isCustomMode

  // ── Handlers ─────────────────────────────────────────────────────────────
  const enterCustomMode = useCallback(() => {
    setIsCustomMode(true)
    setIsEditing(true)
    setInputValue('')
    onCustomModeChange?.(true)
    setTimeout(() => inputRef.current?.focus(), 60)
  }, [onCustomModeChange])

  const exitCustomMode = useCallback(() => {
    setIsCustomMode(false)
    setIsEditing(false)
    setInputValue('')
    onCustomModeChange?.(false)
    // Reset to min so slider starts clean
    onChange(min)
  }, [onCustomModeChange, onChange, min])

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }, [onChange])

  const handlePresetClick = useCallback((amount: number) => {
    setIsCustomMode(false)
    onCustomModeChange?.(false)
    setIsEditing(false)
    setInputValue('')
    onChange(amount)
  }, [onChange, onCustomModeChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    setInputValue(raw)
    const num = parseInt(raw, 10)
    if (!isNaN(num) && num > 0) {
      onChange(num)
    }
  }, [onChange])

  const handleInputBlur = useCallback(() => {
    const num = parseInt(inputValue, 10)
    if (!isNaN(num) && num >= min) {
      onChange(num)
    } else if (isNaN(num) || num === 0) {
      // keep previous value — don't reset
    }
    setIsEditing(false)
    setInputValue('')
  }, [inputValue, min, onChange])

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { inputRef.current?.blur() }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setInputValue('')
    }
  }, [])

  // In preset mode, click-to-edit the display card
  const startEditing = useCallback(() => {
    if (disabled || isCustomMode) return
    setIsEditing(true)
    setInputValue(value.toString())
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [disabled, isCustomMode, value])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled || isCustomMode) return
    let next = value
    switch (e.key) {
      case 'ArrowRight': case 'ArrowUp':   e.preventDefault(); next = Math.min(max, value + step); break
      case 'ArrowLeft':  case 'ArrowDown': e.preventDefault(); next = Math.max(min, value - step); break
      case 'PageUp':   e.preventDefault(); next = Math.min(max, value + step * 5); break
      case 'PageDown': e.preventDefault(); next = Math.max(min, value - step * 5); break
      case 'Home': e.preventDefault(); next = min; break
      case 'End':  e.preventDefault(); next = max; break
      default: return
    }
    onChange(next)
  }, [value, min, max, step, onChange, disabled, isCustomMode])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`w-full ${className}`}>

      {/* ── Label ── */}
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-lg font-bold text-lux-navy">
          <Sparkles className="w-5 h-5 text-premium-gold" />
          {label}
          <span className="text-status-error">*</span>
        </label>

        {/* Mode badge */}
        <AnimatePresence mode="wait">
          {isCustomMode ? (
            <motion.span
              key="libre"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-premium-gold/40 bg-premium-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700"
            >
              <InfinityIcon className="w-3.5 h-3.5" />
              Montant Libre
            </motion.span>
          ) : (
            <motion.span
              key="preset"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-lux-slate"
            >
              5M — 20M د.ج
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick Amount Buttons + Custom toggle ── */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {quickAmounts.map((qa) => (
          <motion.button
            key={qa.value}
            type="button"
            onClick={() => handlePresetClick(qa.value)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={[
              'px-2 py-3 text-sm font-bold rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-elegant-blue/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              !isCustomMode && value === qa.value
                ? 'bg-gradient-to-r from-elegant-blue to-elegant-blue-light text-white shadow-lg shadow-elegant-blue/30'
                : 'bg-gray-50 text-lux-navy hover:bg-elegant-blue/10 hover:text-elegant-blue border-2 border-luxury-gray/50 hover:border-elegant-blue/50',
            ].join(' ')}
          >
            {qa.label}
          </motion.button>
        ))}

        {/* Custom Mode Toggle */}
        <motion.button
          type="button"
          onClick={isCustomMode ? exitCustomMode : enterCustomMode}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.04 }}
          whileTap={{ scale: 0.97 }}
          className={[
            'px-2 py-3 text-sm font-bold rounded-xl transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-amber-400/50',
            'disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden',
            isCustomMode
              ? 'bg-gradient-to-r from-premium-gold to-amber-500 text-white shadow-lg shadow-amber-400/30'
              : 'bg-gray-50 text-lux-navy hover:bg-amber-50 hover:text-amber-700 border-2 border-luxury-gray/50 hover:border-amber-400/50',
          ].join(' ')}
        >
          {isCustomMode ? (
            <span className="flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              رجوع
            </span>
          ) : 'مبلغ آخر'}
        </motion.button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CUSTOM MODE — Libre Panel: no slider, no cap
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {isCustomMode ? (
          <motion.div
            key="libre-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            {/* Libre callout banner */}
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-premium-gold/30 bg-gradient-to-r from-amber-50 via-white to-amber-50 px-5 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-premium-gold to-amber-500 shadow-md">
                <InfinityIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Montant Libre — بلا حد أقصى</p>
                <p className="text-xs text-amber-600">
                  اكتب أي مبلغ — الحد الأدنى فقط: {formatCurrency(min)}
                </p>
              </div>
            </div>

            {/* Amount display / input */}
            <div
              className={[
                'relative rounded-2xl border-2 p-6 transition-all duration-300',
                isEditing
                  ? 'border-premium-gold bg-gradient-to-br from-amber-50/60 via-white to-amber-50/40 shadow-lg shadow-amber-200/40'
                  : isValid
                    ? 'cursor-pointer border-premium-gold/50 bg-gradient-to-br from-white via-amber-50/30 to-white hover:border-premium-gold'
                    : 'border-status-error bg-status-error/5',
              ].join(' ')}
              onClick={!isEditing ? () => { setIsEditing(true); setInputValue(value > 0 ? value.toString() : ''); setTimeout(() => inputRef.current?.focus(), 50) } : undefined}
            >
              {/* Edit icon */}
              <div className="absolute left-4 top-4">
                <motion.div
                  animate={{ scale: isEditing ? 1.1 : 1 }}
                  className={`rounded-full p-2 ${isEditing ? 'bg-premium-gold/20 text-amber-700' : 'bg-elegant-blue/10 text-elegant-blue'}`}
                >
                  <PenLine className="h-4 w-4" />
                </motion.div>
              </div>

              <div className="text-center">
                {isEditing ? (
                  <>
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      onKeyDown={handleInputKeyDown}
                      placeholder={formattedValue}
                      className="w-full bg-transparent border-none text-center text-4xl font-bold outline-none text-elegant-blue placeholder:text-luxury-gray md:text-5xl"
                      autoFocus
                    />
                    {formattedInputPreview && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-base font-semibold text-elegant-blue/60"
                      >
                        {formattedInputPreview} د.ج
                      </motion.p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      اكتب المبلغ ثم اضغط Enter — بلا حد أقصى
                    </p>
                    <p className="mt-1 text-xs text-premium-gold font-medium">
                      الحد الأدنى: {formatCurrency(min)}
                    </p>
                  </>
                ) : (
                  <>
                    <motion.p
                      key={value}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-amber-600 via-premium-gold to-amber-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
                    >
                      {formattedValue}
                    </motion.p>
                    <p className="mt-2 text-lg font-medium text-gray-500">دينار جزائري</p>
                    <p className="mt-1 text-xs text-amber-600 font-medium">اضغط لتغيير المبلغ — بلا حد أقصى</p>
                  </>
                )}
              </div>

              {/* Validation badge */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {isValid ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 rounded-full bg-status-success/10 px-4 py-1.5 text-status-success"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">المبلغ صحيح</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 rounded-full bg-status-error/10 px-4 py-1.5 text-status-error"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      الحد الأدنى: {formatCurrency(min)}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ════════════════════════════════════════════════════════════════
             PRESET MODE — Display card + Slider 5M–20M
          ════════════════════════════════════════════════════════════════ */
          <motion.div
            key="preset-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Amount Display Card */}
            <div className="mb-8">
              <div
                className={[
                  'relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300',
                  isDragging || isEditing
                    ? 'border-elegant-blue bg-gradient-to-br from-elegant-blue/10 via-white to-premium-gold/10 shadow-lg shadow-elegant-blue/20'
                    : error || !isValid
                      ? 'border-status-error bg-status-error/5'
                      : 'border-luxury-gray bg-gradient-to-br from-surface-elevated via-surface-card to-gray-100 hover:border-elegant-blue/50',
                ].join(' ')}
                onClick={!isEditing ? startEditing : undefined}
              >
                <div className="absolute left-4 top-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="rounded-full bg-elegant-blue/10 p-2 text-elegant-blue"
                  >
                    <PenLine className="h-4 w-4" />
                  </motion.div>
                </div>

                <div className="text-center">
                  {isEditing ? (
                    <>
                      <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        placeholder={formattedValue}
                        className="w-full bg-transparent border-none text-center text-4xl font-bold text-elegant-blue outline-none placeholder:text-luxury-gray md:text-5xl"
                        autoFocus
                      />
                      {formattedInputPreview && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-1 text-base font-semibold text-elegant-blue/60"
                        >
                          {formattedInputPreview} د.ج
                        </motion.p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        اكتب المبلغ ثم اضغط Enter
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        الحد الأدنى {formatCurrency(min)} — الحد الأقصى {formatCurrency(max)}
                      </p>
                    </>
                  ) : (
                    <>
                      <motion.p
                        key={value}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-elegant-blue via-elegant-blue-light to-premium-gold bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
                      >
                        {formattedValue}
                      </motion.p>
                      <p className="mt-2 text-lg font-medium text-gray-500">دينار جزائري</p>
                      <p className="mt-1 text-xs text-gray-400">اضغط للكتابة يدوياً</p>
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  {isValid ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 rounded-full bg-status-success/10 px-4 py-1.5 text-status-success"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">المبلغ صحيح</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 rounded-full bg-status-error/10 px-4 py-1.5 text-status-error"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {value < min
                          ? `الحد الأدنى ${formatCurrency(min)}`
                          : `الحد الأقصى ${formatCurrency(max)}`}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Slider Section */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-xl border border-luxury-gray/30 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-500">
                  {formatCurrency(min)}
                </span>
                <span className="text-xs text-gray-400">اسحب المؤشر لتحديد المبلغ</span>
                <span className="rounded-xl border border-luxury-gray/30 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-500">
                  {formatCurrency(max)}
                </span>
              </div>

              <div className="relative flex h-6 items-center">
                {/* Track bg */}
                <div className="absolute inset-0 top-1.5 h-3 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 shadow-inner" />

                {/* Fill */}
                <motion.div
                  className="absolute left-0 top-1.5 h-3 rounded-full bg-gradient-to-r from-elegant-blue via-elegant-blue-light to-premium-gold shadow-md"
                  animate={{ width: `${percentage}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />

                {/* Shimmer on fill */}
                <motion.div
                  className="absolute left-0 top-1.5 h-3 overflow-hidden rounded-full"
                  style={{ width: `${percentage}%` }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/22 to-transparent"
                    animate={{ x: ['-100%', '220%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                  />
                </motion.div>

                {/* Native range */}
                <input
                  ref={sliderRef}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={Math.min(max, Math.max(min, value))}
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
                  aria-valuenow={Math.min(max, Math.max(min, value))}
                  aria-valuetext={formatCurrency(value)}
                  role="slider"
                  className="absolute inset-0 z-10 h-6 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  style={{ touchAction: 'none' }}
                />

                {/* Thumb */}
                <motion.div
                  className="pointer-events-none absolute top-1/2 z-20 -translate-y-1/2"
                  style={{ left: `calc(${percentage}% - ${percentage * 0.28}px)` }}
                  animate={{ scale: isDragging ? 1.3 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-elegant-blue bg-white shadow-xl ${isDragging ? 'ring-4 ring-elegant-blue/30' : 'ring-2 ring-elegant-blue/10'}`}>
                    <div className="h-3 w-3 rounded-full bg-gradient-to-br from-elegant-blue to-premium-gold" />
                  </div>

                  <AnimatePresence>
                    {isDragging && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-elegant-blue px-3 py-1.5 text-sm font-bold text-white shadow-lg"
                      >
                        {formatCurrency(value)}
                        <div className="absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-elegant-blue" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <p className="mt-3 text-center text-xs text-gray-400">
                الخطوة: {formatCurrency(step)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error from parent */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 rounded-lg bg-status-error/10 px-4 py-2 text-sm text-status-error"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Screen-reader description */}
      <p className="sr-only">
        {isCustomMode
          ? `وضع المبلغ الحر — اكتب أي مبلغ أكبر من ${formatCurrency(min)}`
          : `اختر المبلغ المطلوب بين ${formatCurrency(min)} و ${formatCurrency(max)}. استخدم مفاتيح الأسهم أو اضغط على المبلغ للكتابة يدوياً.`}
      </p>
    </div>
  )
})

AmountSlider.displayName = 'AmountSlider'
export default AmountSlider

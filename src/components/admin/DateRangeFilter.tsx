'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DateRangeType, DateRange, formatDateRangeLabel } from '@/lib/exportUtils'
import { Button } from '@/components/ui'

/**
 * Ultra-Premium Date Range Filter Component
 * For filtering admin dashboard submissions by date
 */

export interface DateRangeFilterProps {
  value: DateRange
  onChange: (dateRange: DateRange) => void
  className?: string
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  className,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')

  const quickFilters: { type: DateRangeType; label: string }[] = [
    { type: 'today', label: 'اليوم' },
    { type: 'week', label: 'هذا الأسبوع' },
    { type: 'month', label: 'هذا الشهر' },
    { type: 'year', label: 'هذا العام' },
    { type: 'all', label: 'الكل' },
  ]

  const handleQuickFilter = (type: DateRangeType) => {
    setShowCustomPicker(false)
    onChange({ type })
  }

  const handleCustomFilter = () => {
    if (!customStart || !customEnd) {
      alert('يرجى اختيار تاريخ البداية والنهاية')
      return
    }

    const start = new Date(customStart)
    const end = new Date(customEnd)

    if (start > end) {
      alert('تاريخ البداية يجب أن يكون قبل تاريخ النهاية')
      return
    }

    onChange({
      type: 'custom',
      startDate: start,
      endDate: end,
    })
    setShowCustomPicker(false)
  }

  const clearCustomFilter = () => {
    setCustomStart('')
    setCustomEnd('')
    setShowCustomPicker(false)
    onChange({ type: 'all' })
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <motion.button
            key={filter.type}
            onClick={() => handleQuickFilter(filter.type)}
            className={cn(
              'px-4 py-2 rounded-luxury font-medium transition-all duration-300',
              value.type === filter.type
                ? 'bg-gradient-to-r from-elegant-blue to-elegant-blue-light text-white shadow-premium'
                : 'bg-white text-elegant-blue border-2 border-elegant-blue/20 hover:border-elegant-blue/40 shadow-luxury hover:shadow-luxury-lg'
            )}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {filter.label}
          </motion.button>
        ))}

        {/* Custom Date Button */}
        <motion.button
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className={cn(
            'px-4 py-2 rounded-luxury font-medium transition-all duration-300 flex items-center gap-2',
            value.type === 'custom' || showCustomPicker
              ? 'bg-gradient-to-r from-premium-gold to-premium-gold-dark text-white shadow-premium'
              : 'bg-white text-premium-gold border-2 border-premium-gold/20 hover:border-premium-gold/40 shadow-luxury hover:shadow-luxury-lg'
          )}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Calendar className="w-4 h-4" />
          <span>فترة مخصصة</span>
        </motion.button>
      </div>

      {/* Custom Date Picker */}
      {showCustomPicker && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="luxury-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-elegant-blue flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              اختر الفترة الزمنية
            </h4>
            <button
              onClick={clearCustomFilter}
              className="text-luxury-darkGray hover:text-status-error transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-luxury-darkGray">
                من تاريخ
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white border-2 border-elegant-blue/20 rounded-luxury text-elegant-blue font-medium focus:outline-none focus:ring-2 focus:ring-elegant-blue focus:border-elegant-blue shadow-luxury hover:border-elegant-blue/40 transition-all"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-luxury-darkGray">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min={customStart}
                className="w-full px-4 py-3 bg-white border-2 border-elegant-blue/20 rounded-luxury text-elegant-blue font-medium focus:outline-none focus:ring-2 focus:ring-elegant-blue focus:border-elegant-blue shadow-luxury hover:border-elegant-blue/40 transition-all"
              />
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCustomFilter}
            >
              إلغاء
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleCustomFilter}
              disabled={!customStart || !customEnd}
            >
              تطبيق الفلتر
            </Button>
          </div>
        </motion.div>
      )}

      {/* Current Selection Display */}
      {value.type !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-elegant-blue-50 border border-elegant-blue/20 rounded-luxury px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-elegant-blue" />
            <span className="text-sm font-semibold text-elegant-blue">
              الفترة المحددة:
            </span>
            <span className="text-sm text-luxury-darkGray font-medium">
              {formatDateRangeLabel(value)}
            </span>
          </div>
          <button
            onClick={() => onChange({ type: 'all' })}
            className="text-luxury-darkGray hover:text-status-error transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default DateRangeFilter







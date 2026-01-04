'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileSpreadsheet, FileText, X, Calendar, TrendingUp } from 'lucide-react'
import { Modal, Button } from '@/components/ui'
import DateRangeFilter from './DateRangeFilter'
import { 
  DateRange, 
  exportToExcel, 
  exportToPDF,
  exportToTXT,
  exportToCSV,
  filterSubmissionsByDateRange,
  getSubmissionStatistics,
  formatCurrency,
} from '@/lib/exportUtils'
import { Submission } from '@/types'
import { cn } from '@/lib/utils'

/**
 * Ultra-Premium Download Modal Component
 * Advanced export interface with date filtering and preview
 */

export interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
  submissions: Submission[]
}

type ExportFormat = 'excel' | 'pdf' | 'txt' | 'csv'

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  submissions,
}) => {
  const [dateRange, setDateRange] = useState<DateRange>({ type: 'all' })
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('txt')
  const [includeNotes, setIncludeNotes] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Filter submissions based on date range
  const filteredSubmissions = useMemo(() => {
    return filterSubmissionsByDateRange(submissions, dateRange)
  }, [submissions, dateRange])

  // Get statistics for filtered submissions
  const stats = useMemo(() => {
    return getSubmissionStatistics(submissions, dateRange)
  }, [submissions, dateRange])

  const handleExport = async () => {
    if (filteredSubmissions.length === 0) {
      alert('لا توجد طلبات للتصدير في الفترة المحددة')
      return
    }

    setIsExporting(true)

    try {
      const options = {
        dateRange,
        includeNotes,
      }

      switch (selectedFormat) {
        case 'txt':
          exportToTXT(filteredSubmissions, options)
          break
        case 'csv':
          exportToCSV(filteredSubmissions, options)
          break
        case 'excel':
          exportToExcel(filteredSubmissions, options)
          break
        case 'pdf':
          exportToPDF(filteredSubmissions, options)
          break
      }

      // Success feedback
      setTimeout(() => {
        setIsExporting(false)
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Export error:', error)
      setIsExporting(false)
      alert('حدث خطأ أثناء التصدير. يرجى المحاولة مرة أخرى.')
    }
  }

  const formatOptions: { type: ExportFormat; label: string; description: string; icon: React.ReactNode; color: string; arabicSupport: boolean }[] = [
    {
      type: 'txt',
      label: 'TXT (نص عربي)',
      description: 'ملف نصي مع دعم كامل للعربية',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-elegant-blue to-elegant-blue-light',
      arabicSupport: true,
    },
    {
      type: 'csv',
      label: 'CSV (نص عربي)',
      description: 'جدول بيانات مع دعم العربية',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      color: 'from-premium-gold to-premium-gold-dark',
      arabicSupport: true,
    },
    {
      type: 'excel',
      label: 'Excel (XLSX)',
      description: 'ملف Excel قابل للتحرير',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      color: 'from-status-success to-status-success-dark',
      arabicSupport: true,
    },
    {
      type: 'pdf',
      label: 'PDF (إنجليزي)',
      description: 'مستند PDF (أرقام فقط)',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-status-error to-status-error-dark',
      arabicSupport: false,
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-luxury-lightGray">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-3 rounded-luxury-lg bg-gradient-to-br from-elegant-blue to-elegant-blue-light shadow-premium"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Download className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-elegant-blue">تصدير الطلبات</h2>
              <p className="text-sm text-luxury-darkGray">اختر الفترة الزمنية والصيغة المطلوبة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-luxury-darkGray hover:text-status-error transition-colors p-2 rounded-luxury hover:bg-luxury-offWhite"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-elegant-blue flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            الفترة الزمنية
          </h3>
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>

        {/* Statistics Preview */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-luxury-lg bg-gradient-to-br from-elegant-blue-50 to-premium-gold-50 border border-elegant-blue/10"
        >
          <div className="text-center">
            <p className="text-sm font-medium text-luxury-darkGray mb-1">عدد الطلبات</p>
            <motion.p
              key={stats.total}
              initial={{ scale: 1.2, color: '#3B82F6' }}
              animate={{ scale: 1, color: '#1E3A8A' }}
              className="text-3xl font-bold text-elegant-blue"
            >
              {stats.total}
            </motion.p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-luxury-darkGray mb-1">إجمالي المبالغ</p>
            <motion.p
              key={stats.totalAmount}
              initial={{ scale: 1.2, color: '#3B82F6' }}
              animate={{ scale: 1, color: '#1E3A8A' }}
              className="text-2xl font-bold text-elegant-blue"
            >
              {formatCurrency(stats.totalAmount)}
            </motion.p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-luxury-darkGray mb-1">متوسط المبلغ</p>
            <motion.p
              key={stats.avgAmount}
              initial={{ scale: 1.2, color: '#3B82F6' }}
              animate={{ scale: 1, color: '#1E3A8A' }}
              className="text-2xl font-bold text-elegant-blue"
            >
              {formatCurrency(stats.avgAmount)}
            </motion.p>
          </div>
        </motion.div>

        {/* Format Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-elegant-blue flex items-center gap-2">
            <FileText className="w-5 h-5" />
            صيغة التصدير
          </h3>
          <p className="text-sm text-luxury-darkGray mb-3">
            ⭐ للحصول على النص العربي، استخدم TXT أو CSV
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {formatOptions.map((format) => (
              <motion.button
                key={format.type}
                onClick={() => setSelectedFormat(format.type)}
                className={cn(
                  'p-4 rounded-luxury-lg border-2 transition-all duration-300 flex flex-col items-center gap-2 text-center relative',
                  selectedFormat === format.type
                    ? 'border-elegant-blue/40 bg-gradient-to-br from-white to-elegant-blue-50 shadow-premium'
                    : 'border-luxury-lightGray bg-white hover:border-elegant-blue/20 hover:shadow-luxury-lg'
                )}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {format.arabicSupport && (
                  <span className="absolute -top-2 -right-2 text-xs bg-status-success text-white px-2 py-0.5 rounded-full">
                    عربي ✓
                  </span>
                )}
                <motion.div
                  className={cn(
                    'p-3 rounded-luxury-lg bg-gradient-to-br text-white shadow-luxury',
                    format.color
                  )}
                  animate={selectedFormat === format.type ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {format.icon}
                </motion.div>
                <div>
                  <p className="text-sm font-bold text-elegant-blue">{format.label}</p>
                  <p className="text-xs text-luxury-darkGray">{format.description}</p>
                </div>
                {selectedFormat === format.type && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 left-2 w-5 h-5 rounded-full bg-elegant-blue flex items-center justify-center"
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-elegant-blue">خيارات إضافية</h3>
          <label className="flex items-center gap-3 p-4 rounded-luxury bg-white border-2 border-luxury-lightGray hover:border-elegant-blue/20 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={includeNotes}
              onChange={(e) => setIncludeNotes(e.target.checked)}
              className="w-5 h-5 rounded border-elegant-blue/30 text-elegant-blue focus:ring-2 focus:ring-elegant-blue cursor-pointer"
            />
            <div className="flex-1">
              <p className="font-semibold text-elegant-blue">تضمين الملاحظات</p>
              <p className="text-sm text-luxury-darkGray">إضافة عمود الملاحظات في الملف المُصدّر</p>
            </div>
          </label>
        </div>

        {/* Preview */}
        {filteredSubmissions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-elegant-blue">معاينة البيانات (أول 3 طلبات)</h3>
            <div className="space-y-2">
              {filteredSubmissions.slice(0, 3).map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-luxury bg-white border border-luxury-lightGray hover:border-elegant-blue/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-elegant-blue">{submission.data.fullName}</p>
                      <p className="text-sm text-luxury-darkGray">
                        {submission.data.phone} • {submission.data.wilaya}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-premium-gold">
                      {formatCurrency(submission.data.requestedAmount || 0)}
                    </p>
                  </div>
                </motion.div>
              ))}
              {filteredSubmissions.length > 3 && (
                <p className="text-center text-sm text-luxury-darkGray font-medium pt-2">
                  + {filteredSubmissions.length - 3} طلبات أخرى
                </p>
              )}
            </div>
          </div>
        )}

        {/* No Data Message */}
        {filteredSubmissions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center rounded-luxury-lg bg-luxury-offWhite border-2 border-dashed border-luxury-gray"
          >
            <Calendar className="w-12 h-12 text-luxury-mediumGray mx-auto mb-3" />
            <p className="text-lg font-bold text-luxury-darkGray mb-1">لا توجد طلبات</p>
            <p className="text-sm text-luxury-mediumGray">لا توجد طلبات في الفترة الزمنية المحددة</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-luxury-lightGray">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            variant="gradient"
            size="lg"
            onClick={handleExport}
            disabled={filteredSubmissions.length === 0 || isExporting}
            loading={isExporting}
            className="flex-1"
          >
            {isExporting ? (
              <span>جاري التصدير...</span>
            ) : (
              <>
                <Download className="w-5 h-5 ml-2" />
                <span>تصدير ({filteredSubmissions.length} طلب)</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DownloadModal




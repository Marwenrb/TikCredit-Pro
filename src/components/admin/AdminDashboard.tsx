'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Download, Trash2, Eye, LogOut, TrendingUp, Users, DollarSign, Calendar, FileText, Sparkles, CheckCircle2, XCircle, RefreshCw, Loader2, AlertCircle, Wifi, WifiOff, Bell, Printer, MapPin, CheckSquare, Square } from 'lucide-react'
import { Button, GlassCard, StatCard, Modal } from '@/components/ui'
import DownloadModal from './DownloadModal'
import PrintableSubmissions from './PrintableSubmissions'
import { Submission, WILAYAS } from '@/types'
import {
  getSubmissions,
  deleteSubmission as deleteLocalSubmission,
  clearAllSubmissions,
  getStatistics,
  filterSubmissions,
  exportToJSON,
  exportToCSV,
  exportToText,
  exportToPDF,
  debounce,
  formatCurrency,
  generateDemoData,
} from '@/lib/utils'
import { format } from 'date-fns'
import { useRealtimeSubmissions } from '@/hooks/useRealtimeSubmissions'
import { useToast } from '@/components/ui/Toast'

const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'firebase' | 'local' | 'browser'>('browser')
  const [newSubmissionsCount, setNewSubmissionsCount] = useState(0)

  // New states for enhanced features
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all')
  const [showPrintView, setShowPrintView] = useState(false)
  const [serverSearch, setServerSearch] = useState('')

  const toast = useToast()

  // Real-time updates via SSE
  const { isConnected, reconnect } = useRealtimeSubmissions({
    enabled: true,
    onNewSubmission: useCallback((submission: Submission) => {
      // Add new submission to the top of the list
      setSubmissions(prev => {
        // Avoid duplicates
        if (prev.some(s => s.id === submission.id)) return prev
        return [submission, ...prev]
      })
      setNewSubmissionsCount(prev => prev + 1)

      // Show notification
      toast.success(
        `طلب جديد من ${submission.data?.fullName || 'عميل'} - ${submission.data?.requestedAmount ? formatCurrency(submission.data.requestedAmount) : ''}`,
        5000
      )

      // Play notification sound if available
      try {
        const audio = new Audio('/notification.mp3')
        audio.volume = 0.3
        audio.play().catch(() => { })
      } catch {
        // Audio not available
      }
    }, [toast]),
    onError: useCallback((err: Error) => {
      console.error('Real-time connection error:', err)
    }, []),
  })

  // Fetch submissions from server API with filters
  const fetchServerSubmissions = useCallback(async (filters?: { wilaya?: string; search?: string; period?: string }) => {
    setIsLoading(true)
    setError(null)
    setNewSubmissionsCount(0)

    try {
      // Build URL with query parameters
      const params = new URLSearchParams()
      if (filters?.wilaya && filters.wilaya !== 'all') params.set('wilaya', filters.wilaya)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.period && filters.period !== 'all') params.set('period', filters.period)

      const url = `/api/submissions/list${params.toString() ? `?${params.toString()}` : ''}`

      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.submissions) {
          setSubmissions(data.submissions)
          setDataSource(data.source || 'firebase')
          console.log(`✅ Loaded ${data.submissions.length} submissions from ${data.source}`)
          return
        }
      } else if (response.status === 401) {
        // Not authenticated - redirect to login
        window.location.href = '/admin'
        return
      }

      // Fallback to browser localStorage
      console.log('⚠️ Server fetch failed, using browser localStorage')
      const localData = getSubmissions()
      setSubmissions(localData)
      setDataSource('browser')

    } catch (err) {
      console.error('Error fetching submissions:', err)
      // Fallback to browser localStorage
      const localData = getSubmissions()
      setSubmissions(localData)
      setDataSource('browser')
      setError('تعذر الاتصال بالخادم. يتم عرض البيانات المحلية فقط.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServerSubmissions()
  }, [fetchServerSubmissions])

  useEffect(() => {
    const filtered = filterSubmissions(submissions, period, searchQuery)
    setFilteredSubmissions(filtered)
  }, [submissions, period, searchQuery])

  const stats = useMemo(() => getStatistics(submissions), [submissions])

  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  )

  const handleRefresh = () => {
    fetchServerSubmissions({ wilaya: selectedWilaya, search: serverSearch, period })
  }

  // Selection handlers
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(filteredSubmissions.map(s => s.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const getSelectedSubmissions = () => {
    return filteredSubmissions.filter(s => selectedIds.has(s.id))
  }

  // Server-side search handler
  const handleServerSearch = useMemo(
    () => debounce((query: string) => {
      setServerSearch(query)
      fetchServerSubmissions({ wilaya: selectedWilaya, search: query, period })
    }, 500),
    [selectedWilaya, period, fetchServerSubmissions]
  )

  // Wilaya filter handler
  const handleWilayaChange = (newWilaya: string) => {
    setSelectedWilaya(newWilaya)
    fetchServerSubmissions({ wilaya: newWilaya, search: serverSearch, period })
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        // Try server delete first
        const response = await fetch(`/api/submissions/list?id=${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Refresh from server
          fetchServerSubmissions()
          return
        }
      } catch (err) {
        console.error('Server delete failed:', err)
      }

      // Fallback to local delete
      deleteLocalSubmission(id)
      setSubmissions(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleClearAll = () => {
    if (confirm('هل أنت متأكد من حذف جميع الطلبات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      clearAllSubmissions()
      setSubmissions([])
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      window.location.href = '/admin'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/admin'
    }
  }

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDetailModalOpen(true)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-elegant-blue animate-spin mx-auto mb-4" />
          <p className="text-luxury-darkGray">جاري تحميل الطلبات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-luxury-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 text-sm">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="mr-auto">
              إغلاق
            </Button>
          </motion.div>
        )}

        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="p-3 rounded-luxury-lg bg-gradient-to-br from-elegant-blue to-elegant-blue-light shadow-premium"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-elegant-blue">لوحة التحكم</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-luxury-darkGray font-medium">إدارة طلبات التمويل</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${dataSource === 'firebase'
                  ? 'bg-green-100 text-green-700'
                  : dataSource === 'local'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                  }`}>
                  {dataSource === 'firebase' ? '☁️ Firebase' : dataSource === 'local' ? '📁 خادم محلي' : '💾 متصفح'}
                </span>
                {/* Real-time connection status */}
                <button
                  onClick={isConnected ? undefined : reconnect}
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full transition-all ${isConnected
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer'
                    }`}
                  title={isConnected ? 'متصل في الوقت الفعلي' : 'انقر لإعادة الاتصال'}
                >
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isConnected ? 'مباشر' : 'غير متصل'}
                </button>
                {/* New submissions badge */}
                <AnimatePresence>
                  {newSubmissionsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-premium-gold/20 text-premium-gold-dark font-bold"
                    >
                      <Bell className="w-3 h-3" />
                      {newSubmissionsCount} جديد
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRefresh}
              title="تحديث البيانات"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button
              variant="glass-blue"
              size="lg"
              onClick={() => setIsDownloadModalOpen(true)}
            >
              <Download className="w-5 h-5 ml-2" />
              تصدير الطلبات
            </Button>
            <Button variant="outline" size="lg" onClick={handleLogout}>
              <LogOut className="w-5 h-5 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي الطلبات"
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="طلبات اليوم"
            value={stats.today}
            icon={<Calendar className="w-6 h-6" />}
          />
          <StatCard
            title="إجمالي المبالغ"
            value={formatCurrency(stats.totalAmount)}
            icon={<DollarSign className="w-6 h-6" />}
          />
          <StatCard
            title="متوسط المبلغ"
            value={formatCurrency(Math.round(stats.avgAmount))}
            icon={<TrendingUp className="w-6 h-6" />}
          />
        </div>

        <GlassCard variant="elevated" className="p-6">
          {/* Selection Action Bar */}
          <AnimatePresence>
            {selectMode && selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-elegant-blue/10 border border-elegant-blue/30 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-4"
              >
                <span className="text-elegant-blue font-bold">
                  {selectedIds.size} طلب محدد
                </span>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  <CheckSquare className="w-4 h-4 ml-1" />
                  تحديد الكل
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  <Square className="w-4 h-4 ml-1" />
                  إلغاء التحديد
                </Button>
                <Button
                  variant="glass-blue"
                  size="sm"
                  onClick={() => setShowPrintView(true)}
                >
                  <Printer className="w-4 h-4 ml-1" />
                  طباعة المحدد
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => {
                    setIsDownloadModalOpen(true)
                  }}
                >
                  <Download className="w-4 h-4 ml-1" />
                  تصدير المحدد
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Server-side Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-mediumGray" />
              <input
                type="text"
                placeholder="بحث في Supabase بالاسم أو الهاتف..."
                onChange={(e) => handleServerSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-white backdrop-blur-sm border border-luxury-lightGray rounded-xl text-luxury-charcoal placeholder:text-luxury-mediumGray shadow-sm focus:outline-none focus:ring-2 focus:ring-elegant-blue focus:border-elegant-blue"
              />
            </div>

            {/* Wilaya Filter */}
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-mediumGray pointer-events-none" />
              <select
                value={selectedWilaya}
                onChange={(e) => handleWilayaChange(e.target.value)}
                className="appearance-none pr-10 pl-8 py-3 bg-white border border-luxury-lightGray rounded-xl text-luxury-charcoal shadow-sm focus:outline-none focus:ring-2 focus:ring-elegant-blue focus:border-elegant-blue min-w-[180px] cursor-pointer"
              >
                <option value="all">كل الولايات</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Select Mode Toggle */}
            <Button
              variant={selectMode ? 'default' : 'outline'}
              size="lg"
              onClick={() => {
                setSelectMode(!selectMode)
                if (selectMode) setSelectedIds(new Set())
              }}
            >
              {selectMode ? <CheckSquare className="w-5 h-5 ml-1" /> : <Square className="w-5 h-5 ml-1" />}
              {selectMode ? 'إلغاء التحديد' : 'وضع التحديد'}
            </Button>
          </div>

          {/* Period and Action Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'today', 'week', 'month'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setPeriod(p)
                    // Trigger server-side filtering
                    fetchServerSubmissions({ wilaya: selectedWilaya, search: serverSearch, period: p })
                  }}
                >
                  {p === 'all' ? 'الكل' : p === 'today' ? 'اليوم' : p === 'week' ? 'الأسبوع' : 'الشهر'}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const MIN_LOAN_AMOUNT = 5_000_000
                  const MAX_LOAN_AMOUNT = 20_000_000
                  const validOnly = filteredSubmissions.filter(s =>
                    s.data.requestedAmount >= MIN_LOAN_AMOUNT &&
                    s.data.requestedAmount <= MAX_LOAN_AMOUNT
                  )
                  setFilteredSubmissions(validOnly)
                }}
                title="عرض المبالغ الصحيحة فقط"
              >
                <CheckCircle2 className="w-4 h-4 ml-1" />
                صحيحة فقط
              </Button>
            </div>
            <div className="flex gap-2 mr-auto">
              <Button
                variant="glass-blue"
                size="sm"
                onClick={() => setShowPrintView(true)}
                title="طباعة الكل بالعربية"
              >
                <Printer className="w-4 h-4 ml-2" />
                طباعة عربي
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setIsDownloadModalOpen(true)}
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير متقدم
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToJSON(filteredSubmissions)}>
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredSubmissions)}>
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => generateDemoData(10)}>
                بيانات تجريبية
              </Button>
              <Button variant="danger" size="sm" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 ml-2" />
                حذف الكل
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-luxury-darkGray">
                لا توجد طلبات
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white backdrop-blur-sm border rounded-xl p-4 hover:shadow-md transition-all shadow-sm ${selectedIds.has(submission.id)
                    ? 'border-elegant-blue bg-elegant-blue/5'
                    : 'border-luxury-lightGray hover:border-elegant-blue/40'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    {/* Checkbox */}
                    {selectMode && (
                      <button
                        onClick={() => toggleSelection(submission.id)}
                        className="ml-3 p-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        {selectedIds.has(submission.id) ? (
                          <CheckSquare className="w-5 h-5 text-elegant-blue" />
                        ) : (
                          <Square className="w-5 h-5 text-luxury-mediumGray" />
                        )}
                      </button>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-elegant-blue mb-1">
                        {submission.data.fullName}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-luxury-darkGray items-center">
                        <span>{submission.data.phone}</span>
                        <span>{submission.data.wilaya}</span>
                        <span className="text-elegant-blue font-bold flex items-center gap-1">
                          {formatCurrency(submission.data.requestedAmount)}
                          {(() => {
                            const MIN_LOAN_AMOUNT = 5_000_000
                            const MAX_LOAN_AMOUNT = 20_000_000
                            const isValid = submission.data.requestedAmount >= MIN_LOAN_AMOUNT &&
                              submission.data.requestedAmount <= MAX_LOAN_AMOUNT
                            return isValid ? (
                              <span title="المبلغ صحيح">
                                <CheckCircle2 className="w-4 h-4 text-status-success" />
                              </span>
                            ) : (
                              <span title="المبلغ خارج النطاق المسموح">
                                <XCircle className="w-4 h-4 text-status-error" />
                              </span>
                            )
                          })()}
                        </span>
                        <span>
                          {format(new Date(submission.timestamp), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(submission)}
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedIds(new Set([submission.id]))
                          setShowPrintView(true)
                        }}
                        title="طباعة هذا الطلب"
                      >
                        <Printer className="w-4 h-4 text-elegant-blue" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // Quick download single submission as TXT
                          const content = `
═══════════════════════════════════════════════════════════════════════════════
                         TikCredit Pro - طلب تمويل                          
═══════════════════════════════════════════════════════════════════════════════

🔖 معرف الطلب: ${submission.id}
📆 تاريخ الإرسال: ${format(new Date(submission.timestamp), 'dd/MM/yyyy HH:mm')}

───────────────────────────────────────────────────────────────────────────────

👤 الاسم الكامل:     ${submission.data.fullName || 'غير محدد'}
📱 رقم الهاتف:       ${submission.data.phone || 'غير محدد'}
📧 البريد الإلكتروني: ${submission.data.email || 'غير محدد'}
📍 الولاية:          ${submission.data.wilaya || 'غير محدد'}
💼 المهنة:           ${submission.data.profession || 'غير محدد'}
💳 نوع التمويل:      ${submission.data.financingType || 'غير محدد'}
💵 المبلغ المطلوب:   ${formatCurrency(submission.data.requestedAmount)}
🏦 طريقة الراتب:     ${submission.data.salaryReceiveMethod === 'CCP' ? 'البريد (CCP)' : submission.data.salaryReceiveMethod || 'غير محدد'}
💰 نطاق الدخل:       ${submission.data.monthlyIncomeRange || 'غير محدد'}
🕐 وقت التواصل:      ${submission.data.preferredContactTime || 'غير محدد'}
👥 عميل موجود:       ${submission.data.isExistingCustomer || 'لا'}
${submission.data.notes ? `📝 الملاحظات:        ${submission.data.notes}` : ''}

═══════════════════════════════════════════════════════════════════════════════
                    TikCredit Pro © ${new Date().getFullYear()}              
═══════════════════════════════════════════════════════════════════════════════
`.trim()
                          const BOM = '\uFEFF'
                          const blob = new Blob([BOM + content], { type: 'text/plain;charset=utf-8' })
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = `TikCredit_${submission.data.phone || submission.id}_${format(new Date(), 'yyyyMMdd')}.txt`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                          URL.revokeObjectURL(url)
                        }}
                        title="تحميل هذا الطلب"
                      >
                        <Download className="w-4 h-4 text-premium-gold" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(submission.id)}
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4 text-status-error" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Submission Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="تفاصيل الطلب"
        size="lg"
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-luxury-darkGray font-medium">الاسم الكامل:</span>
                <p className="text-luxury-charcoal font-bold">{selectedSubmission.data.fullName}</p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">رقم الهاتف:</span>
                <p className="text-luxury-charcoal font-bold">{selectedSubmission.data.phone}</p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">البريد الإلكتروني:</span>
                <p className="text-luxury-charcoal font-bold">{selectedSubmission.data.email || 'غير محدد'}</p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">الولاية:</span>
                <p className="text-luxury-charcoal font-bold">{selectedSubmission.data.wilaya}</p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">المهنة:</span>
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.profession === 'أخرى (حدد)' && selectedSubmission.data.customProfession
                    ? selectedSubmission.data.customProfession
                    : selectedSubmission.data.profession || 'غير محدد'}
                </p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">نوع التمويل:</span>
                <p className="text-luxury-charcoal font-bold">{selectedSubmission.data.financingType}</p>
              </div>
              <div className="col-span-2">
                <span className="text-luxury-darkGray font-medium">المبلغ المطلوب:</span>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-elegant-blue font-bold text-xl">
                    {formatCurrency(selectedSubmission.data.requestedAmount)}
                  </p>
                  {(() => {
                    const MIN_LOAN_AMOUNT = 5_000_000
                    const MAX_LOAN_AMOUNT = 20_000_000
                    const isValid = selectedSubmission.data.requestedAmount >= MIN_LOAN_AMOUNT &&
                      selectedSubmission.data.requestedAmount <= MAX_LOAN_AMOUNT
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isValid
                        ? 'bg-status-success/20 text-status-success border border-status-success/30'
                        : 'bg-status-error/20 text-status-error border border-status-error/30'
                        }`}>
                        {isValid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            صحيح
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            خارج النطاق ({MIN_LOAN_AMOUNT.toLocaleString('ar-DZ')} - {MAX_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج)
                          </>
                        )}
                      </span>
                    )
                  })()}
                </div>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">طريقة استلام الراتب:</span>
                <p className="text-luxury-charcoal font-bold">{selectedSubmission.data.salaryReceiveMethod}</p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">نطاق الدخل:</span>
                <p className="text-luxury-charcoal font-bold">{selectedSubmission.data.monthlyIncomeRange || 'غير محدد'}</p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">وقت التواصل المفضل:</span>
                <p className="text-luxury-charcoal font-bold">{selectedSubmission.data.preferredContactTime || 'غير محدد'}</p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">عميل موجود:</span>
                <p className="text-luxury-charcoal font-bold">{selectedSubmission.data.isExistingCustomer}</p>
              </div>
              <div className="col-span-2">
                <span className="text-luxury-darkGray font-medium">الملاحظات:</span>
                <p className="text-luxury-charcoal font-bold">{selectedSubmission.data.notes || 'لا توجد ملاحظات'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-luxury-darkGray font-medium">تاريخ الإرسال:</span>
                <p className="text-luxury-charcoal font-bold">
                  {format(new Date(selectedSubmission.timestamp), 'dd MMMM yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Premium Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        submissions={selectMode && selectedIds.size > 0 ? getSelectedSubmissions() : submissions}
      />

      {/* Print View Modal */}
      {showPrintView && (
        <div className="fixed inset-0 z-50 bg-white">
          <PrintableSubmissions
            submissions={selectedIds.size > 0 ? getSelectedSubmissions() : filteredSubmissions}
            onClose={() => {
              setShowPrintView(false)
              // Clear selection when closing print view if not in select mode
              if (!selectMode) {
                setSelectedIds(new Set())
              }
            }}
            title={selectedIds.size > 0
              ? selectedIds.size === 1
                ? 'طلب رقم ' + filteredSubmissions.findIndex(s => selectedIds.has(s.id)) + 1
                : `الطلبات المحددة (${selectedIds.size})`
              : selectedWilaya !== 'all'
                ? `طلبات ولاية ${selectedWilaya}`
                : 'جميع الطلبات'}
          />
        </div>
      )}
    </div>
  )
}

export default AdminDashboard


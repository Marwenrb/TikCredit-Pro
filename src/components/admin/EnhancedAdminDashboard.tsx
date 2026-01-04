'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List } from 'react-window'
import Fuse from 'fuse.js'
import {
  Search,
  Download,
  Trash2,
  Eye,
  LogOut,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Sparkles,
  CheckSquare,
  Square,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
} from 'lucide-react'
import { Button, GlassCard, StatCard, Modal } from '@/components/ui'
import DownloadModal from './DownloadModal'
import { Submission } from '@/types'
import {
  getSubmissions,
  deleteSubmission,
  clearAllSubmissions,
  getStatistics,
  filterSubmissions,
  formatCurrency,
  generateDemoData,
} from '@/lib/utils'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/Toast'

/**
 * Enhanced Admin Dashboard with Mass Form Support
 * Features: Virtual scrolling, bulk operations, advanced filtering, fuzzy search
 */

interface FilterState {
  period: 'all' | 'today' | 'week' | 'month' | 'year'
  status: 'all' | 'pending' | 'approved' | 'rejected'
  amountRange: { min: number; max: number }
  wilaya: string
  searchQuery: string
  sortBy: 'date' | 'amount' | 'name'
  sortOrder: 'asc' | 'desc'
}

const ITEM_HEIGHT = 120
const VISIBLE_ITEMS = 8

const EnhancedAdminDashboard: React.FC = () => {
  // State
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  
  const toast = useToast()

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    period: 'all',
    status: 'all',
    amountRange: { min: 0, max: 100000000 },
    wilaya: 'all',
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc',
  })

  // Load submissions
  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = useCallback(() => {
    const data = getSubmissions()
    setSubmissions(data)
  }, [])

  // Fuzzy search setup
  const fuse = useMemo(() => {
    return new Fuse(submissions, {
      keys: ['data.fullName', 'data.email', 'data.phone', 'data.wilaya'],
      threshold: 0.3,
      includeScore: true,
    })
  }, [submissions])

  // Apply fuzzy search if query exists
  const searchResults = useMemo(() => {
    if (!filters.searchQuery) return submissions
    
    const results = fuse.search(filters.searchQuery)
    return results.map((result) => result.item)
  }, [fuse, filters.searchQuery, submissions])

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...searchResults]

    // Period filter
    if (filters.period !== 'all' && filters.period !== 'year') {
      result = filterSubmissions(result, filters.period as 'today' | 'week' | 'month', '')
    } else if (filters.period === 'year') {
      // Custom year filter
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      result = result.filter(s => new Date(s.timestamp) >= oneYearAgo)
    }

    // Status filter (if we add status field later)
    // if (filters.status !== 'all') {
    //   result = result.filter(s => s.status === filters.status)
    // }

    // Amount range filter
    result = result.filter(
      (s) =>
        s.data.requestedAmount >= filters.amountRange.min &&
        s.data.requestedAmount <= filters.amountRange.max
    )

    // Wilaya filter
    if (filters.wilaya && filters.wilaya !== 'all') {
      result = result.filter((s) => s.data.wilaya === filters.wilaya)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case 'amount':
          comparison = a.data.requestedAmount - b.data.requestedAmount
          break
        case 'name':
          comparison = a.data.fullName.localeCompare(b.data.fullName)
          break
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [searchResults, filters])

  // Statistics
  const stats = useMemo(() => {
    const totalAmount = filteredSubmissions.reduce(
      (sum, s) => sum + s.data.requestedAmount,
      0
    )
    
    return {
      total: submissions.length,
      filtered: filteredSubmissions.length,
      selected: selectedIds.size,
      totalAmount,
      averageAmount: filteredSubmissions.length > 0
        ? totalAmount / filteredSubmissions.length
        : 0,
    }
  }, [submissions, filteredSubmissions, selectedIds])

  // Get unique wilayas for filter dropdown
  const wilayas = useMemo(() => {
    const uniqueWilayas = Array.from(
      new Set(submissions.map((s) => s.data.wilaya))
    ).sort()
    return ['all', ...uniqueWilayas]
  }, [submissions])

  // Handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredSubmissions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredSubmissions.map((s) => s.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} طلب؟`)) return

    setBulkActionLoading(true)
    try {
      selectedIds.forEach((id) => deleteSubmission(id))
      toast.success(`تم حذف ${selectedIds.size} طلب بنجاح`)
      setSelectedIds(new Set())
      loadSubmissions()
    } catch (error) {
      toast.error('فشل الحذف الجماعي')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleClearAll = () => {
    if (
      confirm('هل أنت متأكد من حذف جميع الطلبات؟ هذا الإجراء لا يمكن التراجع عنه.')
    ) {
      clearAllSubmissions()
      loadSubmissions()
      toast.success('تم حذف جميع الطلبات')
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      deleteSubmission(id)
      loadSubmissions()
      toast.success('تم حذف الطلب بنجاح')
    }
  }

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDetailModalOpen(true)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/admin'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/admin'
    }
  }

  // Virtualized row renderer
  const Row = ({ index, style, data }: { index: number; style: React.CSSProperties; data: Submission[] }) => {
    const submission = data[index]
    const isSelected = selectedIds.has(submission.id)

    return (
      <motion.div
        style={style}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
        className="px-2"
      >
        <div
          className={`bg-white backdrop-blur-sm border rounded-luxury-lg p-4 hover:border-elegant-blue/40 hover:shadow-luxury-lg transition-all shadow-luxury flex items-center gap-4 ${
            isSelected ? 'border-elegant-blue/60 bg-elegant-blue-50/50' : 'border-luxury-lightGray'
          }`}
        >
          {/* Checkbox */}
          <button
            onClick={() => handleSelectOne(submission.id)}
            className="flex-shrink-0 hover:scale-110 transition-transform"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-elegant-blue" />
            ) : (
              <Square className="w-5 h-5 text-luxury-mediumGray" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-elegant-blue mb-1 truncate">
              {submission.data.fullName}
            </h3>
            <div className="flex flex-wrap gap-3 text-sm text-luxury-darkGray">
              <span className="flex items-center gap-1">
                📞 {submission.data.phone}
              </span>
              <span className="flex items-center gap-1">
                📍 {submission.data.wilaya}
              </span>
              <span className="flex items-center gap-1 text-elegant-blue font-bold">
                💰 {formatCurrency(submission.data.requestedAmount)}
              </span>
              <span className="flex items-center gap-1 text-luxury-mediumGray">
                🕐 {format(new Date(submission.timestamp), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(submission)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(submission.id)}
            >
              <Trash2 className="w-4 h-4 text-status-error" />
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-luxury-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
              <p className="text-luxury-darkGray font-medium">إدارة طلبات التمويل</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="gradient"
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي الطلبات"
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="الطلبات المعروضة"
            value={stats.filtered}
            icon={<Filter className="w-6 h-6" />}
          />
          <StatCard
            title="إجمالي المبالغ"
            value={formatCurrency(stats.totalAmount)}
            icon={<DollarSign className="w-6 h-6" />}
          />
          <StatCard
            title="متوسط المبلغ"
            value={formatCurrency(Math.round(stats.averageAmount))}
            icon={<TrendingUp className="w-6 h-6" />}
          />
        </div>

        {/* Filters and Search */}
        <GlassCard variant="elevated" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-elegant-blue flex items-center gap-2">
              <Filter className="w-5 h-5" />
              البحث والتصفية
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'إخفاء' : 'إظهار'} الفلاتر
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-mediumGray" />
                  <input
                    type="text"
                    placeholder="بحث بالاسم، الهاتف، البريد، أو الولاية..."
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters({ ...filters, searchQuery: e.target.value })
                    }
                    className="w-full pr-10 pl-4 py-3 bg-white backdrop-blur-sm border border-luxury-lightGray rounded-luxury text-luxury-charcoal placeholder:text-luxury-mediumGray shadow-luxury focus:outline-none focus:ring-2 focus:ring-elegant-blue focus:border-elegant-blue transition-all"
                  />
                </div>

                {/* Filter Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Period */}
                  <div>
                    <label className="block text-sm font-semibold text-luxury-darkGray mb-2">
                      الفترة الزمنية
                    </label>
                    <div className="flex gap-2">
                      {(['all', 'today', 'week', 'month'] as const).map((p) => (
                        <Button
                          key={p}
                          variant={filters.period === p ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilters({ ...filters, period: p })}
                        >
                          {p === 'all'
                            ? 'الكل'
                            : p === 'today'
                            ? 'اليوم'
                            : p === 'week'
                            ? 'الأسبوع'
                            : 'الشهر'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Wilaya */}
                  <div>
                    <label className="block text-sm font-semibold text-luxury-darkGray mb-2">
                      الولاية
                    </label>
                    <select
                      value={filters.wilaya}
                      onChange={(e) =>
                        setFilters({ ...filters, wilaya: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white border border-luxury-lightGray rounded-luxury text-luxury-charcoal shadow-luxury focus:outline-none focus:ring-2 focus:ring-elegant-blue focus:border-elegant-blue"
                    >
                      {wilayas.map((w) => (
                        <option key={w} value={w}>
                          {w === 'all' ? 'جميع الولايات' : w}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-semibold text-luxury-darkGray mb-2">
                      الترتيب
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={filters.sortBy}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            sortBy: e.target.value as any,
                          })
                        }
                        className="flex-1 px-3 py-2 bg-white border border-luxury-lightGray rounded-luxury text-sm"
                      >
                        <option value="date">التاريخ</option>
                        <option value="amount">المبلغ</option>
                        <option value="name">الاسم</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFilters({
                            ...filters,
                            sortOrder:
                              filters.sortOrder === 'asc' ? 'desc' : 'asc',
                          })
                        }
                      >
                        {filters.sortOrder === 'asc' ? (
                          <SortAsc className="w-4 h-4" />
                        ) : (
                          <SortDesc className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <label className="block text-sm font-semibold text-luxury-darkGray mb-2">
                      إجراءات
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateDemoData(50)}
                      >
                        بيانات تجريبية
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadSubmissions}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="sticky top-4 z-10"
            >
              <GlassCard variant="elevated" className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-elegant-blue" />
                    <span className="font-bold text-elegant-blue">
                      {selectedIds.size} عنصر محدد
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleBulkDelete}
                      loading={bulkActionLoading}
                      disabled={bulkActionLoading}
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف المحدد
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIds(new Set())}
                    >
                      إلغاء التحديد
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submissions List with Virtual Scrolling */}
        <GlassCard variant="elevated" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-elegant-blue">
              الطلبات ({stats.filtered})
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedIds.size === filteredSubmissions.length
                  ? 'إلغاء التحديد الكلي'
                  : 'تحديد الكل'}
              </Button>
              <Button variant="danger" size="sm" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 ml-2" />
                حذف الكل
              </Button>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 text-luxury-darkGray">
              <Users className="w-16 h-16 mx-auto mb-4 text-luxury-mediumGray" />
              <p className="text-lg font-semibold">لا توجد طلبات</p>
              <p className="text-sm">جرّب تغيير فلاتر البحث</p>
            </div>
          ) : (
            <div className="border border-luxury-lightGray rounded-luxury overflow-hidden">
              <List
                height={ITEM_HEIGHT * Math.min(VISIBLE_ITEMS, filteredSubmissions.length)}
                itemCount={filteredSubmissions.length}
                itemSize={ITEM_HEIGHT}
                width="100%"
                itemData={filteredSubmissions}
                className="scrollbar-thin scrollbar-thumb-elegant-blue scrollbar-track-luxury-offWhite"
              >
                {Row}
              </List>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Detail Modal */}
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
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.fullName}
                </p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">رقم الهاتف:</span>
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.phone}
                </p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">
                  البريد الإلكتروني:
                </span>
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.email || 'غير محدد'}
                </p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">الولاية:</span>
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.wilaya}
                </p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">نوع التمويل:</span>
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.financingType}
                </p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">المبلغ المطلوب:</span>
                <p className="text-elegant-blue font-bold text-xl">
                  {formatCurrency(selectedSubmission.data.requestedAmount)}
                </p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">
                  طريقة استلام الراتب:
                </span>
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.salaryReceiveMethod}
                </p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">نطاق الدخل:</span>
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.monthlyIncomeRange || 'غير محدد'}
                </p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">
                  وقت التواصل المفضل:
                </span>
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.preferredContactTime || 'غير محدد'}
                </p>
              </div>
              <div>
                <span className="text-luxury-darkGray font-medium">عميل موجود:</span>
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.isExistingCustomer}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-luxury-darkGray font-medium">الملاحظات:</span>
                <p className="text-luxury-charcoal font-bold">
                  {selectedSubmission.data.notes || 'لا توجد ملاحظات'}
                </p>
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

      {/* Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        submissions={submissions}
      />
    </div>
  )
}

export default EnhancedAdminDashboard


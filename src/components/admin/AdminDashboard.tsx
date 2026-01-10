'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Trash2, Eye, LogOut, TrendingUp, Users, DollarSign, Calendar, FileText, Sparkles, CheckCircle2, XCircle, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { Button, GlassCard, StatCard, Modal } from '@/components/ui'
import DownloadModal from './DownloadModal'
import { Submission } from '@/types'
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

  // Fetch submissions from server API
  const fetchServerSubmissions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/submissions/list')
      
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
    fetchServerSubmissions()
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
              <div className="flex items-center gap-2">
                <p className="text-luxury-darkGray font-medium">إدارة طلبات التمويل</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  dataSource === 'firebase' 
                    ? 'bg-green-100 text-green-700' 
                    : dataSource === 'local' 
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {dataSource === 'firebase' ? '☁️ Firebase' : dataSource === 'local' ? '📁 خادم محلي' : '💾 متصفح'}
                </span>
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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-mediumGray" />
              <input
                type="text"
                placeholder="بحث بالاسم، الهاتف، أو الولاية..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-white backdrop-blur-sm border border-luxury-lightGray rounded-xl text-luxury-charcoal placeholder:text-luxury-mediumGray shadow-sm focus:outline-none focus:ring-2 focus:ring-elegant-blue focus:border-elegant-blue"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'today', 'week', 'month'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
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
            <div className="flex gap-2">
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
                  className="bg-white backdrop-blur-sm border border-luxury-lightGray rounded-xl p-4 hover:border-elegant-blue/40 hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start">
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
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(submission)}
                      >
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
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        isValid 
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
        submissions={submissions}
      />
    </div>
  )
}

export default AdminDashboard


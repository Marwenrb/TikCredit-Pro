'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Trash2, Eye, LogOut, TrendingUp, Users, DollarSign, Calendar, FileText, Sparkles } from 'lucide-react'
import { Button, GlassCard, StatCard, Modal } from '@/components/ui'
import DownloadModal from './DownloadModal'
import { Submission } from '@/types'
import {
  getSubmissions,
  deleteSubmission,
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

  useEffect(() => {
    loadSubmissions()
  }, [])

  useEffect(() => {
    const filtered = filterSubmissions(submissions, period, searchQuery)
    setFilteredSubmissions(filtered)
  }, [submissions, period, searchQuery])

  const stats = useMemo(() => getStatistics(submissions), [submissions])

  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  )

  const loadSubmissions = () => {
    const data = getSubmissions()
    setSubmissions(data)
  }

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      deleteSubmission(id)
      loadSubmissions()
    }
  }

  const handleClearAll = () => {
    if (confirm('هل أنت متأكد من حذف جميع الطلبات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      clearAllSubmissions()
      loadSubmissions()
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
            <div className="flex gap-2">
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
                      <div className="flex flex-wrap gap-4 text-sm text-luxury-darkGray">
                        <span>{submission.data.phone}</span>
                        <span>{submission.data.wilaya}</span>
                        <span className="text-elegant-blue font-bold">
                          {formatCurrency(submission.data.requestedAmount)}
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
              <div>
                <span className="text-luxury-darkGray font-medium">المبلغ المطلوب:</span>
                <p className="text-elegant-blue font-bold text-xl">{formatCurrency(selectedSubmission.data.requestedAmount)}</p>
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


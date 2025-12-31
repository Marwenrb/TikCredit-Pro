'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Trash2, Eye, LogOut, TrendingUp, Users, DollarSign, Calendar, FileText } from 'lucide-react'
import { Button, GlassCard, StatCard, Modal } from '@/components/ui'
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
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-50 to-dark-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gold-400">لوحة التحكم</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>

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
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالاسم، الهاتف، أو الولاية..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-dark-50/50 backdrop-blur-sm border border-gold-500/30 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
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
              <Button variant="outline" size="sm" onClick={() => exportToJSON(filteredSubmissions)}>
                <Download className="w-4 h-4 ml-2" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredSubmissions)}>
                <Download className="w-4 h-4 ml-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToText(filteredSubmissions)}>
                <FileText className="w-4 h-4 ml-2" />
                TXT
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToPDF(filteredSubmissions)}>
                <FileText className="w-4 h-4 ml-2" />
                PDF
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
              <div className="text-center py-12 text-gray-400">
                لا توجد طلبات
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-50/30 backdrop-blur-sm border border-gold-500/20 rounded-xl p-4 hover:border-gold-500/40 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gold-400 mb-1">
                        {submission.data.fullName}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                        <span>{submission.data.phone}</span>
                        <span>{submission.data.wilaya}</span>
                        <span className="text-gold-400 font-medium">
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
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

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
                <span className="text-gray-400">الاسم الكامل:</span>
                <p className="text-white font-medium">{selectedSubmission.data.fullName}</p>
              </div>
              <div>
                <span className="text-gray-400">رقم الهاتف:</span>
                <p className="text-white font-medium">{selectedSubmission.data.phone}</p>
              </div>
              <div>
                <span className="text-gray-400">البريد الإلكتروني:</span>
                <p className="text-white font-medium">{selectedSubmission.data.email || 'غير محدد'}</p>
              </div>
              <div>
                <span className="text-gray-400">الولاية:</span>
                <p className="text-white font-medium">{selectedSubmission.data.wilaya}</p>
              </div>
              <div>
                <span className="text-gray-400">نوع التمويل:</span>
                <p className="text-white font-medium">{selectedSubmission.data.financingType}</p>
              </div>
              <div>
                <span className="text-gray-400">المبلغ المطلوب:</span>
                <p className="text-gold-400 font-bold">{formatCurrency(selectedSubmission.data.requestedAmount)}</p>
              </div>
              <div>
                <span className="text-gray-400">طريقة استلام الراتب:</span>
                <p className="text-white font-medium">{selectedSubmission.data.salaryReceiveMethod}</p>
              </div>
              <div>
                <span className="text-gray-400">نطاق الدخل:</span>
                <p className="text-white font-medium">{selectedSubmission.data.monthlyIncomeRange || 'غير محدد'}</p>
              </div>
              <div>
                <span className="text-gray-400">وقت التواصل المفضل:</span>
                <p className="text-white font-medium">{selectedSubmission.data.preferredContactTime || 'غير محدد'}</p>
              </div>
              <div>
                <span className="text-gray-400">عميل موجود:</span>
                <p className="text-white font-medium">{selectedSubmission.data.isExistingCustomer}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">الملاحظات:</span>
                <p className="text-white font-medium">{selectedSubmission.data.notes || 'لا توجد ملاحظات'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">تاريخ الإرسال:</span>
                <p className="text-white font-medium">
                  {format(new Date(selectedSubmission.timestamp), 'dd MMMM yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminDashboard


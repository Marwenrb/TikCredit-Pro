'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Trash2, Calendar, MapPin, CreditCard, AlertTriangle,
  CheckSquare, ChevronRight, Loader2, ShieldAlert,
} from 'lucide-react'
import { Submission, WILAYAS } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/Toast'

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = 'selected' | 'date' | 'wilaya' | 'payment' | 'all'

interface DeleteCriteria {
  wilaya?: string
  paymentMethod?: string
  period?: string
  from?: string
  to?: string
}

interface AdvancedDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  submissions: Submission[]
  selectedIds: Set<string>
  onDeleteComplete: () => void
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getDateBounds(period: string, from: string, to: string): { from: Date; to: Date } | null {
  const now = new Date()
  if (period === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    return { from: start, to: end }
  }
  if (period === 'week') {
    const start = new Date(now); start.setDate(now.getDate() - 7)
    return { from: start, to: now }
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: start, to: now }
  }
  if (period === 'custom' && from) {
    const start = new Date(from)
    const end   = to ? new Date(to + 'T23:59:59') : now
    return { from: start, to: end }
  }
  return null
}

function countByDate(submissions: Submission[], period: string, from: string, to: string): number {
  const bounds = getDateBounds(period, from, to)
  if (!bounds) return 0
  return submissions.filter(s => {
    const d = new Date(s.timestamp)
    return d >= bounds.from && d <= bounds.to
  }).length
}

function countByWilaya(submissions: Submission[], wilaya: string): number {
  if (!wilaya) return 0
  return submissions.filter(s => s.data.wilaya === wilaya).length
}

function countByPayment(submissions: Submission[], method: string): number {
  if (!method) return 0
  return submissions.filter(s => s.data.salaryReceiveMethod === method).length
}

// ── Tab config ─────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'selected', label: 'المحدد',        icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'date',     label: 'التاريخ',       icon: <Calendar    className="w-4 h-4" /> },
  { id: 'wilaya',   label: 'الولاية',       icon: <MapPin      className="w-4 h-4" /> },
  { id: 'payment',  label: 'طريقة الدفع',  icon: <CreditCard  className="w-4 h-4" /> },
  { id: 'all',      label: 'حذف الكل',     icon: <ShieldAlert className="w-4 h-4" /> },
]

// ── PreviewBadge ──────────────────────────────────────────────────────────────
function PreviewBadge({ count }: { count: number }) {
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
        count === 0
          ? 'bg-gray-100 text-gray-500'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {count} طلب
    </motion.span>
  )
}

// ── DeleteButton ──────────────────────────────────────────────────────────────
function DeleteButton({
  count, onConfirm, isLoading, disabled,
}: {
  count: number
  onConfirm: () => void
  isLoading: boolean
  disabled?: boolean
}) {
  const [step, setStep] = useState<'idle' | 'confirm'>('idle')

  if (step === 'confirm') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
      >
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
        <p className="flex-1 text-sm font-medium text-red-700">
          سيتم حذف <strong>{count}</strong> طلب بشكل نهائي — هذا الإجراء لا يمكن التراجع عنه.
        </p>
        <button
          onClick={() => setStep('idle')}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          إلغاء
        </button>
        <button
          onClick={() => { onConfirm(); setStep('idle') }}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          تأكيد الحذف
        </button>
      </motion.div>
    )
  }

  return (
    <button
      onClick={() => setStep('confirm')}
      disabled={disabled || count === 0 || isLoading}
      className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Trash2 className="w-4 h-4" />
      حذف {count} طلب
    </button>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
const AdvancedDeleteModal: React.FC<AdvancedDeleteModalProps> = ({
  isOpen, onClose, submissions, selectedIds, onDeleteComplete,
}) => {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('date')
  const [isDeleting, setIsDeleting] = useState(false)

  // ── Date tab state
  const [datePeriod, setDatePeriod]   = useState<string>('')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')

  // ── Wilaya tab state
  const [wilaya, setWilaya]           = useState('')

  // ── Payment tab state
  const [paymentMethod, setPaymentMethod] = useState('')

  // ── All tab state
  const [confirmAllText, setConfirmAllText] = useState('')

  // ── Live preview counts ───────────────────────────────────────────────────
  const previewSelected = selectedIds.size
  const previewDate     = useMemo(() => countByDate(submissions, datePeriod, dateFrom, dateTo), [submissions, datePeriod, dateFrom, dateTo])
  const previewWilaya   = useMemo(() => countByWilaya(submissions, wilaya), [submissions, wilaya])
  const previewPayment  = useMemo(() => countByPayment(submissions, paymentMethod), [submissions, paymentMethod])
  const previewAll      = submissions.length

  // ── API call ──────────────────────────────────────────────────────────────
  const doDelete = async (payload: object) => {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/submissions/list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(data.message || 'تم الحذف بنجاح', 4000)
        onDeleteComplete()
        onClose()
      } else {
        toast.error(data.error || 'فشل الحذف', 5000)
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم', 5000)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSelected = () =>
    doDelete({ mode: 'ids', ids: Array.from(selectedIds) })

  const handleDeleteByDate = () =>
    doDelete({ mode: 'criteria', criteria: { period: datePeriod, from: dateFrom, to: dateTo } })

  const handleDeleteByWilaya = () =>
    doDelete({ mode: 'criteria', criteria: { wilaya } })

  const handleDeleteByPayment = () =>
    doDelete({ mode: 'criteria', criteria: { paymentMethod } })

  const handleDeleteAll = () => {
    if (confirmAllText !== 'حذف الكل') return
    doDelete({ mode: 'criteria', criteria: {} })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 top-8 z-50 mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-red-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 shadow">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">حذف متقدم</h2>
                  <p className="text-xs text-gray-500">احذف الطلبات حسب معايير محددة</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-100 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-100 bg-gray-50 px-4 pt-3 pb-0">
              {TABS.map(tab => {
                let count = 0
                if (tab.id === 'selected') count = previewSelected
                if (tab.id === 'date')     count = previewDate
                if (tab.id === 'wilaya')   count = previewWilaya
                if (tab.id === 'payment')  count = previewPayment
                if (tab.id === 'all')      count = previewAll

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'border-b-2 border-red-500 bg-white text-red-600'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        activeTab === tab.id ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Panel */}
            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">

                {/* ── Selected ──────────────────────────────────────────── */}
                {activeTab === 'selected' && (
                  <motion.div key="selected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {selectedIds.size === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                        لم يتم تحديد أي طلبات. قم بتفعيل وضع التحديد في لوحة التحكم.
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-700">الطلبات المحددة للحذف</p>
                          <PreviewBadge count={previewSelected} />
                        </div>
                        <div className="space-y-2 rounded-xl border border-red-100 bg-red-50 p-3">
                          {submissions
                            .filter(s => selectedIds.has(s.id))
                            .slice(0, 6)
                            .map(s => (
                              <div key={s.id} className="flex items-center gap-3 text-sm">
                                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                                <span className="font-medium text-gray-800">{s.data.fullName}</span>
                                <span className="text-gray-400">{s.data.wilaya}</span>
                                <span className="mr-auto text-red-600 font-semibold">{formatCurrency(s.data.requestedAmount)}</span>
                              </div>
                            ))}
                          {selectedIds.size > 6 && (
                            <p className="text-center text-xs text-gray-400 pt-1">… و {selectedIds.size - 6} آخرين</p>
                          )}
                        </div>
                        <DeleteButton count={previewSelected} onConfirm={handleDeleteSelected} isLoading={isDeleting} />
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── Date ──────────────────────────────────────────────── */}
                {activeTab === 'date' && (
                  <motion.div key="date" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">احذف الطلبات حسب الفترة الزمنية</p>
                      <PreviewBadge count={previewDate} />
                    </div>

                    {/* Preset period pills */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'today', label: 'اليوم' },
                        { key: 'week',  label: 'هذا الأسبوع' },
                        { key: 'month', label: 'هذا الشهر' },
                        { key: 'custom', label: 'مخصص' },
                      ].map(p => (
                        <button
                          key={p.key}
                          onClick={() => { setDatePeriod(p.key); if (p.key !== 'custom') { setDateFrom(''); setDateTo('') } }}
                          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                            datePeriod === p.key
                              ? 'border-red-400 bg-red-50 text-red-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom date range */}
                    <AnimatePresence>
                      {datePeriod === 'custom' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-2 gap-3"
                        >
                          <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">من تاريخ</label>
                            <input
                              type="date"
                              value={dateFrom}
                              onChange={e => setDateFrom(e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">إلى تاريخ</label>
                            <input
                              type="date"
                              value={dateTo}
                              onChange={e => setDateTo(e.target.value)}
                              min={dateFrom}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <DeleteButton count={previewDate} onConfirm={handleDeleteByDate} isLoading={isDeleting} disabled={!datePeriod} />
                  </motion.div>
                )}

                {/* ── Wilaya ────────────────────────────────────────────── */}
                {activeTab === 'wilaya' && (
                  <motion.div key="wilaya" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">احذف جميع طلبات ولاية معينة</p>
                      <PreviewBadge count={previewWilaya} />
                    </div>

                    <select
                      value={wilaya}
                      onChange={e => setWilaya(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    >
                      <option value="">-- اختر الولاية --</option>
                      {WILAYAS.map(w => {
                        const c = submissions.filter(s => s.data.wilaya === w).length
                        return (
                          <option key={w} value={w}>{w} {c > 0 ? `(${c})` : ''}</option>
                        )
                      })}
                    </select>

                    {wilaya && previewWilaya > 0 && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        سيتم حذف <strong>{previewWilaya}</strong> طلب من ولاية <strong>{wilaya}</strong>
                      </div>
                    )}

                    <DeleteButton count={previewWilaya} onConfirm={handleDeleteByWilaya} isLoading={isDeleting} disabled={!wilaya} />
                  </motion.div>
                )}

                {/* ── Payment ───────────────────────────────────────────── */}
                {activeTab === 'payment' && (
                  <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">احذف حسب طريقة استلام الراتب</p>
                      <PreviewBadge count={previewPayment} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'CCP',  label: '📮 بريد الجزائر (CCP)',  count: countByPayment(submissions, 'CCP') },
                        { key: 'بنك',  label: '🏦 حساب بنكي',          count: countByPayment(submissions, 'بنك') },
                      ].map(m => (
                        <button
                          key={m.key}
                          onClick={() => setPaymentMethod(paymentMethod === m.key ? '' : m.key)}
                          className={`rounded-2xl border-2 p-4 text-right transition ${
                            paymentMethod === m.key
                              ? 'border-red-400 bg-red-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <p className="font-bold text-gray-800 text-sm">{m.label}</p>
                          <p className={`text-xs mt-1 ${paymentMethod === m.key ? 'text-red-600' : 'text-gray-400'}`}>
                            {m.count} طلب
                          </p>
                        </button>
                      ))}
                    </div>

                    <DeleteButton count={previewPayment} onConfirm={handleDeleteByPayment} isLoading={isDeleting} disabled={!paymentMethod} />
                  </motion.div>
                )}

                {/* ── Delete All ────────────────────────────────────────── */}
                {activeTab === 'all' && (
                  <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                      <div className="flex gap-3">
                        <ShieldAlert className="w-6 h-6 flex-shrink-0 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-bold text-red-800">خطر — حذف نهائي لجميع البيانات</p>
                          <p className="mt-1 text-sm text-red-600">
                            سيتم حذف جميع <strong>{previewAll}</strong> طلب من قاعدة البيانات.
                            هذا الإجراء لا يمكن التراجع عنه.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        اكتب <code className="rounded bg-gray-100 px-1 font-mono text-red-700">حذف الكل</code> للتأكيد
                      </label>
                      <input
                        type="text"
                        value={confirmAllText}
                        onChange={e => setConfirmAllText(e.target.value)}
                        placeholder="حذف الكل"
                        className="w-full rounded-xl border-2 border-red-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    <button
                      onClick={handleDeleteAll}
                      disabled={confirmAllText !== 'حذف الكل' || isDeleting || previewAll === 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      حذف جميع الطلبات ({previewAll})
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-right">
              <p className="text-xs text-gray-400">
                الطلبات المحذوفة لا يمكن استعادتها — تأكد من تصدير نسخة احتياطية أولاً.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AdvancedDeleteModal

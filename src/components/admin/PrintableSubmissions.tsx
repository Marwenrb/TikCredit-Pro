'use client'

import React, { useEffect, useRef } from 'react'
import { Submission } from '@/types'
import { format } from 'date-fns'

interface PrintableSubmissionsProps {
    submissions: Submission[]
    onClose: () => void
    title?: string
}

/**
 * Print-ready Arabic submissions view
 * Optimized for printing with RTL layout
 */
export default function PrintableSubmissions({
    submissions,
    onClose,
    title = 'قائمة طلبات التمويل'
}: PrintableSubmissionsProps) {
    const printRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Auto-trigger print after component mounts
        const timer = setTimeout(() => {
            window.print()
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-DZ', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount) + ' د.ج'
    }

    return (
        <>
            {/* Print-specific styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .submission-card {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>

            {/* Close button (hidden in print) */}
            <div className="no-print fixed top-4 left-4 z-50">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    ✕ إغلاق
                </button>
                <button
                    onClick={() => window.print()}
                    className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    🖨️ طباعة
                </button>
            </div>

            {/* Printable content */}
            <div ref={printRef} className="print-container bg-white min-h-screen p-8" dir="rtl">
                {/* Header */}
                <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">TikCredit Pro</h1>
                    <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
                    <p className="text-gray-600 mt-2">
                        تاريخ الطباعة: {format(new Date(), 'dd/MM/yyyy HH:mm')}
                    </p>
                    <p className="text-gray-600">
                        إجمالي الطلبات: {submissions.length}
                    </p>
                </div>

                {/* Submissions */}
                <div className="space-y-6">
                    {submissions.map((submission, index) => (
                        <div key={submission.id} className="submission-card border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                            {/* Card Header */}
                            <div className="flex justify-between items-start border-b border-gray-300 pb-3 mb-4">
                                <div>
                                    <span className="text-lg font-bold text-blue-800">
                                        طلب رقم {index + 1}
                                    </span>
                                    <p className="text-sm text-gray-600 font-mono mt-1">
                                        🔖 ID: <span className="bg-gray-100 px-2 py-0.5 rounded">{submission.id}</span>
                                    </p>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-gray-600">
                                        {format(new Date(submission.timestamp), 'dd/MM/yyyy')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(submission.timestamp), 'HH:mm')}
                                    </p>
                                </div>
                            </div>

                            {/* Client Info Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-3">
                                    <div>
                                        <span className="font-semibold text-gray-700">الاسم الكامل:</span>
                                        <p className="text-gray-900 font-medium text-lg">{submission.data.fullName}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">رقم الهاتف:</span>
                                        <p className="text-gray-900 font-medium text-lg" dir="ltr">{submission.data.phone}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">البريد الإلكتروني:</span>
                                        <p className="text-gray-900">{submission.data.email || 'غير محدد'}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">الولاية:</span>
                                        <p className="text-gray-900 font-medium">{submission.data.wilaya}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">المهنة:</span>
                                        <p className="text-gray-900">
                                            {submission.data.profession === 'أخرى (حدد)' && submission.data.customProfession
                                                ? submission.data.customProfession
                                                : submission.data.profession || 'غير محدد'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <span className="font-semibold text-gray-700">نوع التمويل:</span>
                                        <p className="text-gray-900 font-medium">{submission.data.financingType}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">المبلغ المطلوب:</span>
                                        <p className="text-blue-800 font-bold text-xl">
                                            {formatCurrency(submission.data.requestedAmount)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">طريقة استلام الراتب:</span>
                                        <p className="text-gray-900">{submission.data.salaryReceiveMethod}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">نطاق الدخل الشهري:</span>
                                        <p className="text-gray-900">{submission.data.monthlyIncomeRange || 'غير محدد'}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">عميل حالي:</span>
                                        <p className="text-gray-900">{submission.data.isExistingCustomer || 'لا'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {submission.data.notes && (
                                <div className="mt-4 pt-3 border-t border-gray-300">
                                    <span className="font-semibold text-gray-700">ملاحظات:</span>
                                    <p className="text-gray-900 mt-1">{submission.data.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t-2 border-gray-800 text-center text-gray-600">
                    <p>TikCredit Pro © {new Date().getFullYear()}</p>
                    <p className="text-sm">صُنع بحب في الجزائر 🇩🇿</p>
                </div>
            </div>
        </>
    )
}

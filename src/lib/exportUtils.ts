/**
 * Ultra-Premium Export Utilities
 * Advanced Excel & PDF export functionality with date filtering
 */

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { Submission } from '@/types'

// ============================================
// TYPE DEFINITIONS
// ============================================

export type DateRangeType = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all'

export interface DateRange {
  type: DateRangeType
  startDate?: Date
  endDate?: Date
}

export interface ExportOptions {
  filename?: string
  dateRange: DateRange
  includeNotes?: boolean
  includeTimestamp?: boolean
}

// ============================================
// DATE FILTERING UTILITIES
// ============================================

/**
 * Get date range based on filter type
 */
export const getDateRange = (type: DateRangeType, customStart?: Date, customEnd?: Date): { start: Date; end: Date } => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  switch (type) {
    case 'today':
      return {
        start: startOfToday,
        end: endOfToday,
      }

    case 'week': {
      const dayOfWeek = now.getDay()
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(now)
      monday.setDate(now.getDate() + diffToMonday)
      monday.setHours(0, 0, 0, 0)
      
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)
      
      return {
        start: monday,
        end: sunday,
      }
    }

    case 'month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      
      return {
        start: firstDay,
        end: lastDay,
      }
    }

    case 'year': {
      const firstDay = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
      const lastDay = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      
      return {
        start: firstDay,
        end: lastDay,
      }
    }

    case 'custom':
      if (customStart && customEnd) {
        return {
          start: new Date(customStart.setHours(0, 0, 0, 0)),
          end: new Date(customEnd.setHours(23, 59, 59, 999)),
        }
      }
      // Fallback to all time if custom dates not provided
      return {
        start: new Date(2020, 0, 1),
        end: now,
      }

    case 'all':
    default:
      return {
        start: new Date(2020, 0, 1),
        end: now,
      }
  }
}

/**
 * Filter submissions by date range
 */
export const filterSubmissionsByDateRange = (
  submissions: Submission[],
  dateRange: DateRange
): Submission[] => {
  const { start, end } = getDateRange(dateRange.type, dateRange.startDate, dateRange.endDate)

  return submissions.filter((submission) => {
    const submissionDate = new Date(submission.timestamp)
    return submissionDate >= start && submissionDate <= end
  })
}

/**
 * Format date range for display
 */
export const formatDateRangeLabel = (dateRange: DateRange): string => {
  switch (dateRange.type) {
    case 'today':
      return `اليوم - ${format(new Date(), 'dd/MM/yyyy')}`
    case 'week':
      const { start: weekStart, end: weekEnd } = getDateRange('week')
      return `هذا الأسبوع (${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM/yyyy')})`
    case 'month':
      return `هذا الشهر - ${format(new Date(), 'MMMM yyyy')}`
    case 'year':
      return `هذا العام - ${format(new Date(), 'yyyy')}`
    case 'custom':
      if (dateRange.startDate && dateRange.endDate) {
        return `${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`
      }
      return 'فترة مخصصة'
    case 'all':
    default:
      return 'جميع الفترات'
  }
}

// ============================================
// EXCEL EXPORT
// ============================================

/**
 * Export submissions to Excel with advanced formatting
 */
export const exportToExcel = (
  submissions: Submission[],
  options: ExportOptions
): void => {
  try {
    // Filter by date range
    const filteredSubmissions = filterSubmissionsByDateRange(submissions, options.dateRange)

    if (filteredSubmissions.length === 0) {
      alert('لا توجد طلبات في الفترة المحددة')
      return
    }

    // Prepare data for Excel
    const excelData = filteredSubmissions.map((submission, index) => {
      const data: any = {
        'الرقم': index + 1,
        'الاسم الكامل': submission.data.fullName || '',
        'رقم الهاتف': submission.data.phone || '',
        'البريد الإلكتروني': submission.data.email || 'غير محدد',
        'الولاية': submission.data.wilaya || '',
        'نوع التمويل': submission.data.financingType || '',
        'المبلغ المطلوب': submission.data.requestedAmount || 0,
        'طريقة استلام الراتب': submission.data.salaryReceiveMethod || '',
        'نطاق الدخل الشهري': submission.data.monthlyIncomeRange || 'غير محدد',
        'وقت التواصل المفضل': submission.data.preferredContactTime || 'غير محدد',
        'عميل موجود': submission.data.isExistingCustomer || 'لا',
        'تاريخ الإرسال': format(new Date(submission.timestamp), 'dd/MM/yyyy HH:mm'),
      }

      if (options.includeNotes) {
        data['الملاحظات'] = submission.data.notes || ''
      }

      return data
    })

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const columnWidths = [
      { wch: 8 },  // ID
      { wch: 25 }, // Full Name
      { wch: 15 }, // Phone
      { wch: 25 }, // Email
      { wch: 15 }, // Wilaya
      { wch: 20 }, // Financing Type
      { wch: 15 }, // Amount
      { wch: 20 }, // Salary Method
      { wch: 20 }, // Income Range
      { wch: 20 }, // Contact Time
      { wch: 12 }, // Existing Customer
      { wch: 18 }, // Date
    ]

    if (options.includeNotes) {
      columnWidths.push({ wch: 30 }) // Notes
    }

    ws['!cols'] = columnWidths

    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Generate sheet name with date range
    const dateLabel = formatDateRangeLabel(options.dateRange)
    const sheetName = `Submissions_${format(new Date(), 'ddMMyyyy')}`
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31)) // Excel sheet name limit

    // Generate filename
    const filename = options.filename || `TikCredit_Submissions_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`

    // Download file
    XLSX.writeFile(wb, filename)

    console.log(`✅ تم تصدير ${filteredSubmissions.length} طلب إلى Excel بنجاح`)
  } catch (error) {
    console.error('Excel export error:', error)
    alert('حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.')
  }
}

// ============================================
// PDF EXPORT
// ============================================

/**
 * Export submissions to PDF with professional formatting
 */
export const exportToPDF = (
  submissions: Submission[],
  options: ExportOptions
): void => {
  try {
    // Filter by date range
    const filteredSubmissions = filterSubmissionsByDateRange(submissions, options.dateRange)

    if (filteredSubmissions.length === 0) {
      alert('لا توجد طلبات في الفترة المحددة')
      return
    }

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    // Add header
    doc.setFontSize(20)
    doc.setTextColor(30, 58, 138) // Elegant blue
    doc.text('TikCredit Pro - Submissions Report', 15, 20)

    // Add date range
    doc.setFontSize(12)
    doc.setTextColor(75, 75, 75)
    const dateLabel = formatDateRangeLabel(options.dateRange)
    doc.text(`Date Range: ${dateLabel}`, 15, 30)

    // Add submission count
    doc.text(`Total Submissions: ${filteredSubmissions.length}`, 15, 37)

    // Prepare table data
    const tableData = filteredSubmissions.map((submission, index) => {
      const row = [
        (index + 1).toString(),
        submission.data.fullName || '',
        submission.data.phone || '',
        submission.data.wilaya || '',
        submission.data.financingType || '',
        `${submission.data.requestedAmount?.toLocaleString('ar-DZ')} دج` || '0',
        format(new Date(submission.timestamp), 'dd/MM/yyyy'),
      ]

      if (options.includeNotes) {
        row.push(submission.data.notes?.substring(0, 50) || '')
      }

      return row
    })

    // Define table headers
    const headers = ['#', 'Full Name', 'Phone', 'Wilaya', 'Type', 'Amount', 'Date']
    
    if (options.includeNotes) {
      headers.push('Notes')
    }

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 45,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 58, 138], // Elegant blue
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Luxury off-white
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto', minCellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25 },
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        // Add footer with page numbers
        const pageCount = doc.getNumberOfPages()
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      },
    })

    // Generate filename
    const filename = options.filename || `TikCredit_Submissions_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`

    // Download PDF
    doc.save(filename)

    console.log(`✅ تم تصدير ${filteredSubmissions.length} طلب إلى PDF بنجاح`)
  } catch (error) {
    console.error('PDF export error:', error)
    alert('حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.')
  }
}

// ============================================
// STATISTICS & HELPERS
// ============================================

/**
 * Get submission statistics for a date range
 */
export const getSubmissionStatistics = (
  submissions: Submission[],
  dateRange: DateRange
) => {
  const filtered = filterSubmissionsByDateRange(submissions, dateRange)

  const totalAmount = filtered.reduce(
    (sum, sub) => sum + (sub.data.requestedAmount || 0),
    0
  )

  const avgAmount = filtered.length > 0 ? totalAmount / filtered.length : 0

  // Group by financing type
  const byType = filtered.reduce((acc, sub) => {
    const type = sub.data.financingType || 'غير محدد'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Group by wilaya
  const byWilaya = filtered.reduce((acc, sub) => {
    const wilaya = sub.data.wilaya || 'غير محدد'
    acc[wilaya] = (acc[wilaya] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total: filtered.length,
    totalAmount,
    avgAmount,
    byType,
    byWilaya,
  }
}

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Validate date range
 */
export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate
}



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
 * Note: PDF uses English labels for compatibility (Arabic not supported in jsPDF without custom fonts)
 * For Arabic text export, use TXT or CSV format instead
 */
export const exportToPDF = (
  submissions: Submission[],
  options: ExportOptions
): void => {
  try {
    // Filter by date range
    const filteredSubmissions = filterSubmissionsByDateRange(submissions, options.dateRange)

    if (filteredSubmissions.length === 0) {
      alert('لا توجد طلبات في الفترة المحددة - For Arabic text, please use TXT or CSV export')
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

    // Add date range info
    doc.setFontSize(12)
    doc.setTextColor(75, 75, 75)
    doc.text(`Export Date: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 30)

    // Add submission count
    doc.text(`Total Submissions: ${filteredSubmissions.length}`, 15, 37)

    // Add note about Arabic text
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    doc.text('Note: For Arabic text support, please export as TXT or CSV format', 15, 44)

    // Prepare table data - use phone as identifier since Arabic names won't render
    const tableData = filteredSubmissions.map((submission, index) => {
      // Format amount without Arabic currency
      const amount = submission.data.requestedAmount?.toLocaleString() || '0'
      
      const row = [
        (index + 1).toString(),
        submission.data.phone || '-',
        submission.data.email || '-',
        `${amount} DZD`,
        format(new Date(submission.timestamp), 'dd/MM/yyyy HH:mm'),
      ]

      return row
    })

    // Define table headers (English for PDF compatibility)
    const headers = ['#', 'Phone', 'Email', 'Amount', 'Date']

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 50,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 58, 138], // Elegant blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [50, 50, 50],
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Luxury off-white
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 40 },
        2: { cellWidth: 60 },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 40 },
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        // Add footer with page numbers
        const pageCount = doc.getNumberOfPages()
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(
          `Page ${data.pageNumber} of ${pageCount} - TikCredit Pro`,
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

    console.log(`Exported ${filteredSubmissions.length} submissions to PDF`)
  } catch (error) {
    console.error('PDF export error:', error)
    alert('حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.')
  }
}

// ============================================
// TXT EXPORT (UTF-8 Arabic Support)
// ============================================

/**
 * Export submissions to TXT with proper Arabic UTF-8 encoding
 */
export const exportToTXT = (
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

    // Build TXT content with proper formatting
    let content = ''
    
    // Header
    content += '═══════════════════════════════════════════════════════════════════════════════\n'
    content += '                         TikCredit Pro - تقرير الطلبات                          \n'
    content += '═══════════════════════════════════════════════════════════════════════════════\n\n'
    
    // Date info
    const dateLabel = formatDateRangeLabel(options.dateRange)
    content += `📅 الفترة: ${dateLabel}\n`
    content += `📊 إجمالي الطلبات: ${filteredSubmissions.length}\n`
    content += `🕐 تاريخ التصدير: ${format(new Date(), 'dd/MM/yyyy HH:mm')}\n\n`
    content += '───────────────────────────────────────────────────────────────────────────────\n\n'

    // Submissions
    filteredSubmissions.forEach((submission, index) => {
      content += `┌─────────────────────────────────────────────────────────────────────────────┐\n`
      content += `│ طلب رقم ${index + 1}                                                                      \n`
      content += `├─────────────────────────────────────────────────────────────────────────────┤\n`
      content += `│ الاسم الكامل:     ${submission.data.fullName || 'غير محدد'}\n`
      content += `│ رقم الهاتف:       ${submission.data.phone || 'غير محدد'}\n`
      content += `│ البريد الإلكتروني: ${submission.data.email || 'غير محدد'}\n`
      content += `│ الولاية:          ${submission.data.wilaya || 'غير محدد'}\n`
      content += `│ نوع التمويل:      ${submission.data.financingType || 'غير محدد'}\n`
      content += `│ المبلغ المطلوب:   ${submission.data.requestedAmount?.toLocaleString('ar-DZ') || '0'} دج\n`
      content += `│ طريقة الراتب:     ${submission.data.salaryReceiveMethod || 'غير محدد'}\n`
      content += `│ نطاق الدخل:       ${submission.data.monthlyIncomeRange || 'غير محدد'}\n`
      content += `│ وقت التواصل:      ${submission.data.preferredContactTime || 'غير محدد'}\n`
      content += `│ عميل موجود:       ${submission.data.isExistingCustomer || 'لا'}\n`
      content += `│ تاريخ الإرسال:    ${format(new Date(submission.timestamp), 'dd/MM/yyyy HH:mm')}\n`
      
      if (options.includeNotes && submission.data.notes) {
        content += `│ الملاحظات:        ${submission.data.notes}\n`
      }
      
      content += `└─────────────────────────────────────────────────────────────────────────────┘\n\n`
    })

    // Footer
    content += '───────────────────────────────────────────────────────────────────────────────\n'
    content += '                    TikCredit Pro © 2024 - صُنع بحب في الجزائر 🇩🇿              \n'
    content += '═══════════════════════════════════════════════════════════════════════════════\n'

    // Create Blob with UTF-8 BOM for proper Arabic display
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + content], { type: 'text/plain;charset=utf-8' })
    
    // Generate filename
    const filename = options.filename?.replace(/\.(xlsx|pdf)$/i, '.txt') || 
                     `TikCredit_Submissions_${format(new Date(), 'yyyy-MM-dd_HHmm')}.txt`

    // Download file
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log(`✅ تم تصدير ${filteredSubmissions.length} طلب إلى TXT بنجاح`)
  } catch (error) {
    console.error('TXT export error:', error)
    alert('حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.')
  }
}

// ============================================
// CSV EXPORT (UTF-8 Arabic Support)
// ============================================

/**
 * Export submissions to CSV with proper Arabic UTF-8 encoding
 */
export const exportToCSV = (
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

    // CSV Headers
    let headers = [
      'الرقم',
      'الاسم الكامل',
      'رقم الهاتف',
      'البريد الإلكتروني',
      'الولاية',
      'نوع التمويل',
      'المبلغ المطلوب',
      'طريقة الراتب',
      'نطاق الدخل',
      'وقت التواصل',
      'عميل موجود',
      'تاريخ الإرسال'
    ]

    if (options.includeNotes) {
      headers.push('الملاحظات')
    }

    // Build CSV content
    let csvContent = headers.join(',') + '\n'

    filteredSubmissions.forEach((submission, index) => {
      const row = [
        index + 1,
        `"${(submission.data.fullName || '').replace(/"/g, '""')}"`,
        `"${submission.data.phone || ''}"`,
        `"${submission.data.email || 'غير محدد'}"`,
        `"${submission.data.wilaya || ''}"`,
        `"${submission.data.financingType || ''}"`,
        submission.data.requestedAmount || 0,
        `"${submission.data.salaryReceiveMethod || ''}"`,
        `"${submission.data.monthlyIncomeRange || 'غير محدد'}"`,
        `"${submission.data.preferredContactTime || 'غير محدد'}"`,
        `"${submission.data.isExistingCustomer || 'لا'}"`,
        `"${format(new Date(submission.timestamp), 'dd/MM/yyyy HH:mm')}"`
      ]

      if (options.includeNotes) {
        row.push(`"${(submission.data.notes || '').replace(/"/g, '""')}"`)
      }

      csvContent += row.join(',') + '\n'
    })

    // Create Blob with UTF-8 BOM for proper Arabic display
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
    
    // Generate filename
    const filename = options.filename?.replace(/\.(xlsx|pdf|txt)$/i, '.csv') || 
                     `TikCredit_Submissions_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`

    // Download file
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log(`✅ تم تصدير ${filteredSubmissions.length} طلب إلى CSV بنجاح`)
  } catch (error) {
    console.error('CSV export error:', error)
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




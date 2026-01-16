import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Submission, FormData, STORAGE_KEY, DRAFT_STORAGE_KEY, WILAYAS, CONTACT_TIMES, INCOME_RANGES, FINANCING_TYPES } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate UUID v4 compatible ID
 * Fallback for browsers without crypto.randomUUID support
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback: generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getSubmissions(): Submission[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveSubmission(data: FormData): Submission {
  const submission: Submission = {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    data
  }
  const submissions = getSubmissions()
  submissions.push(submission)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
  return submission
}

export function deleteSubmission(id: string): void {
  const submissions = getSubmissions()
  const filtered = submissions.filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function clearAllSubmissions(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function saveDraft(data: Partial<FormData>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data))
}

export function getDraft(): Partial<FormData> | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(DRAFT_STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DRAFT_STORAGE_KEY)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(05|06|07)[0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function validateEmail(email: string): boolean {
  if (!email) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' د.ج'
}

export function getStatistics(submissions: Submission[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const todaySubmissions = submissions.filter(s => {
    const date = new Date(s.timestamp)
    return date >= today
  })

  const weekSubmissions = submissions.filter(s => {
    const date = new Date(s.timestamp)
    return date >= weekAgo
  })

  const monthSubmissions = submissions.filter(s => {
    const date = new Date(s.timestamp)
    return date >= monthAgo
  })

  const totalAmount = submissions.reduce((sum, s) => sum + s.data.requestedAmount, 0)
  const avgAmount = submissions.length > 0 ? totalAmount / submissions.length : 0

  const wilayaDistribution: Record<string, number> = {}
  const financingDistribution: Record<string, number> = {}
  const dailySubmissions: Record<string, number> = {}

  submissions.forEach(s => {
    wilayaDistribution[s.data.wilaya] = (wilayaDistribution[s.data.wilaya] || 0) + 1
    financingDistribution[s.data.financingType] = (financingDistribution[s.data.financingType] || 0) + 1

    const date = new Date(s.timestamp).toISOString().split('T')[0]
    dailySubmissions[date] = (dailySubmissions[date] || 0) + 1
  })

  return {
    total: submissions.length,
    today: todaySubmissions.length,
    week: weekSubmissions.length,
    month: monthSubmissions.length,
    totalAmount,
    avgAmount,
    wilayaDistribution,
    financingDistribution,
    dailySubmissions,
    lastSubmission: submissions.length > 0 ? submissions[submissions.length - 1] : null
  }
}

export function exportToJSON(submissions: Submission[]): void {
  const dataStr = JSON.stringify(submissions, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `tikcredit-submissions-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(submissions: Submission[]): void {
  if (submissions.length === 0) return

  // Professional Arabic headers
  const headers = [
    'رقم الطلب',
    'التاريخ والوقت',
    'حالة العميل',
    'الاسم الكامل',
    'رقم الهاتف',
    'البريد الإلكتروني',
    'وقت التواصل المفضل',
    'الولاية',
    'نطاق الدخل الشهري',
    'طريقة استلام الراتب',
    'طبيعة العمل/المهنة',
    'نوع التمويل',
    'المبلغ المطلوب (د.ج)',
    'ملاحظات'
  ]

  const rows = submissions.map((s, index) => [
    (index + 1).toString(),
    new Date(s.timestamp).toLocaleString('ar-DZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    s.data.isExistingCustomer === 'نعم' ? 'عميل حالي' :
      s.data.isExistingCustomer === 'لا' ? 'عميل جديد' : 'غير محدد',
    s.data.fullName,
    s.data.phone,
    s.data.email || 'غير محدد',
    s.data.preferredContactTime || 'غير محدد',
    s.data.wilaya,
    s.data.monthlyIncomeRange || 'غير محدد',
    s.data.salaryReceiveMethod === 'CCP' ? 'البريد (CCP)' :
      s.data.salaryReceiveMethod === 'بنك' ? 'حساب بنكي' : 'غير محدد',
    s.data.profession ?
      (s.data.profession === 'أخرى (حدد)' && s.data.customProfession ?
        s.data.customProfession : s.data.profession) : 'غير محدد',
    s.data.financingType,
    s.data.requestedAmount.toLocaleString('ar-DZ'),
    s.data.notes || 'لا توجد'
  ])

  // Add summary statistics at the end
  const totalAmount = submissions.reduce((sum, s) => sum + s.data.requestedAmount, 0)
  const avgAmount = totalAmount / submissions.length

  rows.push([]) // Empty row
  rows.push([
    'الإحصائيات',
    '',
    '',
    `إجمالي الطلبات: ${submissions.length}`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    `المبلغ الإجمالي: ${totalAmount.toLocaleString('ar-DZ')} د.ج`,
    `المتوسط: ${Math.round(avgAmount).toLocaleString('ar-DZ')} د.ج`,
    ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `تقرير_طلبات_التمويل_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToText(submissions: Submission[]): void {
  if (submissions.length === 0) return

  let textContent = '===========================================\n'
  textContent += '        TikCredit Pro - تقرير الطلبات        \n'
  textContent += '===========================================\n\n'
  textContent += `تاريخ التصدير: ${new Date().toLocaleString('ar-DZ')}\n`
  textContent += `عدد الطلبات: ${submissions.length}\n`
  textContent += '===========================================\n\n'

  submissions.forEach((submission, index) => {
    textContent += `【 الطلب رقم ${index + 1} 】\n`
    textContent += '-------------------------------------------\n'
    textContent += `▸ معرف الطلب: ${submission.id}\n`
    textContent += `▸ التاريخ: ${new Date(submission.timestamp).toLocaleString('ar-DZ')}\n`
    textContent += `▸ عميل موجود: ${submission.data.isExistingCustomer || 'غير محدد'}\n`
    textContent += `▸ الاسم الكامل: ${submission.data.fullName}\n`
    textContent += `▸ رقم الهاتف: ${submission.data.phone}\n`
    textContent += `▸ البريد الإلكتروني: ${submission.data.email || 'غير محدد'}\n`
    textContent += `▸ وقت التواصل المفضل: ${submission.data.preferredContactTime || 'غير محدد'}\n`
    textContent += `▸ الولاية: ${submission.data.wilaya}\n`
    textContent += `▸ نطاق الدخل الشهري: ${submission.data.monthlyIncomeRange || 'غير محدد'}\n`
    textContent += `▸ طريقة استلام الراتب: ${submission.data.salaryReceiveMethod === 'CCP' ? 'البريد (CCP)' : submission.data.salaryReceiveMethod === 'بنك' ? 'حساب بنكي' : 'غير محدد'}\n`
    textContent += `▸ طبيعة العمل/المهنة: ${submission.data.profession ? (submission.data.profession === 'أخرى (حدد)' && submission.data.customProfession ? submission.data.customProfession : submission.data.profession) : 'غير محدد'}\n`
    textContent += `▸ نوع التمويل: ${submission.data.financingType}\n`
    textContent += `▸ المبلغ المطلوب: ${formatCurrency(submission.data.requestedAmount)}\n`
    textContent += `▸ ملاحظات: ${submission.data.notes || 'لا توجد ملاحظات'}\n`
    textContent += '\n'
  })

  textContent += '===========================================\n'
  textContent += '           نهاية التقرير - End of Report           \n'
  textContent += '===========================================\n'

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `tikcredit-report-${new Date().toISOString().split('T')[0]}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

export function filterSubmissions(
  submissions: Submission[],
  period: 'all' | 'today' | 'week' | 'month',
  searchQuery: string
): Submission[] {
  let filtered = [...submissions]

  if (period !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let cutoff: Date

    if (period === 'today') {
      cutoff = today
    } else if (period === 'week') {
      cutoff = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else {
      cutoff = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    filtered = filtered.filter(s => new Date(s.timestamp) >= cutoff)
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(s => {
      return (
        s.data.fullName.toLowerCase().includes(query) ||
        s.data.phone.includes(query) ||
        s.data.wilaya.toLowerCase().includes(query) ||
        (s.data.email && s.data.email.toLowerCase().includes(query))
      )
    })
  }

  return filtered
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export async function exportToPDF(submissions: Submission[]): Promise<void> {
  if (typeof window === 'undefined' || submissions.length === 0) return

  try {
    // Dynamic imports to avoid SSR issues
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Add custom font for Arabic support (using built-in fonts for now)
    doc.setFont('helvetica')

    // Title
    doc.setFontSize(20)
    doc.setTextColor(212, 175, 55) // Gold color
    doc.text('TikCredit Pro', 105, 20, { align: 'center' })

    // Subtitle
    doc.setFontSize(14)
    doc.setTextColor(100, 100, 100)
    doc.text('تقرير الطلبات المقدمة', 105, 30, { align: 'center' })

    // Date
    doc.setFontSize(10)
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-DZ')}`, 20, 40)
    doc.text(`عدد الطلبات: ${submissions.length}`, 20, 45)

    // Statistics section
    const stats = getStatistics(submissions)
    doc.setFontSize(12)
    doc.setTextColor(50, 50, 50)
    doc.text('الإحصائيات:', 20, 55)

    // Draw statistics boxes
    const statsY = 60
    const boxWidth = 60
    const boxHeight = 20

    // Total requests box
    doc.setFillColor(212, 175, 55, 30)
    doc.rect(20, statsY, boxWidth, boxHeight, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text('إجمالي الطلبات', 50, statsY + 7, { align: 'center' })
    doc.setFontSize(14)
    doc.text(stats.total.toString(), 50, statsY + 15, { align: 'center' })

    // Average amount box
    doc.setFillColor(212, 175, 55, 30)
    doc.rect(90, statsY, boxWidth, boxHeight, 'F')
    doc.setFontSize(10)
    doc.text('متوسط المبلغ', 120, statsY + 7, { align: 'center' })
    doc.setFontSize(14)
    doc.text(formatCurrency(stats.avgAmount), 120, statsY + 15, { align: 'center' })

    // Add chart placeholder (since actual charting would require canvas)
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('توزيع الطلبات حسب الولاية:', 20, statsY + 30)

    // Create simple bar chart representation
    let chartY = statsY + 35
    const maxCount = Math.max(...Object.values(stats.wilayaDistribution))

    Object.entries(stats.wilayaDistribution).slice(0, 5).forEach(([wilaya, count]) => {
      const barWidth = (count / maxCount) * 100
      doc.setFillColor(212, 175, 55, 60)
      doc.rect(20, chartY, barWidth, 5, 'F')
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.text(`${wilaya}: ${count}`, 125, chartY + 4)
      chartY += 7
    })

    // Table data with profession
    const tableData = submissions.map((submission, index) => [
      (index + 1).toString(),
      submission.data.fullName,
      submission.data.phone,
      submission.data.wilaya,
      submission.data.profession ?
        (submission.data.profession === 'أخرى (حدد)' && submission.data.customProfession ?
          submission.data.customProfession : submission.data.profession) : 'غير محدد',
      formatCurrency(submission.data.requestedAmount),
      new Date(submission.timestamp).toLocaleDateString('ar-DZ')
    ])

      // Add table
      ; (doc as any).autoTable({
        startY: chartY + 10,
        head: [['#', 'الاسم', 'الهاتف', 'الولاية', 'المهنة', 'المبلغ', 'التاريخ']],
        body: tableData,
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 3,
          lineColor: [212, 175, 55],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [212, 175, 55],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 40 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35, halign: 'right' },
          5: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: function (data: any) {
          // Footer
          doc.setFontSize(8)
          doc.setTextColor(150, 150, 150)
          doc.text(
            `صفحة ${data.pageNumber} من ${doc.getNumberOfPages()}`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          )
        }
      })

    // Save the PDF
    doc.save(`tikcredit-report-${new Date().toISOString().split('T')[0]}.pdf`)

  } catch (error) {
    console.error('Error generating PDF:', error)
    // Fallback to JSON export if PDF generation fails
    exportToJSON(submissions)
  }
}

export function generateDemoData(count: number): void {
  const names = ['أحمد محمد', 'فاطمة علي', 'محمد خالد', 'سارة أحمد', 'يوسف حسن', 'نور الدين', 'ليلى محمود', 'عمر كريم']
  const professions = ['موظف حكومي', 'عسكري (جيش وطني)', 'طبيب', 'مهندس', 'معلم/أستاذ', 'موظف شركة خاصة', 'تاجر', 'حرفي']
  const submissions: Submission[] = []

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))

    submissions.push({
      id: crypto.randomUUID(),
      timestamp: date.toISOString(),
      data: {
        isExistingCustomer: Math.random() > 0.5 ? 'نعم' : 'لا',
        fullName: names[Math.floor(Math.random() * names.length)],
        phone: `0${Math.floor(Math.random() * 3) + 5}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        email: Math.random() > 0.3 ? `user${i}@example.com` : '',
        preferredContactTime: CONTACT_TIMES[Math.floor(Math.random() * CONTACT_TIMES.length)],
        wilaya: WILAYAS[Math.floor(Math.random() * WILAYAS.length)],
        monthlyIncomeRange: INCOME_RANGES[Math.floor(Math.random() * INCOME_RANGES.length)],
        salaryReceiveMethod: Math.random() > 0.5 ? 'CCP' : 'بنك',
        profession: professions[Math.floor(Math.random() * professions.length)],
        customProfession: '',
        financingType: FINANCING_TYPES[Math.floor(Math.random() * FINANCING_TYPES.length)],
        requestedAmount: Math.floor(Math.random() * 15000000) + 5000000,
        loanDuration: Math.floor(Math.random() * 18) + 1,
        notes: Math.random() > 0.7 ? 'ملاحظات إضافية للطلب' : ''
      }
    })
  }

  const existing = getSubmissions()
  existing.push(...submissions)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}


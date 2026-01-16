/**
 * Email Service for TikCredit Pro
 * Handles sending notification emails with retry mechanism
 */

import { FormData } from '@/types'

export interface EmailPayload {
  to: string
  subject: string
  body: string
  html?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  retryCount?: number
}

export interface SubmissionEmailData {
  submissionId: string
  timestamp: string
  data: FormData
  adminDashboardUrl: string
}

// Email queue for retry mechanism
interface QueuedEmail {
  id: string
  payload: EmailPayload
  attempts: number
  lastAttempt: string
  status: 'pending' | 'sent' | 'failed'
  error?: string
}

// In-memory queue (in production, use Redis or database)
const emailQueue: Map<string, QueuedEmail> = new Map()

// Maximum retry attempts
const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 5000, 15000] // 1s, 5s, 15s

/**
 * Format submission data as email content
 */
export function formatSubmissionEmail(data: SubmissionEmailData): EmailPayload {
  const { submissionId, timestamp, data: formData, adminDashboardUrl } = data
  const formattedDate = new Date(timestamp).toLocaleString('ar-DZ', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
  
  const subject = `📋 طلب تمويل جديد – ${formData.fullName} – ${formData.requestedAmount.toLocaleString('ar-DZ')} د.ج – ${new Date(timestamp).toLocaleDateString('ar-DZ')}`
  
  const body = `
=== طلب تمويل جديد ===

📅 التاريخ: ${formattedDate}
🔑 رقم الطلب: ${submissionId}

═══════════════════════════════════

👤 معلومات مقدم الطلب:
━━━━━━━━━━━━━━━━━━━━━
• الاسم الكامل: ${formData.fullName}
• رقم الهاتف: ${formData.phone}
• البريد الإلكتروني: ${formData.email || 'غير محدد'}
• الولاية: ${formData.wilaya}
• عميل موجود: ${formData.isExistingCustomer || 'غير محدد'}
• وقت التواصل المفضل: ${formData.preferredContactTime || 'غير محدد'}

💼 معلومات العمل والدخل:
━━━━━━━━━━━━━━━━━━━━━
• طبيعة العمل: ${formData.profession}${formData.customProfession ? ` (${formData.customProfession})` : ''}
• نطاق الدخل الشهري: ${formData.monthlyIncomeRange || 'غير محدد'}
• طريقة استلام الراتب: ${formData.salaryReceiveMethod}

💰 تفاصيل التمويل:
━━━━━━━━━━━━━━━━━━━━━
• نوع التمويل: ${formData.financingType}
• المبلغ المطلوب: ${formData.requestedAmount.toLocaleString('ar-DZ')} د.ج

📝 ملاحظات إضافية:
${formData.notes || 'لا توجد ملاحظات'}

═══════════════════════════════════

🔗 رابط لوحة التحكم: ${adminDashboardUrl}

---
هذه الرسالة آلية من نظام TikCredit Pro
  `.trim()

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>طلب تمويل جديد</title>
  <style>
    body {
      font-family: 'Tajawal', 'Arial', sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 20px;
      direction: rtl;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
      color: white;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      padding: 24px;
    }
    .section {
      margin-bottom: 24px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 12px;
      border-right: 4px solid #3B82F6;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1E3A8A;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6b7280;
      font-size: 14px;
    }
    .info-value {
      color: #1f2937;
      font-weight: 600;
      font-size: 14px;
    }
    .amount-highlight {
      background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      margin: 24px 0;
    }
    .amount-highlight .label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 8px;
    }
    .amount-highlight .value {
      font-size: 32px;
      font-weight: 800;
    }
    .cta-button {
      display: block;
      background: #F59E0B;
      color: white;
      text-align: center;
      padding: 16px 24px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      margin: 24px 0;
    }
    .cta-button:hover {
      background: #D97706;
    }
    .footer {
      background: #f9fafb;
      padding: 16px 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .submission-id {
      background: #e5e7eb;
      padding: 4px 12px;
      border-radius: 20px;
      font-family: monospace;
      font-size: 12px;
      display: inline-block;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 طلب تمويل جديد</h1>
      <p>${formattedDate}</p>
      <div class="submission-id">${submissionId}</div>
    </div>
    
    <div class="content">
      <div class="amount-highlight">
        <div class="label">المبلغ المطلوب</div>
        <div class="value">${formData.requestedAmount.toLocaleString('ar-DZ')} د.ج</div>
      </div>
      
      <div class="section">
        <div class="section-title">👤 معلومات مقدم الطلب</div>
        <div class="info-row">
          <span class="info-label">الاسم الكامل</span>
          <span class="info-value">${formData.fullName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">رقم الهاتف</span>
          <span class="info-value" dir="ltr">${formData.phone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">البريد الإلكتروني</span>
          <span class="info-value">${formData.email || 'غير محدد'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">الولاية</span>
          <span class="info-value">${formData.wilaya}</span>
        </div>
        <div class="info-row">
          <span class="info-label">عميل موجود</span>
          <span class="info-value">${formData.isExistingCustomer || 'غير محدد'}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">💼 معلومات العمل والدخل</div>
        <div class="info-row">
          <span class="info-label">طبيعة العمل</span>
          <span class="info-value">${formData.profession}${formData.customProfession ? ` (${formData.customProfession})` : ''}</span>
        </div>
        <div class="info-row">
          <span class="info-label">نطاق الدخل الشهري</span>
          <span class="info-value">${formData.monthlyIncomeRange || 'غير محدد'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">طريقة استلام الراتب</span>
          <span class="info-value">${formData.salaryReceiveMethod}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">💰 تفاصيل التمويل</div>
        <div class="info-row">
          <span class="info-label">نوع التمويل</span>
          <span class="info-value">${formData.financingType}</span>
        </div>
        ${formData.notes ? `
        <div class="info-row">
          <span class="info-label">ملاحظات</span>
          <span class="info-value">${formData.notes}</span>
        </div>
        ` : ''}
      </div>
      
      <a href="${adminDashboardUrl}" class="cta-button">
        🔗 فتح لوحة التحكم
      </a>
    </div>
    
    <div class="footer">
      <p>هذه الرسالة آلية من نظام TikCredit Pro</p>
      <p>© ${new Date().getFullYear()} TikCredit Pro - جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return {
    to: 'weshcredit@gmail.com',
    subject,
    body,
    html,
  }
}

/**
 * Send email using external service
 * In production, integrate with SendGrid, Mailgun, AWS SES, or similar
 */
async function sendEmailViaProvider(payload: EmailPayload): Promise<EmailResult> {
  // Check for email provider configuration
  const resendApiKey = process.env.RESEND_API_KEY
  const sendgridApiKey = process.env.SENDGRID_API_KEY
  
  // Try Resend (recommended for Next.js)
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'TikCredit Pro <noreply@tikcredit.com>',
          to: payload.to,
          subject: payload.subject,
          text: payload.body,
          html: payload.html,
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        return { success: true, messageId: result.id }
      }
      
      const error = await response.text()
      return { success: false, error: `Resend error: ${error}` }
    } catch (error) {
      return { 
        success: false, 
        error: `Resend exception: ${error instanceof Error ? error.message : 'Unknown'}` 
      }
    }
  }
  
  // Try SendGrid
  if (sendgridApiKey) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payload.to }] }],
          from: { email: process.env.EMAIL_FROM || 'noreply@tikcredit.com' },
          subject: payload.subject,
          content: [
            { type: 'text/plain', value: payload.body },
            ...(payload.html ? [{ type: 'text/html', value: payload.html }] : []),
          ],
        }),
      })
      
      if (response.ok || response.status === 202) {
        return { success: true, messageId: response.headers.get('X-Message-Id') || 'sent' }
      }
      
      const error = await response.text()
      return { success: false, error: `SendGrid error: ${error}` }
    } catch (error) {
      return { 
        success: false, 
        error: `SendGrid exception: ${error instanceof Error ? error.message : 'Unknown'}` 
      }
    }
  }
  
  // No email provider configured - log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 [DEV] Email would be sent:')
    console.log('   To:', payload.to)
    console.log('   Subject:', payload.subject)
    console.log('   Body preview:', payload.body.substring(0, 200) + '...')
    return { success: true, messageId: 'dev-mode-skipped' }
  }
  
  // Production without email provider
  console.warn('⚠️ No email provider configured. Set RESEND_API_KEY or SENDGRID_API_KEY.')
  return { success: false, error: 'No email provider configured' }
}

/**
 * Send email with retry mechanism
 */
export async function sendEmailWithRetry(
  payload: EmailPayload, 
  emailId: string = crypto.randomUUID()
): Promise<EmailResult> {
  let attempts = 0
  let lastError: string | undefined
  
  // Add to queue
  const queuedEmail: QueuedEmail = {
    id: emailId,
    payload,
    attempts: 0,
    lastAttempt: new Date().toISOString(),
    status: 'pending',
  }
  emailQueue.set(emailId, queuedEmail)
  
  while (attempts < MAX_RETRIES) {
    attempts++
    queuedEmail.attempts = attempts
    queuedEmail.lastAttempt = new Date().toISOString()
    
    const result = await sendEmailViaProvider(payload)
    
    if (result.success) {
      queuedEmail.status = 'sent'
      emailQueue.set(emailId, queuedEmail)
      return { ...result, retryCount: attempts - 1 }
    }
    
    lastError = result.error
    queuedEmail.error = lastError
    
    // Wait before retry (except on last attempt)
    if (attempts < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempts - 1]))
    }
  }
  
  // Mark as failed after all retries
  queuedEmail.status = 'failed'
  emailQueue.set(emailId, queuedEmail)
  
  return { 
    success: false, 
    error: `Failed after ${MAX_RETRIES} attempts: ${lastError}`,
    retryCount: attempts - 1,
  }
}

/**
 * Get email queue status
 */
export function getEmailQueueStatus(): { pending: number; sent: number; failed: number } {
  let pending = 0, sent = 0, failed = 0
  
  emailQueue.forEach(email => {
    switch (email.status) {
      case 'pending': pending++; break
      case 'sent': sent++; break
      case 'failed': failed++; break
    }
  })
  
  return { pending, sent, failed }
}

/**
 * Get email status by ID
 */
export function getEmailStatus(emailId: string): QueuedEmail | undefined {
  return emailQueue.get(emailId)
}

/**
 * Send submission notification email
 */
export async function sendSubmissionNotification(
  submissionId: string,
  timestamp: string,
  formData: FormData,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://tikcredit.com'
): Promise<EmailResult> {
  const adminDashboardUrl = `${baseUrl}/admin`
  
  const emailPayload = formatSubmissionEmail({
    submissionId,
    timestamp,
    data: formData,
    adminDashboardUrl,
  })
  
  return sendEmailWithRetry(emailPayload, submissionId)
}

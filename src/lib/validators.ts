import { z } from 'zod'
import { ALGERIAN_BANKS, WILAYAS, FINANCING_TYPES } from '@/types'

// ── Algerian Banks enum for Zod ──────────────────────────────────────────────

const bankCodes = ALGERIAN_BANKS.map(b => b.code) as [string, ...string[]]

// ── CCP Schema ───────────────────────────────────────────────────────────────

export const ccpSchema = z.object({
  paymentMethod: z.literal('CCP'),
  ccpNumber: z
    .string()
    .transform(v => v.replace(/\s/g, ''))
    .pipe(z.string().regex(/^\d{10}$/, 'رقم CCP يجب أن يتكون من 10 أرقام')),
  ccpKey: z
    .string()
    .transform(v => v.replace(/\s/g, ''))
    .pipe(z.string().regex(/^\d{2}$/, 'مفتاح CCP يجب أن يتكون من رقمين')),
})

// ── Bank Account Schema ──────────────────────────────────────────────────────

export const bankAccountSchema = z.object({
  paymentMethod: z.literal('بنك'),
  bankName: z.enum(bankCodes, { errorMap: () => ({ message: 'اختر بنكاً صالحاً' }) }),
  bankAccountNumber: z
    .string()
    .transform(v => v.replace(/\s/g, ''))
    .pipe(z.string().regex(/^\d{20}$/, 'رقم الحساب (RIB) يجب أن يتكون من 20 رقماً')),
  bankAgencyCode: z
    .string()
    .regex(/^\d{3,5}$/, 'كود الوكالة يجب أن يتكون من 3 إلى 5 أرقام')
    .optional()
    .or(z.literal('')),
})

// ── Banking Info Discriminated Union ─────────────────────────────────────────

export const bankingInfoSchema = z.discriminatedUnion('paymentMethod', [
  ccpSchema,
  bankAccountSchema,
])

// ── Full Form Submission Schema ──────────────────────────────────────────────

const algerianPhoneRegex = /^(05|06|07)\d{8}$/

export const formSubmissionSchema = z.object({
  isExistingCustomer: z.enum(['نعم', 'لا', '']).optional(),
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z
    .string()
    .transform(v => v.replace(/\s/g, ''))
    .pipe(z.string().regex(algerianPhoneRegex, 'رقم الهاتف غير صالح — يجب أن يبدأ بـ 05 أو 06 أو 07')),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  preferredContactTime: z.string().optional(),
  wilaya: z.string().min(1, 'اختر الولاية'),
  monthlyIncomeRange: z.string().optional(),
  salaryReceiveMethod: z.enum(['CCP', 'بنك'], { errorMap: () => ({ message: 'اختر طريقة استلام الراتب' }) }),
  profession: z.string().min(1, 'اختر المهنة'),
  customProfession: z.string().optional(),
  financingType: z.string().min(1, 'اختر نوع التمويل'),
  requestedAmount: z
    .number()
    .min(5_000_000, 'الحد الأدنى للمبلغ هو 5,000,000 د.ج')
    .max(20_000_000, 'الحد الأقصى للمبلغ هو 20,000,000 د.ج'),
  notes: z.string().optional(),
  banking: bankingInfoSchema.optional().nullable(),
})

// ── Formatting Helpers ───────────────────────────────────────────────────────

/** Format CCP number with space after digit 8: "12345678 90" */
export function formatCCPNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 8) return digits
  return `${digits.slice(0, 8)} ${digits.slice(8)}`
}

/** Format RIB as groups of 4: "1234 5678 9012 3456 7890" */
export function formatRIB(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 20)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/** Compute full CCP display number: "12345678 90 / 12" */
export function computeCCPFullNumber(ccpNumber: string, ccpKey: string): string {
  const clean = ccpNumber.replace(/\D/g, '')
  return `${clean} / ${ccpKey}`
}

/** Mask CCP number: show first 4 and last 2 → "1234****90" */
export function maskCCPNumber(ccpNumber: string): string {
  const clean = ccpNumber.replace(/\D/g, '')
  if (clean.length < 6) return '****'
  return `${clean.slice(0, 4)}****${clean.slice(-2)}`
}

/** Mask bank account: show first 4 and last 4 → "1234************7890" */
export function maskBankAccount(rib: string): string {
  const clean = rib.replace(/\D/g, '')
  if (clean.length < 8) return '****'
  const masked = '*'.repeat(clean.length - 8)
  return `${clean.slice(0, 4)}${masked}${clean.slice(-4)}`
}

'use client'

import React, { useState, useEffect, useRef, useMemo, startTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Phone, Mail, MapPin, DollarSign, FileText,
  CheckCircle2, ArrowRight, ArrowLeft, XCircle, AlertCircle,
  Cloud, CloudOff, Loader2, Building2
} from 'lucide-react'
import { Button, ProgressBar, Textarea, AmountSlider } from '@/components/ui'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import StepIndicator from '@/components/ui/StepIndicator'
import { FormData, FORM_STEPS, INITIAL_FORM_DATA, WILAYAS, CONTACT_TIMES, INCOME_RANGES, FINANCING_TYPES, PROFESSIONS, ALGERIAN_BANKS, BankingInfo } from '@/types'
import { bankingInfoSchema, formatCCPNumber, formatRIB, computeCCPFullNumber, maskCCPNumber, maskBankAccount } from '@/lib/validators'
import { saveSubmission, saveDraft, getDraft, clearDraft, validatePhone, validateEmail, formatCurrency } from '@/lib/utils'
import {
  saveSubmissionToIndexedDB,
  saveDraftToIndexedDB,
  getDraftFromIndexedDB,
  clearDraftFromIndexedDB,
  initAutoSync,
  syncPendingSubmissions
} from '@/lib/indexedDBService'
import confetti from 'canvas-confetti'
import { useToast } from '@/components/ui/Toast'

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MIN_LOAN_AMOUNT = 5_000_000
const MAX_LOAN_AMOUNT = 20_000_000
const LOAN_STEP = 500_000
const INDEXEDDB_DEBOUNCE_MS = 750
const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com']

const validateLoanAmount = (amount: number, isCustom = false): { valid: boolean; error?: string } => {
  if (!amount || isNaN(amount)) {
    return { valid: false, error: 'المبلغ المطلوب مطلوب' }
  }
  if (amount < MIN_LOAN_AMOUNT) {
    return { valid: false, error: `المبلغ الأدنى المسموح به هو ${MIN_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج` }
  }
  // No upper limit when user has explicitly typed a custom amount
  if (!isCustom && amount > MAX_LOAN_AMOUNT) {
    return { valid: false, error: `المبلغ الأقصى المسموح به هو ${MAX_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج` }
  }
  return { valid: true }
}

const formatPhoneDisplay = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
}

const CleanForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isCustomAmount, setIsCustomAmount] = useState(false)
  const [amountValidation, setAmountValidation] = useState<{ valid: boolean; error?: string }>({ valid: true })
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle')
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)
  const [bankingErrors, setBankingErrors] = useState<Record<string, string>>({})
  const [ccpNumber, setCcpNumber] = useState('')
  const [ccpKey, setCcpKey] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAgencyCode, setBankAgencyCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CCP' | 'بنك' | ''>('')
  const toast = useToast()

  useEffect(() => {
    setIsOnline(navigator.onLine)
    setSyncStatus(navigator.onLine ? 'idle' : 'offline')

    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('syncing')
      syncPendingSubmissions().then(() => {
        setSyncStatus('synced')
        setTimeout(() => setSyncStatus('idle'), 2000)
      })
    }
    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    initAutoSync()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const savedStep = sessionStorage.getItem('tikcredit_current_step')
    if (savedStep) {
      const step = parseInt(savedStep, 10)
      if (step >= 1 && step <= 4) setCurrentStep(step)
    }
  }, [])

  const indexedDBTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isSuccess) {
      saveDraft(formData)

      if (indexedDBTimeoutRef.current) {
        clearTimeout(indexedDBTimeoutRef.current)
      }

      indexedDBTimeoutRef.current = setTimeout(() => {
        startTransition(() => {
          saveDraftToIndexedDB(formData).catch(() => {})
        })
      }, INDEXEDDB_DEBOUNCE_MS)
    }

    return () => {
      if (indexedDBTimeoutRef.current) {
        clearTimeout(indexedDBTimeoutRef.current)
      }
    }
  }, [formData, isSuccess])

  // Sync paymentMethod with salaryReceiveMethod
  useEffect(() => {
    if (paymentMethod) {
      setFormData(prev => ({ ...prev, salaryReceiveMethod: paymentMethod }))
    }
  }, [paymentMethod])

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (step === 1) {
      if (!formData.fullName.trim() || formData.fullName.length < 3) {
        newErrors.fullName = 'الاسم يجب أن يكون 3 أحرف على الأقل'
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'رقم الهاتف مطلوب'
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'رقم الهاتف غير صحيح (05/06/07 + 8 أرقام)'
      }
      if (formData.email && !validateEmail(formData.email)) {
        newErrors.email = 'البريد الإلكتروني غير صحيح'
      }
    }

    if (step === 2) {
      if (!formData.wilaya) {
        newErrors.wilaya = 'الولاية مطلوبة'
      }
      if (!formData.profession) {
        newErrors.profession = 'طبيعة العمل مطلوبة'
      }
      if (formData.profession === 'أخرى (حدد)' && !formData.customProfession?.trim()) {
        newErrors.customProfession = 'يرجى تحديد طبيعة عملك'
      }
      if (!formData.financingType) {
        newErrors.financingType = 'نوع التمويل مطلوب'
      }
      const amountCheck = validateLoanAmount(formData.requestedAmount, isCustomAmount)
      if (!amountCheck.valid) {
        newErrors.requestedAmount = amountCheck.error
      }
    }

    if (step === 3) {
      const newBankingErrors: Record<string, string> = {}

      if (!paymentMethod) {
        newErrors.salaryReceiveMethod = 'يرجى اختيار طريقة الاستلام'
        setErrors(newErrors)
        return false
      }

      if (paymentMethod === 'CCP') {
        const result = bankingInfoSchema.safeParse({
          paymentMethod: 'CCP',
          ccpNumber: ccpNumber.replace(/\s/g, ''),
          ccpKey: ccpKey.replace(/\s/g, ''),
        })
        if (!result.success) {
          for (const err of result.error.errors) {
            const field = err.path[0] as string
            newBankingErrors[field] = err.message
          }
        }
      } else if (paymentMethod === 'بنك') {
        const result = bankingInfoSchema.safeParse({
          paymentMethod: 'بنك',
          bankName,
          bankAccountNumber: bankAccountNumber.replace(/\s/g, ''),
          bankAgencyCode: bankAgencyCode || undefined,
        })
        if (!result.success) {
          for (const err of result.error.errors) {
            const field = err.path[0] as string
            newBankingErrors[field] = err.message
          }
        }
      }

      setBankingErrors(newBankingErrors)
      if (Object.keys(newBankingErrors).length > 0) {
        setErrors(newErrors)
        return false
      }

      // Assemble banking info
      if (paymentMethod === 'CCP') {
        const cleanCcp = ccpNumber.replace(/\s/g, '')
        const cleanKey = ccpKey.replace(/\s/g, '')
        setFormData(prev => ({
          ...prev,
          salaryReceiveMethod: 'CCP',
          banking: {
            paymentMethod: 'CCP',
            ccpNumber: cleanCcp,
            ccpKey: cleanKey,
            ccpFullNumber: computeCCPFullNumber(cleanCcp, cleanKey),
          }
        }))
      } else {
        const cleanRib = bankAccountNumber.replace(/\s/g, '')
        setFormData(prev => ({
          ...prev,
          salaryReceiveMethod: 'بنك',
          banking: {
            paymentMethod: 'بنك',
            bankName,
            bankAccountNumber: cleanRib,
            bankAgencyCode: bankAgencyCode || '',
          }
        }))
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const newStep = Math.min(currentStep + 1, FORM_STEPS.length)
      setCurrentStep(newStep)
      sessionStorage.setItem('tikcredit_current_step', String(newStep))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    const newStep = Math.max(currentStep - 1, 1)
    setCurrentStep(newStep)
    sessionStorage.setItem('tikcredit_current_step', String(newStep))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.warning('يرجى إكمال الحقول المطلوبة قبل المتابعة')
      return
    }

    const finalAmountValidation = validateLoanAmount(formData.requestedAmount, isCustomAmount)
    if (!finalAmountValidation.valid) {
      setErrors(prev => ({ ...prev, requestedAmount: finalAmountValidation.error }))
      setCurrentStep(2)
      sessionStorage.setItem('tikcredit_current_step', '2')
      toast.warning(finalAmountValidation.error || 'يرجى تصحيح المبلغ المطلوب قبل الإرسال')
      return
    }

    setIsSubmitting(true)
    setSyncStatus('syncing')

    try {
      try {
        await saveSubmissionToIndexedDB(formData)
      } catch {}

      const response = await fetch('/api/submissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()

      if (response.ok) {
        saveSubmission(formData)
        clearDraft()
        try { await clearDraftFromIndexedDB() } catch {}

        setIsSuccess(true)
        setSyncStatus('synced')
        sessionStorage.removeItem('tikcredit_current_step')

        const persisted = responseData.persisted as 'server' | 'local' | undefined

        if (persisted === 'local') {
          toast.info('تم حفظ طلبك محلياً. سيتم المزامنة تلقائياً عند توفر الاتصال.', 5000)
        } else {
          toast.success('تم استلام طلبك بنجاح! سنتصل بك قريباً.', 5000)
        }

        const duration = 3000
        const animationEnd = Date.now() + duration
        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now()
          if (timeLeft <= 0) return clearInterval(interval)
          confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#1E3A8A', '#D4AF37', '#3B82F6'] })
          confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#1E3A8A', '#D4AF37', '#3B82F6'] })
        }, 250)
      } else {
        const errorMessage = responseData.message || responseData.error || 'فشل إرسال الطلب'
        const errorDetails = responseData.errors || []
        if (errorDetails.length > 0) {
          toast.error(`يرجى تصحيح الأخطاء التالية:\n${errorDetails.join('\n')}`, 7000)
        } else {
          toast.error(`حدث خطأ: ${errorMessage}`, 7000)
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الطلب'
      if (!navigator.onLine) {
        setSyncStatus('offline')
        toast.warning('الاتصال غير متوفر. تم حفظ بياناتك محلياً، وسنحاول الإرسال تلقائياً عند عودة الاتصال.', 7000)
        setIsSuccess(true)
        sessionStorage.removeItem('tikcredit_current_step')
        clearDraft()
        try { await clearDraftFromIndexedDB() } catch {}
      } else {
        setSyncStatus('idle')
        toast.error(`تعذر الاتصال بالخادم: ${errorMessage}`, 7000)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'requestedAmount') {
      const validation = validateLoanAmount(value as number, isCustomAmount)
      setAmountValidation(validation)
      if (validation.valid) {
        setErrors(prev => { const n = { ...prev }; delete n.requestedAmount; return n })
      } else {
        setErrors(prev => ({ ...prev, requestedAmount: validation.error }))
      }
    } else if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 px-6"
      >
        <motion.div
          className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center shadow-luxury-xl"
          style={{ background: 'linear-gradient(135deg, #059669, #2563EB)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <CheckCircle2 className="w-16 h-16 text-white" />
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-4 text-lux-navy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          تم إرسال طلبك بنجاح!
        </motion.h2>

        <motion.p
          className="text-xl text-lux-slate mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          شكراً لك! سنتصل بك قريباً لتأكيد تفاصيل طلبك
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button
            size="lg"
            className="premium-button"
            onClick={() => window.location.href = '/'}
          >
            العودة للصفحة الرئيسية
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <StepIndicator steps={FORM_STEPS} currentStep={currentStep} className="mb-8" />
      <ProgressBar progress={currentStep} total={FORM_STEPS.length} className="mb-8" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="luxury-card p-4 sm:p-6 md:p-10 shadow-luxury-xl"
        >
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-lux-navy mb-3">
              {FORM_STEPS[currentStep - 1].title}
            </h2>
            <p className="text-lg text-lux-slate">
              {FORM_STEPS[currentStep - 1].description}
            </p>
            <div className="w-16 h-[3px] mt-3 rounded-full bg-gradient-to-r from-lux-sapphire to-elegant-blue" />
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.label
                  className={`flex items-center gap-3 p-5 rounded-xl cursor-pointer transition-all duration-300 border-2
                    ${formData.isExistingCustomer === 'نعم'
                      ? 'border-elegant-blue bg-elegant-blue-50 shadow-premium'
                      : 'border-lux-silver hover:border-elegant-blue/40 bg-white'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateField('isExistingCustomer', 'نعم')}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${formData.isExistingCustomer === 'نعم' ? 'border-elegant-blue bg-elegant-blue' : 'border-lux-slate'}`}>
                    {formData.isExistingCustomer === 'نعم' && (
                      <motion.div className="w-3 h-3 bg-white rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} />
                    )}
                  </div>
                  <span className="text-lux-navy font-medium">نعم، أنا عميل موجود</span>
                </motion.label>

                <motion.label
                  className={`flex items-center gap-3 p-5 rounded-xl cursor-pointer transition-all duration-300 border-2
                    ${formData.isExistingCustomer === 'لا'
                      ? 'border-elegant-blue bg-elegant-blue-50 shadow-premium'
                      : 'border-lux-silver hover:border-elegant-blue/40 bg-white'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateField('isExistingCustomer', 'لا')}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${formData.isExistingCustomer === 'لا' ? 'border-elegant-blue bg-elegant-blue' : 'border-lux-slate'}`}>
                    {formData.isExistingCustomer === 'لا' && (
                      <motion.div className="w-3 h-3 bg-white rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} />
                    )}
                  </div>
                  <span className="text-lux-navy font-medium">لا، عميل جديد</span>
                </motion.label>
              </div>

              <FloatingLabelInput
                label="الاسم الكامل *"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                error={errors.fullName}
                icon={<User className="w-5 h-5" />}
              />

              <FloatingLabelInput
                label="رقم الهاتف *"
                type="tel"
                value={formatPhoneDisplay(formData.phone)}
                onChange={(e) => {
                  const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 10)
                  updateField('phone', rawDigits)
                }}
                error={errors.phone}
                placeholder="05XX XX XX XX"
                icon={<Phone className="w-5 h-5" />}
              />

              <div className="relative">
                <FloatingLabelInput
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    updateField('email', e.target.value)
                    const value = e.target.value
                    if (value.includes('@') && !value.includes('.', value.indexOf('@'))) {
                      setShowEmailSuggestions(true)
                    } else {
                      setShowEmailSuggestions(false)
                    }
                  }}
                  onFocus={() => {
                    if (formData.email.includes('@') && !formData.email.includes('.', formData.email.indexOf('@'))) {
                      setShowEmailSuggestions(true)
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowEmailSuggestions(false), 200)
                  }}
                  error={errors.email}
                  icon={<Mail className="w-5 h-5" />}
                />
                <AnimatePresence>
                  {showEmailSuggestions && formData.email.includes('@') && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-1 bg-white rounded-xl border-2 border-lux-azure/20 shadow-luxury-lg overflow-hidden"
                    >
                      {EMAIL_DOMAINS.map((domain) => {
                        const emailPrefix = formData.email.split('@')[0]
                        const suggestion = `${emailPrefix}@${domain}`
                        return (
                          <motion.button
                            key={domain}
                            type="button"
                            onClick={() => {
                              updateField('email', suggestion)
                              setShowEmailSuggestions(false)
                            }}
                            className="w-full px-4 py-3 text-right hover:bg-lux-mist transition-colors flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                            whileHover={{ backgroundColor: 'rgba(37, 99, 235, 0.05)' }}
                          >
                            <Mail className="w-4 h-4 text-lux-azure" />
                            <span className="text-lux-navy">{suggestion}</span>
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-sm font-semibold text-lux-navy mb-2">
                  وقت التواصل المفضل
                </label>
                <select
                  value={formData.preferredContactTime}
                  onChange={(e) => updateField('preferredContactTime', e.target.value)}
                  className="w-full px-4 py-4 bg-white border-2 border-lux-silver rounded-xl text-lux-navy focus:outline-none focus:border-elegant-blue focus:ring-2 focus:ring-elegant-blue/15 transition-all"
                >
                  <option value="">اختر الوقت</option>
                  {CONTACT_TIMES.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Loan Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-lux-navy mb-2">
                  الولاية *
                </label>
                <select
                  value={formData.wilaya}
                  onChange={(e) => updateField('wilaya', e.target.value)}
                  className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-lux-navy focus:outline-none focus:border-elegant-blue focus:ring-2 focus:ring-elegant-blue/15 transition-all
                    ${errors.wilaya ? 'border-status-error' : 'border-lux-silver'}`}
                >
                  <option value="">اختر الولاية</option>
                  {WILAYAS.map(wilaya => (
                    <option key={wilaya} value={wilaya}>{wilaya}</option>
                  ))}
                </select>
                {errors.wilaya && <p className="mt-1 text-sm text-status-error">{errors.wilaya}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-lux-navy mb-2">
                    نطاق الدخل الشهري
                  </label>
                  <select
                    value={formData.monthlyIncomeRange}
                    onChange={(e) => updateField('monthlyIncomeRange', e.target.value)}
                    className="w-full px-4 py-4 bg-white border-2 border-lux-silver rounded-xl text-lux-navy focus:outline-none focus:border-elegant-blue focus:ring-2 focus:ring-elegant-blue/15 transition-all"
                  >
                    <option value="">اختر النطاق</option>
                    {INCOME_RANGES.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-lux-navy mb-2">
                    طبيعة العمل/المهنة *
                  </label>
                  <select
                    value={formData.profession}
                    onChange={(e) => {
                      updateField('profession', e.target.value)
                      if (e.target.value !== 'أخرى (حدد)') {
                        updateField('customProfession', '')
                      }
                    }}
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-lux-navy focus:outline-none focus:border-elegant-blue focus:ring-2 focus:ring-elegant-blue/15 transition-all
                      ${errors.profession ? 'border-status-error' : 'border-lux-silver'}`}
                  >
                    <option value="">اختر المهنة</option>
                    {PROFESSIONS.map(prof => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
                  </select>
                  {errors.profession && <p className="mt-1 text-sm text-status-error">{errors.profession}</p>}
                </div>
              </div>

              {formData.profession === 'أخرى (حدد)' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <FloatingLabelInput
                    label="حدد طبيعة عملك"
                    value={formData.customProfession || ''}
                    onChange={(e) => updateField('customProfession', e.target.value)}
                    placeholder="اكتب طبيعة عملك هنا..."
                    error={errors.customProfession}
                  />
                </motion.div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-lux-navy">
                  نوع التمويل *
                </label>
                {FINANCING_TYPES.map((type) => (
                  <motion.label
                    key={type}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${formData.financingType === type
                        ? 'border-elegant-blue bg-elegant-blue-50 shadow-premium'
                        : 'border-lux-silver hover:border-elegant-blue/40 bg-white'}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => updateField('financingType', type)}
                  >
                    <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center
                      ${formData.financingType === type ? 'border-elegant-blue' : 'border-lux-slate'}`}>
                      {formData.financingType === type && (
                        <motion.div className="w-2.5 h-2.5 bg-elegant-blue rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} />
                      )}
                    </div>
                    <span className="text-lux-navy font-medium">{type}</span>
                  </motion.label>
                ))}
                {errors.financingType && <p className="mt-1 text-sm text-status-error">{errors.financingType}</p>}
              </div>

              <div className="mt-6">
                <AmountSlider
                  min={MIN_LOAN_AMOUNT}
                  max={MAX_LOAN_AMOUNT}
                  step={LOAN_STEP}
                  value={formData.requestedAmount}
                  onChange={(value) => updateField('requestedAmount', value)}
                  onCustomModeChange={(isCustom) => setIsCustomAmount(isCustom)}
                  error={errors.requestedAmount}
                  showTooltip={true}
                />
              </div>
            </div>
          )}

          {/* ============================================
              STEP 3: معلومات الدفع — Payment Step
              ============================================ */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fadeSlideUp" dir="rtl">

              {/* Header — Refined with theme-matched design */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 bg-gradient-to-br from-lux-sapphire to-elegant-blue"
                  style={{ boxShadow: '0 8px 24px rgba(30,58,138,0.25)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                    <path d="M1 10h22"/>
                    <path d="M6 15h4"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-black mb-2 text-lux-navy">معلومات الحساب البنكي أو البريدي</h2>
                <p className="text-sm text-lux-slate font-medium">أين تستلم راتبك الشهري؟</p>
                <div className="w-16 h-[3px] mx-auto mt-4 rounded-full bg-gradient-to-r from-lux-sapphire to-elegant-blue" />
              </div>

              {/* Payment Method Selector — Unified theme */}
              <div>
                <label className="block text-sm font-bold text-lux-navy mb-4 text-right">
                  طريقة الاستلام <span className="text-status-error">*</span>
                </label>
                {errors.salaryReceiveMethod && <p className="mb-2 text-sm text-status-error">{errors.salaryReceiveMethod}</p>}
                <div className="grid grid-cols-2 gap-4">
                  {/* CCP Option */}
                  <motion.button type="button" onClick={() => setPaymentMethod('CCP')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${
                      paymentMethod === 'CCP'
                        ? 'border-premium-gold bg-gradient-to-br from-premium-gold-50 to-white shadow-lg'
                        : 'border-lux-silver bg-white hover:border-premium-gold/40 hover:shadow-md'
                    }`}
                    style={paymentMethod === 'CCP' ? { boxShadow: '0 4px 20px rgba(212,175,55,0.15)' } : {}}>
                    {paymentMethod === 'CCP' && (
                      <div className="absolute top-3 left-3 w-5 h-5 bg-premium-gold rounded-full flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br from-premium-gold to-premium-gold-dark"
                      style={{ boxShadow: '0 4px 12px rgba(212,175,55,0.3)' }}>
                      <span className="text-white font-black text-sm tracking-tight" style={{ fontFamily: 'var(--font-sans)' }}>CCP</span>
                    </div>
                    <span className="font-bold text-lux-navy text-sm">بريد الجزائر</span>
                    <span className="text-xs text-lux-slate mt-0.5">Algérie Poste</span>
                  </motion.button>

                  {/* Bank Option */}
                  <motion.button type="button" onClick={() => setPaymentMethod('بنك')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${
                      paymentMethod === 'بنك'
                        ? 'border-elegant-blue bg-gradient-to-br from-elegant-blue-50 to-white shadow-lg'
                        : 'border-lux-silver bg-white hover:border-elegant-blue/40 hover:shadow-md'
                    }`}
                    style={paymentMethod === 'بنك' ? { boxShadow: '0 4px 20px rgba(37,99,235,0.15)' } : {}}>
                    {paymentMethod === 'بنك' && (
                      <div className="absolute top-3 left-3 w-5 h-5 bg-elegant-blue rounded-full flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br from-lux-sapphire to-elegant-blue"
                      style={{ boxShadow: '0 4px 12px rgba(30,58,138,0.25)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11"/>
                      </svg>
                    </div>
                    <span className="font-bold text-lux-navy text-sm">حساب بنكي</span>
                    <span className="text-xs text-lux-slate mt-0.5">Compte Bancaire</span>
                  </motion.button>
                </div>
              </div>

              {/* ===== CCP FIELDS — Theme-matched ===== */}
              {paymentMethod === 'CCP' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="p-6 rounded-2xl border border-premium-gold/20 space-y-6 bg-gradient-to-br from-premium-gold-50/50 via-white to-lux-pearl">

                  <div className="flex items-center gap-3 pb-4 border-b border-premium-gold/15">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-premium-gold to-premium-gold-dark"
                      style={{ boxShadow: '0 2px 8px rgba(212,175,55,0.25)' }}>
                      <span className="text-white font-black text-[10px] tracking-tight" style={{ fontFamily: 'var(--font-sans)' }}>CCP</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-lux-navy">معلومات حساب بريد الجزائر (CCP)</h3>
                      <p className="text-xs text-lux-slate">Algérie Poste — Compte Chèque Postal</p>
                    </div>
                  </div>

                  {/* CCP Number */}
                  <div>
                    <label className="block text-sm font-bold text-lux-navy mb-2 text-right">
                      رقم الحساب البريدي <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={ccpNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setCcpNumber(raw)
                        if (bankingErrors.ccpNumber) {
                          setBankingErrors(prev => { const n = { ...prev }; delete n.ccpNumber; return n })
                        }
                      }}
                      placeholder="0000000000"
                      maxLength={10}
                      inputMode="numeric"
                      dir="ltr"
                      className="w-full px-4 py-4 bg-white border-2 border-premium-gold/30 rounded-xl text-center font-mono font-bold text-xl tracking-[0.3em] outline-none transition-all duration-200 focus:border-premium-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
                      style={{ color: '#1E3A8A' }}
                    />
                    {bankingErrors.ccpNumber && <p className="mt-1 text-sm text-status-error">{bankingErrors.ccpNumber}</p>}

                    {/* Digit visualizer */}
                    <div className="flex gap-1.5 justify-center mt-3" dir="ltr">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className={`w-8 h-9 border-2 rounded-lg flex items-center justify-center text-sm font-bold font-mono transition-all duration-200 ${
                          ccpNumber[i]
                            ? 'border-premium-gold/50 bg-premium-gold-50 text-lux-navy'
                            : 'border-lux-silver bg-lux-pearl text-lux-slate'
                        }`}>
                          {ccpNumber[i] || '·'}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-lux-slate text-right mt-2">
                      10 أرقام بدون مسافات — كما هو مكتوب على بطاقة بريد الجزائر
                    </p>
                  </div>

                  {/* CCP Key */}
                  <div>
                    <label className="block text-sm font-bold text-lux-navy mb-2 text-right">
                      مفتاح الحساب (Clé) <span className="text-status-error">*</span>
                    </label>
                    <div className="flex justify-end gap-3">
                      <div className="w-40">
                        <input
                          type="text"
                          value={ccpKey}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
                            setCcpKey(raw)
                            if (bankingErrors.ccpKey) {
                              setBankingErrors(prev => { const n = { ...prev }; delete n.ccpKey; return n })
                            }
                          }}
                          placeholder="00"
                          maxLength={2}
                          inputMode="numeric"
                          dir="ltr"
                          className="w-full px-4 py-4 bg-white border-2 border-premium-gold/30 rounded-xl text-center font-mono font-bold text-2xl tracking-[0.5em] outline-none transition-all duration-200 focus:border-premium-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
                          style={{ color: '#1E3A8A' }}
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className={`w-12 h-12 border-2 rounded-xl flex items-center justify-center text-xl font-bold font-mono transition-all duration-200 ${
                            ccpKey[i]
                              ? 'border-premium-gold/50 bg-premium-gold-50 text-lux-navy'
                              : 'border-lux-silver bg-lux-pearl text-lux-slate'
                          }`}>
                            {ccpKey[i] || '·'}
                          </div>
                        ))}
                      </div>
                    </div>
                    {bankingErrors.ccpKey && <p className="mt-1 text-sm text-status-error">{bankingErrors.ccpKey}</p>}
                    <p className="text-xs text-lux-slate text-right mt-2">
                      الرقمان الأخيران المطبوعان على بطاقة بريد الجزائر
                    </p>
                  </div>

                  {/* CCP Full Number Preview */}
                  {ccpNumber.length >= 8 && ccpKey.length === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="p-3.5 rounded-xl bg-white border border-premium-gold/15">
                      <p className="text-sm font-medium text-lux-navy">
                        رقم CCP الكامل: <span className="font-bold text-lux-sapphire" dir="ltr">{computeCCPFullNumber(ccpNumber, ccpKey)}</span>
                      </p>
                    </motion.div>
                  )}

                  {/* Security badge */}
                  <div className="p-4 bg-gradient-to-br from-status-success/[0.06] via-white to-status-success-light/[0.04] rounded-xl border border-status-success/15">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-status-success to-status-success-light"
                        style={{ boxShadow: '0 2px 8px rgba(5,150,105,0.2)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-lux-navy leading-relaxed mb-1">نستخدم هذه المعلومات فقط للتحقق من هويتك وتسريع دراسة ملف التمويل.</p>
                        <p className="text-xs text-status-success font-semibold">بياناتك محمية بتشفير SSL-256 — لن نشارك معلوماتك أبداً مع أي طرف ثالث.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== BANK FIELDS — Theme-matched ===== */}
              {paymentMethod === 'بنك' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="p-6 rounded-2xl border border-elegant-blue/15 space-y-6 bg-gradient-to-br from-elegant-blue-50/50 via-white to-lux-pearl">

                  <div className="flex items-center gap-3 pb-4 border-b border-elegant-blue/10">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-lux-sapphire to-elegant-blue"
                      style={{ boxShadow: '0 2px 8px rgba(30,58,138,0.2)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-lux-navy">معلومات الحساب البنكي</h3>
                      <p className="text-xs text-lux-slate">Compte Bancaire Algérien</p>
                    </div>
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-bold text-lux-navy mb-2 text-right">
                      اسم البنك <span className="text-status-error">*</span>
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => {
                        setBankName(e.target.value)
                        if (bankingErrors.bankName) {
                          setBankingErrors(prev => { const n = { ...prev }; delete n.bankName; return n })
                        }
                      }}
                      className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-lux-navy focus:outline-none focus:border-elegant-blue focus:ring-2 focus:ring-elegant-blue/15 transition-all
                        ${bankingErrors.bankName ? 'border-status-error' : 'border-elegant-blue/25'}`}
                      dir="rtl">
                      <option value="">-- اختر البنك --</option>
                      <optgroup label="البنوك العمومية">
                        <option value="BNA">البنك الوطني الجزائري — BNA</option>
                        <option value="BEA">بنك الجزائر الخارجي — BEA</option>
                        <option value="CPA">القرض الشعبي الجزائري — CPA</option>
                        <option value="BADR">بنك الفلاحة والتنمية الريفية — BADR</option>
                        <option value="BDL">بنك التنمية المحلية — BDL</option>
                        <option value="CNEP">صندوق التوفير والاحتياط — CNEP</option>
                      </optgroup>
                      <optgroup label="البنوك الخاصة">
                        <option value="AGB">الخليج الجزائر — AGB</option>
                        <option value="ABC">العربي الجزائر للتجارة — ABC</option>
                        <option value="ALBARAKA">بنك البركة — Al Baraka</option>
                        <option value="SGA">سوسيتيه جنرال — Société Générale</option>
                        <option value="BNP">بي إن بي باريبا — BNP Paribas</option>
                        <option value="HSBC">HSBC الجزائر — HSBC</option>
                        <option value="TRUST">تراست بنك — Trust Bank</option>
                        <option value="NATIXIS">ناتيكسيس — Natixis</option>
                        <option value="CIB">بنك التجارة والصناعة — CIB</option>
                        <option value="OTHER">بنك آخر</option>
                      </optgroup>
                    </select>
                    {bankingErrors.bankName && <p className="mt-1 text-sm text-status-error">{bankingErrors.bankName}</p>}
                  </div>

                  {/* Bank Account Number (RIB) */}
                  <div>
                    <label className="block text-sm font-bold text-lux-navy mb-2 text-right">
                      رقم الحساب البنكي (RIB) <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 20)
                        setBankAccountNumber(raw)
                        if (bankingErrors.bankAccountNumber) {
                          setBankingErrors(prev => { const n = { ...prev }; delete n.bankAccountNumber; return n })
                        }
                      }}
                      placeholder="00000000000000000000"
                      maxLength={20}
                      inputMode="numeric"
                      dir="ltr"
                      className="w-full px-4 py-4 bg-white border-2 border-elegant-blue/25 rounded-xl text-center font-mono font-bold text-base tracking-[0.15em] outline-none transition-all duration-200 focus:border-elegant-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                      style={{ color: '#1E3A8A' }}
                    />
                    {bankingErrors.bankAccountNumber && <p className="mt-1 text-sm text-status-error">{bankingErrors.bankAccountNumber}</p>}

                    {/* RIB segments */}
                    {bankAccountNumber.length > 0 && (
                      <div className="flex gap-2 justify-center mt-3 flex-wrap" dir="ltr">
                        {[
                          { label: 'Banque', start: 0, len: 3, color: 'bg-elegant-blue-50 border-elegant-blue/20 text-lux-sapphire' },
                          { label: 'Agence', start: 3, len: 5, color: 'bg-elegant-blue-50 border-elegant-blue/15 text-elegant-blue' },
                          { label: 'Compte', start: 8, len: 10, color: 'bg-lux-pearl border-lux-silver text-lux-navy' },
                          { label: 'Clé', start: 18, len: 2, color: 'bg-premium-gold-50 border-premium-gold/20 text-premium-gold-dark' },
                        ].map((seg) => (
                          <div key={seg.label} className="text-center">
                            <div className={`px-2 py-2 border-2 rounded-lg font-mono font-bold text-sm ${seg.color}`}
                              style={{ minWidth: `${Math.max(seg.len * 13, 32)}px` }}>
                              {bankAccountNumber.slice(seg.start, seg.start + seg.len) || '·'.repeat(seg.len)}
                            </div>
                            <div className="text-[10px] text-lux-slate mt-1 font-medium">{seg.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-lux-slate font-mono">{bankAccountNumber.length}/20</span>
                      <p className="text-xs text-lux-slate">
                        رقم التعريف البنكي (RIB) — 20 رقم
                      </p>
                    </div>
                  </div>

                  {/* Agency Code (optional) */}
                  <div>
                    <label className="block text-sm font-bold text-lux-navy mb-2 text-right">
                      كود الوكالة (اختياري)
                    </label>
                    <input
                      type="text"
                      value={bankAgencyCode}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 5)
                        setBankAgencyCode(raw)
                      }}
                      placeholder="000"
                      maxLength={5}
                      inputMode="numeric"
                      dir="ltr"
                      className="w-full px-4 py-4 bg-white border-2 border-elegant-blue/15 rounded-xl text-center font-mono font-bold outline-none transition-all duration-200 focus:border-elegant-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                      style={{ color: '#1E3A8A' }}
                    />
                    <p className="text-xs text-lux-slate text-right mt-1">اختياري — يُوجد على كشف حسابك البنكي</p>
                  </div>

                  {/* Security badge */}
                  <div className="p-4 bg-gradient-to-br from-status-success/[0.06] via-white to-status-success-light/[0.04] rounded-xl border border-status-success/15">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-status-success to-status-success-light"
                        style={{ boxShadow: '0 2px 8px rgba(5,150,105,0.2)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-lux-navy leading-relaxed mb-1">نستخدم هذه المعلومات فقط للتحقق من هويتك وتسريع دراسة ملف التمويل.</p>
                        <p className="text-xs text-status-success font-semibold">بياناتك محمية بتشفير SSL-256 — لن نشارك معلوماتك أبداً مع أي طرف ثالث.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Empty state — theme-matched */}
              {!paymentMethod && (
                <div className="p-8 bg-lux-pearl/50 border-2 border-dashed border-lux-silver rounded-2xl text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-lux-silver/30 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                      <path d="M1 10h22"/>
                    </svg>
                  </div>
                  <p className="text-sm text-lux-slate font-medium">اختر طريقة الاستلام أعلاه لإدخال تفاصيل حسابك</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review and Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-lux-pearl rounded-2xl p-6 space-y-4 border border-lux-silver shadow-sm">
                <h3 className="text-2xl font-bold text-lux-navy mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  ملخص طلبك
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-lux-slate mb-1 font-medium">الاسم الكامل</p>
                    <p className="text-lux-navy font-bold">{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-lux-slate mb-1 font-medium">رقم الهاتف</p>
                    <p className="text-lux-navy font-bold">{formatPhoneDisplay(formData.phone)}</p>
                  </div>
                  {formData.email && (
                    <div>
                      <p className="text-sm text-lux-slate mb-1 font-medium">البريد الإلكتروني</p>
                      <p className="text-lux-navy font-bold">{formData.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-lux-slate mb-1 font-medium">الولاية</p>
                    <p className="text-lux-navy font-bold">{formData.wilaya}</p>
                  </div>
                  <div>
                    <p className="text-sm text-lux-slate mb-1 font-medium">طبيعة العمل/المهنة</p>
                    <p className="text-lux-navy font-bold">
                      {formData.profession === 'أخرى (حدد)' && formData.customProfession
                        ? formData.customProfession
                        : formData.profession}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-lux-slate mb-1 font-medium">نوع التمويل</p>
                    <p className="text-lux-navy font-bold">{formData.financingType}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-lux-slate mb-1">المبلغ المطلوب</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-lux-sapphire to-lux-champagne bg-clip-text text-transparent">
                      {formatCurrency(formData.requestedAmount)}
                    </p>
                  </div>
                </div>

                {/* Banking Info Summary */}
                {formData.banking && (
                  <div className="mt-4 pt-4 border-t border-lux-silver">
                    <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-lux-navy">
                      {formData.banking.paymentMethod === 'CCP' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8941F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M1 10h22"/>
                        </svg>
                      ) : (
                        <Building2 className="w-5 h-5 text-elegant-blue" />
                      )}
                      معلومات الحساب البنكي أو البريدي
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-lux-slate mb-1 font-medium">طريقة الدفع</p>
                        <p className="text-lux-navy font-bold">
                          {formData.banking.paymentMethod === 'CCP' ? 'حساب بريد الجزائر (CCP)' : 'حساب بنكي'}
                        </p>
                      </div>
                      {formData.banking.paymentMethod === 'CCP' && (
                        <div>
                          <p className="text-sm text-lux-slate mb-1 font-medium">رقم CCP</p>
                          <p className="text-lux-navy font-bold" dir="ltr">
                            {maskCCPNumber(formData.banking.ccpNumber)} / {formData.banking.ccpKey}
                          </p>
                        </div>
                      )}
                      {formData.banking.paymentMethod === 'بنك' && (() => {
                        const bankInfo = formData.banking as { paymentMethod: 'بنك'; bankName: string; bankAccountNumber: string; bankAgencyCode: string }
                        const bankLabel = ALGERIAN_BANKS.find(b => b.code === bankInfo.bankName)?.label || bankInfo.bankName
                        return (
                          <>
                            <div>
                              <p className="text-sm text-lux-slate mb-1 font-medium">البنك</p>
                              <p className="text-lux-navy font-bold">{bankLabel}</p>
                            </div>
                            <div>
                              <p className="text-sm text-lux-slate mb-1 font-medium">رقم الحساب (RIB)</p>
                              <p className="text-lux-navy font-bold" dir="ltr">
                                {maskBankAccount(bankInfo.bankAccountNumber)}
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-lux-navy mb-2">
                  ملاحظات إضافية (اختياري)
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="أي معلومات إضافية تريد إضافتها..."
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.div
        className="flex justify-between items-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="min-w-[140px] border-2 border-elegant-blue/25 text-elegant-blue hover:bg-elegant-blue-50"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          السابق
        </Button>

        {currentStep < FORM_STEPS.length ? (
          <Button
            onClick={handleNext}
            size="lg"
            className="min-w-[140px] premium-button"
          >
            التالي
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            size="lg"
            className="min-w-[140px] premium-button"
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            <CheckCircle2 className="w-5 h-5 mr-2" />
          </Button>
        )}
      </motion.div>
    </div>
  )
}

export default CleanForm

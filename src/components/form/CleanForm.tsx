'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Phone, Mail, MapPin, DollarSign, FileText,
  CheckCircle2, ArrowRight, ArrowLeft, XCircle, AlertCircle,
  Cloud, CloudOff, Loader2
} from 'lucide-react'
import { Button, ProgressBar, Textarea, AmountSlider } from '@/components/ui'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import StepIndicator from '@/components/ui/StepIndicator'
import { FormData, FORM_STEPS, INITIAL_FORM_DATA, WILAYAS, CONTACT_TIMES, INCOME_RANGES, FINANCING_TYPES, PROFESSIONS, MAX_LOAN_DURATION } from '@/types'
import { saveSubmission, saveDraft, getDraft, clearDraft, validatePhone, validateEmail, formatCurrency } from '@/lib/utils'
import {
  saveSubmissionToIndexedDB,
  saveDraftToIndexedDB,
  getDraftFromIndexedDB,
  clearDraftFromIndexedDB,
  initAutoSync,
  syncPendingSubmissions,
  getStorageStats
} from '@/lib/indexedDBService'
import confetti from 'canvas-confetti'
import { useToast } from '@/components/ui/Toast'

// Loan amount validation constants - 5M to 20M DZD
const MIN_LOAN_AMOUNT = 5_000_000
const MAX_LOAN_AMOUNT = 20_000_000
const LOAN_STEP = 500_000

/**
 * Validate loan amount
 */
const validateLoanAmount = (amount: number): { valid: boolean; error?: string } => {
  if (!amount || isNaN(amount)) {
    return { valid: false, error: 'المبلغ المطلوب مطلوب' }
  }
  if (amount < MIN_LOAN_AMOUNT) {
    return {
      valid: false,
      error: `المبلغ الأدنى المسموح به هو ${MIN_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج`
    }
  }
  if (amount > MAX_LOAN_AMOUNT) {
    return {
      valid: false,
      error: `المبلغ الأقصى المسموح به هو ${MAX_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج`
    }
  }
  return { valid: true }
}

/**
 * Validate loan duration (max 18 months)
 */
const validateLoanDuration = (duration: number): { valid: boolean; error?: string } => {
  if (!duration || isNaN(duration)) {
    return { valid: false, error: 'مدة القرض مطلوبة' }
  }
  if (duration < 1) {
    return { valid: false, error: 'مدة القرض يجب أن تكون شهر واحد على الأقل' }
  }
  if (duration > MAX_LOAN_DURATION) {
    return {
      valid: false,
      error: `مدة القرض القصوى هي ${MAX_LOAN_DURATION} شهراً`
    }
  }
  return { valid: true }
}

const CleanForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [amountValidation, setAmountValidation] = useState<{ valid: boolean; error?: string }>({ valid: true })
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle')
  const toast = useToast()

  // Initialize auto-sync and load draft on mount
  useEffect(() => {
    // Initialize online status
    setIsOnline(navigator.onLine)
    setSyncStatus(navigator.onLine ? 'idle' : 'offline')

    // Online/offline listeners
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

    // Initialize auto-sync
    initAutoSync()

    // Load draft from both localStorage and IndexedDB
    const loadDraft = async () => {
      // Try IndexedDB first (more reliable)
      try {
        const indexedDBDraft = await getDraftFromIndexedDB()
        if (indexedDBDraft) {
          setFormData(prev => ({ ...prev, ...indexedDBDraft }))
          return
        }
      } catch (e) {
        console.warn('IndexedDB draft load failed, falling back to localStorage')
      }

      // Fallback to localStorage
      const localDraft = getDraft()
      if (localDraft) {
        setFormData(prev => ({ ...prev, ...localDraft }))
      }
    }

    loadDraft()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Save draft when data changes (to both localStorage and IndexedDB)
  useEffect(() => {
    if (!isSuccess) {
      // Save to localStorage (fast, synchronous)
      saveDraft(formData)

      // Also save to IndexedDB (persistent, survives browser close)
      saveDraftToIndexedDB(formData).catch(console.error)
    }
  }, [formData, isSuccess])

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
      if (!formData.salaryReceiveMethod) {
        newErrors.salaryReceiveMethod = 'طريقة استلام الراتب مطلوبة'
      }
      if (!formData.profession) {
        newErrors.profession = 'طبيعة العمل مطلوبة'
      }
      if (formData.profession === 'أخرى (حدد)' && !formData.customProfession?.trim()) {
        newErrors.customProfession = 'يرجى تحديد طبيعة عملك'
      }
    }

    if (step === 3) {
      if (!formData.financingType) {
        newErrors.financingType = 'نوع التمويل مطلوب'
      }
      // Validate loan amount
      const amountValidation = validateLoanAmount(formData.requestedAmount)
      if (!amountValidation.valid) {
        newErrors.requestedAmount = amountValidation.error
      }
      // Validate loan duration (max 18 months)
      const durationValidation = validateLoanDuration(formData.loanDuration)
      if (!durationValidation.valid) {
        newErrors.loanDuration = durationValidation.error
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    // Validate all steps including loan amount
    if (!validateStep(currentStep)) {
      toast.warning('يرجى إكمال الحقول المطلوبة قبل المتابعة')
      return
    }

    // Double-check loan amount validation before submission
    const finalAmountValidation = validateLoanAmount(formData.requestedAmount)
    if (!finalAmountValidation.valid) {
      setErrors(prev => ({
        ...prev,
        requestedAmount: finalAmountValidation.error
      }))
      // Scroll to step 3 to show the error
      setCurrentStep(3)
      toast.warning(finalAmountValidation.error || 'يرجى تصحيح المبلغ المطلوب قبل الإرسال')
      return
    }

    setIsSubmitting(true)
    setSyncStatus('syncing')

    try {
      // Save to IndexedDB first (for offline resilience)
      let indexedDBId: string | null = null
      try {
        indexedDBId = await saveSubmissionToIndexedDB(formData)
        console.log('✅ Saved to IndexedDB:', indexedDBId)
      } catch (e) {
        console.warn('IndexedDB save failed, continuing with server save')
      }

      // Try to submit to server
      const response = await fetch('/api/submissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()

      if (response.ok) {
        // Save to localStorage as additional backup
        saveSubmission(formData)

        // Clear all drafts (localStorage and IndexedDB)
        clearDraft()
        try {
          await clearDraftFromIndexedDB()
        } catch (e) {
          console.warn('Failed to clear IndexedDB draft')
        }

        setIsSuccess(true)
        setSyncStatus('synced')

        const persisted = responseData.persisted as 'server' | 'local' | undefined
        const savedTo = responseData.savedTo as string[] | undefined

        if (persisted === 'local') {
          toast.info('تم حفظ طلبك محلياً. سيتم المزامنة تلقائياً عند توفر الاتصال.', 5000)
        } else {
          // Clean success message without storage details
          toast.success('تم استلام طلبك بنجاح! سنتصل بك قريباً.', 5000)
        }

        // Celebration confetti
        const duration = 3000
        const animationEnd = Date.now() + duration

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now()
          if (timeLeft <= 0) {
            return clearInterval(interval)
          }

          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#1E3A8A', '#D4AF37', '#3B82F6'],
          })
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#1E3A8A', '#D4AF37', '#3B82F6'],
          })
        }, 250)
      } else {
        // Enhanced error handling
        const errorMessage = responseData.message || responseData.error || 'فشل إرسال الطلب'
        const errorDetails = responseData.errors || []

        console.error('Submission failed:', {
          status: response.status,
          message: errorMessage,
          errors: errorDetails
        })

        // Show user-friendly error message
        if (errorDetails.length > 0) {
          toast.error(`يرجى تصحيح الأخطاء التالية:\n${errorDetails.join('\n')}`, 7000)
        } else {
          toast.error(`حدث خطأ: ${errorMessage}`, 7000)
        }

        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الطلب'

      if (!navigator.onLine) {
        // Offline mode - submission was saved to IndexedDB
        setSyncStatus('offline')
        toast.warning('الاتصال غير متوفر. تم حفظ بياناتك محلياً، وسنحاول الإرسال تلقائياً عند عودة الاتصال.', 7000)

        // Show success since it's saved locally
        setIsSuccess(true)
        clearDraft()
        try {
          await clearDraftFromIndexedDB()
        } catch { }
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

    // Real-time validation for loan amount
    if (field === 'requestedAmount') {
      const validation = validateLoanAmount(value as number)
      setAmountValidation(validation)
      if (validation.valid) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.requestedAmount
          return newErrors
        })
      } else {
        setErrors(prev => ({
          ...prev,
          requestedAmount: validation.error
        }))
      }
    } else if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
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
          className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-status-success to-elegant-blue rounded-full flex items-center justify-center shadow-luxury-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <CheckCircle2 className="w-16 h-16 text-white" />
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-elegant-blue to-premium-gold bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          تم إرسال طلبك بنجاح!
        </motion.h2>

        <motion.p
          className="text-xl text-luxury-darkGray mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          شكراً لك! سنتصل بك قريباً لتأكيد تفاصيل طلبك
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
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
          className="luxury-card p-8 md:p-10 shadow-luxury-xl"
        >
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-elegant-blue to-premium-gold bg-clip-text text-transparent mb-3">
              {FORM_STEPS[currentStep - 1].title}
            </h2>
            <p className="text-lg text-luxury-darkGray">
              {FORM_STEPS[currentStep - 1].description}
            </p>
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.label
                  className={`flex items-center gap-3 p-5 rounded-luxury cursor-pointer transition-all duration-300 border-2
                    ${formData.isExistingCustomer === 'نعم'
                      ? 'border-elegant-blue bg-elegant-blue/10 shadow-premium'
                      : 'border-luxury-mediumGray/30 hover:border-elegant-blue/50 bg-luxury-offWhite'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateField('isExistingCustomer', 'نعم')}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${formData.isExistingCustomer === 'نعم' ? 'border-elegant-blue bg-elegant-blue' : 'border-luxury-darkGray'}`}>
                    {formData.isExistingCustomer === 'نعم' && (
                      <motion.div className="w-3 h-3 bg-white rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} />
                    )}
                  </div>
                  <span className="text-luxury-charcoal font-medium">نعم، أنا عميل موجود</span>
                </motion.label>

                <motion.label
                  className={`flex items-center gap-3 p-5 rounded-luxury cursor-pointer transition-all duration-300 border-2
                    ${formData.isExistingCustomer === 'لا'
                      ? 'border-elegant-blue bg-elegant-blue/10 shadow-premium'
                      : 'border-luxury-mediumGray/30 hover:border-elegant-blue/50 bg-luxury-offWhite'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateField('isExistingCustomer', 'لا')}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${formData.isExistingCustomer === 'لا' ? 'border-elegant-blue bg-elegant-blue' : 'border-luxury-darkGray'}`}>
                    {formData.isExistingCustomer === 'لا' && (
                      <motion.div className="w-3 h-3 bg-white rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} />
                    )}
                  </div>
                  <span className="text-luxury-charcoal font-medium">لا، عميل جديد</span>
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
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                error={errors.phone}
                placeholder="05XX XXX XXX"
                icon={<Phone className="w-5 h-5" />}
              />

              <FloatingLabelInput
                label="البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                icon={<Mail className="w-5 h-5" />}
              />

              <div>
                <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                  وقت التواصل المفضل
                </label>
                <select
                  value={formData.preferredContactTime}
                  onChange={(e) => updateField('preferredContactTime', e.target.value)}
                  className="w-full px-4 py-4 bg-luxury-offWhite border-2 border-luxury-mediumGray/30 rounded-luxury text-luxury-charcoal focus:outline-none focus:border-elegant-blue focus:ring-2 focus:ring-elegant-blue/20 transition-all"
                >
                  <option value="">اختر الوقت</option>
                  {CONTACT_TIMES.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Location and Income */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                  الولاية *
                </label>
                <select
                  value={formData.wilaya}
                  onChange={(e) => updateField('wilaya', e.target.value)}
                  className={`w-full px-4 py-4 bg-luxury-offWhite border-2 rounded-luxury text-luxury-charcoal focus:outline-none focus:border-elegant-blue focus:ring-2 focus:ring-elegant-blue/20 transition-all
                    ${errors.wilaya ? 'border-status-error' : 'border-luxury-mediumGray/30'}`}
                >
                  <option value="">اختر الولاية</option>
                  {WILAYAS.map(wilaya => (
                    <option key={wilaya} value={wilaya}>{wilaya}</option>
                  ))}
                </select>
                {errors.wilaya && <p className="mt-1 text-sm text-status-error">{errors.wilaya}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                  نطاق الدخل الشهري
                </label>
                <select
                  value={formData.monthlyIncomeRange}
                  onChange={(e) => updateField('monthlyIncomeRange', e.target.value)}
                  className="w-full px-4 py-4 bg-luxury-offWhite border-2 border-luxury-mediumGray/30 rounded-luxury text-luxury-charcoal focus:outline-none focus:border-elegant-blue focus:ring-2 focus:ring-elegant-blue/20 transition-all"
                >
                  <option value="">اختر النطاق</option>
                  {INCOME_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-luxury-charcoal mb-2">
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
                  className={`w-full px-4 py-4 bg-luxury-offWhite border-2 rounded-luxury text-luxury-charcoal focus:outline-none focus:border-elegant-blue focus:ring-2 focus:ring-elegant-blue/20 transition-all
                    ${errors.profession ? 'border-status-error' : 'border-luxury-mediumGray/30'}`}
                >
                  <option value="">اختر المهنة</option>
                  {PROFESSIONS.map(prof => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                </select>
                {errors.profession && <p className="mt-1 text-sm text-status-error">{errors.profession}</p>}
              </div>

              {formData.profession === 'أخرى (حدد)' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
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
                <label className="block text-sm font-medium text-luxury-charcoal">
                  طريقة استلام الراتب *
                </label>
                {(['CCP', 'بنك'] as const).map((method) => (
                  <motion.label
                    key={method}
                    className={`flex items-center gap-3 p-4 rounded-luxury border-2 cursor-pointer transition-all
                      ${formData.salaryReceiveMethod === method
                        ? 'border-elegant-blue bg-elegant-blue/10 shadow-premium'
                        : 'border-luxury-mediumGray/30 hover:border-elegant-blue/50 bg-luxury-offWhite'}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => updateField('salaryReceiveMethod', method)}
                  >
                    <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center
                      ${formData.salaryReceiveMethod === method ? 'border-elegant-blue' : 'border-luxury-darkGray'}`}>
                      {formData.salaryReceiveMethod === method && (
                        <motion.div className="w-2.5 h-2.5 bg-elegant-blue rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} />
                      )}
                    </div>
                    <span className="text-luxury-charcoal font-medium">{method === 'CCP' ? 'CCP (البريد)' : method}</span>
                  </motion.label>
                ))}
                {errors.salaryReceiveMethod && <p className="mt-1 text-sm text-status-error">{errors.salaryReceiveMethod}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Financing Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-luxury-charcoal">
                  نوع التمويل *
                </label>
                {FINANCING_TYPES.map((type) => (
                  <motion.label
                    key={type}
                    className={`flex items-center gap-3 p-4 rounded-luxury border-2 cursor-pointer transition-all
                      ${formData.financingType === type
                        ? 'border-elegant-blue bg-elegant-blue/10 shadow-premium'
                        : 'border-luxury-mediumGray/30 hover:border-elegant-blue/50 bg-luxury-offWhite'}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => updateField('financingType', type)}
                  >
                    <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center
                      ${formData.financingType === type ? 'border-elegant-blue' : 'border-luxury-darkGray'}`}>
                      {formData.financingType === type && (
                        <motion.div className="w-2.5 h-2.5 bg-elegant-blue rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} />
                      )}
                    </div>
                    <span className="text-luxury-charcoal font-medium">{type}</span>
                  </motion.label>
                ))}
                {errors.financingType && <p className="mt-1 text-sm text-status-error">{errors.financingType}</p>}
              </div>

              {/* Premium Amount Slider Component with Loan Duration */}
              <div className="mt-6">
                <AmountSlider
                  min={MIN_LOAN_AMOUNT}
                  max={MAX_LOAN_AMOUNT}
                  step={LOAN_STEP}
                  value={formData.requestedAmount}
                  onChange={(value) => updateField('requestedAmount', value)}
                  error={errors.requestedAmount}
                  showTooltip={true}
                  loanDuration={formData.loanDuration}
                  onDurationChange={(duration) => updateField('loanDuration', duration)}
                  showDuration={true}
                />
                {errors.loanDuration && (
                  <p className="mt-2 text-sm text-status-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.loanDuration}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review and Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-luxury-offWhite rounded-luxury-lg p-6 space-y-4 border border-luxury-lightGray shadow-sm">
                <h3 className="text-2xl font-bold text-elegant-blue mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  ملخص طلبك
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-luxury-darkGray mb-1 font-medium">الاسم الكامل</p>
                    <p className="text-luxury-charcoal font-bold">{formData.fullName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-luxury-darkGray mb-1 font-medium">رقم الهاتف</p>
                    <p className="text-luxury-charcoal font-bold">{formData.phone}</p>
                  </div>

                  {formData.email && (
                    <div>
                      <p className="text-sm text-luxury-darkGray mb-1 font-medium">البريد الإلكتروني</p>
                      <p className="text-luxury-charcoal font-bold">{formData.email}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-luxury-darkGray mb-1 font-medium">الولاية</p>
                    <p className="text-luxury-charcoal font-bold">{formData.wilaya}</p>
                  </div>

                  <div>
                    <p className="text-sm text-luxury-darkGray mb-1 font-medium">طبيعة العمل/المهنة</p>
                    <p className="text-luxury-charcoal font-bold">
                      {formData.profession === 'أخرى (حدد)' && formData.customProfession
                        ? formData.customProfession
                        : formData.profession}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-luxury-darkGray mb-1 font-medium">نوع التمويل</p>
                    <p className="text-luxury-charcoal font-bold">{formData.financingType}</p>
                  </div>

                  <div>
                    <p className="text-sm text-luxury-darkGray mb-1 font-medium">مدة القرض</p>
                    <p className="text-luxury-charcoal font-bold">
                      {formData.loanDuration} {formData.loanDuration === 1 ? 'شهر' : formData.loanDuration <= 10 ? 'أشهر' : 'شهر'}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm text-luxury-darkGray mb-1">المبلغ المطلوب</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-elegant-blue to-premium-gold bg-clip-text text-transparent">
                      {formatCurrency(formData.requestedAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-luxury-charcoal mb-2">
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
          className="min-w-[140px] border-2 border-elegant-blue/30 text-elegant-blue hover:bg-elegant-blue/10"
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


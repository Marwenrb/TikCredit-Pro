export type PaymentMethod = 'CCP' | 'بنك'

export type CCPBankingInfo = {
  paymentMethod: 'CCP'
  ccpNumber: string
  ccpKey: string
  ccpFullNumber: string
}

export type BankBankingInfo = {
  paymentMethod: 'بنك'
  bankName: string
  bankAccountNumber: string
  bankAgencyCode: string
}

export type BankingInfo = CCPBankingInfo | BankBankingInfo

export interface FormData {
  isExistingCustomer: 'نعم' | 'لا' | ''
  fullName: string
  phone: string
  email: string
  preferredContactTime: string
  wilaya: string
  monthlyIncomeRange: string
  salaryReceiveMethod: 'CCP' | 'بنك' | ''
  profession: string
  customProfession?: string
  financingType: string
  requestedAmount: number
  notes: string
  banking?: BankingInfo | null
}

export interface Submission {
  id: string
  timestamp: string
  data: FormData
}

export interface FormStep {
  id: number
  title: string
  description: string
}

// SECURITY: Password hash is now stored server-side only
// No client-side access to admin credentials

export const STORAGE_KEY = 'tikcredit_submissions'
export const DRAFT_STORAGE_KEY = 'tikcredit_form_draft'
export const ADMIN_AUTH_KEY = 'tikcredit_admin_auth'
export const ADMIN_TOKEN_KEY = 'tikcredit_admin_token'

export const WILAYAS = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
  'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
  'الجلفة', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
  'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
  'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
  'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تيموشنت', 'غرداية', 'غليزان',
  'تميمون', 'برج باجي مختار', 'أولاد جلال', 'بني عباس', 'عين صالح', 'إن قاصة', 'زاوية كونتة'
]

export const CONTACT_TIMES = [
  'صباحاً (8:00 - 12:00)',
  'بعد الظهر (12:00 - 17:00)',
  'مساءً (17:00 - 20:00)',
  'أي وقت'
]

export const INCOME_RANGES = [
  'أقل من 30,000 د.ج',
  '30,000 - 50,000 د.ج',
  '50,000 - 80,000 د.ج',
  '80,000 - 120,000 د.ج',
  'أكثر من 120,000 د.ج'
]

export const FINANCING_TYPES = [
  'تمويل شخصي',
  'تمويل عقاري',
  'تمويل سيارة',
  'تمويل مشروع',
  'قرض استهلاكي'
]

export const PROFESSIONS = [
  'موظف حكومي',
  'عسكري (جيش وطني)',
  'شرطة',
  'درك وطني',
  'حماية مدنية',
  'جمارك',
  'طبيب',
  'ممرض',
  'مهندس',
  'معلم/أستاذ',
  'محامي',
  'تاجر',
  'حرفي',
  'مقاول',
  'موظف بنك',
  'موظف شركة خاصة',
  'سائق',
  'عامل',
  'متقاعد',
  'أخرى (حدد)'
]

export const ALGERIAN_BANKS = [
  { code: 'BNA',      label: 'Banque Nationale d\'Algérie (BNA)' },
  { code: 'BEA',      label: 'Banque Extérieure d\'Algérie (BEA)' },
  { code: 'CPA',      label: 'Crédit Populaire d\'Algérie (CPA)' },
  { code: 'BADR',     label: 'Banque de l\'Agriculture et du Développement Rural (BADR)' },
  { code: 'BDL',      label: 'Banque de Développement Local (BDL)' },
  { code: 'CNEP',     label: 'Caisse Nationale d\'Epargne et de Prévoyance (CNEP)' },
  { code: 'CIB',      label: 'Commerce & Industry Bank (CIB)' },
  { code: 'ABC',      label: 'Arab Banking Corporation Algeria (ABC)' },
  { code: 'ALBARAKA', label: 'Banque Al Baraka d\'Algérie' },
  { code: 'AGB',      label: 'Algeria Gulf Bank (AGB)' },
  { code: 'HSBC',     label: 'HSBC Algérie' },
  { code: 'SGA',      label: 'Société Générale Algérie (SGA)' },
  { code: 'BNP',      label: 'BNP Paribas El Djazaïr' },
  { code: 'TRUST',    label: 'Trust Bank Algeria' },
  { code: 'NATIXIS',  label: 'Natixis Algérie' },
] as const

export type BankCode = typeof ALGERIAN_BANKS[number]['code']

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: 'المعلومات الشخصية',
    description: 'البيانات الشخصية وطرق التواصل'
  },
  {
    id: 2,
    title: 'معلومات القرض',
    description: 'الولاية والدخل ونوع التمويل'
  },
  {
    id: 3,
    title: 'معلومات الحساب البنكي أو البريدي',
    description: 'أين تستلم راتبك الشهري؟'
  },
  {
    id: 4,
    title: 'المراجعة والإرسال',
    description: 'راجع معلوماتك وأرسل الطلب'
  }
]

export const INITIAL_FORM_DATA: FormData = {
  isExistingCustomer: '',
  fullName: '',
  phone: '',
  email: '',
  preferredContactTime: '',
  wilaya: '',
  monthlyIncomeRange: '',
  salaryReceiveMethod: '',
  profession: '',
  customProfession: '',
  financingType: '',
  requestedAmount: 5_000_000,
  notes: '',
  banking: null
}


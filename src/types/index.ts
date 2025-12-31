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

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: 'معلومات أساسية',
    description: 'البيانات الشخصية وطرق التواصل'
  },
  {
    id: 2,
    title: 'الموقع والراتب',
    description: 'الولاية ومعلومات الدخل'
  },
  {
    id: 3,
    title: 'نوع التمويل',
    description: 'اختر نوع التمويل المطلوب'
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
  requestedAmount: 1000000,
  notes: ''
}


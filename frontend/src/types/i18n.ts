/**
 * Enhanced i18n Types and Configuration
 */

export interface LocaleConfig {
  code: string; // ISO 639-1 language code + optional region (e.g., 'en', 'hi', 'ta-IN')
  name: string; // Human readable name
  nativeName: string; // Name in native language
  region?: string; // ISO 3166-1 alpha-2 country code
  direction: 'ltr' | 'rtl';
  
  // Date and time formatting
  dateFormat: string; // e.g., 'DD/MM/YYYY', 'MM/DD/YYYY'
  timeFormat: string; // e.g., 'HH:mm', 'h:mm A'
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday
  
  // Number formatting
  numberFormat: {
    decimal: string; // Decimal separator
    thousands: string; // Thousands separator
    currency: {
      symbol: string;
      position: 'before' | 'after';
      spacing: boolean;
    };
  };
  
  // Calendar system
  calendar: 'gregorian' | 'hindu' | 'islamic' | 'buddhist';
  
  // Font and typography
  font: {
    family: string;
    weights: string[];
    size: {
      base: string;
      scale: number; // Relative scale for this locale
    };
  };
  
  // Accessibility
  accessibility: {
    screenReader: boolean; // Has good screen reader support
    largeText: boolean; // Benefits from larger text
  };
}

export interface TranslationNamespace {
  common: CommonTranslations;
  navigation: NavigationTranslations;
  booking: BookingTranslations;
  crowd: CrowdTranslations;
  notifications: NotificationTranslations;
  auth: AuthTranslations;
  admin: AdminTranslations;
  accessibility: AccessibilityTranslations;
  errors: ErrorTranslations;
  validation: ValidationTranslations;
}

export interface CommonTranslations {
  // Basic actions
  save: string;
  cancel: string;
  submit: string;
  edit: string;
  delete: string;
  view: string;
  create: string;
  update: string;
  refresh: string;
  loading: string;
  
  // Time and dates
  today: string;
  yesterday: string;
  tomorrow: string;
  now: string;
  never: string;
  always: string;
  
  // Status
  active: string;
  inactive: string;
  pending: string;
  completed: string;
  failed: string;
  cancelled: string;
  
  // Common words
  name: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  capacity: string;
  available: string;
  unavailable: string;
  
  // Pluralization rules
  pluralRules: {
    one: string; // For count = 1
    few?: string; // For counts like 2-4 in some languages
    many?: string; // For counts like 5+ in some languages
    other: string; // Default
  };
}

export interface NavigationTranslations {
  home: string;
  booking: string;
  queue: string;
  crowd: string;
  notifications: string;
  profile: string;
  admin: string;
  settings: string;
  help: string;
  about: string;
  contact: string;
  
  // Breadcrumbs
  breadcrumb: {
    home: string;
    back: string;
    forward: string;
  };
  
  // Mobile menu
  menu: {
    open: string;
    close: string;
    toggle: string;
  };
}

export interface BookingTranslations {
  title: string;
  selectDate: string;
  selectTime: string;
  selectDarshan: string;
  numberOfDevotees: string;
  specialRequirements: string;
  contactDetails: string;
  confirmBooking: string;
  bookingConfirmed: string;
  bookingCancelled: string;
  
  // Darshan types
  darshanTypes: {
    general: string;
    vip: string;
    special: string;
    group: string;
  };
  
  // Booking status
  status: {
    pending: string;
    confirmed: string;
    checkedIn: string;
    completed: string;
    cancelled: string;
    noShow: string;
  };
  
  // Validation messages
  validation: {
    dateRequired: string;
    timeRequired: string;
    devoteeCountRequired: string;
    contactRequired: string;
    invalidDate: string;
    pastDate: string;
    slotFull: string;
  };
  
  // Time slots
  timeSlots: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };
}

export interface CrowdTranslations {
  currentCrowd: string;
  expectedWaitTime: string;
  queueLength: string;
  liveTracking: string;
  crowdLevel: {
    low: string;
    moderate: string;
    high: string;
    full: string;
  };
  
  // Queue status
  queueStatus: {
    moving: string;
    slow: string;
    stopped: string;
    closed: string;
  };
  
  // Zones
  zones: {
    entrance: string;
    mainHall: string;
    sanctum: string;
    exit: string;
    parking: string;
    facilities: string;
  };
}

export interface NotificationTranslations {
  title: string;
  markAllRead: string;
  noNotifications: string;
  
  // Types
  types: {
    booking: string;
    reminder: string;
    alert: string;
    announcement: string;
    emergency: string;
  };
  
  // Settings
  settings: {
    title: string;
    emailNotifications: string;
    smsNotifications: string;
    pushNotifications: string;
    quietHours: string;
    frequency: string;
  };
  
  // Templates
  templates: {
    bookingConfirmation: string;
    slotReminder: string;
    queueUpdate: string;
    emergencyAlert: string;
    weatherAlert: string;
  };
}

export interface AuthTranslations {
  login: string;
  logout: string;
  register: string;
  forgotPassword: string;
  resetPassword: string;
  changePassword: string;
  
  // Form fields
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  firstName: string;
  lastName: string;
  
  // Validation
  validation: {
    emailRequired: string;
    passwordRequired: string;
    invalidEmail: string;
    passwordTooShort: string;
    passwordsDoNotMatch: string;
    phoneRequired: string;
    invalidPhone: string;
  };
  
  // Messages
  messages: {
    loginSuccess: string;
    loginFailed: string;
    registrationSuccess: string;
    passwordResetSent: string;
    passwordChanged: string;
    loggedOut: string;
  };
}

export interface AdminTranslations {
  dashboard: string;
  users: string;
  bookings: string;
  capacity: string;
  notifications: string;
  settings: string;
  reportsTab: string;
  
  // User management
  userManagement: {
    title: string;
    addUser: string;
    editUser: string;
    deleteUser: string;
    roleAssignment: string;
    permissions: string;
  };
  
  // Capacity management
  capacityManagement: {
    title: string;
    rules: string;
    overrides: string;
    events: string;
    analytics: string;
  };
  
  // Reports
  reports: {
    title: string;
    footfall: string;
    revenue: string;
    occupancy: string;
    waitTimes: string;
    userSatisfaction: string;
  };
}

export interface AccessibilityTranslations {
  // Screen reader announcements
  announcements: {
    pageLoaded: string;
    navigationMenuOpened: string;
    navigationMenuClosed: string;
    modalOpened: string;
    modalClosed: string;
    formSubmitted: string;
    errorOccurred: string;
    successMessage: string;
  };
  
  // ARIA labels
  ariaLabels: {
    mainNavigation: string;
    breadcrumbNavigation: string;
    skipToContent: string;
    skipToNavigation: string;
    openMenu: string;
    closeMenu: string;
    previousPage: string;
    nextPage: string;
    currentPage: string;
    sortAscending: string;
    sortDescending: string;
    expandSection: string;
    collapseSection: string;
    required: string;
    optional: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  
  // Keyboard shortcuts
  shortcuts: {
    help: string;
    home: string;
    search: string;
    menu: string;
    skip: string;
  };
  
  // Font size
  fontSize: {
    increase: string;
    decrease: string;
    reset: string;
    description: string;
  };
  
  // Motion preferences
  motion: {
    reduce: string;
    enable: string;
    description: string;
  };
}

export interface ErrorTranslations {
  // HTTP errors
  http: {
    400: string; // Bad Request
    401: string; // Unauthorized
    403: string; // Forbidden
    404: string; // Not Found
    429: string; // Too Many Requests
    500: string; // Internal Server Error
    503: string; // Service Unavailable
  };
  
  // Network errors
  network: {
    offline: string;
    timeout: string;
    connectionFailed: string;
    noResponse: string;
  };
  
  // Application errors
  application: {
    unexpected: string;
    validationFailed: string;
    permissionDenied: string;
    resourceNotFound: string;
    operationFailed: string;
  };
  
  // Recovery actions
  recovery: {
    tryAgain: string;
    goHome: string;
    contactSupport: string;
    refresh: string;
  };
}

export interface ValidationTranslations {
  required: string;
  invalid: string;
  tooShort: string;
  tooLong: string;
  mustBeNumber: string;
  mustBeEmail: string;
  mustBePhone: string;
  mustBeUrl: string;
  mustBeDate: string;
  futureDate: string;
  pastDate: string;
  minValue: string;
  maxValue: string;
  mustMatch: string;
  mustBeUnique: string;
  
  // Field-specific
  fields: {
    email: string;
    password: string;
    phone: string;
    date: string;
    time: string;
    name: string;
    address: string;
  };
}

// Regional calendar mappings
export interface CalendarConfig {
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  
  // Special dates and festivals
  festivals: {
    [date: string]: {
      name: string;
      description?: string;
      type: 'major' | 'minor' | 'regional';
    };
  };
  
  // Auspicious timing
  auspiciousTimes?: {
    [date: string]: {
      periods: Array<{
        start: string;
        end: string;
        name: string;
      }>;
    };
  };
}

// Accessibility configuration
export interface AccessibilityConfig {
  // Screen reader support
  screenReader: {
    enabled: boolean;
    announcePageChanges: boolean;
    announceFormErrors: boolean;
    announceStatusUpdates: boolean;
  };
  
  // Keyboard navigation
  keyboard: {
    enabled: boolean;
    focusVisible: boolean;
    skipLinks: boolean;
    shortcuts: Record<string, string>;
  };
  
  // Visual accessibility
  visual: {
    largeText: boolean;
    reducedMotion: boolean;
    focusIndicators: boolean;
  };
  
  // Color accessibility
  colors: {
    contrastRatio: number; // WCAG AA = 4.5, AAA = 7
    colorBlindSupport: boolean;
    alternativeIndicators: boolean; // Don't rely only on color
  };
  
  // Interactive elements
  interactive: {
    minimumTargetSize: number; // 44px recommended
    touchFriendly: boolean;
    gestureAlternatives: boolean;
  };
}

// RTL (Right-to-Left) support configuration
export interface RTLConfig {
  enabled: boolean;
  direction: 'ltr' | 'rtl';
  
  // Layout adjustments
  layout: {
    flipHorizontal: boolean;
    mirrorIcons: boolean;
    adjustMargins: boolean;
    adjustPadding: boolean;
  };
  
  // Text alignment
  text: {
    defaultAlign: 'left' | 'right' | 'center';
    preserveNumbers: boolean; // Keep numbers LTR in RTL text
    preserveUrls: boolean; // Keep URLs LTR in RTL text
  };
  
  // Component adjustments
  components: {
    navigation: 'left' | 'right';
    sidebar: 'left' | 'right';
    modals: 'left' | 'right';
    tooltips: 'left' | 'right';
  };
}
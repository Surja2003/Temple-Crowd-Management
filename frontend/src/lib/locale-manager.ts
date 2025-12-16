/**
 * Enhanced i18n Configuration and Locale Management
 */

import { LocaleConfig, CalendarConfig, AccessibilityConfig, RTLConfig } from '@/types/i18n';

// Supported locales with comprehensive configuration
export const SUPPORTED_LOCALES: Record<string, LocaleConfig> = {
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'US',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm A',
    firstDayOfWeek: 0, // Sunday
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: {
        symbol: '$',
        position: 'before',
        spacing: false,
      },
    },
    calendar: 'gregorian',
    font: {
      family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      weights: ['400', '500', '600', '700'],
      size: {
        base: '16px',
        scale: 1.0,
      },
    },
    accessibility: {
      screenReader: true,
      largeText: false,
    },
  },
  
  'hi': {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'IN',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    firstDayOfWeek: 1, // Monday
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: {
        symbol: '₹',
        position: 'before',
        spacing: true,
      },
    },
    calendar: 'hindu',
    font: {
      family: 'Noto Sans Devanagari, -apple-system, BlinkMacSystemFont, sans-serif',
      weights: ['400', '500', '600', '700'],
      size: {
        base: '18px',
        scale: 1.125,
      },
    },
    accessibility: {
      screenReader: true,
      largeText: true,
    },
  },
  
  'ta': {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'IN',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    firstDayOfWeek: 1, // Monday
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: {
        symbol: '₹',
        position: 'before',
        spacing: true,
      },
    },
    calendar: 'hindu',
    font: {
      family: 'Noto Sans Tamil, -apple-system, BlinkMacSystemFont, sans-serif',
      weights: ['400', '500', '600', '700'],
      size: {
        base: '18px',
        scale: 1.125,
      },
    },
    accessibility: {
      screenReader: true,
      largeText: true,
    },
  },
  
  'te': {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'IN',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    firstDayOfWeek: 1, // Monday
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: {
        symbol: '₹',
        position: 'before',
        spacing: true,
      },
    },
    calendar: 'hindu',
    font: {
      family: 'Noto Sans Telugu, -apple-system, BlinkMacSystemFont, sans-serif',
      weights: ['400', '500', '600', '700'],
      size: {
        base: '18px',
        scale: 1.125,
      },
    },
    accessibility: {
      screenReader: true,
      largeText: true,
    },
  },
  
  'ar': {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    region: 'SA',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    firstDayOfWeek: 6, // Saturday
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: {
        symbol: 'ر.س',
        position: 'after',
        spacing: true,
      },
    },
    calendar: 'islamic',
    font: {
      family: 'Noto Sans Arabic, -apple-system, BlinkMacSystemFont, sans-serif',
      weights: ['400', '500', '600', '700'],
      size: {
        base: '18px',
        scale: 1.125,
      },
    },
    accessibility: {
      screenReader: true,
      largeText: true,
    },
  },
  
  'ur': {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    region: 'PK',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    firstDayOfWeek: 1, // Monday
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: {
        symbol: '₨',
        position: 'before',
        spacing: true,
      },
    },
    calendar: 'islamic',
    font: {
      family: 'Noto Nastaliq Urdu, -apple-system, BlinkMacSystemFont, sans-serif',
      weights: ['400', '500', '600', '700'],
      size: {
        base: '18px',
        scale: 1.125,
      },
    },
    accessibility: {
      screenReader: true,
      largeText: true,
    },
  },
};

// Calendar configurations for different locales
export const CALENDAR_CONFIGS: Record<string, CalendarConfig> = {
  'en': {
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    monthsShort: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    weekdays: [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekdaysMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    festivals: {
      '2024-03-25': {
        name: 'Holi',
        description: 'Festival of Colors',
        type: 'major',
      },
      '2024-04-17': {
        name: 'Ram Navami',
        description: 'Birth of Lord Rama',
        type: 'major',
      },
      '2024-08-26': {
        name: 'Janmashtami',
        description: 'Birth of Lord Krishna',
        type: 'major',
      },
      '2024-11-01': {
        name: 'Diwali',
        description: 'Festival of Lights',
        type: 'major',
      },
    },
  },
  
  'hi': {
    months: [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ],
    monthsShort: [
      'जन', 'फर', 'मार', 'अप्र', 'मई', 'जून',
      'जुल', 'अग', 'सित', 'अक्ट', 'नव', 'दिस'
    ],
    weekdays: [
      'रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
    ],
    weekdaysShort: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    weekdaysMin: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
    festivals: {
      '2024-03-25': {
        name: 'होली',
        description: 'रंगों का त्योहार',
        type: 'major',
      },
      '2024-04-17': {
        name: 'राम नवमी',
        description: 'भगवान राम का जन्म',
        type: 'major',
      },
      '2024-08-26': {
        name: 'जन्माष्टमी',
        description: 'भगवान कृष्ण का जन्म',
        type: 'major',
      },
      '2024-11-01': {
        name: 'दिवाली',
        description: 'रोशनी का त्योहार',
        type: 'major',
      },
    },
    auspiciousTimes: {
      '2024-04-17': {
        periods: [
          { start: '06:00', end: '07:30', name: 'प्रातःकाल मुहूर्त' },
          { start: '11:00', end: '12:30', name: 'मध्याह्न मुहूर्त' },
          { start: '17:00', end: '18:30', name: 'सायंकाल मुहूर्त' },
        ],
      },
    },
  },
  
  'ta': {
    months: [
      'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
      'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'
    ],
    monthsShort: [
      'ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்',
      'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'
    ],
    weekdays: [
      'ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'
    ],
    weekdaysShort: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
    weekdaysMin: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
    festivals: {
      '2024-04-14': {
        name: 'தமிழ் புத்தாண்டு',
        description: 'தமிழ் नया साल',
        type: 'major',
      },
      '2024-08-26': {
        name: 'கிருஷ்ண ஜெயந்தி',
        description: 'கண்ணன் பிறந்த நாள்',
        type: 'major',
      },
    },
  },
  
  'ar': {
    months: [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ],
    monthsShort: [
      'ينا', 'فبر', 'مار', 'أبر', 'مايو', 'يون',
      'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'
    ],
    weekdays: [
      'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
    ],
    weekdaysShort: ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
    weekdaysMin: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
    festivals: {
      '2024-04-10': {
        name: 'عيد الفطر',
        description: 'عيد إنهاء شهر رمضان',
        type: 'major',
      },
      '2024-06-16': {
        name: 'عيد الأضحى',
        description: 'عيد الأضحى المبارك',
        type: 'major',
      },
    },
  },
};

// Default accessibility configuration
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  screenReader: {
    enabled: true,
    announcePageChanges: true,
    announceFormErrors: true,
    announceStatusUpdates: true,
  },
  keyboard: {
    enabled: true,
    focusVisible: true,
    skipLinks: true,
    shortcuts: {
      'alt+h': 'home',
      'alt+m': 'menu',
      'alt+s': 'search',
      'alt+/': 'help',
      'escape': 'close',
      'tab': 'next',
      'shift+tab': 'previous',
    },
  },
  visual: {
    largeText: false,
    reducedMotion: false,
    focusIndicators: true,
  },
  colors: {
    contrastRatio: 4.5, // WCAG AA compliance
    colorBlindSupport: true,
    alternativeIndicators: true,
  },
  interactive: {
    minimumTargetSize: 44,
    touchFriendly: true,
    gestureAlternatives: true,
  },
};

// RTL configuration for Arabic and Urdu
export const RTL_CONFIG: RTLConfig = {
  enabled: true,
  direction: 'rtl',
  layout: {
    flipHorizontal: true,
    mirrorIcons: true,
    adjustMargins: true,
    adjustPadding: true,
  },
  text: {
    defaultAlign: 'right',
    preserveNumbers: true,
    preserveUrls: true,
  },
  components: {
    navigation: 'right',
    sidebar: 'right',
    modals: 'right',
    tooltips: 'right',
  },
};

// Utility functions for locale management
export class LocaleManager {
  private static instance: LocaleManager;
  private currentLocale: string = 'en';
  private fallbackLocale: string = 'en';
  
  static getInstance(): LocaleManager {
    if (!LocaleManager.instance) {
      LocaleManager.instance = new LocaleManager();
    }
    return LocaleManager.instance;
  }
  
  setLocale(locale: string): void {
    if (SUPPORTED_LOCALES[locale]) {
      this.currentLocale = locale;
      this.updateDocumentDirection();
      this.updateDocumentLang();
      this.loadFonts();
    }
  }
  
  getCurrentLocale(): LocaleConfig {
    return SUPPORTED_LOCALES[this.currentLocale];
  }
  
  isRTL(): boolean {
    return this.getCurrentLocale().direction === 'rtl';
  }
  
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const locale = this.getCurrentLocale();
    const formatOptions = {
      ...options,
      calendar: locale.calendar === 'gregorian' ? undefined : locale.calendar,
    };
    
    return new Intl.DateTimeFormat(locale.code, formatOptions).format(date);
  }
  
  formatTime(date: Date): string {
    const locale = this.getCurrentLocale();
    const is24Hour = locale.timeFormat.includes('HH');
    
    return new Intl.DateTimeFormat(locale.code, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !is24Hour,
    }).format(date);
  }
  
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const locale = this.getCurrentLocale();
    return new Intl.NumberFormat(locale.code, options).format(number);
  }
  
  formatCurrency(amount: number): string {
    const locale = this.getCurrentLocale();
    const currency = locale.region === 'IN' ? 'INR' : 
                    locale.region === 'SA' ? 'SAR' : 
                    locale.region === 'PK' ? 'PKR' : 'USD';
    
    return new Intl.NumberFormat(locale.code, {
      style: 'currency',
      currency,
    }).format(amount);
  }
  
  private updateDocumentDirection(): void {
    document.documentElement.dir = this.isRTL() ? 'rtl' : 'ltr';
  }
  
  private updateDocumentLang(): void {
    document.documentElement.lang = this.currentLocale;
  }
  
  private async loadFonts(): Promise<void> {
    const locale = this.getCurrentLocale();
    const fontFamily = locale.font.family.split(',')[0].trim();
    
    // Load Google Fonts for non-Latin scripts
    if (fontFamily.startsWith('Noto')) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@${locale.font.weights.join(';')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }
  
  getCalendarConfig(): CalendarConfig {
    return CALENDAR_CONFIGS[this.currentLocale] || CALENDAR_CONFIGS['en'];
  }
  
  getAccessibilityConfig(): AccessibilityConfig {
    return DEFAULT_ACCESSIBILITY_CONFIG;
  }
  
  getRTLConfig(): RTLConfig | null {
    return this.isRTL() ? RTL_CONFIG : null;
  }
  
  // Pluralization helper
  pluralize(count: number, singular: string, plural?: string, few?: string): string {
    const locale = this.getCurrentLocale();
    
    // English pluralization
    if (locale.code === 'en') {
      return count === 1 ? singular : (plural || `${singular}s`);
    }
    
    // Hindi/Tamil/Telugu pluralization (simplified)
    if (['hi', 'ta', 'te'].includes(locale.code)) {
      if (count === 1) return singular;
      if (count <= 4 && few) return few;
      return plural || singular;
    }
    
    // Arabic pluralization (simplified)
    if (locale.code === 'ar') {
      if (count === 1) return singular;
      if (count === 2 && few) return few;
      return plural || singular;
    }
    
    return count === 1 ? singular : (plural || singular);
  }
  
  // Get text direction for specific elements
  getTextDirection(preserveDirection?: boolean): 'ltr' | 'rtl' {
    if (preserveDirection) return 'ltr';
    return this.getCurrentLocale().direction;
  }
  
  // Check if locale supports specific features
  supportsFeature(feature: 'screenReader' | 'largeText'): boolean {
    return this.getCurrentLocale().accessibility[feature];
  }
}

// Export singleton instance
export const localeManager = LocaleManager.getInstance();
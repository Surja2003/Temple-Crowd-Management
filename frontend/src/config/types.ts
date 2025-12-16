// Temple Configuration Types
export interface TempleConfig {
  // Basic Information
  basic: {
    id: string;
    slug: string; // URL-friendly identifier
    name: string;
    shortName?: string;
    description: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    contact: {
      phone: string[];
      email: string[];
      website?: string;
      socialMedia?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
      };
    };
    images: {
      logo: string;
      banner: string;
      gallery: string[];
      zoneMaps?: string[];
      virtualTour?: string;
    };
  };

  // Operational Settings
  operations: {
    timings: {
      general: DailyTiming;
      special: SpecialTiming[];
      festivals: FestivalTiming[];
    };
    capacity: {
      total: number;
      zones: ZoneCapacity[];
      vipQuota: number;
      seniorCitizenQuota: number;
      disabilityQuota: number;
    };
    darshanTypes: DarshanType[];
    rules: TempleRule[];
    languages: string[]; // supported languages
    currency: string;
    timezone: string;
  };

  // Booking Configuration
  booking: {
    advanceBookingDays: number;
    cancellationPolicy: {
      freeUntilHours: number;
      refundPercentage: number;
    };
    slotDuration: number; // in minutes
    bufferTime: number; // buffer between slots
    notifications: NotificationConfig;
    paymentMethods: PaymentMethod[];
  };

  // Features & Integrations
  features: {
    liveTracking: boolean;
    qrCodeEntry: boolean;
    multiLanguage: boolean;
    accessibility: boolean;
    analytics: boolean;
    crowdPrediction: boolean;
    weatherIntegration: boolean;
  };

  // Access Control
  access: {
    publicRegistration: boolean;
    guestBooking: boolean;
    staffRoles: string[];
    adminEmails: string[];
  };
}

export interface DailyTiming {
  open: string; // 24-hour format
  close: string;
  breaks?: TimeSlot[];
  lastEntry?: string;
}

export interface SpecialTiming extends DailyTiming {
  date: string; // ISO date
  reason: string;
}

export interface FestivalTiming extends DailyTiming {
  name: string;
  startDate: string;
  endDate: string;
  specialRules?: string[];
}

export interface ZoneCapacity {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  accessLevel: 'public' | 'vip' | 'staff';
}

export interface DarshanType {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  capacity: number;
  zones: string[]; // zone IDs
  features: string[];
  accessLevel: 'public' | 'registered' | 'vip';
  advanceBookingRequired: boolean;
}

export interface TempleRule {
  id: string;
  category: 'dress_code' | 'items_allowed' | 'behavior' | 'photography' | 'general';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'mandatory';
  icon?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface NotificationConfig {
  channels: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  triggers: {
    bookingConfirmation: boolean;
    slotReminder: boolean;
    queueUpdates: boolean;
    emergencyAlerts: boolean;
    festivalAnnouncements: boolean;
  };
  timing: {
    reminderHours: number[];
    emergencyRetryMinutes: number;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'online' | 'offline' | 'wallet';
  enabled: boolean;
  minAmount?: number;
  maxAmount?: number;
  processingFee?: number;
}

// Multi-temple registry
export interface TempleRegistryEntry {
  id: string;
  slug: string;
  name: string;
  configPath: string;
  status: 'active' | 'inactive' | 'maintenance';
  featured: boolean;
}

export interface TempleRegistry {
  temples: TempleRegistryEntry[];
  defaultTemple: string; // slug of default temple
  globalSettings: {
    defaultLanguage: string;
    supportedLanguages: string[];
    theme: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
    };
    features: {
      multiTenancy: boolean;
      globalSearch: boolean;
      crossTempleBooking: boolean;
    };
    analytics: {
      googleAnalyticsId: string;
      enableHeatmaps: boolean;
      trackUserBehavior: boolean;
      retentionDays: number;
    };
    integrations: {
      paymentGateway: {
        provider: string;
        sandbox: boolean;
      };
      notifications: {
        smsProvider: string;
        emailProvider: string;
        whatsappProvider: string;
      };
      maps: {
        provider: string;
        apiKey: string;
      };
    };
    security: {
      sessionTimeout: number;
      maxLoginAttempts: number;
      passwordPolicy: {
        minLength: number;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        requireUppercase: boolean;
      };
      dataEncryption: boolean;
      auditLogging: boolean;
    };
    compliance: {
      gdprCompliant: boolean;
      dataRetentionDays: number;
      cookieConsent: boolean;
      privacyPolicyUrl: string;
      termsOfServiceUrl: string;
    };
  };
}

// Crowd prediction and analytics
export interface CrowdMetrics {
  timestamp: string;
  templeId: string;
  currentOccupancy: number;
  estimatedWaitTime: number;
  arrivalRate: number; // people per hour
  departureRate: number;
  zones: ZoneCrowdData[];
  prediction: {
    nextHour: number;
    nextTwoHours: number;
    peakTime: string;
    recommendedArrival: string;
  };
}

export interface ZoneCrowdData {
  zoneId: string;
  currentCount: number;
  maxCapacity: number;
  averageStayDuration: number;
  queueLength: number;
}

// Audit and compliance
export interface AuditLog {
  id: string;
  timestamp: string;
  templeId: string;
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export interface DataRetentionPolicy {
  templeId: string;
  personalData: {
    retentionDays: number;
    anonymizeAfterDays: number;
  };
  bookingData: {
    retentionDays: number;
  };
  analyticsData: {
    retentionDays: number;
    aggregationLevel: 'hourly' | 'daily' | 'weekly';
  };
  auditLogs: {
    retentionDays: number;
  };
}
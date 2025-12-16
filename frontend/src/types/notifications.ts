/**
 * Types for Multi-Channel Notification System
 */

export interface NotificationChannel {
  id: string;
  name: string;
  type: NotificationChannelType;
  enabled: boolean;
  config: NotificationChannelConfig;
  priority: number;
  fallbackChannel?: string;
}

export type NotificationChannelType = 
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'push'
  | 'in_app'
  | 'voice_call';

export interface NotificationChannelConfig {
  // Email config
  emailConfig?: {
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string;
    tls: boolean;
  };
  
  // SMS config
  smsConfig?: {
    provider: 'twilio' | 'aws_sns' | 'msg91' | 'textlocal';
    apiKey: string;
    apiSecret?: string;
    senderId: string;
    templateId?: string;
  };
  
  // WhatsApp config
  whatsappConfig?: {
    provider: 'twilio' | 'gupshup' | 'whatsapp_business';
    apiKey: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookUrl: string;
  };
  
  // Push notification config
  pushConfig?: {
    fcmServerKey: string;
    vapidKeys: {
      publicKey: string;
      privateKey: string;
    };
    apnsConfig?: {
      keyId: string;
      teamId: string;
      bundleId: string;
      privateKey: string;
    };
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channels: NotificationChannelType[];
  
  // Template content for different channels
  templates: {
    [key in NotificationChannelType]?: {
      subject?: string; // For email
      title?: string; // For push notifications
      body: string;
      html?: string; // For email HTML version
      buttons?: NotificationButton[];
      media?: NotificationMedia[];
    };
  };
  
  // Variables available in template
  variables: TemplateVariable[];
  
  // Scheduling and rules
  schedulingRules: SchedulingRule[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  lastModified: string;
  version: number;
  active: boolean;
}

export type NotificationType = 
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_cancellation'
  | 'slot_reminder'
  | 'queue_update'
  | 'delay_alert'
  | 'emergency_alert'
  | 'capacity_alert'
  | 'weather_alert'
  | 'festival_announcement'
  | 'payment_reminder'
  | 'payment_confirmation'
  | 'user_registration'
  | 'password_reset'
  | 'admin_alert';

export interface NotificationButton {
  text: string;
  action: 'url' | 'deep_link' | 'call' | 'reply';
  value: string;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationMedia {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  caption?: string;
  thumbnail?: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  description: string;
  required: boolean;
  defaultValue?: string | number | boolean;
  format?: string; // For date formatting
}

export interface SchedulingRule {
  type: 'immediate' | 'delayed' | 'scheduled' | 'recurring';
  
  // For delayed notifications
  delay?: {
    amount: number;
    unit: 'minutes' | 'hours' | 'days';
    basedOn?: 'creation' | 'event_time' | 'booking_time';
  };
  
  // For scheduled notifications
  schedule?: {
    dateTime: string;
    timezone: string;
  };
  
  // For recurring notifications
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number; // Every N days/weeks/months
    endCondition: 'never' | 'count' | 'date';
    endValue?: number | string;
    daysOfWeek?: number[]; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  
  // Delivery window
  deliveryWindow?: {
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    timezone: string;
    daysOfWeek: number[]; // 0-6
  };
}

export interface NotificationRequest {
  id: string;
  templateId: string;
  recipientId: string;
  recipientType: 'user' | 'staff' | 'admin' | 'group';
  
  // Recipient contact info
  recipient: NotificationRecipient;
  
  // Template variables
  variables: Record<string, unknown>;
  
  // Channel overrides
  channelOverrides?: {
    channels: NotificationChannelType[];
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  };
  
  // Scheduling
  scheduledFor?: string;
  timezone?: string;
  
  // Metadata
  source: string; // booking, queue, admin, etc.
  sourceId: string; // booking id, queue id, etc.
  createdAt: string;
  createdBy: string;
}

export interface NotificationRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  pushTokens?: string[];
  language: string;
  timezone: string;
  preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  channels: {
    [key in NotificationChannelType]: {
      enabled: boolean;
      types: NotificationType[];
      quietHours?: {
        start: string; // HH:MM
        end: string; // HH:MM
        timezone: string;
      };
    };
  };
  
  frequency: {
    [key in NotificationType]: 'immediate' | 'batched' | 'digest' | 'disabled';
  };
  
  language: string;
  timezone: string;
}

export interface NotificationDelivery {
  id: string;
  requestId: string;
  channel: NotificationChannelType;
  status: DeliveryStatus;
  
  // Delivery details
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  clickedAt?: string;
  
  // Error details
  error?: {
    code: string;
    message: string;
    retryable: boolean;
    retryCount: number;
    lastRetryAt?: string;
  };
  
  // Provider response
  providerResponse?: {
    messageId?: string;
    status?: string;
    rawResponse?: Record<string, unknown>;
  };
  
  // Analytics
  analytics?: {
    opened: boolean;
    clicked: boolean;
    converted: boolean;
    unsubscribed: boolean;
    bounced: boolean;
  };
}

export type DeliveryStatus = 
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'expired'
  | 'cancelled';

export interface NotificationBatch {
  id: string;
  name: string;
  templateId: string;
  recipients: string[]; // recipient IDs
  variables: Record<string, unknown>; // Common variables
  
  // Batch settings
  settings: {
    batchSize: number;
    delayBetweenBatches: number; // milliseconds
    retryFailures: boolean;
    maxRetries: number;
  };
  
  // Status
  status: BatchStatus;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  
  // Timing
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  
  createdBy: string;
  createdAt: string;
}

export type BatchStatus = 
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface NotificationAnalytics {
  period: 'day' | 'week' | 'month';
  data: NotificationAnalyticsData[];
  insights: NotificationInsight[];
  recommendations: NotificationRecommendation[];
}

export interface NotificationAnalyticsData {
  timestamp: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  
  // By channel
  channelStats: {
    [key in NotificationChannelType]: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      failed: number;
      deliveryRate: number;
      openRate: number;
      clickRate: number;
    };
  };
  
  // By type
  typeStats: {
    [key in NotificationType]: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      effectivenessScore: number;
    };
  };
}

export interface NotificationInsight {
  type: 'low_delivery_rate' | 'high_open_rate' | 'poor_click_rate' | 'channel_preference';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  affectedChannels?: NotificationChannelType[];
  affectedTypes?: NotificationType[];
}

export interface NotificationRecommendation {
  id: string;
  type: 'channel_optimization' | 'timing_optimization' | 'content_improvement' | 'frequency_adjustment';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: 'automatic' | 'manual' | 'requires_approval';
  priority: number;
}

export interface NotificationQueue {
  id: string;
  name: string;
  type: 'immediate' | 'delayed' | 'batch';
  priority: number;
  
  // Queue settings
  settings: {
    maxConcurrentDeliveries: number;
    retryPolicy: {
      maxRetries: number;
      backoffStrategy: 'linear' | 'exponential';
      retryDelays: number[]; // milliseconds
    };
    deadLetterQueue: boolean;
  };
  
  // Status
  status: QueueStatus;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  
  // Performance
  averageProcessingTime: number; // milliseconds
  throughputPerMinute: number;
  lastProcessedAt?: string;
}

export type QueueStatus = 
  | 'active'
  | 'paused'
  | 'stopped'
  | 'error';

// Configuration for notification system
export interface NotificationSystemConfig {
  // General settings
  defaultLanguage: string;
  defaultTimezone: string;
  
  // Delivery settings
  delivery: {
    maxRetries: number;
    retryDelays: number[]; // milliseconds
    batchSize: number;
    rateLimits: {
      [key in NotificationChannelType]: {
        perMinute: number;
        perHour: number;
        perDay: number;
      };
    };
  };
  
  // Channel priorities
  channelPriorities: {
    [key in NotificationType]: NotificationChannelType[];
  };
  
  // Fallback rules
  fallbackRules: {
    enabled: boolean;
    fallbackDelay: number; // milliseconds
    maxFallbacks: number;
  };
  
  // Analytics settings
  analytics: {
    retentionDays: number;
    trackingEnabled: boolean;
    pixelTracking: boolean;
    linkTracking: boolean;
  };
  
  // Compliance settings
  compliance: {
    gdprCompliant: boolean;
    optInRequired: boolean;
    unsubscribeRequired: boolean;
    dataRetentionDays: number;
  };
}
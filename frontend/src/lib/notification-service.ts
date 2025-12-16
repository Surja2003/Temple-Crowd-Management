/**
 * Multi-Channel Notification Service
 * Handles sending notifications across multiple channels
 */

import { 
  NotificationRequest,
  NotificationDelivery,
  NotificationTemplate,
  NotificationChannel,
  NotificationChannelType,
  NotificationType,
  DeliveryStatus,
  NotificationSystemConfig,
  NotificationBatch,
  NotificationQueue,
  NotificationAnalytics,
  NotificationRecipient
} from '@/types/notifications';

export class NotificationService {
  private config: NotificationSystemConfig;
  private channels: Map<NotificationChannelType, NotificationChannel> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private queues: Map<string, NotificationQueue> = new Map();
  private deliveries: Map<string, NotificationDelivery> = new Map();
  private activeWebSocket: WebSocket | null = null;

  constructor(config: NotificationSystemConfig) {
    this.config = config;
    this.initializeChannels();
    this.initializeQueues();
    this.loadTemplates();
  }

  private initializeChannels(): void {
    // Initialize default channels
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'email-primary',
        name: 'Primary Email',
        type: 'email',
        enabled: true,
        priority: 1,
        config: {
          emailConfig: {
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            username: 'notifications@temple.org',
            password: 'app-password',
            fromEmail: 'notifications@temple.org',
            fromName: 'Temple Notifications',
            tls: true
          }
        }
      },
      {
        id: 'sms-primary',
        name: 'Primary SMS',
        type: 'sms',
        enabled: true,
        priority: 2,
        config: {
          smsConfig: {
            provider: 'twilio',
            apiKey: 'twilio-api-key',
            apiSecret: 'twilio-api-secret',
            senderId: 'TEMPLE',
            templateId: 'temple-notifications'
          }
        }
      },
      {
        id: 'whatsapp-business',
        name: 'WhatsApp Business',
        type: 'whatsapp',
        enabled: true,
        priority: 3,
        config: {
          whatsappConfig: {
            provider: 'twilio',
            apiKey: 'whatsapp-api-key',
            phoneNumberId: '+1234567890',
            businessAccountId: 'business-account-id',
            webhookUrl: 'https://api.temple.org/webhooks/whatsapp'
          }
        }
      },
      {
        id: 'push-firebase',
        name: 'Firebase Push',
        type: 'push',
        enabled: true,
        priority: 4,
        config: {
          pushConfig: {
            fcmServerKey: 'firebase-server-key',
            vapidKeys: {
              publicKey: 'vapid-public-key',
              privateKey: 'vapid-private-key'
            }
          }
        }
      },
      {
        id: 'in-app',
        name: 'In-App Notifications',
        type: 'in_app',
        enabled: true,
        priority: 5,
        config: {}
      }
    ];

    defaultChannels.forEach(channel => {
      this.channels.set(channel.type, channel);
    });
  }

  private initializeQueues(): void {
    const defaultQueues: NotificationQueue[] = [
      {
        id: 'immediate',
        name: 'Immediate Delivery',
        type: 'immediate',
        priority: 1,
        settings: {
          maxConcurrentDeliveries: 100,
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            retryDelays: [1000, 5000, 15000]
          },
          deadLetterQueue: true
        },
        status: 'active',
        pendingCount: 0,
        processingCount: 0,
        completedCount: 0,
        failedCount: 0,
        averageProcessingTime: 0,
        throughputPerMinute: 0
      },
      {
        id: 'delayed',
        name: 'Delayed Delivery',
        type: 'delayed',
        priority: 2,
        settings: {
          maxConcurrentDeliveries: 50,
          retryPolicy: {
            maxRetries: 5,
            backoffStrategy: 'linear',
            retryDelays: [5000, 10000, 30000, 60000, 300000]
          },
          deadLetterQueue: true
        },
        status: 'active',
        pendingCount: 0,
        processingCount: 0,
        completedCount: 0,
        failedCount: 0,
        averageProcessingTime: 0,
        throughputPerMinute: 0
      },
      {
        id: 'batch',
        name: 'Batch Processing',
        type: 'batch',
        priority: 3,
        settings: {
          maxConcurrentDeliveries: 20,
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            retryDelays: [2000, 10000, 30000]
          },
          deadLetterQueue: true
        },
        status: 'active',
        pendingCount: 0,
        processingCount: 0,
        completedCount: 0,
        failedCount: 0,
        averageProcessingTime: 0,
        throughputPerMinute: 0
      }
    ];

    defaultQueues.forEach(queue => {
      this.queues.set(queue.id, queue);
    });
  }

  private loadTemplates(): void {
    // Load default notification templates
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'booking-confirmation',
        name: 'Booking Confirmation',
        type: 'booking_confirmation',
        channels: ['email', 'sms', 'push'],
        templates: {
          email: {
            subject: 'Booking Confirmed - {{templeName}}',
            body: 'Dear {{userName}}, your booking for {{darshanType}} on {{bookingDate}} at {{bookingTime}} has been confirmed. Booking ID: {{bookingId}}',
            html: `
              <h1>Booking Confirmed</h1>
              <p>Dear {{userName}},</p>
              <p>Your booking has been confirmed for:</p>
              <ul>
                <li><strong>Temple:</strong> {{templeName}}</li>
                <li><strong>Darshan:</strong> {{darshanType}}</li>
                <li><strong>Date:</strong> {{bookingDate}}</li>
                <li><strong>Time:</strong> {{bookingTime}}</li>
                <li><strong>Booking ID:</strong> {{bookingId}}</li>
              </ul>
              <p>Please arrive 15 minutes before your scheduled time.</p>
            `
          },
          sms: {
            body: 'Booking confirmed for {{darshanType}} on {{bookingDate}} at {{bookingTime}}. ID: {{bookingId}}. Arrive 15 min early. -{{templeName}}'
          },
          push: {
            title: 'Booking Confirmed',
            body: 'Your {{darshanType}} booking for {{bookingDate}} is confirmed. ID: {{bookingId}}'
          }
        },
        variables: [
          { name: 'userName', type: 'string', description: 'User name', required: true },
          { name: 'templeName', type: 'string', description: 'Temple name', required: true },
          { name: 'darshanType', type: 'string', description: 'Type of darshan', required: true },
          { name: 'bookingDate', type: 'date', description: 'Booking date', required: true, format: 'YYYY-MM-DD' },
          { name: 'bookingTime', type: 'string', description: 'Booking time', required: true },
          { name: 'bookingId', type: 'string', description: 'Booking ID', required: true }
        ],
        schedulingRules: [
          {
            type: 'immediate'
          }
        ],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1,
        active: true
      },
      {
        id: 'slot-reminder',
        name: 'Slot Reminder',
        type: 'slot_reminder',
        channels: ['push', 'sms'],
        templates: {
          push: {
            title: 'Darshan Reminder',
            body: 'Your {{darshanType}} slot starts in {{timeUntil}}. Please arrive on time!'
          },
          sms: {
            body: 'Reminder: Your {{darshanType}} slot at {{templeName}} starts in {{timeUntil}}. Please arrive on time!'
          }
        },
        variables: [
          { name: 'darshanType', type: 'string', description: 'Type of darshan', required: true },
          { name: 'templeName', type: 'string', description: 'Temple name', required: true },
          { name: 'timeUntil', type: 'string', description: 'Time until slot', required: true }
        ],
        schedulingRules: [
          {
            type: 'delayed',
            delay: {
              amount: 30,
              unit: 'minutes',
              basedOn: 'event_time'
            }
          }
        ],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1,
        active: true
      },
      {
        id: 'emergency-alert',
        name: 'Emergency Alert',
        type: 'emergency_alert',
        channels: ['push', 'sms', 'whatsapp', 'in_app'],
        templates: {
          push: {
            title: 'URGENT: {{alertTitle}}',
            body: '{{alertMessage}}'
          },
          sms: {
            body: 'URGENT ALERT: {{alertMessage}} -{{templeName}}'
          },
          whatsapp: {
            body: '🚨 *URGENT ALERT*\n\n{{alertMessage}}\n\n_{{templeName}}_'
          },
          in_app: {
            title: 'Emergency Alert',
            body: '{{alertMessage}}'
          }
        },
        variables: [
          { name: 'alertTitle', type: 'string', description: 'Alert title', required: true },
          { name: 'alertMessage', type: 'string', description: 'Alert message', required: true },
          { name: 'templeName', type: 'string', description: 'Temple name', required: true }
        ],
        schedulingRules: [
          {
            type: 'immediate'
          }
        ],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1,
        active: true
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Core notification methods
  async sendNotification(request: NotificationRequest): Promise<NotificationDelivery[]> {
    const template = this.templates.get(request.templateId);
    if (!template) {
      throw new Error(`Template not found: ${request.templateId}`);
    }

    const deliveries: NotificationDelivery[] = [];
    const targetChannels = request.channelOverrides?.channels || 
                          this.config.channelPriorities[template.type] || 
                          template.channels;

    for (const channelType of targetChannels) {
      const channel = this.channels.get(channelType);
      if (!channel || !channel.enabled) {
        continue;
      }

      // Check if user has this channel enabled
      if (!this.isChannelEnabledForRecipient(request.recipient, channelType, template.type)) {
        continue;
      }

      const delivery = await this.sendToChannel(request, template, channel);
      deliveries.push(delivery);
      
      // If delivery successful, might skip lower priority channels based on config
      if (delivery.status === 'sent' && !this.shouldSendToAllChannels(template.type)) {
        break;
      }
    }

    return deliveries;
  }

  private async sendToChannel(
    request: NotificationRequest,
    template: NotificationTemplate,
    channel: NotificationChannel
  ): Promise<NotificationDelivery> {
    const deliveryId = `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const delivery: NotificationDelivery = {
      id: deliveryId,
      requestId: request.id,
      channel: channel.type,
      status: 'pending'
    };

    try {
      // Get template content for this channel
      const channelTemplate = template.templates[channel.type];
      if (!channelTemplate) {
        throw new Error(`No template defined for channel ${channel.type}`);
      }

      // Process template variables
      const processedContent = this.processTemplate(channelTemplate, request.variables);

      // Send based on channel type
      delivery.status = 'queued';
      delivery.sentAt = new Date().toISOString();

      switch (channel.type) {
        case 'email':
          await this.sendEmail(request.recipient, processedContent, channel);
          break;
        case 'sms':
          await this.sendSms(request.recipient, processedContent, channel);
          break;
        case 'whatsapp':
          await this.sendWhatsApp(request.recipient, processedContent, channel);
          break;
        case 'push':
          await this.sendPushNotification(request.recipient, processedContent, channel);
          break;
        case 'in_app':
          await this.sendInAppNotification(request.recipient, processedContent);
          break;
        default:
          throw new Error(`Unsupported channel type: ${channel.type}`);
      }

      delivery.status = 'sent';
      delivery.deliveredAt = new Date().toISOString();

    } catch (error) {
      delivery.status = 'failed';
      delivery.error = {
        code: 'DELIVERY_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        retryable: true,
        retryCount: 0
      };
    }

    this.deliveries.set(deliveryId, delivery);
    return delivery;
  }

  private processTemplate(
    template: Record<string, unknown>,
    variables: Record<string, unknown>
  ): Record<string, unknown> {
    const processedTemplate = { ...template };

    // Process subject, title, body with variable substitution
    ['subject', 'title', 'body', 'html'].forEach(field => {
      if (processedTemplate[field] && typeof processedTemplate[field] === 'string') {
        processedTemplate[field] = this.substituteVariables(
          processedTemplate[field] as string,
          variables
        );
      }
    });

    return processedTemplate;
  }

  private substituteVariables(
    content: string,
    variables: Record<string, unknown>
  ): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key];
      if (value === undefined || value === null) {
        return match; // Keep placeholder if variable not found
      }
      return String(value);
    });
  }

  // Channel-specific sending methods (mock implementations)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async sendEmail(recipient: NotificationRecipient, content: Record<string, unknown>, _channel: NotificationChannel): Promise<void> {
    // Mock email sending
    console.log('Sending email:', {
      to: recipient.email,
      subject: content.subject,
      body: content.body,
      html: content.html
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async sendSms(recipient: NotificationRecipient, content: Record<string, unknown>, channel: NotificationChannel): Promise<void> {
    // Mock SMS sending
    console.log('Sending SMS:', {
      to: recipient.phone,
      body: content.body,
      config: channel.config.smsConfig
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async sendWhatsApp(recipient: NotificationRecipient, content: Record<string, unknown>, channel: NotificationChannel): Promise<void> {
    // Mock WhatsApp sending
    console.log('Sending WhatsApp:', {
      to: recipient.whatsapp || recipient.phone,
      body: content.body,
      config: channel.config.whatsappConfig
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async sendPushNotification(recipient: NotificationRecipient, content: Record<string, unknown>, _channel: NotificationChannel): Promise<void> {
    // Mock push notification sending
    console.log('Sending Push:', {
      tokens: recipient.pushTokens,
      title: content.title,
      body: content.body
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 75));
  }

  private async sendInAppNotification(recipient: NotificationRecipient, content: Record<string, unknown>): Promise<void> {
    // Mock in-app notification (WebSocket)
    if (this.activeWebSocket && this.activeWebSocket.readyState === WebSocket.OPEN) {
      this.activeWebSocket.send(JSON.stringify({
        type: 'notification',
        recipient: recipient.id,
        title: content.title,
        body: content.body,
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Utility methods
  private isChannelEnabledForRecipient(
    recipient: NotificationRecipient,
    channelType: NotificationChannelType,
    notificationType: NotificationType
  ): boolean {
    const preferences = recipient.preferences;
    if (!preferences) return true; // Default to enabled if no preferences

    const channelPrefs = preferences.channels[channelType];
    if (!channelPrefs) return true;

    return channelPrefs.enabled && channelPrefs.types.includes(notificationType);
  }

  private shouldSendToAllChannels(notificationType: NotificationType): boolean {
    // Emergency alerts should go to all channels
    const allChannelTypes: NotificationType[] = [
      'emergency_alert',
      'capacity_alert',
      'weather_alert'
    ];
    
    return allChannelTypes.includes(notificationType);
  }

  // Batch operations
  async sendBatchNotifications(batch: NotificationBatch): Promise<void> {
    // Implementation for batch sending
    console.log('Processing batch:', batch.id);
    
    // Mock batch processing
    for (let i = 0; i < batch.recipients.length; i += batch.settings.batchSize) {
      const batchRecipients = batch.recipients.slice(i, i + batch.settings.batchSize);
      
      // Process batch
      await Promise.all(batchRecipients.map(async (recipientId) => {
        // Create notification request for each recipient
        // This is a simplified version - real implementation would be more complex
        console.log(`Processing notification for recipient: ${recipientId}`);
      }));
      
      // Delay between batches
      if (i + batch.settings.batchSize < batch.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, batch.settings.delayBetweenBatches));
      }
    }
  }

  // Analytics and monitoring
  async getAnalytics(period: 'day' | 'week' | 'month'): Promise<NotificationAnalytics> {
    // Mock analytics data
    return {
      period,
      data: [
        {
          timestamp: new Date().toISOString(),
          sent: 1250,
          delivered: 1180,
          opened: 892,
          clicked: 245,
          failed: 70,
          channelStats: {
            email: { sent: 500, delivered: 485, opened: 320, clicked: 89, failed: 15, deliveryRate: 0.97, openRate: 0.66, clickRate: 0.28 },
            sms: { sent: 400, delivered: 390, opened: 350, clicked: 78, failed: 10, deliveryRate: 0.975, openRate: 0.9, clickRate: 0.22 },
            whatsapp: { sent: 200, delivered: 180, opened: 145, clicked: 45, failed: 20, deliveryRate: 0.9, openRate: 0.81, clickRate: 0.31 },
            push: { sent: 150, delivered: 125, opened: 77, clicked: 33, failed: 25, deliveryRate: 0.83, openRate: 0.62, clickRate: 0.43 },
            in_app: { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0, deliveryRate: 0, openRate: 0, clickRate: 0 },
            voice_call: { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0, deliveryRate: 0, openRate: 0, clickRate: 0 }
          },
          typeStats: {
            booking_confirmation: { sent: 400, delivered: 385, opened: 280, clicked: 95, effectivenessScore: 0.85 },
            slot_reminder: { sent: 300, delivered: 290, opened: 250, clicked: 60, effectivenessScore: 0.78 },
            emergency_alert: { sent: 100, delivered: 98, opened: 95, clicked: 40, effectivenessScore: 0.95 },
            booking_reminder: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            booking_cancellation: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            queue_update: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            delay_alert: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            capacity_alert: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            weather_alert: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            festival_announcement: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            payment_reminder: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            payment_confirmation: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            user_registration: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            password_reset: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 },
            admin_alert: { sent: 0, delivered: 0, opened: 0, clicked: 0, effectivenessScore: 0 }
          }
        }
      ],
      insights: [
        {
          type: 'high_open_rate',
          title: 'High Email Open Rates',
          description: 'Email notifications have 66% open rate, above industry average',
          impact: 'medium',
          actionRequired: false,
          affectedChannels: ['email']
        }
      ],
      recommendations: [
        {
          id: 'rec_1',
          type: 'timing_optimization',
          title: 'Optimize SMS Timing',
          description: 'Send SMS reminders 15 minutes earlier for better engagement',
          expectedImpact: '12% improvement in click-through rate',
          implementation: 'automatic',
          priority: 1
        }
      ]
    };
  }

  // WebSocket connection for real-time notifications
  connectWebSocket(url: string): void {
    this.activeWebSocket = new WebSocket(url);
    
    this.activeWebSocket.onopen = () => {
      console.log('Notification WebSocket connected');
    };
    
    this.activeWebSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
    };
    
    this.activeWebSocket.onclose = () => {
      console.log('Notification WebSocket disconnected');
    };
  }

  disconnectWebSocket(): void {
    if (this.activeWebSocket) {
      this.activeWebSocket.close();
      this.activeWebSocket = null;
    }
  }

  // Template management
  getTemplate(id: string): NotificationTemplate | undefined {
    return this.templates.get(id);
  }

  addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  updateTemplate(id: string, updates: Partial<NotificationTemplate>): void {
    const existing = this.templates.get(id);
    if (existing) {
      this.templates.set(id, { ...existing, ...updates });
    }
  }

  deleteTemplate(id: string): void {
    const existing = this.templates.get(id);
    if (!existing) {
      throw new Error(`Template ${id} not found`);
    }
    this.templates.delete(id);
  }

  // Delivery status tracking
  getDelivery(id: string): NotificationDelivery | undefined {
    return this.deliveries.get(id);
  }

  updateDeliveryStatus(id: string, status: DeliveryStatus, metadata?: Record<string, unknown>): void {
    const delivery = this.deliveries.get(id);
    if (delivery) {
      delivery.status = status;
      if (metadata) {
        Object.assign(delivery, metadata);
      }
      this.deliveries.set(id, delivery);
    }
  }

  // Cleanup
  destroy(): void {
    this.disconnectWebSocket();
    this.channels.clear();
    this.templates.clear();
    this.queues.clear();
    this.deliveries.clear();
  }
}
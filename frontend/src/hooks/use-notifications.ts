/**
 * React hook for multi-channel notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/lib/notification-service';
import { useTempleConfig } from '@/config/hooks';
import { 
  NotificationRequest,
  NotificationDelivery,
  NotificationTemplate,
  NotificationChannel,
  NotificationAnalytics,
  NotificationSystemConfig,
  NotificationChannelType,
  NotificationRecipient
} from '@/types/notifications';

export interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface NotificationsHookReturn {
  // Current state
  templates: NotificationTemplate[];
  channels: NotificationChannel[];
  analytics: NotificationAnalytics | undefined;
  
  // Loading states
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  // Actions
  sendNotification: (request: Omit<NotificationRequest, 'id' | 'createdAt'>) => Promise<NotificationDelivery[]>;
  sendBulkNotifications: (requests: Omit<NotificationRequest, 'id' | 'createdAt'>[]) => Promise<void>;
  
  createTemplate: (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'lastModified' | 'version'>) => Promise<NotificationTemplate>;
  updateTemplate: (id: string, updates: Partial<NotificationTemplate>) => Promise<NotificationTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  
  getDeliveryStatus: (deliveryId: string) => Promise<NotificationDelivery | undefined>;
  getAnalytics: (period: 'day' | 'week' | 'month') => Promise<void>;
  
  // Utility functions
  createBookingConfirmation: (recipient: NotificationRecipient, bookingData: Record<string, unknown>) => Promise<NotificationDelivery[]>;
  createSlotReminder: (recipient: NotificationRecipient, slotData: Record<string, unknown>) => Promise<NotificationDelivery[]>;
  createEmergencyAlert: (message: string, recipients?: NotificationRecipient[]) => Promise<void>;
  
  refreshData: () => Promise<void>;
}

export function useNotifications(options: UseNotificationsOptions = {}): NotificationsHookReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30 // seconds
  } = options;

  const { config: templeConfig } = useTempleConfig();
  const queryClient = useQueryClient();
  
  // State
  const [service, setService] = useState<NotificationService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | undefined>();

  // Initialize service
  useEffect(() => {
    if (templeConfig?.basic.slug) {
      // Default notification system config
      const defaultConfig: NotificationSystemConfig = {
        defaultLanguage: 'en',
        defaultTimezone: 'Asia/Kolkata',
        delivery: {
          maxRetries: 3,
          retryDelays: [1000, 5000, 15000],
          batchSize: 100,
          rateLimits: {
            email: { perMinute: 100, perHour: 1000, perDay: 10000 },
            sms: { perMinute: 50, perHour: 500, perDay: 2000 },
            whatsapp: { perMinute: 30, perHour: 300, perDay: 1000 },
            push: { perMinute: 200, perHour: 2000, perDay: 20000 },
            in_app: { perMinute: 500, perHour: 5000, perDay: 50000 },
            voice_call: { perMinute: 10, perHour: 100, perDay: 500 }
          }
        },
        channelPriorities: {
          booking_confirmation: ['email', 'sms', 'push'],
          slot_reminder: ['push', 'sms'],
          emergency_alert: ['push', 'sms', 'whatsapp', 'in_app'],
          booking_reminder: ['push', 'email'],
          booking_cancellation: ['email', 'sms'],
          queue_update: ['push', 'in_app'],
          delay_alert: ['push', 'sms'],
          capacity_alert: ['push', 'in_app'],
          weather_alert: ['push', 'sms'],
          festival_announcement: ['email', 'push', 'whatsapp'],
          payment_reminder: ['email', 'sms'],
          payment_confirmation: ['email', 'sms'],
          user_registration: ['email'],
          password_reset: ['email', 'sms'],
          admin_alert: ['email', 'push']
        },
        fallbackRules: {
          enabled: true,
          fallbackDelay: 30000,
          maxFallbacks: 2
        },
        analytics: {
          retentionDays: 90,
          trackingEnabled: true,
          pixelTracking: true,
          linkTracking: true
        },
        compliance: {
          gdprCompliant: true,
          optInRequired: true,
          unsubscribeRequired: true,
          dataRetentionDays: 365
        }
      };

      const newService = new NotificationService(defaultConfig);
      setService(newService);

      return () => {
        newService.destroy();
      };
    }
  }, [templeConfig?.basic.slug]);

  // Queries
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['notification-templates', templeConfig?.basic.slug],
    queryFn: async () => {
      // For now, return empty array as templates are managed internally by service
      return [];
    },
    enabled: !!service,
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false
  });

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['notification-channels', templeConfig?.basic.slug],
    queryFn: async () => {
      // For now, return empty array as channels are managed internally by service
      return [];
    },
    enabled: !!service
  });

  const isLoading = templatesLoading || channelsLoading;

  // Mutations
  const sendNotificationMutation = useMutation({
    mutationFn: async (request: Omit<NotificationRequest, 'id' | 'createdAt'>) => {
      if (!service) throw new Error('Notification service not initialized');
      
      const fullRequest: NotificationRequest = {
        ...request,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      
      return service.sendNotification(fullRequest);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to send notification');
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'lastModified' | 'version'>) => {
      if (!service) throw new Error('Notification service not initialized');
      
      const fullTemplate: NotificationTemplate = {
        ...template,
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1
      };
      
      service.addTemplate(fullTemplate);
      return fullTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to create template');
    }
  });

  // Actions
  const sendNotification = useCallback(async (request: Omit<NotificationRequest, 'id' | 'createdAt'>) => {
    setError(null);
    return sendNotificationMutation.mutateAsync(request);
  }, [sendNotificationMutation]);

  const sendBulkNotifications = useCallback(async (requests: Omit<NotificationRequest, 'id' | 'createdAt'>[]) => {
    if (!service) {
      throw new Error('Notification service not initialized');
    }
    
    setError(null);
    
    // Process requests in batches
    const batchSize = 50;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      await Promise.all(batch.map(request => sendNotification(request)));
      
      // Small delay between batches to avoid overwhelming the system
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [service, sendNotification]);

  const createTemplate = useCallback(async (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'lastModified' | 'version'>) => {
    setError(null);
    return createTemplateMutation.mutateAsync(template);
  }, [createTemplateMutation]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<NotificationTemplate>) => {
    if (!service) {
      throw new Error('Notification service not initialized');
    }
    
    setError(null);
    
    const existingTemplate = service.getTemplate(id);
    if (!existingTemplate) {
      throw new Error('Template not found');
    }
    
    const updatedTemplate = {
      ...existingTemplate,
      ...updates,
      lastModified: new Date().toISOString(),
      version: existingTemplate.version + 1
    };
    
    service.updateTemplate(id, updatedTemplate);
    queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    
    return updatedTemplate;
  }, [service, queryClient]);

  const deleteTemplate = useCallback(async (id: string) => {
    setError(null);
    if (!service) {
      throw new Error('Notification service not initialized');
    }
    service.deleteTemplate(id);
    queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
  }, [service, queryClient]);

  const getDeliveryStatus = useCallback(async (deliveryId: string) => {
    if (!service) {
      throw new Error('Notification service not initialized');
    }
    
    return service.getDelivery(deliveryId);
  }, [service]);

  const getAnalytics = useCallback(async (period: 'day' | 'week' | 'month') => {
    if (!service) {
      throw new Error('Notification service not initialized');
    }
    try {
      setError(null);
      const analyticsData = await service.getAnalytics(period);
      setAnalytics(analyticsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
    }
  }, [service]);

  // Utility functions for common notification types
  const createBookingConfirmation = useCallback(async (
    recipient: NotificationRecipient, 
    bookingData: Record<string, unknown>
  ) => {
    return sendNotification({
      templateId: 'booking-confirmation',
      recipientId: recipient.id,
      recipientType: 'user',
      recipient,
      variables: {
        userName: recipient.name,
        templeName: templeConfig?.basic.name || 'Temple',
        ...bookingData
      },
      source: 'booking',
      sourceId: (bookingData.bookingId as string) || 'unknown',
      createdBy: 'system'
    });
  }, [sendNotification, templeConfig?.basic.name]);

  const createSlotReminder = useCallback(async (
    recipient: NotificationRecipient, 
    slotData: Record<string, unknown>
  ) => {
    return sendNotification({
      templateId: 'slot-reminder',
      recipientId: recipient.id,
      recipientType: 'user',
      recipient,
      variables: {
        templeName: templeConfig?.basic.name || 'Temple',
        ...slotData
      },
      scheduledFor: slotData.reminderTime as string,
      source: 'booking',
      sourceId: (slotData.bookingId as string) || 'unknown',
      createdBy: 'system'
    });
  }, [sendNotification, templeConfig?.basic.name]);

  const createEmergencyAlert = useCallback(async (
    message: string, 
    recipients?: NotificationRecipient[]
  ) => {
    if (!recipients) {
      // If no specific recipients, this would typically broadcast to all active users
      // For now, we'll just log that it would be a broadcast
      console.log('Emergency alert would be broadcast to all users:', message);
      return;
    }

    const requests = recipients.map(recipient => ({
      templateId: 'emergency-alert',
      recipientId: recipient.id,
      recipientType: 'user' as const,
      recipient,
      variables: {
        alertTitle: 'Emergency Alert',
        alertMessage: message,
        templeName: templeConfig?.basic.name || 'Temple'
      },
      channelOverrides: {
        channels: ['push', 'sms', 'whatsapp', 'in_app'] as NotificationChannelType[],
        priority: 'urgent' as const
      },
      source: 'admin',
      sourceId: 'emergency',
      createdBy: 'admin'
    }));

    await sendBulkNotifications(requests);
  }, [sendBulkNotifications, templeConfig?.basic.name]);

  const refreshData = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    queryClient.invalidateQueries({ queryKey: ['notification-channels'] });
  }, [queryClient]);

  const isSending = sendNotificationMutation.isPending || createTemplateMutation.isPending;

  return {
    // Current state
    templates,
    channels,
    analytics,
    
    // Loading states
    isLoading,
    isSending,
    error,
    
    // Actions
    sendNotification,
    sendBulkNotifications,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getDeliveryStatus,
    getAnalytics,
    
    // Utility functions
    createBookingConfirmation,
    createSlotReminder,
    createEmergencyAlert,
    
    refreshData
  };
}
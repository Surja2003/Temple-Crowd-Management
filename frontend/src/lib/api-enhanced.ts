import axios from "axios";
import React from 'react';
import { configManager } from "../config/manager";
import { TempleConfig, CrowdMetrics, AuditLog } from "../config/types";
import { templePath, bookingPath, alertPath, analyticsPath, livePath, apiPrefix } from './paths';

// Base API instance with dynamic configuration
const createApiInstance = (baseURL?: string) => {
  return axios.create({
    baseURL: baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Enhanced types that extend configuration
export interface QueueDataEnhanced {
  templeId: string;
  currentQueue: number;
  estimatedWaitTime: string;
  estimatedWaitTimeConfidence?: string;
  nextBatchTime: string;
  zones: ZoneQueueData[];
  crowdLevel: "low" | "medium" | "high";
  lastUpdated: string;
}

export interface ZoneQueueData {
  zoneId: string;
  currentCount: number;
  queueLength: number;
  estimatedWait: string;
}

export interface EnhancedTempleInfo extends TempleConfig {
  currentStatus: {
    isOpen: boolean;
    specialEvent?: string;
    crowdLevel: "low" | "medium" | "high";
    lastUpdated: string;
    nextOpenTime?: string;
    activeCapacity: number;
  };
  liveMetrics?: CrowdMetrics;
}

export interface BookingEnhanced {
  bookingId: string;
  templeId: string;
  date: string;
  timeSlot: string;
  queueNumber: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  darshanType: string;
  devoteeName: string;
  phone: string;
  email?: string;
  numberOfDevotees: number;
  amount: number;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  specialRequests?: string;
  accessibilityNeeds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AlertEnhanced {
  id: string;
  templeId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: string;
  priority: "low" | "medium" | "high";
  category: "general" | "crowd" | "weather" | "maintenance" | "festival" | "emergency";
  targetAudience: "all" | "devotees" | "staff" | "vip";
  expiresAt?: string;
  actionRequired?: boolean;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    sms: boolean;
    email: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  types: {
    bookingConfirmation: boolean;
    queueUpdates: boolean;
    emergencyAlerts: boolean;
    festivalAnnouncements: boolean;
    maintenanceNotices: boolean;
  };
}

export interface NotificationData {
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface AnalyticsData {
  period: string;
  metrics: {
    totalVisitors: number;
    totalBookings: number;
    revenue: number;
    averageWaitTime: number;
    peakHours: string[];
  };
  trends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

/**
 * Configuration-aware API service
 */
export class TempleApiService {
  private api: ReturnType<typeof createApiInstance>;
  private templeSlug: string;

  constructor(templeSlug: string) {
    this.templeSlug = templeSlug;
    this.api = createApiInstance();
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add temple context
    this.api.interceptors.request.use((config) => {
      config.headers['X-Temple-Slug'] = this.templeSlug;
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Queue and crowd management
  async getQueueData(): Promise<QueueDataEnhanced> {
    const config = await configManager.getTempleConfig(this.templeSlug);
    if (!config?.features.liveTracking) {
      // Fallback to inline mock data
      const mockData: QueueDataEnhanced = {
        templeId: config?.basic.id || 'unknown',
        currentQueue: 45,
        estimatedWaitTime: '25 minutes',
        estimatedWaitTimeConfidence: "5",
        nextBatchTime: new Date(Date.now() + 15 * 60000).toISOString(),
        zones: [],
        crowdLevel: 'medium',
        lastUpdated: new Date().toISOString()
      };
      return mockData;
    }

    try {
      // Use livePath for live queue if backend expects /api/v1/live/temple/{id}/status
      const response = await this.api.get(livePath(`/temple/${this.templeSlug}/status`));
      return response.data;
    } catch (error) {
      // Fallback to inline mock data if backend is not available (silent fallback)
      const mockData: QueueDataEnhanced = {
        templeId: config?.basic.id || 'unknown',
        currentQueue: 45,
        estimatedWaitTime: '25 minutes',
        estimatedWaitTimeConfidence: "5",
        nextBatchTime: new Date(Date.now() + 15 * 60000).toISOString(),
        zones: [],
        crowdLevel: 'medium',
        lastUpdated: new Date().toISOString()
      };
      return mockData;
    }
  }

  async getCrowdMetrics(): Promise<CrowdMetrics> {
    try {
      // Use analyticsPath for crowd metrics if backend expects /api/v1/analytics/temple/{id}
      const response = await this.api.get(analyticsPath(`/temple/${this.templeSlug}`));
      return response.data;
    } catch (error) {
      // Return mock data if backend is not available (silent fallback)
      return {
        timestamp: new Date().toISOString(),
        templeId: this.templeSlug,
        currentOccupancy: 150,
        estimatedWaitTime: 25,
        arrivalRate: 50,
        departureRate: 45,
        zones: [],
        prediction: {
          nextHour: 180,
          nextTwoHours: 200,
          peakTime: '18:00',
          recommendedArrival: '16:00'
        }
      };
    }
  }

  async getPredictedCrowdLevel(timestamp: string): Promise<{ level: string; confidence: number }> {
    try {
      // Prediction endpoint may need to be added to backend; placeholder
      const response = await this.api.get(analyticsPath(`/temple/${this.templeSlug}/prediction`), {
        params: { timestamp }
      });
      return response.data;
    } catch (error) {
      // Silent fallback to mock prediction
      return { level: 'medium', confidence: 0.7 };
    }
  }

  // Temple information
  async getTempleInfo(): Promise<EnhancedTempleInfo> {
    const config = await configManager.getTempleConfig(this.templeSlug);
    if (!config) {
      throw new Error(`Temple configuration not found for ${this.templeSlug}`);
    }

    try {
      // Get temple info
      const response = await this.api.get(templePath(this.templeSlug));
      return { ...config, ...response.data };
    } catch (error) {
      // Fallback to configuration with mock status (silent fallback)
      const mockStatus = {
        isOpen: true,
        crowdLevel: "medium" as const,
        lastUpdated: new Date().toISOString(),
        activeCapacity: config.operations.capacity.total
      };
      return { ...config, currentStatus: mockStatus };
    }
  }

  // Booking management
  async getBookings(userId?: string): Promise<BookingEnhanced[]> {
    const params = userId ? { userId } : {};
  // List bookings for user
  const response = await this.api.get(bookingPath(), { params });
    return response.data;
  }

  async getBooking(bookingId: string): Promise<BookingEnhanced> {
    // In a real application, this would fetch data from the API
    // For now, we'll mock the data
    const mockBooking = {
      bookingId: bookingId,
      templeId: this.templeSlug,
      date: "2025-09-21",
      timeSlot: "10:00 AM - 10:30 AM",
      queueNumber: 123,
      status: "confirmed",
      darshanType: "Special Darshan",
      devoteeName: "John Doe",
      phone: "1234567890",
      numberOfDevotees: 2,
      amount: 200,
      paymentStatus: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return Promise.resolve(mockBooking as BookingEnhanced);
  }

  async createBooking(bookingData: Partial<BookingEnhanced>): Promise<BookingEnhanced> {
    const config = await configManager.getTempleConfig(this.templeSlug);
    const enrichedData = {
      ...bookingData,
      templeId: config?.basic.id,
    };
    
  // Create booking
  const response = await this.api.post(bookingPath(), enrichedData);
    return response.data;
  }

  async updateBooking(bookingId: string, updates: Partial<BookingEnhanced>): Promise<BookingEnhanced> {
  // Update booking
  const response = await this.api.put(bookingPath(`/${bookingId}`), updates);
    return response.data;
  }

  async cancelBooking(bookingId: string): Promise<void> {
  // Delete booking
  await this.api.delete(bookingPath(`/${bookingId}`));
  }

  async getAvailableSlots(date: string, darshanType: string): Promise<string[]> {
  // Available slots endpoint may need to be added to backend
  const response = await this.api.get(bookingPath('/available-slots'), {
      params: { date, darshanType }
    });
    return response.data;
  }

  async getSlotAvailability(): Promise<Record<string, string>> {
    // In a real application, this would fetch data from the API
    // For now, return inline mock data
    return {
      "2024-01-15": "available",
      "2024-01-16": "available",
      "2024-01-17": "limited",
      "2024-01-18": "full"
    };
  }

  // Alerts and notifications
  async getAlerts(targetAudience: string = 'all'): Promise<AlertEnhanced[]> {
    try {
  // List alerts
  const response = await this.api.get(alertPath(), {
        params: { targetAudience }
      });
      return response.data;
    } catch {
      // Fallback to inline mock data
      const mockAlerts = [
        { id: 1, title: 'Crowd Alert', message: 'High crowd expected today', type: 'warning', timestamp: new Date().toISOString(), priority: 'high' }
      ];
      return mockAlerts.map((alert, index) => ({
        ...alert,
        id: String(alert.id || index),
        templeId: this.templeSlug,
        category: 'general' as const,
        targetAudience: 'all' as const,
        type: (alert.type as "info" | "warning" | "success" | "error") || 'info',
        priority: (alert.priority as "low" | "medium" | "high") || 'medium'
      }));
    }
  }

  async createAlert(alertData: Partial<AlertEnhanced>): Promise<AlertEnhanced> {
  // Create alert
  const response = await this.api.post(alertPath(), {
      ...alertData,
      templeId: this.templeSlug
    });
    return response.data;
  }

  async updateAlert(alertId: string, updates: Partial<AlertEnhanced>): Promise<AlertEnhanced> {
  // Update alert
  const response = await this.api.put(alertPath(`/${alertId}`), updates);
    return response.data;
  }

  async deleteAlert(alertId: string): Promise<void> {
  // Delete alert
  await this.api.delete(alertPath(`/${alertId}`));
  }

  // Notification management
  async sendNotification(type: string, recipients: string[], data: NotificationData): Promise<void> {
  // Send notification (admin)
  await this.api.post(apiPrefix('/notifications/send'), {
      type,
      recipients,
      data
    });
  }

  async updateNotificationPreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
  // Update notification preferences
  await this.api.put(apiPrefix(`/notifications/preferences/${userId}`), preferences);
  }

  // Analytics and reporting
  async getAnalytics(startDate: string, endDate: string): Promise<AnalyticsData> {
  // Temple analytics
  const response = await this.api.get(analyticsPath(`/temple/${this.templeSlug}`), {
      params: { startDate, endDate }
    });
    return response.data;
  }

  async getFootfallData(period: 'day' | 'week' | 'month'): Promise<AnalyticsData> {
  // Footfall analytics
  const response = await this.api.get(analyticsPath(`/temple/${this.templeSlug}/footfall`), {
      params: { period }
    });
    return response.data;
  }

  async getRevenueData(period: 'day' | 'week' | 'month'): Promise<AnalyticsData> {
  // Revenue analytics
  const response = await this.api.get(analyticsPath(`/temple/${this.templeSlug}/revenue`), {
      params: { period }
    });
    return response.data;
  }

  // Audit and compliance
  async getAuditLogs(startDate: string, endDate: string, entityType?: string): Promise<AuditLog[]> {
  // Audit logs
  const response = await this.api.get(apiPrefix(`/temples/${this.templeSlug}/audit-logs`), {
      params: { startDate, endDate, entityType }
    });
    return response.data;
  }

  async exportData(dataType: string, format: 'json' | 'csv' = 'json'): Promise<Blob> {
  // Export data
  const response = await this.api.get(apiPrefix(`/temples/${this.templeSlug}/export/${dataType}`), {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteUserData(userId: string): Promise<void> {
  await this.api.delete(templePath(this.templeSlug, `users/${userId}/data`));
  }
}

/**
 * Factory function to create temple-specific API service
 */
export const createTempleApiService = (templeSlug: string) => {
  return new TempleApiService(templeSlug);
};

/**
 * Hook to get temple API service
 */
export const useTempleApi = (templeSlug: string) => {
  return React.useMemo(() => createTempleApiService(templeSlug), [templeSlug]);
};
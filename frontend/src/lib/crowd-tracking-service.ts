/**
 * Live Crowd Tracking Service
 * Provides real-time crowd monitoring with multiple data sources
 */

import { 
  LiveTrackingData, 
  LiveQueueData, 
  ZoneTrackingData, 
  SensorData, 
  CrowdPrediction, 
  PredictionData,
  ManualCounterData,
  CrowdAnalytics,
  TrackingConfig
} from '@/types/crowd-tracking';
import { apiFetch } from './http';
import { wsPath, livePath, analyticsPath } from './paths';

export class CrowdTrackingService {
  private templeSlug: string;
  private config: TrackingConfig;
  private websocket: WebSocket | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();

  constructor(templeSlug: string, config: TrackingConfig) {
    this.templeSlug = templeSlug;
    this.config = config;
    this.initializeListeners();
  }

  private initializeListeners() {
    this.listeners.set('data_update', []);
    this.listeners.set('alert', []);
    this.listeners.set('sensor_status', []);
    this.listeners.set('prediction_update', []);
  }

  /**
   * Initialize real-time tracking
   */
  async startTracking(): Promise<void> {
    try {
      // Connect to WebSocket for real-time updates
      await this.connectWebSocket();
      
      // Start periodic updates
      this.startPeriodicUpdates();
      
      // Initialize sensors
      await this.initializeSensors();
      
      console.log('Crowd tracking started for temple:', this.templeSlug);
    } catch (error) {
      console.error('Failed to start crowd tracking:', error);
      throw error;
    }
  }

  /**
   * Stop tracking and cleanup resources
   */
  stopTracking(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    console.log('Crowd tracking stopped for temple:', this.templeSlug);
  }

  /**
   * Alias for stopTracking for consistency
   */
  stop(): void {
    this.stopTracking();
  }

  /**
   * Get current live tracking data
   */
  async getLiveData(): Promise<LiveTrackingData> {
    try {
      const response = await apiFetch(livePath(`/temple/${this.templeSlug}/status`));
      if (!response.ok) {
        throw new Error('Failed to fetch live tracking data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching live data:', error);
      return this.getMockLiveData();
    }
  }

  /**
   * Get queue data with real-time updates
   */
  async getQueueData(): Promise<LiveQueueData> {
    try {
      const response = await apiFetch(livePath(`/temple/${this.templeSlug}/status/queue`));
      if (!response.ok) {
        throw new Error('Failed to fetch queue data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching queue data:', error);
      return this.getMockQueueData();
    }
  }

  /**
   * Get zone-specific tracking data
   */
  async getZoneData(zoneId?: string): Promise<ZoneTrackingData[]> {
    try {
      const url = zoneId 
        ? livePath(`/temple/${this.templeSlug}/zones/${zoneId}/tracking`)
        : livePath(`/temple/${this.templeSlug}/zones/tracking`);
      
      const response = await apiFetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch zone data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching zone data:', error);
      return this.getMockZoneData();
    }
  }

  /**
   * Get sensor status and readings
   */
  async getSensorData(): Promise<SensorData[]> {
    try {
      const response = await apiFetch(livePath(`/temple/${this.templeSlug}/sensors`));
      if (!response.ok) {
        throw new Error('Failed to fetch sensor data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return this.getMockSensorData();
    }
  }

  /**
   * Get crowd predictions
   */
  async getPredictions(): Promise<CrowdPrediction> {
    try {
      const response = await apiFetch(analyticsPath(`/temple/${this.templeSlug}/predictions`));
      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching predictions:', error);
      return this.getMockPredictions();
    }
  }

  /**
   * Submit manual count
   */
  async submitManualCount(data: Omit<ManualCounterData, 'timestamp'>): Promise<void> {
    try {
      const payload = {
        ...data,
        timestamp: new Date().toISOString()
      };

      const response = await apiFetch(livePath(`/temple/${this.templeSlug}/manual-count`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit manual count');
      }

      // Trigger immediate update
      this.notifyListeners('data_update', payload);
    } catch (error) {
      console.error('Error submitting manual count:', error);
      throw error;
    }
  }

  /**
   * Get historical analytics
   */
  async getAnalytics(period: 'hour' | 'day' | 'week' | 'month'): Promise<CrowdAnalytics> {
    try {
      const response = await apiFetch(analyticsPath(`/temple/${this.templeSlug}?period=${period}`));
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return this.getMockAnalytics(period);
    }
  }

  /**
   * Event listeners
   */
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: unknown) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * WebSocket connection for real-time updates
   */
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = wsPath(this.templeSlug);
      
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('WebSocket connected for live tracking');
        resolve();
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('WebSocket connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  private handleWebSocketMessage(data: { type: string; payload: unknown }): void {
    switch (data.type) {
      case 'live_data':
        this.notifyListeners('data_update', data.payload);
        break;
      case 'alert':
        this.notifyListeners('alert', data.payload);
        break;
      case 'sensor_update':
        this.notifyListeners('sensor_status', data.payload);
        break;
      case 'prediction_update':
        this.notifyListeners('prediction_update', data.payload);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  /**
   * Periodic updates for non-WebSocket data
   */
  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(async () => {
      try {
        const liveData = await this.getLiveData();
        this.notifyListeners('data_update', liveData);
      } catch (error) {
        console.error('Error in periodic update:', error);
      }
    }, this.config.updateInterval * 1000);
  }

  /**
   * Initialize sensors
   */
  private async initializeSensors(): Promise<void> {
    try {
      const response = await apiFetch(livePath(`/temple/${this.templeSlug}/sensors/initialize`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.config.sensors)
      });

      if (!response.ok) {
        throw new Error('Failed to initialize sensors');
      }

      console.log('Sensors initialized successfully');
    } catch (error) {
      console.error('Error initializing sensors:', error);
    }
  }

  /**
   * Mock data generators for development/fallback
   */
  private getMockLiveData(): LiveTrackingData {
    const now = new Date().toISOString();
    return {
      templeId: this.templeSlug,
      timestamp: now,
      totalCrowd: Math.floor(Math.random() * 300) + 50,
      queueData: this.getMockQueueData(),
      zones: this.getMockZoneData(),
      sensors: this.getMockSensorData(),
      predictions: this.getMockPredictions(),
      alerts: []
    };
  }

  private getMockQueueData(): LiveQueueData {
    const currentCount = Math.floor(Math.random() * 150) + 25;
    const arrivalRate = Math.random() * 5 + 1;
    const serviceRate = arrivalRate * (0.8 + Math.random() * 0.4);
    
    return {
      currentCount,
      estimatedWaitTime: Math.ceil(currentCount / serviceRate),
      arrivalRate: Math.round(arrivalRate * 10) / 10,
      serviceRate: Math.round(serviceRate * 10) / 10,
      averageServiceTime: Math.round(10 / serviceRate * 10) / 10,
      queueTrend: arrivalRate > serviceRate ? 'increasing' : 'decreasing',
      confidence: Math.floor(Math.random() * 30) + 70,
      historicalAverage: 85,
      lastUpdated: new Date().toISOString()
    };
  }

  private getMockZoneData(): ZoneTrackingData[] {
    return [
      {
        zoneId: 'main-hall',
        zoneName: 'Main Hall',
        currentOccupancy: Math.floor(Math.random() * 200) + 50,
        maxCapacity: 300,
        utilizationRate: Math.floor(Math.random() * 40) + 40,
        averageStayTime: Math.floor(Math.random() * 10) + 5,
        entryRate: Math.random() * 3 + 1,
        exitRate: Math.random() * 3 + 0.8,
        density: 'medium',
        lastUpdated: new Date().toISOString()
      },
      {
        zoneId: 'queue-area',
        zoneName: 'Queue Area',
        currentOccupancy: Math.floor(Math.random() * 100) + 20,
        maxCapacity: 150,
        utilizationRate: Math.floor(Math.random() * 50) + 30,
        averageStayTime: Math.floor(Math.random() * 20) + 10,
        entryRate: Math.random() * 4 + 1,
        exitRate: Math.random() * 4 + 1.2,
        density: 'high',
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  private getMockSensorData(): SensorData[] {
    return [
      {
        sensorId: 'entrance-counter-1',
        type: 'people_counter',
        location: {
          zoneId: 'entrance',
          position: { x: 0, y: 0 },
          coverage: { radius: 5 }
        },
        reading: Math.floor(Math.random() * 10),
        status: 'active',
        lastReading: new Date().toISOString(),
        batteryLevel: Math.floor(Math.random() * 30) + 70,
        accuracy: 95
      }
    ];
  }

  private getMockPredictions(): CrowdPrediction {
    const generatePredictionData = (hours: number): PredictionData[] => {
      const predictions: PredictionData[] = [];
      for (let i = 0; i < hours; i++) {
        const timestamp = new Date(Date.now() + i * 3600000).toISOString();
        const baseCrowd = 100 + Math.sin(i * Math.PI / 12) * 50; // Sine wave pattern
        const crowdLevel: 'low' | 'medium' | 'high' | 'critical' = 
          baseCrowd > 200 ? 'critical' : baseCrowd > 150 ? 'high' : baseCrowd > 100 ? 'medium' : 'low';
        
        predictions.push({
          timestamp,
          expectedCrowd: Math.floor(baseCrowd + Math.random() * 20),
          expectedWaitTime: Math.floor((baseCrowd / 3) + Math.random() * 10),
          confidence: Math.floor(Math.random() * 20) + 75,
          crowdLevel
        });
      }
      return predictions;
    };

    return {
      nextHour: generatePredictionData(1),
      nextDay: generatePredictionData(24),
      weekend: generatePredictionData(48),
      confidence: 85,
      factors: [
        { factor: 'Historical patterns', impact: 40, description: 'Based on past crowd data' },
        { factor: 'Day of week', impact: 25, description: 'Weekend effect' },
        { factor: 'Weather', impact: 15, description: 'Clear weather increases visitors' },
        { factor: 'Festivals', impact: 20, description: 'No major festivals today' }
      ]
    };
  }

  private getMockAnalytics(period: string): CrowdAnalytics {
    const dataPoints = [];
    const count = period === 'hour' ? 24 : period === 'day' ? 7 : period === 'week' ? 4 : 12;
    
    for (let i = 0; i < count; i++) {
      dataPoints.push({
        timestamp: new Date(Date.now() - i * (period === 'hour' ? 3600000 : 86400000)).toISOString(),
        crowdCount: Math.floor(Math.random() * 200) + 50,
        waitTime: Math.floor(Math.random() * 30) + 10,
        utilizationRate: Math.floor(Math.random() * 40) + 40
      });
    }

    return {
      period: period as 'hour' | 'day' | 'week' | 'month',
      data: dataPoints,
      trends: {
        averageCrowd: 125,
        peakTimes: [
          { timeRange: '10:00-12:00', averageCrowd: 180, frequency: 85 },
          { timeRange: '18:00-20:00', averageCrowd: 160, frequency: 75 }
        ],
        growthRate: 5.2,
        seasonality: [
          { period: 'Weekend', multiplier: 1.4, confidence: 90 },
          { period: 'Festival', multiplier: 2.1, confidence: 95 }
        ]
      }
    };
  }
}
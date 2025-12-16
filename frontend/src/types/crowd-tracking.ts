/**
 * Types for live crowd tracking system
 */

export interface LiveTrackingData {
  templeId: string;
  timestamp: string;
  totalCrowd: number;
  queueData: LiveQueueData;
  zones: ZoneTrackingData[];
  sensors: SensorData[];
  predictions: CrowdPrediction;
  alerts: TrackingAlert[];
}

export interface LiveQueueData {
  currentCount: number;
  estimatedWaitTime: number; // in minutes
  arrivalRate: number; // people per minute
  serviceRate: number; // people per minute
  averageServiceTime: number; // minutes per person
  queueTrend: 'increasing' | 'decreasing' | 'stable';
  confidence: number; // 0-100
  historicalAverage: number;
  lastUpdated: string;
}

export interface ZoneTrackingData {
  zoneId: string;
  zoneName: string;
  currentOccupancy: number;
  maxCapacity: number;
  utilizationRate: number; // 0-100
  averageStayTime: number; // minutes
  entryRate: number; // people per minute
  exitRate: number; // people per minute
  density: 'low' | 'medium' | 'high' | 'critical';
  temperature?: number; // if available
  airQuality?: number; // if available
  lastUpdated: string;
}

export interface SensorData {
  sensorId: string;
  type: SensorType;
  location: SensorLocation;
  reading: number;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastReading: string;
  batteryLevel?: number;
  accuracy?: number;
}

export type SensorType = 
  | 'people_counter'
  | 'thermal_camera'
  | 'pressure_mat'
  | 'wifi_probe'
  | 'bluetooth_beacon'
  | 'cctv_analytics'
  | 'turnstile'
  | 'manual_counter';

export interface SensorLocation {
  zoneId: string;
  position: {
    x: number;
    y: number;
    elevation?: number;
  };
  coverage: {
    radius: number;
    angle?: number;
    direction?: number;
  };
}

export interface CrowdPrediction {
  nextHour: PredictionData[];
  nextDay: PredictionData[];
  weekend: PredictionData[];
  confidence: number;
  factors: PredictionFactor[];
}

export interface PredictionData {
  timestamp: string;
  expectedCrowd: number;
  expectedWaitTime: number;
  confidence: number;
  crowdLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PredictionFactor {
  factor: string;
  impact: number; // -100 to 100
  description: string;
}

export interface TrackingAlert {
  id: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  timestamp: string;
  zoneId?: string;
  sensorId?: string;
  threshold?: number;
  currentValue?: number;
  autoResolved?: boolean;
  actions?: AlertAction[];
}

export type AlertType = 
  | 'capacity_exceeded'
  | 'long_wait_time'
  | 'sensor_failure'
  | 'crowd_density'
  | 'safety_concern'
  | 'system_maintenance'
  | 'prediction_warning';

export interface AlertAction {
  action: string;
  description: string;
  automated: boolean;
  executed?: boolean;
  executedAt?: string;
}

// Integration interfaces
export interface GoogleMapsIntegration {
  enabled: boolean;
  apiKey?: string;
  placeId?: string;
  crowdData?: {
    popularTimes: PopularTimeData[];
    liveOccupancy?: number;
    lastUpdated: string;
  };
}

export interface PopularTimeData {
  dayOfWeek: number; // 0-6
  hours: number[]; // Array of 24 values (0-100)
}

export interface ManualCounterData {
  counterId: string;
  staffId: string;
  timestamp: string;
  count: number;
  location: string;
  notes?: string;
}

// Historical data for analytics
export interface CrowdAnalytics {
  period: 'hour' | 'day' | 'week' | 'month';
  data: AnalyticsDataPoint[];
  trends: {
    averageCrowd: number;
    peakTimes: PeakTimeData[];
    growthRate: number;
    seasonality: SeasonalityData[];
  };
}

export interface AnalyticsDataPoint {
  timestamp: string;
  crowdCount: number;
  waitTime: number;
  utilizationRate: number;
  weather?: WeatherData;
  events?: string[];
}

export interface PeakTimeData {
  timeRange: string;
  averageCrowd: number;
  frequency: number;
  dayOfWeek?: number;
}

export interface SeasonalityData {
  period: string;
  multiplier: number;
  confidence: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  condition: string;
}

// Configuration for tracking system
export interface TrackingConfig {
  updateInterval: number; // seconds
  predictionHorizon: number; // hours
  alertThresholds: {
    capacityWarning: number; // percentage
    capacityCritical: number; // percentage
    waitTimeWarning: number; // minutes
    waitTimeCritical: number; // minutes
  };
  sensors: SensorConfig[];
  integrations: {
    googleMaps: GoogleMapsIntegration;
    weatherAPI: boolean;
    manualCounters: boolean;
  };
}

export interface SensorConfig {
  id: string;
  type: SensorType;
  location: SensorLocation;
  calibration: {
    factor: number;
    offset: number;
    lastCalibrated: string;
  };
  maintenance: {
    lastMaintained: string;
    nextMaintenance: string;
    status: 'ok' | 'due' | 'overdue';
  };
}
/**
 * Advanced Analytics Types and Interfaces
 * Comprehensive analytics system for temple crowd management
 */

// Time-based analytics data
export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Footfall Analytics
export interface FootfallAnalytics {
  summary: FootfallSummary;
  trends: FootfallTrend[];
  patterns: FootfallPattern[];
  forecasts: FootfallForecast[];
  anomalies: FootfallAnomaly[];
}

export interface FootfallSummary {
  totalVisitors: number;
  averageDaily: number;
  peakDay: {
    date: Date;
    count: number;
  };
  growthRate: number; // percentage
  comparisonPeriod: {
    current: number;
    previous: number;
    change: number;
  };
}

export interface FootfallTrend {
  date: Date;
  visitors: number;
  hour: number;
  dayOfWeek: number;
  isHoliday: boolean;
  weatherCondition?: string;
  specialEvent?: string;
}

export interface FootfallPattern {
  type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'seasonal';
  pattern: TimeSeriesData[];
  confidence: number;
  seasonality: number;
}

export interface FootfallForecast {
  date: Date;
  predictedVisitors: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  factors: ForecastFactor[];
}

export interface ForecastFactor {
  factor: string;
  impact: number; // -1 to 1
  confidence: number;
}

export interface FootfallAnomaly {
  date: Date;
  expectedValue: number;
  actualValue: number;
  severity: 'low' | 'medium' | 'high';
  possibleCauses: string[];
}

// Capacity Analytics
export interface CapacityAnalytics {
  utilization: CapacityUtilization;
  efficiency: CapacityEfficiency;
  optimization: CapacityOptimization;
  zoneAnalysis: ZoneAnalytics[];
}

export interface CapacityUtilization {
  overall: {
    averageUtilization: number;
    peakUtilization: number;
    utilizationTrend: TimeSeriesData[];
  };
  zones: {
    [zoneId: string]: {
      averageUtilization: number;
      peakUtilization: number;
      bottleneckScore: number;
    };
  };
  timeSlots: {
    [timeSlot: string]: {
      utilization: number;
      variance: number;
    };
  };
}

export interface CapacityEfficiency {
  throughputRate: number; // visitors per hour
  dwellTime: number; // average time spent
  turnoverRate: number;
  queueEfficiency: number;
  resourceUtilization: number;
}

export interface CapacityOptimization {
  recommendations: OptimizationRecommendation[];
  potentialImprovements: {
    capacityIncrease: number;
    waitTimeReduction: number;
    revenueIncrease: number;
  };
  scenarios: OptimizationScenario[];
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimatedBenefit: number;
  implementationSteps: string[];
}

export interface OptimizationScenario {
  name: string;
  changes: string[];
  expectedOutcome: {
    capacityChange: number;
    waitTimeChange: number;
    revenueChange: number;
    satisfactionChange: number;
  };
}

export interface ZoneAnalytics {
  zoneId: string;
  zoneName: string;
  utilization: number;
  popularity: number;
  dwellTime: number;
  congestionScore: number;
  satisfactionScore: number;
  revenueContribution: number;
}

// User Behavior Analytics
export interface UserBehaviorAnalytics {
  segments: UserSegment[];
  journeys: UserJourney[];
  preferences: UserPreferences;
  satisfaction: SatisfactionAnalytics;
  retention: RetentionAnalytics;
}

export interface UserSegment {
  id: string;
  name: string;
  size: number;
  characteristics: {
    averageAge: number;
    visitFrequency: number;
    averageSpending: number;
    preferredTimes: string[];
    preferredZones: string[];
  };
  behavior: {
    conversionRate: number;
    churnRate: number;
    lifetimeValue: number;
  };
}

export interface UserJourney {
  journeyId: string;
  touchpoints: Touchpoint[];
  duration: number;
  completionRate: number;
  dropoffPoints: string[];
  satisfactionScore: number;
}

export interface Touchpoint {
  step: string;
  timestamp: Date;
  zone?: string;
  action: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface UserPreferences {
  visitTimes: {
    [timeSlot: string]: number;
  };
  darshanTypes: {
    [type: string]: number;
  };
  paymentMethods: {
    [method: string]: number;
  };
  channels: {
    [channel: string]: number;
  };
}

export interface SatisfactionAnalytics {
  overallScore: number;
  factors: {
    [factor: string]: number;
  };
  trends: TimeSeriesData[];
  feedback: FeedbackAnalytics;
}

export interface FeedbackAnalytics {
  totalResponses: number;
  averageRating: number;
  sentimentScore: number;
  topComplaints: string[];
  topPraises: string[];
  responseRate: number;
}

export interface RetentionAnalytics {
  overallRetention: number;
  cohortAnalysis: CohortData[];
  churnPrediction: ChurnPrediction[];
  loyaltyMetrics: LoyaltyMetrics;
}

export interface CohortData {
  cohort: string;
  retentionRates: number[];
  size: number;
  averageValue: number;
}

export interface ChurnPrediction {
  userId: string;
  churnProbability: number;
  riskFactors: string[];
  recommendedActions: string[];
}

export interface LoyaltyMetrics {
  loyalUsers: number;
  averageLifetime: number;
  loyaltyScore: number;
  reactivationRate: number;
}

// Revenue Analytics
export interface RevenueAnalytics {
  overview: RevenueOverview;
  trends: RevenueTrend[];
  sources: RevenueSource[];
  optimization: RevenueOptimization;
  forecasts: RevenueForecast[];
}

export interface RevenueOverview {
  totalRevenue: number;
  averageDailyRevenue: number;
  revenuePerVisitor: number;
  growthRate: number;
  seasonality: number;
  breakdown: {
    [category: string]: number;
  };
}

export interface RevenueTrend {
  date: Date;
  revenue: number;
  visitors: number;
  conversionRate: number;
  averageTransactionValue: number;
}

export interface RevenueSource {
  source: string;
  revenue: number;
  percentage: number;
  growth: number;
  profitability: number;
}

export interface RevenueOptimization {
  pricingRecommendations: PricingRecommendation[];
  upsellOpportunities: UpsellOpportunity[];
  conversionOptimization: ConversionOptimization[];
}

export interface PricingRecommendation {
  item: string;
  currentPrice: number;
  recommendedPrice: number;
  elasticity: number;
  expectedImpact: number;
}

export interface UpsellOpportunity {
  baseProduct: string;
  upsellProduct: string;
  successRate: number;
  averageValue: number;
  targeting: string[];
}

export interface ConversionOptimization {
  funnel: string;
  currentRate: number;
  targetRate: number;
  improvements: string[];
  expectedIncrease: number;
}

export interface RevenueForecast {
  date: Date;
  predictedRevenue: number;
  confidence: number;
  factors: ForecastFactor[];
  scenarios: {
    conservative: number;
    optimistic: number;
    pessimistic: number;
  };
}

// Predictive Analytics
export interface PredictiveAnalytics {
  models: PredictiveModel[];
  predictions: Prediction[];
  recommendations: PredictiveRecommendation[];
  alerts: PredictiveAlert[];
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'footfall' | 'revenue' | 'capacity' | 'churn' | 'satisfaction';
  accuracy: number;
  lastTrained: Date;
  features: string[];
  performance: ModelPerformance;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mape: number; // Mean Absolute Percentage Error
}

export interface Prediction {
  modelId: string;
  type: string;
  timeHorizon: string;
  value: number;
  confidence: number;
  factors: ForecastFactor[];
  createdAt: Date;
}

export interface PredictiveRecommendation {
  id: string;
  title: string;
  description: string;
  prediction: Prediction;
  actionRequired: boolean;
  urgency: 'low' | 'medium' | 'high';
  estimatedImpact: number;
}

export interface PredictiveAlert {
  id: string;
  type: 'anomaly' | 'threshold' | 'trend';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  prediction: Prediction;
  recommendedActions: string[];
  createdAt: Date;
}

// Real-time Analytics
export interface RealTimeAnalytics {
  currentMetrics: CurrentMetrics;
  liveUpdates: LiveUpdate[];
  alerts: RealTimeAlert[];
  dashboardData: DashboardData;
}

export interface CurrentMetrics {
  currentVisitors: number;
  capacityUtilization: number;
  averageWaitTime: number;
  revenue: {
    today: number;
    hourly: number;
  };
  satisfaction: number;
  queueLength: number;
}

export interface LiveUpdate {
  timestamp: Date;
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RealTimeAlert {
  id: string;
  type: 'capacity' | 'queue' | 'satisfaction' | 'technical';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  acknowledged: boolean;
}

export interface DashboardData {
  widgets: DashboardWidget[];
  lastUpdated: Date;
  refreshInterval: number;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'gauge' | 'map';
  title: string;
  data: unknown;
  config: WidgetConfig;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  timeRange?: DateRange;
  refreshRate?: number;
  filters?: Record<string, unknown>;
  thresholds?: {
    warning: number;
    critical: number;
  };
}

// Analytics Query Interface
export interface AnalyticsQuery {
  type: 'footfall' | 'capacity' | 'behavior' | 'revenue' | 'predictive' | 'realtime';
  dateRange: DateRange;
  filters: AnalyticsFilters;
  aggregation: 'hour' | 'day' | 'week' | 'month' | 'year';
  metrics: string[];
  dimensions: string[];
}

export interface AnalyticsFilters {
  zones?: string[];
  userSegments?: string[];
  darshanTypes?: string[];
  paymentMethods?: string[];
  weatherConditions?: string[];
  specialEvents?: string[];
  ageGroups?: string[];
  visitFrequency?: string[];
}

// Export and Reporting
export interface AnalyticsReport {
  id: string;
  title: string;
  description: string;
  type: 'scheduled' | 'ondemand' | 'alert';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  recipients: string[];
  schedule?: ReportSchedule;
  filters: AnalyticsFilters;
  sections: ReportSection[];
  createdAt: Date;
  lastGenerated?: Date;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  timezone: string;
  enabled: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'chart' | 'table' | 'insights';
  data: unknown;
  description?: string;
}

// Analytics Configuration
export interface AnalyticsConfig {
  dataRetention: {
    rawData: number; // days
    aggregatedData: number; // days
    reports: number; // days
  };
  sampling: {
    enabled: boolean;
    rate: number; // percentage
    strategy: 'random' | 'systematic' | 'stratified';
  };
  privacy: {
    anonymizeData: boolean;
    encryptSensitiveData: boolean;
    gdprCompliant: boolean;
  };
  performance: {
    cacheEnabled: boolean;
    cacheTtl: number; // seconds
    precomputeAggregations: boolean;
  };
  alerts: {
    enabled: boolean;
    thresholds: Record<string, number>;
    channels: string[];
  };
}
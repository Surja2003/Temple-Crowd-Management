/**
 * Types for Dynamic Capacity Management System
 */

export interface CapacityRule {
  id: string;
  name: string;
  description: string;
  priority: number; // Higher priority rules override lower ones
  active: boolean;
  
  // Rule conditions
  conditions: CapacityCondition[];
  
  // Rule effects
  effects: CapacityEffect[];
  
  // Validity period
  validFrom: string;
  validTo?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  lastModified: string;
  version: number;
}

export interface CapacityCondition {
  type: ConditionType;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: string | number | string[] | number[] | boolean;
  metadata?: Record<string, unknown>;
}

export type ConditionType = 
  | 'date_range'
  | 'time_range' 
  | 'day_of_week'
  | 'festival'
  | 'weather'
  | 'current_occupancy'
  | 'booking_count'
  | 'user_type'
  | 'zone_id'
  | 'darshan_type'
  | 'special_event';

export interface CapacityEffect {
  type: EffectType;
  target: EffectTarget;
  operation: 'set' | 'multiply' | 'add' | 'subtract';
  value: number;
  metadata?: Record<string, unknown>;
}

export type EffectType = 
  | 'capacity_adjustment'
  | 'zone_capacity_adjustment'
  | 'slot_capacity_adjustment'
  | 'booking_limit'
  | 'wait_time_multiplier'
  | 'price_adjustment'
  | 'access_restriction';

export interface EffectTarget {
  scope: 'temple' | 'zone' | 'darshan_type' | 'time_slot' | 'user_type';
  identifier?: string; // zone id, darshan type id, etc.
}

// Current capacity state
export interface CapacityState {
  templeId: string;
  timestamp: string;
  
  // Overall capacity
  totalCapacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  utilizationRate: number;
  
  // Zone-wise capacity
  zones: ZoneCapacityState[];
  
  // Time slot capacity
  timeSlots: TimeSlotCapacity[];
  
  // Active rules affecting capacity
  activeRules: string[]; // Rule IDs
  
  // Overrides
  manualOverrides: CapacityOverride[];
}

export interface ZoneCapacityState {
  zoneId: string;
  zoneName: string;
  baseCapacity: number;
  adjustedCapacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  utilizationRate: number;
  restrictions: ZoneRestriction[];
}

export interface TimeSlotCapacity {
  slot: string; // "09:00-10:00"
  date: string;
  baseCapacity: number;
  adjustedCapacity: number;
  bookedCapacity: number;
  availableCapacity: number;
  waitingList: number;
  restrictions: SlotRestriction[];
}

export interface ZoneRestriction {
  type: 'user_type' | 'booking_required' | 'maintenance' | 'vip_only';
  description: string;
  appliedBy: string; // rule id or manual override
}

export interface SlotRestriction {
  type: 'fully_booked' | 'maintenance' | 'special_event' | 'weather';
  description: string;
  appliedBy: string;
}

export interface CapacityOverride {
  id: string;
  type: 'emergency_closure' | 'capacity_increase' | 'capacity_decrease' | 'zone_closure' | 'slot_closure';
  description: string;
  
  // Override details
  target: EffectTarget;
  newValue: number;
  reason: string;
  
  // Validity
  validFrom: string;
  validTo?: string;
  
  // Authorization
  authorizedBy: string;
  authorizedAt: string;
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

// Festival and special event management
export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  type: 'festival' | 'maintenance' | 'special_darshan' | 'cultural_event' | 'emergency';
  
  // Timing
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  
  // Capacity impact
  capacityRules: string[]; // Rule IDs that apply during this event
  automaticRules: CapacityRule[]; // Rules created specifically for this event
  
  // Priority and conflicts
  priority: number;
  conflictResolution: 'override' | 'merge' | 'reject';
  
  // Notification
  announcements: EventAnnouncement[];
  
  // Status
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

export interface EventAnnouncement {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'capacity_change';
  targetAudience: 'all' | 'staff' | 'devotees' | 'vip';
  scheduledFor: string;
  sent: boolean;
}

// VIP and priority management
export interface PriorityBookingRule {
  id: string;
  name: string;
  userTypes: string[]; // 'vip', 'senior_citizen', 'temple_member', etc.
  
  // Benefits
  capacityReservation: number; // percentage of capacity reserved
  advanceBookingDays: number; // how many days in advance they can book
  skipWaitingList: boolean;
  prioritySlots: string[]; // time slots reserved for this group
  
  // Restrictions
  maxBookingsPerDay: number;
  maxDevoteesPerBooking: number;
  
  // Validity
  validDays: number[]; // 0-6 (Sunday-Saturday)
  validTimeSlots: string[];
  
  active: boolean;
}

// Weather and external factors
export interface WeatherCapacityRule {
  id: string;
  weatherCondition: WeatherCondition;
  capacityMultiplier: number; // 0.5 = 50% capacity in bad weather
  affectedZones: string[]; // zones affected (outdoor zones in rain)
  autoApply: boolean;
  manualOverrideRequired: boolean;
}

export interface WeatherCondition {
  condition: 'rain' | 'heavy_rain' | 'storm' | 'extreme_heat' | 'fog' | 'clear';
  temperature?: {
    min?: number;
    max?: number;
  };
  precipitation?: {
    min?: number; // mm
  };
  windSpeed?: {
    max?: number; // km/h
  };
}

// Analytics and reporting
export interface CapacityAnalytics {
  period: 'day' | 'week' | 'month';
  data: CapacityAnalyticsData[];
  insights: CapacityInsight[];
  recommendations: CapacityRecommendation[];
}

export interface CapacityAnalyticsData {
  timestamp: string;
  plannedCapacity: number;
  actualCapacity: number;
  utilization: number;
  overrides: number;
  rulesApplied: string[];
  events: string[];
}

export interface CapacityInsight {
  type: 'peak_utilization' | 'underutilized_slots' | 'frequent_overrides' | 'rule_conflicts';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

export interface CapacityRecommendation {
  id: string;
  type: 'rule_adjustment' | 'capacity_increase' | 'slot_redistribution' | 'new_rule';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: 'automatic' | 'manual' | 'requires_approval';
  priority: number;
}

// Configuration
export interface CapacityManagementConfig {
  // Rule engine settings
  ruleEngine: {
    evaluationInterval: number; // seconds
    conflictResolution: 'priority' | 'latest' | 'manual';
    autoApplyRules: boolean;
    requireApprovalForOverrides: boolean;
  };
  
  // Notification settings
  notifications: {
    capacityThresholds: {
      warning: number; // 80%
      critical: number; // 95%
    };
    stakeholders: {
      templeStaff: string[];
      administrators: string[];
      security: string[];
    };
  };
  
  // Integration settings
  integrations: {
    weatherAPI: boolean;
    calendarSync: boolean;
    bookingSystem: boolean;
    crowdTracking: boolean;
  };
  
  // Default rules
  defaultRules: {
    maxOccupancyRate: number; // 90%
    emergencyCapacityReduction: number; // 50%
    bufferCapacity: number; // 10%
  };
}
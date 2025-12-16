/**
 * Comprehensive Audit Logging System Types
 */

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  userRole: string;
  templeId: string;
  sessionId: string;
  
  // Action details
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  
  // Context information
  resource: AuditResource;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  
  // System context
  ipAddress: string;
  userAgent: string;
  requestId?: string;
  correlationId?: string;
  
  // Additional metadata
  metadata: Record<string, unknown>;
  tags: string[];
  
  // Compliance and retention
  retentionPeriod: number; // days
  complianceLevel: ComplianceLevel;
  sensitive: boolean;
  
  // Success/failure
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  
  // Performance tracking
  duration?: number; // milliseconds
  responseSize?: number; // bytes
}

export enum AuditAction {
  // Authentication & Authorization
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_RESET = 'password_reset',
  SESSION_EXPIRED = 'session_expired',
  PERMISSION_DENIED = 'permission_denied',
  
  // User Management
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ACTIVATED = 'user_activated',
  USER_DEACTIVATED = 'user_deactivated',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REMOVED = 'role_removed',
  
  // Booking Operations
  BOOKING_CREATED = 'booking_created',
  BOOKING_UPDATED = 'booking_updated',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CHECKED_IN = 'booking_checked_in',
  BOOKING_NO_SHOW = 'booking_no_show',
  
  // Capacity Management
  CAPACITY_RULE_CREATED = 'capacity_rule_created',
  CAPACITY_RULE_UPDATED = 'capacity_rule_updated',
  CAPACITY_RULE_DELETED = 'capacity_rule_deleted',
  CAPACITY_OVERRIDE_CREATED = 'capacity_override_created',
  CAPACITY_OVERRIDE_REMOVED = 'capacity_override_removed',
  CAPACITY_CHANGED = 'capacity_changed',
  
  // Crowd Management
  CROWD_DATA_UPDATE = 'crowd_data_update',
  SENSOR_READING = 'sensor_reading',
  CROWD_ALERT = 'crowd_alert',
  QUEUE_STATUS_CHANGE = 'queue_status_change',
  
  // Notifications
  NOTIFICATION_SENT = 'notification_sent',
  NOTIFICATION_DELIVERED = 'notification_delivered',
  NOTIFICATION_FAILED = 'notification_failed',
  NOTIFICATION_TEMPLATE_CREATED = 'notification_template_created',
  NOTIFICATION_TEMPLATE_UPDATED = 'notification_template_updated',
  
  // Configuration
  CONFIG_UPDATED = 'config_updated',
  TEMPLE_SETTINGS_CHANGED = 'temple_settings_changed',
  FEATURE_TOGGLED = 'feature_toggled',
  INTEGRATION_CONFIGURED = 'integration_configured',
  
  // Data Operations
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  DATA_BACKUP = 'data_backup',
  DATA_RESTORE = 'data_restore',
  DATA_DELETED = 'data_deleted',
  
  // System Events
  SYSTEM_STARTUP = 'system_startup',
  SYSTEM_SHUTDOWN = 'system_shutdown',
  HEALTH_CHECK = 'health_check',
  MAINTENANCE_MODE = 'maintenance_mode',
  
  // Security Events
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_TOKEN = 'invalid_token',
  CSRF_ATTEMPT = 'csrf_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  
  // API Operations
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',
  API_ERROR = 'api_error',
  WEBHOOK_RECEIVED = 'webhook_received',
  WEBHOOK_SENT = 'webhook_sent',
  
  // File Operations
  FILE_UPLOADED = 'file_uploaded',
  FILE_DOWNLOADED = 'file_downloaded',
  FILE_DELETED = 'file_deleted',
  
  // Payment & Financial
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_PROCESSED = 'refund_processed',
  
  // Reporting & Analytics
  REPORT_GENERATED = 'report_generated',
  ANALYTICS_QUERY = 'analytics_query',
  DASHBOARD_VIEWED = 'dashboard_viewed',
}

export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  USER_MANAGEMENT = 'user_management',
  BOOKING = 'booking',
  CAPACITY = 'capacity',
  CROWD = 'crowd',
  NOTIFICATION = 'notification',
  CONFIGURATION = 'configuration',
  DATA = 'data',
  SYSTEM = 'system',
  SECURITY = 'security',
  API = 'api',
  FILE = 'file',
  PAYMENT = 'payment',
  REPORTING = 'reporting',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AuditResource {
  type: string; // e.g., 'user', 'booking', 'capacity_rule'
  name: string; // human-readable name
  endpoint?: string; // API endpoint if applicable
  table?: string; // database table if applicable
}

export enum ComplianceLevel {
  BASIC = 'basic',
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  SOX = 'sox',
  PCI_DSS = 'pci_dss',
  ISO27001 = 'iso27001',
}

// Audit search and filtering
export interface AuditSearchCriteria {
  // Time range
  startDate?: Date;
  endDate?: Date;
  
  // User filters
  userId?: string;
  userEmail?: string;
  userRole?: string;
  
  // Action filters
  actions?: AuditAction[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  
  // Resource filters
  resourceType?: string;
  resourceId?: string;
  
  // Status filters
  success?: boolean;
  
  // Temple filter
  templeId?: string;
  
  // Text search
  searchText?: string;
  
  // Pagination
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'action' | 'user' | 'severity';
  sortOrder?: 'asc' | 'desc';
  
  // Advanced filters
  ipAddress?: string;
  sessionId?: string;
  correlationId?: string;
  tags?: string[];
  
  // Compliance filters
  complianceLevel?: ComplianceLevel;
  sensitive?: boolean;
}

export interface AuditSearchResult {
  entries: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Audit analytics and reporting
export interface AuditAnalytics {
  summary: AuditSummary;
  trends: AuditTrend[];
  topActions: ActionCount[];
  topUsers: UserActivityCount[];
  securityEvents: SecurityEventSummary;
  complianceStatus: ComplianceStatus;
}

export interface AuditSummary {
  totalEntries: number;
  totalUsers: number;
  successRate: number;
  averageResponseTime: number;
  
  // By time period
  last24Hours: number;
  lastWeek: number;
  lastMonth: number;
  
  // By category
  byCategoryCount: Record<AuditCategory, number>;
  bySeverityCount: Record<AuditSeverity, number>;
}

export interface AuditTrend {
  date: string;
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  uniqueUsers: number;
  securityEvents: number;
}

export interface ActionCount {
  action: AuditAction;
  count: number;
  successRate: number;
}

export interface UserActivityCount {
  userId: string;
  userEmail: string;
  actionCount: number;
  lastActivity: Date;
  riskScore: number; // 0-100, based on actions and patterns
}

export interface SecurityEventSummary {
  totalSecurityEvents: number;
  criticalEvents: number;
  suspiciousActivities: number;
  failedLogins: number;
  rateLimitExceeded: number;
  
  // Recent security events
  recentEvents: AuditLogEntry[];
}

export interface ComplianceStatus {
  overallScore: number; // 0-100
  gdprCompliance: boolean;
  dataRetentionCompliance: boolean;
  auditTrailCompleteness: number; // percentage
  
  // Compliance issues
  issues: ComplianceIssue[];
  recommendations: ComplianceRecommendation[];
}

export interface ComplianceIssue {
  id: string;
  type: 'data_retention' | 'access_logging' | 'encryption' | 'anonymization';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedRecords: number;
  dueDate?: Date;
}

export interface ComplianceRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedEffort: string; // e.g., "2 hours", "1 day"
  category: string;
}

// Audit configuration
export interface AuditConfig {
  // Retention policies
  defaultRetentionDays: number;
  categoryRetentionPolicies: Record<AuditCategory, number>;
  
  // Logging levels
  logLevel: 'minimal' | 'standard' | 'detailed' | 'comprehensive';
  
  // Performance settings
  batchSize: number;
  flushInterval: number; // milliseconds
  
  // Storage settings
  enableCompression: boolean;
  enableEncryption: boolean;
  storageLocation: 'database' | 'file' | 'cloud';
  
  // Monitoring and alerting
  enableRealTimeAlerts: boolean;
  securityAlertThreshold: number;
  performanceAlertThreshold: number; // milliseconds
  
  // Compliance settings
  enableGdprMode: boolean;
  enableDataMinimization: boolean;
  enableAnonymization: boolean;
  
  // Integration settings
  syslogEnabled: boolean;
  syslogServer?: string;
  siemIntegration?: {
    enabled: boolean;
    endpoint: string;
    apiKey: string;
  };
}

// Real-time audit events
export interface AuditEventSubscription {
  id: string;
  filters: AuditSearchCriteria;
  callback: (entry: AuditLogEntry) => void;
  active: boolean;
}

// Audit export formats
export interface AuditExportOptions {
  format: 'json' | 'csv' | 'xml' | 'pdf';
  criteria: AuditSearchCriteria;
  includeMetadata: boolean;
  anonymizeData: boolean;
  
  // PDF-specific options
  includeCharts?: boolean;
  includeSummary?: boolean;
  
  // Compression
  compress?: boolean;
  password?: string;
}

export interface AuditExportResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  recordCount: number;
  expiresAt: Date;
}

// Audit data retention and archival
export interface AuditRetentionPolicy {
  id: string;
  name: string;
  description: string;
  
  // Criteria for applying policy
  categories: AuditCategory[];
  severities: AuditSeverity[];
  complianceLevels: ComplianceLevel[];
  
  // Retention rules
  retentionDays: number;
  archiveAfterDays: number;
  deleteAfterDays: number;
  
  // Processing rules
  anonymizeBeforeArchive: boolean;
  encryptArchive: boolean;
  
  // Status
  active: boolean;
  lastProcessed: Date;
  nextProcessing: Date;
}

// Audit integrity verification
export interface AuditIntegrityCheck {
  id: string;
  timestamp: Date;
  type: 'hash_verification' | 'sequence_check' | 'timestamp_validation';
  
  // Check parameters
  startDate: Date;
  endDate: Date;
  recordCount: number;
  
  // Results
  passed: boolean;
  issues: IntegrityIssue[];
  
  // Verification details
  checksum: string;
  signatureValid: boolean;
}

export interface IntegrityIssue {
  type: 'missing_sequence' | 'invalid_hash' | 'timestamp_anomaly' | 'tampering_detected';
  recordId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
}

// Performance monitoring for audit system
export interface AuditPerformanceMetrics {
  timestamp: Date;
  
  // Throughput metrics
  entriesPerSecond: number;
  queryResponseTime: number;
  indexingTime: number;
  
  // Storage metrics
  totalStorageSize: number;
  storageGrowthRate: number;
  compressionRatio: number;
  
  // System health
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  
  // Queue metrics
  pendingEntries: number;
  processingTime: number;
  errorRate: number;
}
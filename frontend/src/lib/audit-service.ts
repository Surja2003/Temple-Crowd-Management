/**
 * Comprehensive Audit Logging Service
 */

import { 
  AuditLogEntry, 
  AuditAction, 
  AuditCategory, 
  AuditSeverity, 
  AuditResource,
  AuditSearchCriteria,
  AuditSearchResult,
  AuditConfig,
  AuditEventSubscription,
  ComplianceLevel,
  AuditAnalytics,
  AuditExportOptions,
  AuditExportResult,
  AuditIntegrityCheck
} from '@/types/audit';

interface AuditContext {
  userId: string;
  userEmail: string;
  userRole: string;
  templeId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  requestId?: string;
}

export class AuditService {
  private static instance: AuditService;
  private config: AuditConfig;
  private subscribers: Map<string, AuditEventSubscription> = new Map();
  private pendingEntries: AuditLogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: AuditConfig) {
    this.config = config;
    this.startPeriodicFlush();
  }

  static getInstance(config?: AuditConfig): AuditService {
    if (!AuditService.instance) {
      if (!config) {
        throw new Error('AuditService requires configuration on first initialization');
      }
      AuditService.instance = new AuditService(config);
    }
    return AuditService.instance;
  }

  // Core logging methods
  async log(
    action: AuditAction,
    resource: AuditResource,
    context: AuditContext,
    options: {
      resourceId?: string;
      oldValue?: Record<string, unknown>;
      newValue?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
      tags?: string[];
      severity?: AuditSeverity;
      success?: boolean;
      errorCode?: string;
      errorMessage?: string;
      duration?: number;
      responseSize?: number;
      sensitive?: boolean;
    } = {}
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: context.userId,
      userEmail: context.userEmail,
      userRole: context.userRole,
      templeId: context.templeId,
      sessionId: context.sessionId,
      
      action,
      category: this.getActionCategory(action),
      severity: options.severity || this.getDefaultSeverity(action),
      
      resource,
      resourceId: options.resourceId,
      oldValue: options.oldValue,
      newValue: options.newValue,
      
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      correlationId: this.generateCorrelationId(),
      
      metadata: {
        ...options.metadata,
        logLevel: this.config.logLevel,
        version: '1.0'
      },
      tags: options.tags || [],
      
      retentionPeriod: this.getRetentionPeriod(this.getActionCategory(action)),
      complianceLevel: this.getComplianceLevel(action),
      sensitive: options.sensitive || this.isSensitiveAction(action),
      
      success: options.success !== undefined ? options.success : true,
      errorCode: options.errorCode,
      errorMessage: options.errorMessage,
      
      duration: options.duration,
      responseSize: options.responseSize
    };

    // Add to pending queue
    this.pendingEntries.push(entry);

    // Notify real-time subscribers
    this.notifySubscribers(entry);

    // Flush immediately for critical events
    if (entry.severity === AuditSeverity.CRITICAL) {
      await this.flushPendingEntries();
    }

    // Check batch size for flushing
    if (this.pendingEntries.length >= this.config.batchSize) {
      await this.flushPendingEntries();
    }
  }

  // Convenience methods for common actions
  async logUserAction(
    action: AuditAction,
    context: AuditContext,
    options?: {
      resourceId?: string;
      oldValue?: Record<string, unknown>;
      newValue?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    await this.log(action, { type: 'user', name: 'User Management' }, context, options);
  }

  async logBookingAction(
    action: AuditAction,
    bookingId: string,
    context: AuditContext,
    bookingData?: Record<string, unknown>
  ): Promise<void> {
    await this.log(
      action,
      { type: 'booking', name: 'Booking Management' },
      context,
      {
        resourceId: bookingId,
        newValue: bookingData,
        tags: ['booking', 'darshan']
      }
    );
  }

  async logSecurityEvent(
    action: AuditAction,
    context: AuditContext,
    details: {
      threatLevel?: 'low' | 'medium' | 'high' | 'critical';
      source?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    await this.log(
      action,
      { type: 'security', name: 'Security Event' },
      context,
      {
        severity: details.threatLevel === 'critical' ? AuditSeverity.CRITICAL :
                 details.threatLevel === 'high' ? AuditSeverity.HIGH :
                 details.threatLevel === 'medium' ? AuditSeverity.MEDIUM : AuditSeverity.LOW,
        metadata: {
          ...details.metadata,
          threatLevel: details.threatLevel,
          source: details.source
        },
        tags: ['security', 'threat'],
        sensitive: true
      }
    );
  }

  async logSystemEvent(
    action: AuditAction,
    context: AuditContext,
    systemInfo?: Record<string, unknown>
  ): Promise<void> {
    await this.log(
      action,
      { type: 'system', name: 'System Event' },
      context,
      {
        metadata: systemInfo,
        tags: ['system', 'infrastructure']
      }
    );
  }

  async logAPIRequest(
    endpoint: string,
    method: string,
    context: AuditContext,
    options: {
      responseCode: number;
      duration: number;
      responseSize?: number;
      requestBody?: Record<string, unknown>;
      responseBody?: Record<string, unknown>;
    }
  ): Promise<void> {
    await this.log(
      AuditAction.API_REQUEST,
      { type: 'api', name: 'API Request', endpoint },
      context,
      {
        success: options.responseCode < 400,
        duration: options.duration,
        responseSize: options.responseSize,
        metadata: {
          method,
          responseCode: options.responseCode,
          requestBody: this.sanitizeRequestBody(options.requestBody),
          responseBody: this.sanitizeResponseBody(options.responseBody)
        },
        tags: ['api', method.toLowerCase()]
      }
    );
  }

  // Search and retrieval
  async search(criteria: AuditSearchCriteria): Promise<AuditSearchResult> {
    // Implementation would query the audit log storage
    // This is a mock implementation
    const mockEntries: AuditLogEntry[] = [];
    
    return {
      entries: mockEntries,
      total: 0,
      page: criteria.page || 1,
      limit: criteria.limit || 50,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getById(id: string): Promise<AuditLogEntry | null> {
    // Implementation would query specific audit entry
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getByCorrelationId(correlationId: string): Promise<AuditLogEntry[]> {
    // Implementation would query related audit entries
    return [];
  }

  // Analytics and reporting
  async getAnalytics(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    startDate: Date,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    endDate: Date,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    templeId?: string
  ): Promise<AuditAnalytics> {
    // Implementation would generate analytics from audit data
    return {
      summary: {
        totalEntries: 0,
        totalUsers: 0,
        successRate: 0,
        averageResponseTime: 0,
        last24Hours: 0,
        lastWeek: 0,
        lastMonth: 0,
        byCategoryCount: {} as Record<AuditCategory, number>,
        bySeverityCount: {} as Record<AuditSeverity, number>
      },
      trends: [],
      topActions: [],
      topUsers: [],
      securityEvents: {
        totalSecurityEvents: 0,
        criticalEvents: 0,
        suspiciousActivities: 0,
        failedLogins: 0,
        rateLimitExceeded: 0,
        recentEvents: []
      },
      complianceStatus: {
        overallScore: 0,
        gdprCompliance: false,
        dataRetentionCompliance: false,
        auditTrailCompleteness: 0,
        issues: [],
        recommendations: []
      }
    };
  }

  // Export functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async exportAuditLogs(options: AuditExportOptions): Promise<AuditExportResult> {
    // Implementation would export audit logs in specified format
    return {
      fileUrl: '/api/audit/exports/audit-export.json',
      fileName: 'audit-export.json',
      fileSize: 0,
      recordCount: 0,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  // Real-time subscriptions
  subscribe(
    filters: AuditSearchCriteria,
    callback: (entry: AuditLogEntry) => void
  ): string {
    const subscriptionId = this.generateId();
    this.subscribers.set(subscriptionId, {
      id: subscriptionId,
      filters,
      callback,
      active: true
    });
    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    this.subscribers.delete(subscriptionId);
  }

  // Configuration management
  updateConfig(newConfig: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AuditConfig {
    return { ...this.config };
  }

  // Data retention and cleanup
  async applyRetentionPolicies(): Promise<void> {
    // Implementation would apply retention policies and clean up old data
    console.log('Applying retention policies...');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async archiveOldEntries(cutoffDate: Date): Promise<number> {
    // Implementation would archive entries older than cutoff date
    return 0;
  }

  // Integrity and verification
  async performIntegrityCheck(
    startDate: Date,
    endDate: Date
  ): Promise<AuditIntegrityCheck> {
    // Implementation would verify audit log integrity
    return {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'hash_verification',
      startDate,
      endDate,
      recordCount: 0,
      passed: true,
      issues: [],
      checksum: 'mock-checksum',
      signatureValid: true
    };
  }

  // Private helper methods
  private async flushPendingEntries(): Promise<void> {
    if (this.pendingEntries.length === 0) return;

    try {
      // In a real implementation, this would batch insert to database
      const entries = [...this.pendingEntries];
      this.pendingEntries = [];

      // Mock storage operation
      console.log(`Flushing ${entries.length} audit entries to storage`);

      // Process entries for compliance
      if (this.config.enableAnonymization) {
        entries.forEach(entry => this.anonymizeEntry(entry));
      }

      if (this.config.enableEncryption) {
        entries.forEach(entry => this.encryptSensitiveData(entry));
      }

      // Send to external systems if configured
      if (this.config.syslogEnabled && this.config.syslogServer) {
        await this.sendToSyslog(entries);
      }

      if (this.config.siemIntegration?.enabled) {
        await this.sendToSiem(entries);
      }

    } catch (error) {
      console.error('Failed to flush audit entries:', error);
      // In a real implementation, you might want to retry or use a dead letter queue
    }
  }

  private startPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushPendingEntries();
    }, this.config.flushInterval);
  }

  private notifySubscribers(entry: AuditLogEntry): void {
    this.subscribers.forEach(subscription => {
      if (subscription.active && this.entryMatchesFilters(entry, subscription.filters)) {
        try {
          subscription.callback(entry);
        } catch (error) {
          console.error('Error in audit subscription callback:', error);
        }
      }
    });
  }

  private entryMatchesFilters(entry: AuditLogEntry, filters: AuditSearchCriteria): boolean {
    // Implement filter matching logic
    if (filters.actions && !filters.actions.includes(entry.action)) return false;
    if (filters.categories && !filters.categories.includes(entry.category)) return false;
    if (filters.severities && !filters.severities.includes(entry.severity)) return false;
    if (filters.userId && entry.userId !== filters.userId) return false;
    if (filters.templeId && entry.templeId !== filters.templeId) return false;
    if (filters.success !== undefined && entry.success !== filters.success) return false;
    
    return true;
  }

  private getActionCategory(action: AuditAction): AuditCategory {
    // Map actions to categories
    const actionCategoryMap: Record<string, AuditCategory> = {
      'login': AuditCategory.AUTHENTICATION,
      'logout': AuditCategory.AUTHENTICATION,
      'login_failed': AuditCategory.AUTHENTICATION,
      'password_reset': AuditCategory.AUTHENTICATION,
      'user_created': AuditCategory.USER_MANAGEMENT,
      'user_updated': AuditCategory.USER_MANAGEMENT,
      'booking_created': AuditCategory.BOOKING,
      'booking_updated': AuditCategory.BOOKING,
      'capacity_rule_created': AuditCategory.CAPACITY,
      'crowd_data_update': AuditCategory.CROWD,
      'notification_sent': AuditCategory.NOTIFICATION,
      'config_updated': AuditCategory.CONFIGURATION,
      'data_export': AuditCategory.DATA,
      'system_startup': AuditCategory.SYSTEM,
      'suspicious_activity': AuditCategory.SECURITY,
      'api_request': AuditCategory.API,
      'file_uploaded': AuditCategory.FILE,
      'payment_initiated': AuditCategory.PAYMENT,
      'report_generated': AuditCategory.REPORTING,
    };

    return actionCategoryMap[action] || AuditCategory.SYSTEM;
  }

  private getDefaultSeverity(action: AuditAction): AuditSeverity {
    const highSeverityActions = [
      AuditAction.PERMISSION_DENIED,
      AuditAction.USER_DELETED,
      AuditAction.SUSPICIOUS_ACTIVITY,
      AuditAction.SQL_INJECTION_ATTEMPT,
      AuditAction.SYSTEM_SHUTDOWN
    ];

    const mediumSeverityActions = [
      AuditAction.LOGIN_FAILED,
      AuditAction.USER_CREATED,
      AuditAction.CAPACITY_RULE_DELETED,
      AuditAction.DATA_EXPORT
    ];

    if (highSeverityActions.includes(action)) return AuditSeverity.HIGH;
    if (mediumSeverityActions.includes(action)) return AuditSeverity.MEDIUM;
    return AuditSeverity.LOW;
  }

  private getRetentionPeriod(category: AuditCategory): number {
    return this.config.categoryRetentionPolicies[category] || this.config.defaultRetentionDays;
  }

  private getComplianceLevel(action: AuditAction): ComplianceLevel {
    const gdprActions = [
      AuditAction.DATA_EXPORT,
      AuditAction.DATA_DELETED,
      AuditAction.USER_CREATED,
      AuditAction.USER_DELETED
    ];

    if (gdprActions.includes(action)) return ComplianceLevel.GDPR;
    return ComplianceLevel.BASIC;
  }

  private isSensitiveAction(action: AuditAction): boolean {
    const sensitiveActions = [
      AuditAction.PASSWORD_RESET,
      AuditAction.PAYMENT_INITIATED,
      AuditAction.DATA_EXPORT,
      AuditAction.SUSPICIOUS_ACTIVITY
    ];

    return sensitiveActions.includes(action);
  }

  private sanitizeRequestBody(body?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!body) return undefined;

    // Remove sensitive fields
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeResponseBody(body?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!body) return undefined;
    return this.sanitizeRequestBody(body);
  }

  private anonymizeEntry(entry: AuditLogEntry): void {
    if (this.config.enableDataMinimization) {
      // Hash or pseudonymize PII
      entry.userEmail = this.hashValue(entry.userEmail);
      entry.ipAddress = this.anonymizeIpAddress(entry.ipAddress);
      
      // Remove or hash sensitive metadata
      if (entry.metadata) {
        Object.keys(entry.metadata).forEach(key => {
          if (this.isSensitiveField(key)) {
            entry.metadata![key] = '[ANONYMIZED]';
          }
        });
      }
    }
  }

  private encryptSensitiveData(entry: AuditLogEntry): void {
    // In a real implementation, this would encrypt sensitive fields
    if (entry.sensitive) {
      // Encrypt oldValue and newValue if they contain sensitive data
      if (entry.oldValue) {
        entry.oldValue = this.encryptObject(entry.oldValue);
      }
      if (entry.newValue) {
        entry.newValue = this.encryptObject(entry.newValue);
      }
    }
  }

  private async sendToSyslog(entries: AuditLogEntry[]): Promise<void> {
    // Implementation would send entries to syslog server
    console.log(`Sending ${entries.length} entries to syslog`);
  }

  private async sendToSiem(entries: AuditLogEntry[]): Promise<void> {
    // Implementation would send entries to SIEM system
    console.log(`Sending ${entries.length} entries to SIEM`);
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashValue(value: string): string {
    // Simple hash implementation - in production use proper crypto
    return `hash_${value.length}_${value.substring(0, 2)}***`;
  }

  private anonymizeIpAddress(ip: string): string {
    // Anonymize IP by zeroing last octet
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
    return ip;
  }

  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = ['email', 'phone', 'address', 'payment', 'personal'];
    return sensitiveFields.some(field => fieldName.toLowerCase().includes(field));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private encryptObject(obj: Record<string, unknown>): Record<string, unknown> {
    // Mock encryption - in production use proper encryption
    return { encrypted: true, data: '[ENCRYPTED]' };
  }

  // Cleanup resources
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush any remaining entries
    this.flushPendingEntries();
    
    // Clear subscribers
    this.subscribers.clear();
  }
}

// Default configuration
export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  defaultRetentionDays: 2555, // 7 years
  categoryRetentionPolicies: {
    [AuditCategory.AUTHENTICATION]: 365,
    [AuditCategory.AUTHORIZATION]: 365,
    [AuditCategory.USER_MANAGEMENT]: 2555,
    [AuditCategory.BOOKING]: 1095, // 3 years
    [AuditCategory.CAPACITY]: 365,
    [AuditCategory.CROWD]: 90,
    [AuditCategory.NOTIFICATION]: 180,
    [AuditCategory.CONFIGURATION]: 1095,
    [AuditCategory.DATA]: 2555,
    [AuditCategory.SYSTEM]: 365,
    [AuditCategory.SECURITY]: 2555,
    [AuditCategory.API]: 90,
    [AuditCategory.FILE]: 365,
    [AuditCategory.PAYMENT]: 2555,
    [AuditCategory.REPORTING]: 365,
  },
  
  logLevel: 'standard',
  batchSize: 100,
  flushInterval: 30000, // 30 seconds
  
  enableCompression: true,
  enableEncryption: true,
  storageLocation: 'database',
  
  enableRealTimeAlerts: true,
  securityAlertThreshold: 5,
  performanceAlertThreshold: 5000,
  
  enableGdprMode: true,
  enableDataMinimization: true,
  enableAnonymization: false,
  
  syslogEnabled: false,
  siemIntegration: {
    enabled: false,
    endpoint: '',
    apiKey: ''
  }
};

// Export singleton instance
export const auditService = AuditService.getInstance(DEFAULT_AUDIT_CONFIG);
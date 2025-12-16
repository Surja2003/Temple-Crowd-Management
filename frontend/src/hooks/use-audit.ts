/**
 * React Hooks for Audit Logging
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AuditLogEntry, 
  AuditAction,
  AuditSearchCriteria,
  AuditExportOptions,
  AuditExportResult,
  AuditCategory,
  AuditSeverity
} from '@/types/audit';
import { auditService } from '@/lib/audit-service';

// Hook for logging audit events
export function useAuditLogger() {
  const [isLogging, setIsLogging] = useState(false);

  const logMutation = useMutation({
    mutationFn: async (params: {
      action: AuditAction;
      resource: { type: string; name: string; endpoint?: string };
      context: {
        userId: string;
        userEmail: string;
        userRole: string;
        templeId: string;
        sessionId: string;
        ipAddress: string;
        userAgent: string;
        requestId?: string;
      };
      options?: {
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
      };
    }) => {
      setIsLogging(true);
      await auditService.log(
        params.action,
        params.resource,
        params.context,
        params.options
      );
      setIsLogging(false);
    },
    onError: (error) => {
      setIsLogging(false);
      console.error('Failed to log audit event:', error);
    }
  });

  const logEvent = useCallback(
    (
      action: AuditAction,
      resource: { type: string; name: string; endpoint?: string },
      options?: {
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
      }
    ) => {
      // Get current user context (would come from auth provider)
      const context = {
        userId: 'current-user-id',
        userEmail: 'user@temple.com',
        userRole: 'user',
        templeId: 'current-temple-id',
        sessionId: 'current-session-id',
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        requestId: `req_${Date.now()}`
      };

      return logMutation.mutate({ action, resource, context, options });
    },
    [logMutation]
  );

  // Convenience methods for common audit events
  const logUserAction = useCallback(
    (action: AuditAction, options?: { resourceId?: string; metadata?: Record<string, unknown> }) => {
      return logEvent(action, { type: 'user', name: 'User Management' }, options);
    },
    [logEvent]
  );

  const logBookingAction = useCallback(
    (action: AuditAction, bookingId: string, bookingData?: Record<string, unknown>) => {
      return logEvent(
        action,
        { type: 'booking', name: 'Booking Management' },
        {
          resourceId: bookingId,
          newValue: bookingData,
          tags: ['booking', 'darshan']
        }
      );
    },
    [logEvent]
  );

  const logSecurityEvent = useCallback(
    (
      action: AuditAction,
      details: {
        threatLevel?: 'low' | 'medium' | 'high' | 'critical';
        source?: string;
        metadata?: Record<string, unknown>;
      }
    ) => {
      const severity = details.threatLevel === 'critical' ? AuditSeverity.CRITICAL :
                      details.threatLevel === 'high' ? AuditSeverity.HIGH :
                      details.threatLevel === 'medium' ? AuditSeverity.MEDIUM : AuditSeverity.LOW;

      return logEvent(
        action,
        { type: 'security', name: 'Security Event' },
        {
          severity,
          metadata: {
            ...details.metadata,
            threatLevel: details.threatLevel,
            source: details.source
          },
          tags: ['security', 'threat'],
          sensitive: true
        }
      );
    },
    [logEvent]
  );

  const logSystemEvent = useCallback(
    (action: AuditAction, systemInfo?: Record<string, unknown>) => {
      return logEvent(
        action,
        { type: 'system', name: 'System Event' },
        {
          metadata: systemInfo,
          tags: ['system', 'infrastructure']
        }
      );
    },
    [logEvent]
  );

  return {
    logEvent,
    logUserAction,
    logBookingAction,
    logSecurityEvent,
    logSystemEvent,
    isLogging,
    error: logMutation.error
  };
}

// Hook for searching audit logs
export function useAuditSearch(criteria: AuditSearchCriteria) {
  return useQuery({
    queryKey: ['audit-search', criteria],
    queryFn: () => auditService.search(criteria),
    enabled: !!criteria,
    staleTime: 30000, // 30 seconds
  });
}

// Hook for audit analytics
export function useAuditAnalytics(
  startDate: Date,
  endDate: Date,
  templeId?: string
) {
  return useQuery({
    queryKey: ['audit-analytics', startDate, endDate, templeId],
    queryFn: () => auditService.getAnalytics(startDate, endDate, templeId),
    enabled: !!startDate && !!endDate,
    staleTime: 60000, // 1 minute
  });
}

// Hook for exporting audit logs
export function useAuditExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportMutation = useMutation({
    mutationFn: async (options: AuditExportOptions): Promise<AuditExportResult> => {
      setIsExporting(true);
      const result = await auditService.exportAuditLogs(options);
      setIsExporting(false);
      return result;
    },
    onError: () => {
      setIsExporting(false);
    }
  });

  const exportLogs = useCallback(
    (options: AuditExportOptions) => {
      return exportMutation.mutateAsync(options);
    },
    [exportMutation]
  );

  return {
    exportLogs,
    isExporting,
    error: exportMutation.error,
    data: exportMutation.data
  };
}

// Hook for real-time audit events
export function useAuditSubscription(filters: AuditSearchCriteria) {
  const [events, setEvents] = useState<AuditLogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const subscriptionId = auditService.subscribe(filters, (entry) => {
      setEvents(prev => [entry, ...prev.slice(0, 99)]); // Keep last 100 events
    });

    setIsConnected(true);

    return () => {
      auditService.unsubscribe(subscriptionId);
      setIsConnected(false);
    };
  }, [filters]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isConnected,
    clearEvents
  };
}

// Hook for audit log management
export function useAuditManagement() {
  const queryClient = useQueryClient();

  const retentionMutation = useMutation({
    mutationFn: () => auditService.applyRetentionPolicies(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-analytics'] });
    }
  });

  const integrityCheckMutation = useMutation({
    mutationFn: ({ startDate, endDate }: { startDate: Date; endDate: Date }) =>
      auditService.performIntegrityCheck(startDate, endDate)
  });

  const applyRetentionPolicies = useCallback(() => {
    return retentionMutation.mutateAsync();
  }, [retentionMutation]);

  const performIntegrityCheck = useCallback(
    (startDate: Date, endDate: Date) => {
      return integrityCheckMutation.mutateAsync({ startDate, endDate });
    },
    [integrityCheckMutation]
  );

  return {
    applyRetentionPolicies,
    performIntegrityCheck,
    isApplyingRetention: retentionMutation.isPending,
    isCheckingIntegrity: integrityCheckMutation.isPending,
    retentionError: retentionMutation.error,
    integrityError: integrityCheckMutation.error,
    integrityResult: integrityCheckMutation.data
  };
}

// Hook for audit configuration
export function useAuditConfig() {
  const [config, setConfig] = useState(() => auditService.getConfig());

  const updateConfig = useCallback((newConfig: Partial<typeof config>) => {
    const updatedConfig = { ...config, ...newConfig };
    auditService.updateConfig(updatedConfig);
    setConfig(updatedConfig);
  }, [config]);

  return {
    config,
    updateConfig
  };
}

// Custom hook for audit dashboard data
export function useAuditDashboard(templeId?: string) {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Recent activity
  const recentActivity = useAuditSearch({
    startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
    endDate: now,
    templeId,
    limit: 50,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  // Analytics for last 30 days
  const analytics = useAuditAnalytics(last30Days, now, templeId);

  // Security events
  const securityEvents = useAuditSearch({
    startDate: last30Days,
    endDate: now,
    categories: [AuditCategory.SECURITY],
    templeId,
    limit: 20,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  // Failed actions
  const failedActions = useAuditSearch({
    startDate: last30Days,
    endDate: now,
    success: false,
    templeId,
    limit: 20,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  // Critical events
  const criticalEvents = useAuditSearch({
    startDate: last30Days,
    endDate: now,
    severities: [AuditSeverity.CRITICAL, AuditSeverity.HIGH],
    templeId,
    limit: 10,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  const isLoading = recentActivity.isLoading || 
                   analytics.isLoading || 
                   securityEvents.isLoading || 
                   failedActions.isLoading || 
                   criticalEvents.isLoading;

  const error = recentActivity.error || 
                analytics.error || 
                securityEvents.error || 
                failedActions.error || 
                criticalEvents.error;

  return {
    recentActivity: recentActivity.data,
    analytics: analytics.data,
    securityEvents: securityEvents.data,
    failedActions: failedActions.data,
    criticalEvents: criticalEvents.data,
    isLoading,
    error,
    refetch: () => {
      recentActivity.refetch();
      analytics.refetch();
      securityEvents.refetch();
      failedActions.refetch();
      criticalEvents.refetch();
    }
  };
}

// Utility hook for common audit patterns
export function useAuditHelpers() {
  const { logEvent } = useAuditLogger();

  // Higher-order function to wrap API calls with audit logging
  const withAudit = useCallback(
    <T extends unknown[], R>(
      fn: (...args: T) => Promise<R>,
      action: AuditAction,
      resource: { type: string; name: string; endpoint?: string }
    ) => {
      return async (...args: T): Promise<R> => {
        const startTime = Date.now();
        let success = true;
        let error: Error | null = null;

        try {
          const result = await fn(...args);
          return result;
        } catch (err) {
          success = false;
          error = err as Error;
          throw err;
        } finally {
          const duration = Date.now() - startTime;
          
          await logEvent(action, resource, {
            success,
            duration,
            errorMessage: error?.message,
            metadata: {
              arguments: args,
              executionTime: duration
            }
          });
        }
      };
    },
    [logEvent]
  );

  // Helper to log form submissions
  const logFormSubmission = useCallback(
    (
      formType: string,
      formData: Record<string, unknown>,
      success: boolean,
      errors?: string[]
    ) => {
      return logEvent(
        success ? AuditAction.USER_UPDATED : AuditAction.API_ERROR,
        { type: 'form', name: `${formType} Form` },
        {
          success,
          newValue: formData,
          errorMessage: errors?.join(', '),
          metadata: {
            formType,
            fieldCount: Object.keys(formData).length
          },
          tags: ['form', 'user-interaction']
        }
      );
    },
    [logEvent]
  );

  // Helper to log page visits
  const logPageVisit = useCallback(
    (pageName: string, pageUrl: string, referrer?: string) => {
      return logEvent(
        AuditAction.DASHBOARD_VIEWED,
        { type: 'page', name: 'Page View' },
        {
          metadata: {
            pageName,
            pageUrl,
            referrer,
            timestamp: new Date().toISOString()
          },
          tags: ['navigation', 'user-interaction']
        }
      );
    },
    [logEvent]
  );

  return {
    withAudit,
    logFormSubmission,
    logPageVisit
  };
}

// Custom hook for audit compliance monitoring
export function useAuditCompliance() {
  const { config } = useAuditConfig();
  
  const complianceStatus = useMemo(() => {
    const issues = [];
    const recommendations = [];

    // Check retention policies
    if (!config.enableGdprMode) {
      issues.push({
        type: 'gdpr_compliance',
        severity: 'high',
        message: 'GDPR mode is not enabled'
      });
      recommendations.push({
        action: 'Enable GDPR mode',
        priority: 'high'
      });
    }

    // Check encryption
    if (!config.enableEncryption) {
      issues.push({
        type: 'encryption',
        severity: 'high',
        message: 'Audit log encryption is not enabled'
      });
      recommendations.push({
        action: 'Enable audit log encryption',
        priority: 'high'
      });
    }

    // Check data minimization
    if (!config.enableDataMinimization) {
      issues.push({
        type: 'data_minimization',
        severity: 'medium',
        message: 'Data minimization is not enabled'
      });
      recommendations.push({
        action: 'Enable data minimization',
        priority: 'medium'
      });
    }

    const score = Math.max(0, 100 - (issues.length * 20));

    return {
      score,
      issues,
      recommendations,
      isCompliant: score >= 80
    };
  }, [config]);

  return complianceStatus;
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PrivacyService } from '@/lib/privacy-service';
import { 
  ConsentType, 
  ConsentStatus, 
  ConsentSource,
  DataSubjectRightType,
  RequestStatus,
  BreachCategory,
  BreachSeverity,
  DataCategory,
  PrivacyNotice
} from '@/types/privacy';

const privacyService = PrivacyService.getInstance();

// Consent Management Hooks
export function useConsentStatus(userId: string, templeId: string) {
  return useQuery({
    queryKey: ['consent-status', userId, templeId],
    queryFn: () => privacyService.getConsentStatus(userId, templeId),
    enabled: !!(userId && templeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useConsentHistory(userId: string, templeId: string) {
  return useQuery({
    queryKey: ['consent-history', userId, templeId],
    queryFn: () => privacyService.getConsentHistory(userId, templeId),
    enabled: !!(userId && templeId),
  });
}

export function useUpdateConsent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      templeId, 
      consents 
    }: { 
      userId: string; 
      templeId: string; 
      consents: Partial<ConsentStatus> 
    }) => privacyService.updateConsent(userId, templeId, consents),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['consent-status', variables.userId, variables.templeId]
      });
      queryClient.invalidateQueries({
        queryKey: ['consent-history', variables.userId, variables.templeId]
      });
    },
  });
}

export function useRecordConsent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      templeId, 
      consentType, 
      granted, 
      source, 
      metadata 
    }: { 
      userId: string; 
      templeId: string; 
      consentType: ConsentType; 
      granted: boolean; 
      source: ConsentSource; 
      metadata?: Record<string, unknown> 
    }) => privacyService.recordConsent(userId, templeId, consentType, granted, source, metadata),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['consent-status', variables.userId, variables.templeId]
      });
      queryClient.invalidateQueries({
        queryKey: ['consent-history', variables.userId, variables.templeId]
      });
    },
  });
}

export function useWithdrawConsent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      templeId, 
      consentType 
    }: { 
      userId: string; 
      templeId: string; 
      consentType: ConsentType 
    }) => privacyService.withdrawConsent(userId, templeId, consentType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['consent-status', variables.userId, variables.templeId]
      });
      queryClient.invalidateQueries({
        queryKey: ['consent-history', variables.userId, variables.templeId]
      });
    },
  });
}

// Data Subject Rights Hooks
export function useDataSubjectRequests(
  templeId: string,
  filters?: {
    status?: RequestStatus;
    requestType?: DataSubjectRightType;
    userId?: string;
  }
) {
  return useQuery({
    queryKey: ['data-subject-requests', templeId, filters],
    queryFn: () => privacyService.getDataSubjectRequests(templeId, filters),
    enabled: !!templeId,
  });
}

export function useSubmitDataSubjectRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      templeId, 
      requestType, 
      details 
    }: { 
      userId: string; 
      templeId: string; 
      requestType: DataSubjectRightType; 
      details: string 
    }) => privacyService.submitDataSubjectRequest(userId, templeId, requestType, details),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['data-subject-requests', variables.templeId]
      });
    },
  });
}

export function useProcessDataSubjectRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      requestId, 
      action, 
      notes, 
      responseData 
    }: { 
      requestId: string; 
      action: 'verify' | 'approve' | 'reject' | 'complete'; 
      notes?: string; 
      responseData?: unknown 
    }) => privacyService.processDataSubjectRequest(requestId, action, notes, responseData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['data-subject-requests']
      });
    },
  });
}

// Privacy Impact Assessment Hooks
export function usePrivacyImpactAssessments(templeId: string) {
  return useQuery({
    queryKey: ['privacy-impact-assessments', templeId],
    queryFn: () => privacyService.getPIAs(templeId),
    enabled: !!templeId,
  });
}

export function useCreatePIA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      templeId, 
      projectName, 
      description 
    }: { 
      templeId: string; 
      projectName: string; 
      description: string 
    }) => privacyService.createPIA(templeId, projectName, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['privacy-impact-assessments', variables.templeId]
      });
    },
  });
}

// Compliance Hooks
export function useComplianceFrameworks() {
  return useQuery({
    queryKey: ['compliance-frameworks'],
    queryFn: () => privacyService.getComplianceFrameworks(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useComplianceAssessment(templeId: string, frameworkId: string) {
  return useQuery({
    queryKey: ['compliance-assessment', templeId, frameworkId],
    queryFn: () => privacyService.assessCompliance(templeId, frameworkId),
    enabled: !!(templeId && frameworkId),
  });
}

// Privacy Notice Hooks
export function usePrivacyNotice(templeId: string, language = 'en') {
  return useQuery({
    queryKey: ['privacy-notice', templeId, language],
    queryFn: () => privacyService.getPrivacyNotice(templeId, language),
    enabled: !!templeId,
  });
}

export function useUpdatePrivacyNotice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      templeId, 
      updates 
    }: { 
      templeId: string; 
      updates: Partial<PrivacyNotice>
    }) => privacyService.updatePrivacyNotice(templeId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['privacy-notice', variables.templeId]
      });
    },
  });
}

// Data Breach Hooks
export function useDataBreaches(templeId: string) {
  return useQuery({
    queryKey: ['data-breaches', templeId],
    queryFn: () => privacyService.getDataBreaches(templeId),
    enabled: !!templeId,
  });
}

export function useReportDataBreach() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      templeId, 
      title, 
      description, 
      category, 
      severity, 
      affectedRecords, 
      dataTypes 
    }: { 
      templeId: string; 
      title: string; 
      description: string; 
      category: BreachCategory; 
      severity: BreachSeverity; 
      affectedRecords: number; 
      dataTypes: DataCategory[] 
    }) => privacyService.reportDataBreach(templeId, title, description, category, severity, affectedRecords, dataTypes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['data-breaches', variables.templeId]
      });
    },
  });
}

// Privacy Metrics and Reporting Hooks
export function usePrivacyMetrics(templeId: string, dateRange: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['privacy-metrics', templeId, dateRange],
    queryFn: () => privacyService.getPrivacyMetrics(templeId, dateRange),
    enabled: !!(templeId && dateRange.start && dateRange.end),
  });
}

export function useGeneratePrivacyReport() {
  return useMutation({
    mutationFn: ({ 
      templeId, 
      reportType, 
      options 
    }: { 
      templeId: string; 
      reportType: 'compliance' | 'consent' | 'requests' | 'breaches'; 
      options: {
        format: 'pdf' | 'csv' | 'json';
        dateRange?: { start: Date; end: Date };
        includeDetails?: boolean;
      }
    }) => privacyService.generatePrivacyReport(templeId, reportType, options),
  });
}

// Data Subject Profile Hooks
export function useDataSubjectProfile(userId: string, templeId: string) {
  return useQuery({
    queryKey: ['data-subject-profile', userId, templeId],
    queryFn: () => privacyService.getDataSubjectProfile(userId, templeId),
    enabled: !!(userId && templeId),
  });
}

export function useExportUserData() {
  return useMutation({
    mutationFn: ({ 
      userId, 
      templeId 
    }: { 
      userId: string; 
      templeId: string 
    }) => privacyService.exportUserData(userId, templeId),
  });
}

export function useDeleteUserData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      templeId 
    }: { 
      userId: string; 
      templeId: string 
    }) => privacyService.deleteUserData(userId, templeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['data-subject-profile', variables.userId, variables.templeId]
      });
    },
  });
}

// Utility Hook for Privacy Dashboard
export function usePrivacyDashboard(templeId: string) {
  const dateRange = { 
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date() 
  };

  const metricsQuery = usePrivacyMetrics(templeId, dateRange);
  const requestsQuery = useDataSubjectRequests(templeId);
  const breachesQuery = useDataBreaches(templeId);
  const complianceQuery = useComplianceAssessment(templeId, 'gdpr');

  return {
    metrics: metricsQuery.data,
    requests: requestsQuery.data,
    breaches: breachesQuery.data,
    compliance: complianceQuery.data,
    isLoading: metricsQuery.isLoading || requestsQuery.isLoading || breachesQuery.isLoading || complianceQuery.isLoading,
    error: metricsQuery.error || requestsQuery.error || breachesQuery.error || complianceQuery.error,
    refetch: () => {
      metricsQuery.refetch();
      requestsQuery.refetch();
      breachesQuery.refetch();
      complianceQuery.refetch();
    }
  };
}
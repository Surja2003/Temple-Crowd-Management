/**
 * Advanced Analytics React Hooks
 * Custom hooks for analytics data management with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { AnalyticsService } from '@/lib/analytics-service';
import type {
  AnalyticsQuery,
  AnalyticsReport,
  AnalyticsConfig,
  DateRange
} from '@/types/analytics';

// Default analytics configuration
const DEFAULT_CONFIG: AnalyticsConfig = {
  dataRetention: {
    rawData: 365,
    aggregatedData: 1095,
    reports: 180
  },
  sampling: {
    enabled: false,
    rate: 100,
    strategy: 'random'
  },
  privacy: {
    anonymizeData: true,
    encryptSensitiveData: true,
    gdprCompliant: true
  },
  performance: {
    cacheEnabled: true,
    cacheTtl: 300,
    precomputeAggregations: true
  },
  alerts: {
    enabled: true,
    thresholds: {
      capacityUtilization: 0.9,
      waitTime: 30,
      satisfaction: 3.0
    },
    channels: ['email', 'sms', 'push']
  }
};

// Hook for creating analytics service instance
export function useAnalyticsService(templeId: string, config?: Partial<AnalyticsConfig>) {
  return useMemo(() => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    return new AnalyticsService(templeId, finalConfig);
  }, [templeId, config]);
}

// Footfall Analytics Hook
export function useFootfallAnalytics(
  templeId: string,
  query: AnalyticsQuery,
  config?: Partial<AnalyticsConfig>
) {
  const analyticsService = useAnalyticsService(templeId, config);

  return useQuery({
    queryKey: ['footfall-analytics', templeId, query],
    queryFn: () => analyticsService.getFootfallAnalytics(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    enabled: !!templeId && !!query.dateRange
  });
}

// Capacity Analytics Hook
export function useCapacityAnalytics(
  templeId: string,
  query: AnalyticsQuery,
  config?: Partial<AnalyticsConfig>
) {
  const analyticsService = useAnalyticsService(templeId, config);

  return useQuery({
    queryKey: ['capacity-analytics', templeId, query],
    queryFn: () => analyticsService.getCapacityAnalytics(query),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    enabled: !!templeId && !!query.dateRange
  });
}

// User Behavior Analytics Hook
export function useUserBehaviorAnalytics(
  templeId: string,
  query: AnalyticsQuery,
  config?: Partial<AnalyticsConfig>
) {
  const analyticsService = useAnalyticsService(templeId, config);

  return useQuery({
    queryKey: ['behavior-analytics', templeId, query],
    queryFn: () => analyticsService.getUserBehaviorAnalytics(query),
    staleTime: 15 * 60 * 1000, // 15 minutes (less frequent updates)
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    enabled: !!templeId && !!query.dateRange
  });
}

// Revenue Analytics Hook
export function useRevenueAnalytics(
  templeId: string,
  query: AnalyticsQuery,
  config?: Partial<AnalyticsConfig>
) {
  const analyticsService = useAnalyticsService(templeId, config);

  return useQuery({
    queryKey: ['revenue-analytics', templeId, query],
    queryFn: () => analyticsService.getRevenueAnalytics(query),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 20 * 60 * 1000,
    enabled: !!templeId && !!query.dateRange
  });
}

// Predictive Analytics Hook
export function usePredictiveAnalytics(
  templeId: string,
  query: AnalyticsQuery,
  config?: Partial<AnalyticsConfig>
) {
  const analyticsService = useAnalyticsService(templeId, config);

  return useQuery({
    queryKey: ['predictive-analytics', templeId, query],
    queryFn: () => analyticsService.getPredictiveAnalytics(query),
    staleTime: 60 * 60 * 1000, // 1 hour (predictive models update less frequently)
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    enabled: !!templeId && !!query.dateRange
  });
}

// Real-time Analytics Hook
export function useRealTimeAnalytics(
  templeId: string,
  config?: Partial<AnalyticsConfig>
) {
  const analyticsService = useAnalyticsService(templeId, config);

  return useQuery({
    queryKey: ['realtime-analytics', templeId],
    queryFn: () => analyticsService.getRealTimeAnalytics(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // 30 seconds (real-time updates)
    enabled: !!templeId
  });
}

// Combined Analytics Dashboard Hook
export function useAnalyticsDashboard(
  templeId: string,
  dateRange: DateRange,
  filters?: Partial<AnalyticsQuery['filters']>,
  config?: Partial<AnalyticsConfig>
) {
  const baseQuery: AnalyticsQuery = {
    type: 'footfall',
    dateRange,
    filters: filters || {},
    aggregation: 'day',
    metrics: ['visitors', 'capacity', 'revenue'],
    dimensions: ['date', 'zone', 'hour']
  };

  const footfallQuery = { ...baseQuery, type: 'footfall' as const };
  const capacityQuery = { ...baseQuery, type: 'capacity' as const };
  const behaviorQuery = { ...baseQuery, type: 'behavior' as const };
  const revenueQuery = { ...baseQuery, type: 'revenue' as const };
  const predictiveQuery = { ...baseQuery, type: 'predictive' as const };

  const footfall = useFootfallAnalytics(templeId, footfallQuery, config);
  const capacity = useCapacityAnalytics(templeId, capacityQuery, config);
  const behavior = useUserBehaviorAnalytics(templeId, behaviorQuery, config);
  const revenue = useRevenueAnalytics(templeId, revenueQuery, config);
  const predictive = usePredictiveAnalytics(templeId, predictiveQuery, config);
  const realtime = useRealTimeAnalytics(templeId, config);

  const isLoading = footfall.isLoading || capacity.isLoading || behavior.isLoading || 
                    revenue.isLoading || predictive.isLoading || realtime.isLoading;

  const error = footfall.error || capacity.error || behavior.error || 
                revenue.error || predictive.error || realtime.error;

  const refetchAll = () => {
    footfall.refetch();
    capacity.refetch();
    behavior.refetch();
    revenue.refetch();
    predictive.refetch();
    realtime.refetch();
  };

  return {
    data: {
      footfall: footfall.data,
      capacity: capacity.data,
      behavior: behavior.data,
      revenue: revenue.data,
      predictive: predictive.data,
      realtime: realtime.data
    },
    isLoading,
    error,
    refetch: refetchAll,
    isRefetching: footfall.isRefetching || capacity.isRefetching || behavior.isRefetching || 
                  revenue.isRefetching || predictive.isRefetching || realtime.isRefetching
  };
}

// Analytics Report Generation Hook
export function useAnalyticsReports(templeId: string, config?: Partial<AnalyticsConfig>) {
  const analyticsService = useAnalyticsService(templeId, config);
  const queryClient = useQueryClient();

  const generateReport = useMutation({
    mutationFn: (reportConfig: Partial<AnalyticsReport>) =>
      analyticsService.generateReport(reportConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports', templeId] });
    }
  });

  const reports = useQuery({
    queryKey: ['analytics-reports', templeId],
    queryFn: async () => {
      // This would typically fetch existing reports from the API
      return [];
    },
    staleTime: 30 * 60 * 1000 // 30 minutes
  });

  return {
    reports: reports.data || [],
    isLoading: reports.isLoading,
    error: reports.error,
    generateReport: generateReport.mutate,
    isGenerating: generateReport.isPending,
    generationError: generateReport.error
  };
}

// Analytics Insights Hook - Provides AI-powered insights
export function useAnalyticsInsights(
  templeId: string,
  dateRange: DateRange,
  config?: Partial<AnalyticsConfig>
) {
  const dashboard = useAnalyticsDashboard(templeId, dateRange, {}, config);

  const insights = useMemo(() => {
    if (!dashboard.data.footfall || !dashboard.data.capacity || !dashboard.data.revenue) {
      return null;
    }

    const footfallData = dashboard.data.footfall;
    const capacityData = dashboard.data.capacity;
    const revenueData = dashboard.data.revenue;

    // Generate insights based on data patterns
    const insights = [];

    // Footfall insights
    if (footfallData.summary.growthRate > 15) {
      insights.push({
        type: 'positive',
        category: 'footfall',
        title: 'Strong Visitor Growth',
        description: `Visitor count has grown by ${footfallData.summary.growthRate.toFixed(1)}% compared to the previous period.`,
        impact: 'high',
        recommendation: 'Consider increasing capacity or extending operating hours to accommodate growth.'
      });
    }

    // Capacity insights
    if (capacityData.utilization.overall.averageUtilization > 0.85) {
      insights.push({
        type: 'warning',
        category: 'capacity',
        title: 'High Capacity Utilization',
        description: `Average capacity utilization is ${(capacityData.utilization.overall.averageUtilization * 100).toFixed(1)}%.`,
        impact: 'high',
        recommendation: 'Implement dynamic pricing or queue management to optimize flow.'
      });
    }

    // Revenue insights
    if (revenueData.overview.growthRate > 20) {
      insights.push({
        type: 'positive',
        category: 'revenue',
        title: 'Excellent Revenue Growth',
        description: `Revenue has increased by ${revenueData.overview.growthRate.toFixed(1)}%.`,
        impact: 'high',
        recommendation: 'Maintain current strategies and explore additional revenue streams.'
      });
    }

    return insights;
  }, [dashboard.data]);

  return {
    insights,
    isLoading: dashboard.isLoading,
    error: dashboard.error,
    refetch: dashboard.refetch
  };
}

// Analytics Comparison Hook - Compare different time periods
export function useAnalyticsComparison(
  templeId: string,
  currentPeriod: DateRange,
  comparisonPeriod: DateRange,
  config?: Partial<AnalyticsConfig>
) {
  const currentData = useAnalyticsDashboard(templeId, currentPeriod, {}, config);
  const comparisonData = useAnalyticsDashboard(templeId, comparisonPeriod, {}, config);

  const comparison = useMemo(() => {
    if (!currentData.data.footfall || !comparisonData.data.footfall) {
      return null;
    }

    const current = currentData.data;
    const previous = comparisonData.data;

    return {
      footfall: {
        current: current.footfall?.summary.totalVisitors || 0,
        previous: previous.footfall?.summary.totalVisitors || 0,
        change: ((current.footfall?.summary.totalVisitors || 0) - (previous.footfall?.summary.totalVisitors || 0)),
        changePercent: previous.footfall?.summary.totalVisitors 
          ? (((current.footfall?.summary.totalVisitors || 0) - (previous.footfall?.summary.totalVisitors || 0)) / (previous.footfall?.summary.totalVisitors || 1)) * 100
          : 0
      },
      revenue: {
        current: current.revenue?.overview.totalRevenue || 0,
        previous: previous.revenue?.overview.totalRevenue || 0,
        change: ((current.revenue?.overview.totalRevenue || 0) - (previous.revenue?.overview.totalRevenue || 0)),
        changePercent: previous.revenue?.overview.totalRevenue
          ? (((current.revenue?.overview.totalRevenue || 0) - (previous.revenue?.overview.totalRevenue || 0)) / (previous.revenue?.overview.totalRevenue || 1)) * 100
          : 0
      },
      capacity: {
        current: current.capacity?.utilization.overall.averageUtilization || 0,
        previous: previous.capacity?.utilization.overall.averageUtilization || 0,
        change: ((current.capacity?.utilization.overall.averageUtilization || 0) - (previous.capacity?.utilization.overall.averageUtilization || 0)),
        changePercent: previous.capacity?.utilization.overall.averageUtilization
          ? (((current.capacity?.utilization.overall.averageUtilization || 0) - (previous.capacity?.utilization.overall.averageUtilization || 0)) / (previous.capacity?.utilization.overall.averageUtilization || 1)) * 100
          : 0
      }
    };
  }, [currentData.data, comparisonData.data]);

  return {
    comparison,
    isLoading: currentData.isLoading || comparisonData.isLoading,
    error: currentData.error || comparisonData.error,
    refetch: () => {
      currentData.refetch();
      comparisonData.refetch();
    }
  };
}

// Export all hooks
export {
  DEFAULT_CONFIG as DEFAULT_ANALYTICS_CONFIG
};
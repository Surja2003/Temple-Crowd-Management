/**
 * React hook for dynamic capacity management
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CapacityManagementService } from '@/lib/capacity-management-service';
import { useTempleConfig } from '@/config/hooks';
import { 
  CapacityRule,
  CapacityState,
  CapacityOverride,
  SpecialEvent,
  CapacityAnalytics,
  CapacityManagementConfig
} from '@/types/capacity-management';

export interface UseCapacityManagementOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface CapacityManagementHookReturn {
  // Current state
  capacityState: CapacityState | undefined;
  rules: CapacityRule[];
  overrides: CapacityOverride[];
  specialEvents: SpecialEvent[];
  analytics: CapacityAnalytics | undefined;
  
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Actions
  createRule: (rule: Omit<CapacityRule, 'id' | 'createdAt' | 'lastModified' | 'version'>) => Promise<CapacityRule>;
  updateRule: (id: string, updates: Partial<CapacityRule>) => Promise<CapacityRule>;
  deleteRule: (id: string) => Promise<void>;
  
  createOverride: (override: Omit<CapacityOverride, 'id' | 'authorizedAt'>) => Promise<CapacityOverride>;
  removeOverride: (id: string) => Promise<void>;
  
  createEvent: (event: Omit<SpecialEvent, 'id' | 'createdAt'>) => Promise<SpecialEvent>;
  updateEvent: (id: string, updates: Partial<SpecialEvent>) => Promise<SpecialEvent>;
  
  getAvailableCapacity: (date: string, timeSlot: string, darshanType: string, userType?: string) => Promise<{
    available: number;
    total: number;
    restrictions: string[];
    waitingListLength: number;
  }>;
  
  refreshCapacity: () => Promise<void>;
  getAnalytics: (period: 'day' | 'week' | 'month') => Promise<void>;
}

export function useCapacityManagement(options: UseCapacityManagementOptions = {}): CapacityManagementHookReturn {
  const {
    autoRefresh = true,
    refreshInterval = 60 // seconds
  } = options;

  const { config: templeConfig } = useTempleConfig();
  const queryClient = useQueryClient();
  
  // State
  const [service, setService] = useState<CapacityManagementService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<CapacityAnalytics | undefined>();

  // Initialize service
  useEffect(() => {
    if (templeConfig?.basic.slug) {
      // Default capacity management config
      const defaultConfig: CapacityManagementConfig = {
        ruleEngine: {
          evaluationInterval: 30,
          conflictResolution: 'priority',
          autoApplyRules: true,
          requireApprovalForOverrides: true
        },
        notifications: {
          capacityThresholds: {
            warning: 80,
            critical: 95
          },
          stakeholders: {
            templeStaff: [],
            administrators: [],
            security: []
          }
        },
        integrations: {
          weatherAPI: false,
          calendarSync: true,
          bookingSystem: true,
          crowdTracking: true
        },
        defaultRules: {
          maxOccupancyRate: 0.9,
          emergencyCapacityReduction: 0.5,
          bufferCapacity: 0.1
        }
      };

      const newService = new CapacityManagementService(
        templeConfig.basic.slug,
        defaultConfig
      );
      setService(newService);

      return () => {
        newService.destroy();
      };
    }
  }, [templeConfig?.basic.slug]);

  // Queries
  const { data: capacityState, isLoading: capacityLoading } = useQuery({
    queryKey: ['capacity-state', templeConfig?.basic.slug],
    queryFn: () => service?.getCurrentCapacityState(),
    enabled: !!service,
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
    staleTime: (refreshInterval - 10) * 1000
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['capacity-rules', templeConfig?.basic.slug],
    queryFn: async () => {
      // For now, return empty array as rules are managed internally by service
      return [];
    },
    enabled: !!service
  });

  const { data: overrides = [], isLoading: overridesLoading } = useQuery({
    queryKey: ['capacity-overrides', templeConfig?.basic.slug],
    queryFn: async () => {
      // For now, return empty array as overrides are managed internally by service
      return [];
    },
    enabled: !!service
  });

  const { data: specialEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['special-events', templeConfig?.basic.slug],
    queryFn: async () => {
      // For now, return empty array as events are managed internally by service
      return [];
    },
    enabled: !!service
  });

  const isLoading = capacityLoading || rulesLoading || overridesLoading || eventsLoading;

  // Mutations
  const createRuleMutation = useMutation({
    mutationFn: async (rule: Omit<CapacityRule, 'id' | 'createdAt' | 'lastModified' | 'version'>) => {
      if (!service) throw new Error('Capacity service not initialized');
      return service.createCapacityRule(rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capacity-rules'] });
      queryClient.invalidateQueries({ queryKey: ['capacity-state'] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to create rule');
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CapacityRule> }) => {
      if (!service) throw new Error('Capacity service not initialized');
      return service.updateCapacityRule(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capacity-rules'] });
      queryClient.invalidateQueries({ queryKey: ['capacity-state'] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to update rule');
    }
  });

  const createOverrideMutation = useMutation({
    mutationFn: async (override: Omit<CapacityOverride, 'id' | 'authorizedAt'>) => {
      if (!service) throw new Error('Capacity service not initialized');
      return service.createCapacityOverride(override);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capacity-overrides'] });
      queryClient.invalidateQueries({ queryKey: ['capacity-state'] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to create override');
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (event: Omit<SpecialEvent, 'id' | 'createdAt'>) => {
      if (!service) throw new Error('Capacity service not initialized');
      return service.createSpecialEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['special-events'] });
      queryClient.invalidateQueries({ queryKey: ['capacity-state'] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to create event');
    }
  });

  // Actions
  const createRule = useCallback(async (rule: Omit<CapacityRule, 'id' | 'createdAt' | 'lastModified' | 'version'>) => {
    setError(null);
    return createRuleMutation.mutateAsync(rule);
  }, [createRuleMutation]);

  const updateRule = useCallback(async (id: string, updates: Partial<CapacityRule>) => {
    setError(null);
    return updateRuleMutation.mutateAsync({ id, updates });
  }, [updateRuleMutation]);

  const deleteRule = useCallback(async (id: string) => {
    setError(null);
    if (!service) {
      throw new Error('Capacity management service not initialized');
    }
    await service.deleteCapacityRule(id);
    queryClient.invalidateQueries({ queryKey: ['capacity-rules'] });
    queryClient.invalidateQueries({ queryKey: ['capacity-state'] });
  }, [service, queryClient]);

  const createOverride = useCallback(async (override: Omit<CapacityOverride, 'id' | 'authorizedAt'>) => {
    setError(null);
    return createOverrideMutation.mutateAsync(override);
  }, [createOverrideMutation]);

  const removeOverride = useCallback(async (id: string) => {
    setError(null);
    if (!service) {
      throw new Error('Capacity management service not initialized');
    }
    await service.removeCapacityOverride(id);
    queryClient.invalidateQueries({ queryKey: ['capacity-overrides'] });
    queryClient.invalidateQueries({ queryKey: ['capacity-state'] });
  }, [service, queryClient]);

  const createEvent = useCallback(async (event: Omit<SpecialEvent, 'id' | 'createdAt'>) => {
    setError(null);
    return createEventMutation.mutateAsync(event);
  }, [createEventMutation]);

  const updateEvent = useCallback(async (id: string, updates: Partial<SpecialEvent>) => {
    setError(null);
    if (!service) {
      throw new Error('Capacity management service not initialized');
    }
    const updatedEvent = await service.updateSpecialEvent(id, updates);
    queryClient.invalidateQueries({ queryKey: ['special-events'] });
    queryClient.invalidateQueries({ queryKey: ['capacity-state'] });
    return updatedEvent;
  }, [service, queryClient]);

  const getAvailableCapacity = useCallback(async (
    date: string, 
    timeSlot: string, 
    darshanType: string, 
    userType: string = 'public'
  ) => {
    if (!service) {
      throw new Error('Capacity service not initialized');
    }
    return service.getAvailableCapacity(date, timeSlot, darshanType, userType);
  }, [service]);

  const refreshCapacity = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['capacity-state'] });
  }, [queryClient]);

  const getAnalytics = useCallback(async (period: 'day' | 'week' | 'month') => {
    if (!service) {
      throw new Error('Capacity service not initialized');
    }
    try {
      setError(null);
      const analyticsData = await service.getCapacityAnalytics(period);
      setAnalytics(analyticsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
    }
  }, [service]);

  const isUpdating = createRuleMutation.isPending || 
                    updateRuleMutation.isPending || 
                    createOverrideMutation.isPending || 
                    createEventMutation.isPending;

  return {
    // Current state
    capacityState,
    rules,
    overrides,
    specialEvents,
    analytics,
    
    // Loading states
    isLoading,
    isUpdating,
    error,
    
    // Actions
    createRule,
    updateRule,
    deleteRule,
    createOverride,
    removeOverride,
    createEvent,
    updateEvent,
    getAvailableCapacity,
    refreshCapacity,
    getAnalytics
  };
}
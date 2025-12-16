/**
 * React hook for live crowd tracking
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CrowdTrackingService } from '@/lib/crowd-tracking-service';
import { useTempleConfig } from '@/config/hooks';
import { 
  LiveTrackingData, 
  LiveQueueData, 
  ZoneTrackingData, 
  SensorData, 
  CrowdPrediction,
  TrackingAlert,
  CrowdAnalytics,
  TrackingConfig
} from '@/types/crowd-tracking';

export interface UseCrowdTrackingOptions {
  autoStart?: boolean;
  updateInterval?: number;
  enablePredictions?: boolean;
  enableAnalytics?: boolean;
}

export interface CrowdTrackingHookReturn {
  // Data
  liveData: LiveTrackingData | undefined;
  queueData: LiveQueueData | undefined;
  zoneData: ZoneTrackingData[] | undefined;
  sensorData: SensorData[] | undefined;
  predictions: CrowdPrediction | undefined;
  analytics: CrowdAnalytics | undefined;
  alerts: TrackingAlert[];
  
  // Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  start: () => Promise<void>;
  stop: () => void;
  refresh: () => Promise<void>;
  submitManualCount: (data: { counterId: string; staffId: string; count: number; location: string; notes?: string }) => Promise<void>;
  getAnalytics: (period: 'hour' | 'day' | 'week' | 'month') => Promise<void>;
  
  // Real-time updates
  onDataUpdate: (callback: (data: LiveTrackingData) => void) => () => void;
  onAlert: (callback: (alert: TrackingAlert) => void) => () => void;
}

export function useCrowdTracking(options: UseCrowdTrackingOptions = {}): CrowdTrackingHookReturn {
  const {
    autoStart = true,
    updateInterval = 30,
    enablePredictions = true,
    enableAnalytics = false
  } = options;

  const { config: templeConfig } = useTempleConfig();
  const queryClient = useQueryClient();
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<TrackingAlert[]>([]);
  const [analytics, setAnalytics] = useState<CrowdAnalytics | undefined>();
  
  // Service reference
  const serviceRef = useRef<CrowdTrackingService | null>(null);
  const callbacksRef = useRef<{
    onDataUpdate: ((data: LiveTrackingData) => void)[];
    onAlert: ((alert: TrackingAlert) => void)[];
  }>({
    onDataUpdate: [],
    onAlert: []
  });

  // Default tracking config
  const defaultConfig: TrackingConfig = {
    updateInterval,
    predictionHorizon: 24,
    alertThresholds: {
      capacityWarning: 80,
      capacityCritical: 95,
      waitTimeWarning: 30,
      waitTimeCritical: 60
    },
    sensors: [],
    integrations: {
      googleMaps: { enabled: false },
      weatherAPI: false,
      manualCounters: true
    }
  };

  // Initialize service
  useEffect(() => {
    if (templeConfig?.basic.slug && templeConfig.features.liveTracking) {
      serviceRef.current = new CrowdTrackingService(
        templeConfig.basic.slug, 
        defaultConfig
      );

      // Set up event listeners
      serviceRef.current.on('data_update', (data) => {
        queryClient.invalidateQueries({ queryKey: ['live-tracking'] });
        callbacksRef.current.onDataUpdate.forEach(callback => 
          callback(data as LiveTrackingData)
        );
      });

      serviceRef.current.on('alert', (alert) => {
        const alertData = alert as TrackingAlert;
        setAlerts(prev => [alertData, ...prev.slice(0, 9)]); // Keep last 10 alerts
        callbacksRef.current.onAlert.forEach(callback => callback(alertData));
      });

      serviceRef.current.on('sensor_status', () => {
        queryClient.invalidateQueries({ queryKey: ['sensor-data'] });
      });

      if (autoStart) {
        // Call start function asynchronously
        start().catch(console.error);
      }
    }

    return () => {
      if (serviceRef.current) {
        serviceRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templeConfig?.basic.slug, templeConfig?.features.liveTracking, autoStart]);

  // Queries
  const { data: liveData, isLoading: liveLoading } = useQuery({
    queryKey: ['live-tracking', templeConfig?.basic.slug],
    queryFn: () => serviceRef.current?.getLiveData(),
    enabled: !!serviceRef.current && isConnected,
    refetchInterval: updateInterval * 1000,
    staleTime: (updateInterval - 5) * 1000
  });

  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ['queue-live', templeConfig?.basic.slug],
    queryFn: () => serviceRef.current?.getQueueData(),
    enabled: !!serviceRef.current && isConnected,
    refetchInterval: updateInterval * 1000,
    staleTime: (updateInterval - 5) * 1000
  });

  const { data: zoneData, isLoading: zoneLoading } = useQuery({
    queryKey: ['zone-data', templeConfig?.basic.slug],
    queryFn: () => serviceRef.current?.getZoneData(),
    enabled: !!serviceRef.current && isConnected,
    refetchInterval: updateInterval * 1000
  });

  const { data: sensorData, isLoading: sensorLoading } = useQuery({
    queryKey: ['sensor-data', templeConfig?.basic.slug],
    queryFn: () => serviceRef.current?.getSensorData(),
    enabled: !!serviceRef.current && isConnected,
    refetchInterval: updateInterval * 2 * 1000 // Sensors update less frequently
  });

  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['predictions', templeConfig?.basic.slug],
    queryFn: () => serviceRef.current?.getPredictions(),
    enabled: !!serviceRef.current && isConnected && enablePredictions,
    refetchInterval: 300000, // 5 minutes
    staleTime: 240000 // 4 minutes
  });

  const isLoading = liveLoading || queueLoading || zoneLoading || sensorLoading || predictionsLoading;

  // Actions
  const start = useCallback(async () => {
    if (!serviceRef.current) {
      setError('Tracking service not initialized');
      return;
    }

    try {
      setError(null);
      await serviceRef.current.startTracking();
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start tracking';
      setError(errorMessage);
      setIsConnected(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stopTracking();
      setIsConnected(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!serviceRef.current || !isConnected) return;

    queryClient.invalidateQueries({ queryKey: ['live-tracking'] });
    queryClient.invalidateQueries({ queryKey: ['queue-live'] });
    queryClient.invalidateQueries({ queryKey: ['zone-data'] });
    queryClient.invalidateQueries({ queryKey: ['sensor-data'] });
    
    if (enablePredictions) {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    }
  }, [isConnected, queryClient, enablePredictions]);

  const submitManualCount = useCallback(async (data: {
    counterId: string;
    staffId: string;
    count: number;
    location: string;
    notes?: string;
  }) => {
    if (!serviceRef.current) {
      throw new Error('Tracking service not initialized');
    }

    try {
      await serviceRef.current.submitManualCount(data);
      // Refresh data after manual count
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit manual count';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  const getAnalytics = useCallback(async (period: 'hour' | 'day' | 'week' | 'month') => {
    if (!serviceRef.current || !enableAnalytics) return;

    try {
      const analyticsData = await serviceRef.current.getAnalytics(period);
      setAnalytics(analyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
    }
  }, [enableAnalytics]);

  const onDataUpdate = useCallback((callback: (data: LiveTrackingData) => void) => {
    callbacksRef.current.onDataUpdate.push(callback);
    
    // Return cleanup function
    return () => {
      const index = callbacksRef.current.onDataUpdate.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.onDataUpdate.splice(index, 1);
      }
    };
  }, []);

  const onAlert = useCallback((callback: (alert: TrackingAlert) => void) => {
    callbacksRef.current.onAlert.push(callback);
    
    // Return cleanup function
    return () => {
      const index = callbacksRef.current.onAlert.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.onAlert.splice(index, 1);
      }
    };
  }, []);

  return {
    // Data
    liveData,
    queueData,
    zoneData,
    sensorData,
    predictions,
    analytics,
    alerts,
    
    // Status
    isConnected,
    isLoading,
    error,
    
    // Actions
    start,
    stop,
    refresh,
    submitManualCount,
    getAnalytics,
    
    // Real-time updates
    onDataUpdate,
    onAlert
  };
}
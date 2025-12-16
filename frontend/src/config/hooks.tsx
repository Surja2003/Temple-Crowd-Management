'use client'

import React from 'react';
import { TempleConfig } from './types';
import { ConfigManager } from './manager';

/**
 * React hook for temple configuration
 */
export function useTempleConfig(slug?: string) {
  const [config, setConfig] = React.useState<TempleConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        setError(null);
        
        const configManager = ConfigManager.getInstance();
        const templeConfig = slug 
          ? await configManager.getTempleConfig(slug)
          : await configManager.getDefaultTempleConfig();
          
        setConfig(templeConfig);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load temple configuration');
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [slug]);

  const refetch = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const configManager = ConfigManager.getInstance();
      const templeConfig = slug 
        ? await configManager.getTempleConfig(slug)
        : await configManager.getDefaultTempleConfig();
        
      setConfig(templeConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load temple configuration');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  return { config, loading, error, refetch };
}

/**
 * Context for temple configuration
 */
export const TempleConfigContext = React.createContext<{
  config: TempleConfig | null;
  loading: boolean;
  error: string | null;
  setTemple: (slug: string) => void;
}>({
  config: null,
  loading: true,
  error: null,
  setTemple: () => {},
});

/**
 * Provider component for temple configuration
 */
export function TempleConfigProvider({ 
  children, 
  initialSlug 
}: { 
  children: React.ReactNode;
  initialSlug?: string;
}) {
  const [currentSlug, setCurrentSlug] = React.useState(initialSlug);
  const { config, loading, error } = useTempleConfig(currentSlug);

  const setTemple = React.useCallback((slug: string) => {
    setCurrentSlug(slug);
  }, []);

  return (
    <TempleConfigContext.Provider value={{ config, loading, error, setTemple }}>
      {children}
    </TempleConfigContext.Provider>
  );
}

/**
 * Hook to use temple configuration from context
 */
export function useTempleConfigContext() {
  const context = React.useContext(TempleConfigContext);
  if (!context) {
    throw new Error('useTempleConfigContext must be used within a TempleConfigProvider');
  }
  return context;
}
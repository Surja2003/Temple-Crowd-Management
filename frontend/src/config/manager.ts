import { TempleConfig, TempleRegistry } from './types';
import registryData from './registry.json';

// Temple configuration cache
const configCache = new Map<string, TempleConfig>();
const registry: TempleRegistry = registryData as TempleRegistry;

/**
 * Configuration Manager for multi-temple support
 */
export class ConfigManager {
  private static instance: ConfigManager;
  
  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get temple configuration by slug
   */
  async getTempleConfig(slug: string): Promise<TempleConfig | null> {
    try {
      // Check cache first
      if (configCache.has(slug)) {
        return configCache.get(slug)!;
      }

      // Find temple in registry
      const templeEntry = registry.temples.find(t => t.slug === slug);
      if (!templeEntry) {
        console.warn(`Temple with slug "${slug}" not found in registry`);
        return null;
      }

      // Load configuration
      const configModule = await import(`./temples/${slug}.json`);
      const config = configModule.default as TempleConfig;

      // Cache the configuration
      configCache.set(slug, config);
      return config;
    } catch (error) {
      console.error(`Error loading temple config for "${slug}":`, error);
      return null;
    }
  }

  /**
   * Get default temple configuration
   */
  async getDefaultTempleConfig(): Promise<TempleConfig | null> {
    return this.getTempleConfig(registry.defaultTemple);
  }

  /**
   * Get all available temples
   */
  getAvailableTemples() {
    return registry.temples.filter(t => t.status === 'active');
  }

  /**
   * Get featured temples
   */
  getFeaturedTemples() {
    return registry.temples.filter(t => t.status === 'active' && t.featured);
  }

  /**
   * Get global settings
   */
  getGlobalSettings() {
    return registry.globalSettings;
  }

  /**
   * Check if multi-tenancy is enabled
   */
  isMultiTenancyEnabled(): boolean {
    return registry.globalSettings.features.multiTenancy;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return registry.globalSettings.supportedLanguages;
  }

  /**
   * Get theme configuration
   */
  getThemeConfig() {
    return registry.globalSettings.theme;
  }

  /**
   * Validate temple configuration
   */
  validateConfig(config: TempleConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!config.basic.id) errors.push('Temple ID is required');
    if (!config.basic.slug) errors.push('Temple slug is required');
    if (!config.basic.name) errors.push('Temple name is required');

    // Slug validation (URL-friendly)
    if (config.basic.slug && !/^[a-z0-9-]+$/.test(config.basic.slug)) {
      errors.push('Temple slug must contain only lowercase letters, numbers, and hyphens');
    }

    // Timing validation
    if (!config.operations.timings.general.open || !config.operations.timings.general.close) {
      errors.push('General opening and closing times are required');
    }

    // Capacity validation
    if (config.operations.capacity.total <= 0) {
      errors.push('Total capacity must be greater than 0');
    }

    // Darshan types validation
    if (!config.operations.darshanTypes || config.operations.darshanTypes.length === 0) {
      errors.push('At least one darshan type is required');
    }

    // Language validation
    if (!config.operations.languages || config.operations.languages.length === 0) {
      errors.push('At least one language must be supported');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Clear configuration cache
   */
  clearCache(slug?: string) {
    if (slug) {
      configCache.delete(slug);
    } else {
      configCache.clear();
    }
  }

  /**
   * Preload configurations for better performance
   */
  async preloadConfigs(slugs?: string[]) {
    const templesToLoad = slugs || registry.temples.map(t => t.slug);
    
    const loadPromises = templesToLoad.map(async slug => {
      try {
        await this.getTempleConfig(slug);
      } catch (error) {
        console.warn(`Failed to preload config for ${slug}:`, error);
      }
    });

    await Promise.allSettled(loadPromises);
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();
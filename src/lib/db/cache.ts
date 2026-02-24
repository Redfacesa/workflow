// Caching layer for database queries
// Prevents N+1 queries and improves performance

import { CacheEntry } from '../types/database';

interface CacheConfig {
  defaultTTL: number; // milliseconds
  maxSize: number; // maximum entries
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
};

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get value from cache if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const ageMs = Date.now() - entry.timestamp;
    if (ageMs > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = this.config.defaultTTL): void {
    // LRU eviction: remove oldest entry if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      isValid: true,
    });
  }

  /**
   * Invalidate single cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Invalidate all cache (hard reset)
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats (for debugging)
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
let cacheInstance: CacheManager | null = null;

export const getCacheManager = (config?: Partial<CacheConfig>): CacheManager => {
  if (!cacheInstance) {
    cacheInstance = new CacheManager(config);
  }
  return cacheInstance;
};

// Cache key builders
export const cacheKeys = {
  // Workflows
  workflows: (userId: string) => `workflows:${userId}`,
  workflow: (workflowId: string) => `workflow:${workflowId}`,
  workflowNodes: (workflowId: string) => `workflow_nodes:${workflowId}`,
  workflowConnections: (workflowId: string) => `workflow_connections:${workflowId}`,

  // Executions
  executions: (workflowId: string) => `executions:${workflowId}`,
  execution: (executionId: string) => `execution:${executionId}`,
  executionResults: (executionId: string) => `execution_results:${executionId}`,

  // API Keys
  apiKeys: (userId: string) => `api_keys:${userId}`,
  apiKey: (userId: string, serviceName: string) => `api_key:${userId}:${serviceName}`,

  // Settings
  brandSettings: (userId: string) => `brand_settings:${userId}`,
  accountSettings: (userId: string) => `account_settings:${userId}`,

  // Audit logs
  auditLogs: (userId: string) => `audit_logs:${userId}`,

  // User
  userProfile: (userId: string) => `user_profile:${userId}`,

  // Templates
  templates: () => 'templates:all',
  template: (templateId: string) => `template:${templateId}`,
  savedTemplates: (userId: string) => `saved_templates:${userId}`,

  // Favorites
  favorites: (userId: string) => `favorites:${userId}`,
};

export default CacheManager;

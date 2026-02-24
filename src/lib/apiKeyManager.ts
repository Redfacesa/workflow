import * as React from 'react';

/**
 * API Key Management
 * Handles storage and retrieval of API keys securely
 */

interface ApiKeyConfig {
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_AI_API_KEY?: string;
  GOOGLE_OAUTH_TOKEN?: string;
  KLING_API_KEY?: string;
  XAI_API_KEY?: string;
  REPLICATE_API_KEY?: string;
  STABILITY_API_KEY?: string;
  ELEVENLABS_API_KEY?: string;
  GOOGLE_TTS_API_KEY?: string;
}

/**
 * API Key Manager - stores and retrieves API keys
 * In production, these should be stored in encrypted Supabase/backend
 */
export class ApiKeyManager {
  private keys: ApiKeyConfig = {};
  private isInitialized = false;

  /**
   * Initialize API keys from environment or storage
   */
  async initialize() {
    if (this.isInitialized) return;

    // Load from environment variables (backend should provide these)
    // For now, we'll load from localStorage (NOT SECURE - backend should handle this)
    const stored = localStorage.getItem('api_keys');
    if (stored) {
      try {
        this.keys = JSON.parse(stored);
      } catch (err) {
        console.error('Failed to parse stored API keys');
      }
    }

    this.isInitialized = true;
  }

  /**
   * Set an API key
   */
  setKey(name: keyof ApiKeyConfig, value: string) {
    this.keys[name] = value;
    // In production: send securely to backend for encrypted storage
    localStorage.setItem('api_keys', JSON.stringify(this.keys));
  }

  /**
   * Get an API key
   */
  getKey(name: keyof ApiKeyConfig): string | undefined {
    return this.keys[name];
  }

  /**
   * Get all configured keys
   */
  getAllKeys(): ApiKeyConfig {
    return { ...this.keys };
  }

  /**
   * Check if a key is configured
   */
  hasKey(name: keyof ApiKeyConfig): boolean {
    return !!this.keys[name];
  }

  /**
   * Clear an API key
   */
  clearKey(name: keyof ApiKeyConfig) {
    delete this.keys[name];
    localStorage.setItem('api_keys', JSON.stringify(this.keys));
  }

  /**
   * Clear all API keys
   */
  clearAllKeys() {
    this.keys = {};
    localStorage.removeItem('api_keys');
  }

  /**
   * Get list of configured services
   */
  getConfiguredServices(): string[] {
    return Object.keys(this.keys).filter(key => this.keys[key as keyof ApiKeyConfig]);
  }
}

// Singleton instance
export const apiKeyManager = new ApiKeyManager();

/**
 * Hook for React components to use API keys
 * Usage: const keys = useApiKeys();
 */
export function useApiKeys() {
  const [keys, setKeys] = React.useState<ApiKeyConfig>({});

  React.useEffect(() => {
    apiKeyManager.initialize().then(() => {
      setKeys(apiKeyManager.getAllKeys());
    });
  }, []);

  return keys;
}

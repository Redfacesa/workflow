// React hook for managing API keys
// Includes caching, real-time sync, and error handling

import { useEffect, useState, useCallback, useRef } from 'react';
import { ApiKey, DatabaseError } from '../types/database';
import { db } from './queries';
import { getRealtimeManager } from './realtime';

interface UseApiKeysState {
  keys: ApiKey[];
  loading: boolean;
  error: DatabaseError | null;
  isSaving: boolean;
}

interface UseApiKeyState {
  key: ApiKey | null;
  loading: boolean;
  error: DatabaseError | null;
  isSaving: boolean;
}

/**
 * Hook to fetch and manage API keys for a user
 */
export const useApiKeys = (userId: string, options?: { realtime?: boolean }) => {
  const [state, setState] = useState<UseApiKeysState>({
    keys: [],
    loading: true,
    error: null,
    isSaving: false,
  });

  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial data
    const fetchApiKeys = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await db.getApiKeys(userId);
        setState(prev => ({ ...prev, keys: data, loading: false }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
          loading: false,
        }));
      }
    };

    fetchApiKeys();

    // Set up real-time subscription if enabled
    if (options?.realtime) {
      const realtimeManager = getRealtimeManager();
      subscriptionRef.current = realtimeManager.subscribe('api_keys', userId, (event) => {
        setState(prev => {
          if (event.type === 'INSERT') {
            return { ...prev, keys: [...prev.keys, event.record] };
          } else if (event.type === 'UPDATE') {
            return {
              ...prev,
              keys: prev.keys.map(k => (k.id === event.record.id ? event.record : k)),
            };
          } else if (event.type === 'DELETE') {
            return {
              ...prev,
              keys: prev.keys.filter(k => k.id !== event.record.id),
            };
          }
          return prev;
        });
      });
    }

    return () => {
      if (subscriptionRef.current && options?.realtime) {
        getRealtimeManager()
          .unsubscribe(subscriptionRef.current)
          .catch(console.error);
      }
    };
  }, [userId, options?.realtime]);

  const createApiKey = useCallback(
    async (key: Omit<ApiKey, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        setState(prev => ({ ...prev, isSaving: true }));
        const newKey = await db.createApiKey(key);
        setState(prev => ({
          ...prev,
          keys: [...prev.keys, newKey],
          isSaving: false,
        }));
        return newKey;
      } catch (error) {
        const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
        setState(prev => ({ ...prev, error: dbError, isSaving: false }));
        throw dbError;
      }
    },
    []
  );

  const updateApiKey = useCallback(
    async (keyId: string, updates: Partial<Omit<ApiKey, 'id' | 'created_at' | 'updated_at'>>) => {
      try {
        setState(prev => ({ ...prev, isSaving: true }));
        const updated = await db.updateApiKey(keyId, updates);
        setState(prev => ({
          ...prev,
          keys: prev.keys.map(k => (k.id === keyId ? updated : k)),
          isSaving: false,
        }));
        return updated;
      } catch (error) {
        const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
        setState(prev => ({ ...prev, error: dbError, isSaving: false }));
        throw dbError;
      }
    },
    []
  );

  const deleteApiKey = useCallback(
    async (keyId: string) => {
      try {
        setState(prev => ({ ...prev, isSaving: true }));
        await db.deleteApiKey(keyId, userId);
        setState(prev => ({
          ...prev,
          keys: prev.keys.filter(k => k.id !== keyId),
          isSaving: false,
        }));
      } catch (error) {
        const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
        setState(prev => ({ ...prev, error: dbError, isSaving: false }));
        throw dbError;
      }
    },
    [userId]
  );

  const getKeyByService = useCallback(
    (serviceName: string): ApiKey | undefined => {
      return state.keys.find(k => k.service_name === serviceName);
    },
    [state.keys]
  );

  const getMasterKey = useCallback((): ApiKey | undefined => {
    return state.keys.find(k => k.is_master_key);
  }, [state.keys]);

  const refreshApiKeys = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const data = await db.getApiKeys(userId);
      setState(prev => ({ ...prev, keys: data, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
        loading: false,
      }));
    }
  }, [userId]);

  return {
    ...state,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    getKeyByService,
    getMasterKey,
    refreshApiKeys,
  };
};

/**
 * Hook to fetch and manage a single API key
 */
export const useApiKey = (userId: string, serviceName: string) => {
  const [state, setState] = useState<UseApiKeyState>({
    key: null,
    loading: true,
    error: null,
    isSaving: false,
  });

  useEffect(() => {
    if (!userId || !serviceName) return;

    const fetchApiKey = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await db.getApiKey(userId, serviceName);
        setState(prev => ({ ...prev, key: data, loading: false }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
          loading: false,
        }));
      }
    };

    fetchApiKey();

    // Subscribe to changes
    const subscriptionId = getRealtimeManager().subscribe('api_keys', userId, (event) => {
      if (event.type === 'UPDATE' && event.record.service_name === serviceName) {
        setState(prev => ({ ...prev, key: event.record }));
      } else if (event.type === 'DELETE' && event.record.service_name === serviceName) {
        setState(prev => ({ ...prev, key: null }));
      }
    });

    return () => {
      getRealtimeManager()
        .unsubscribe(subscriptionId)
        .catch(console.error);
    };
  }, [userId, serviceName]);

  const updateApiKey = useCallback(
    async (updates: Partial<Omit<ApiKey, 'id' | 'created_at' | 'updated_at'>>) => {
      if (!state.key) throw new DatabaseError('NOT_FOUND', 'API key not found');

      try {
        setState(prev => ({ ...prev, isSaving: true }));
        const updated = await db.updateApiKey(state.key.id, updates);
        setState(prev => ({
          ...prev,
          key: updated,
          isSaving: false,
        }));
        return updated;
      } catch (error) {
        const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
        setState(prev => ({ ...prev, error: dbError, isSaving: false }));
        throw dbError;
      }
    },
    [state.key]
  );

  const deleteApiKey = useCallback(async () => {
    if (!state.key) throw new DatabaseError('NOT_FOUND', 'API key not found');

    try {
      setState(prev => ({ ...prev, isSaving: true }));
      await db.deleteApiKey(state.key.id, userId);
      setState(prev => ({
        ...prev,
        key: null,
        isSaving: false,
      }));
    } catch (error) {
      const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
      setState(prev => ({ ...prev, error: dbError, isSaving: false }));
      throw dbError;
    }
  }, [userId, state.key]);

  return {
    ...state,
    updateApiKey,
    deleteApiKey,
  };
};

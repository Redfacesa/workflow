// React hook for managing audit logs
// Includes real-time sync, pagination, and filtering

import { useEffect, useState, useCallback, useRef } from 'react';
import { AuditLog, DatabaseError, PaginatedResponse } from '../types/database';
import { db } from './queries';
import { getRealtimeManager } from './realtime';

interface UseAuditLogsState {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: DatabaseError | null;
  hasMore: boolean;
}

/**
 * Hook to fetch and manage audit logs for a user
 * Includes pagination and real-time updates
 */
export const useAuditLogs = (
  userId: string,
  options?: {
    realtime?: boolean;
    pageSize?: number;
    resourceType?: string;
    action?: string;
  }
) => {
  const [state, setState] = useState<UseAuditLogsState>({
    logs: [],
    total: 0,
    page: 0,
    pageSize: options?.pageSize || 50,
    loading: true,
    error: null,
    hasMore: false,
  });

  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial data
    const fetchLogs = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await db.getAuditLogs(userId, state.pageSize, state.page * state.pageSize);
        setState(prev => ({
          ...prev,
          logs: data.data,
          total: data.total,
          hasMore: data.hasMore,
          loading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
          loading: false,
        }));
      }
    };

    fetchLogs();

    // Set up real-time subscription if enabled
    if (options?.realtime) {
      const realtimeManager = getRealtimeManager();
      subscriptionRef.current = realtimeManager.subscribe('audit_logs', userId, (event) => {
        if (event.type === 'INSERT') {
          // Add new log to the beginning if it matches filter
          const matchesFilter =
            (!options.resourceType || event.record.resource_type === options.resourceType) &&
            (!options.action || event.record.action === options.action);

          if (matchesFilter) {
            setState(prev => ({
              ...prev,
              logs: [event.record, ...prev.logs].slice(0, prev.pageSize),
              total: prev.total + 1,
            }));
          }
        }
      });
    }

    return () => {
      if (subscriptionRef.current && options?.realtime) {
        getRealtimeManager()
          .unsubscribe(subscriptionRef.current)
          .catch(console.error);
      }
    };
  }, [userId, state.page, state.pageSize, options?.realtime, options?.resourceType, options?.action]);

  const goToPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page: Math.max(0, page) }));
  }, []);

  const nextPage = useCallback(() => {
    setState(prev => {
      if (prev.hasMore) {
        return { ...prev, page: prev.page + 1 };
      }
      return prev;
    });
  }, []);

  const prevPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      page: Math.max(0, prev.page - 1),
    }));
  }, []);

  const refreshLogs = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const data = await db.getAuditLogs(userId, state.pageSize, state.page * state.pageSize);
      setState(prev => ({
        ...prev,
        logs: data.data,
        total: data.total,
        hasMore: data.hasMore,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
        loading: false,
      }));
    }
  }, [userId, state.page, state.pageSize]);

  const getLogsByAction = useCallback((action: string): AuditLog[] => {
    return state.logs.filter(log => log.action === action);
  }, [state.logs]);

  const getLogsByResource = useCallback((resourceType: string): AuditLog[] => {
    return state.logs.filter(log => log.resource_type === resourceType);
  }, [state.logs]);

  return {
    ...state,
    goToPage,
    nextPage,
    prevPage,
    refreshLogs,
    getLogsByAction,
    getLogsByResource,
  };
};

/**
 * Hook to watch recent audit activity
 * Returns last N logs in real-time
 */
export const useRecentAuditActivity = (userId: string, limit = 20) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial recent logs
    const fetchRecent = async () => {
      try {
        const data = await db.getAuditLogs(userId, limit, 0);
        setLogs(data.data);
      } catch (error) {
        console.error('Failed to fetch recent audit logs:', error);
      }
    };

    fetchRecent();

    // Subscribe to new logs
    subscriptionRef.current = getRealtimeManager().subscribe('audit_logs', userId, (event) => {
      if (event.type === 'INSERT') {
        setLogs(prev => [event.record, ...prev].slice(0, limit));
      }
    });

    return () => {
      if (subscriptionRef.current) {
        getRealtimeManager()
          .unsubscribe(subscriptionRef.current)
          .catch(console.error);
      }
    };
  }, [userId, limit]);

  return logs;
};

/**
 * Hook to get summary of audit activity
 */
export const useAuditSummary = (userId: string) => {
  const [summary, setSummary] = useState<{
    totalActions: number;
    actionsByType: Record<string, number>;
    recentActions: AuditLog[];
    lastActivityTime: string | null;
  }>({
    totalActions: 0,
    actionsByType: {},
    recentActions: [],
    lastActivityTime: null,
  });

  const logs = useAuditLogs(userId, { pageSize: 100, realtime: true });

  useEffect(() => {
    const actionsByType: Record<string, number> = {};
    let lastTime: string | null = null;

    logs.logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      if (!lastTime) {
        lastTime = log.created_at;
      }
    });

    setSummary({
      totalActions: logs.total,
      actionsByType,
      recentActions: logs.logs.slice(0, 10),
      lastActivityTime: lastTime,
    });
  }, [logs.logs, logs.total]);

  return summary;
};

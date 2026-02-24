// React hook for managing workflow executions
// Includes real-time updates on execution progress

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  WorkflowExecution,
  ExecutionNodeResult,
  DatabaseError,
  PaginatedResponse,
} from '../types/database';
import { db } from './queries';
import { getRealtimeManager } from './realtime';

interface UseExecutionHistoryState extends PaginatedResponse<WorkflowExecution> {
  loading: boolean;
  error: DatabaseError | null;
}

interface UseExecutionState {
  execution: WorkflowExecution | null;
  nodeResults: ExecutionNodeResult[];
  loading: boolean;
  error: DatabaseError | null;
  isUpdating: boolean;
}

/**
 * Hook to fetch and manage execution history for a workflow
 */
export const useExecutionHistory = (
  workflowId: string,
  options?: {
    pageSize?: number;
    realtime?: boolean;
  }
) => {
  const [state, setState] = useState<UseExecutionHistoryState>({
    data: [],
    total: 0,
    page: 0,
    pageSize: options?.pageSize || 20,
    hasMore: false,
    loading: true,
    error: null,
  });

  const subscriptionRef = useRef<string | null>(null);

  const fetchExecutions = useCallback(async (page: number, pageSize: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await db.getExecutionHistory(workflowId, pageSize, page * pageSize);
      setState(prev => ({
        ...prev,
        data: data.data,
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
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
  }, [workflowId]);

  useEffect(() => {
    if (!workflowId) return;

    // Fetch initial data
    fetchExecutions(0, state.pageSize);

    // Set up real-time subscription if enabled
    if (options?.realtime) {
      const subscriptionId = getRealtimeManager().subscribe(
        'workflow_executions',
        workflowId,
        (event) => {
          if (event.type === 'INSERT') {
            setState(prev => ({
              ...prev,
              data: [event.record, ...prev.data].slice(0, prev.pageSize),
              total: prev.total + 1,
            }));
          } else if (event.type === 'UPDATE') {
            setState(prev => ({
              ...prev,
              data: prev.data.map(e => (e.id === event.record.id ? event.record : e)),
            }));
          }
        }
      );
      subscriptionRef.current = subscriptionId;
    }

    return () => {
      if (subscriptionRef.current && options?.realtime) {
        getRealtimeManager()
          .unsubscribe(subscriptionRef.current)
          .catch(console.error);
      }
    };
  }, [workflowId, state.pageSize, options?.realtime, fetchExecutions]);

  const goToPage = useCallback((page: number) => {
    fetchExecutions(Math.max(0, page), state.pageSize);
  }, [fetchExecutions, state.pageSize]);

  const nextPage = useCallback(() => {
    if (state.hasMore) {
      goToPage(state.page + 1);
    }
  }, [state.hasMore, state.page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(Math.max(0, state.page - 1));
  }, [goToPage]);

  const refresh = useCallback(() => {
    fetchExecutions(state.page, state.pageSize);
  }, [fetchExecutions, state.page, state.pageSize]);

  return {
    ...state,
    goToPage,
    nextPage,
    prevPage,
    refresh,
  };
};

/**
 * Hook to track a single execution in real-time
 */
export const useExecution = (executionId: string, options?: { realtime?: boolean }) => {
  const [state, setState] = useState<UseExecutionState>({
    execution: null,
    nodeResults: [],
    loading: true,
    error: null,
    isUpdating: false,
  });

  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!executionId) return;

    // Fetch initial execution and results
    const fetchExecution = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const [execution, results] = await Promise.all([
          db.getExecution(executionId),
          db.getExecutionResults(executionId),
        ]);
        setState(prev => ({
          ...prev,
          execution,
          nodeResults: results,
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

    fetchExecution();

    // Subscribe to execution updates
    if (options?.realtime) {
      const subscriptionId = getRealtimeManager().subscribe(
        'workflow_executions',
        executionId,
        async (event) => {
          if (event.type === 'UPDATE' && event.record.id === executionId) {
            setState(prev => ({ ...prev, execution: event.record }));
          }
        }
      );

      // Also subscribe to node results
      const resultsId = getRealtimeManager().subscribe(
        'execution_node_results',
        executionId,
        async (event) => {
          if (event.record.execution_id === executionId) {
            if (event.type === 'INSERT') {
              setState(prev => ({
                ...prev,
                nodeResults: [...prev.nodeResults, event.record],
              }));
            } else if (event.type === 'UPDATE') {
              setState(prev => ({
                ...prev,
                nodeResults: prev.nodeResults.map(nr =>
                  nr.id === event.record.id ? event.record : nr
                ),
              }));
            }
          }
        }
      );

      subscriptionRef.current = subscriptionId;

      return () => {
        getRealtimeManager()
          .unsubscribe(subscriptionId)
          .catch(console.error);
        getRealtimeManager()
          .unsubscribe(resultsId)
          .catch(console.error);
      };
    }
  }, [executionId, options?.realtime]);

  const updateExecution = useCallback(
    async (updates: Partial<Omit<WorkflowExecution, 'id' | 'created_at'>>) => {
      if (!state.execution) {
        throw new DatabaseError('NOT_FOUND', 'Execution not found');
      }

      try {
        setState(prev => ({ ...prev, isUpdating: true }));
        const updated = await db.updateExecution(executionId, updates);
        setState(prev => ({
          ...prev,
          execution: updated,
          isUpdating: false,
        }));
        return updated;
      } catch (error) {
        const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
        setState(prev => ({ ...prev, error: dbError, isUpdating: false }));
        throw dbError;
      }
    },
    [executionId, state.execution]
  );

  const getNodeResult = useCallback(
    (nodeId: string): ExecutionNodeResult | undefined => {
      return state.nodeResults.find(nr => nr.node_id === nodeId);
    },
    [state.nodeResults]
  );

  const getResultsByStatus = useCallback(
    (status: 'running' | 'completed' | 'failed'): ExecutionNodeResult[] => {
      return state.nodeResults.filter(nr => nr.status === status);
    },
    [state.nodeResults]
  );

  const refresh = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const [execution, results] = await Promise.all([
        db.getExecution(executionId),
        db.getExecutionResults(executionId),
      ]);
      setState(prev => ({
        ...prev,
        execution,
        nodeResults: results,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
        loading: false,
      }));
    }
  }, [executionId]);

  return {
    ...state,
    updateExecution,
    getNodeResult,
    getResultsByStatus,
    refresh,
  };
};

/**
 * Hook to watch execution progress in real-time
 */
export const useExecutionProgress = (executionId: string) => {
  const { execution, nodeResults, loading, error } = useExecution(executionId, { realtime: true });

  const completedCount = nodeResults.filter(nr => nr.status === 'completed').length;
  const failedCount = nodeResults.filter(nr => nr.status === 'failed').length;
  const runningCount = nodeResults.filter(nr => nr.status === 'running').length;
  const totalNodes = nodeResults.length;

  const progressPercent = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;
  const isCompleted = execution?.status === 'completed';
  const isFailed = execution?.status === 'failed';
  const isRunning = execution?.status === 'running';

  return {
    execution,
    totalNodes,
    completedCount,
    failedCount,
    runningCount,
    progressPercent,
    isCompleted,
    isFailed,
    isRunning,
    loading,
    error,
  };
};

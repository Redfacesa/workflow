// React hook for managing workflows
// Includes caching, real-time sync, and error handling

import { useEffect, useState, useCallback, useRef } from 'react';
import { Workflow, WorkflowWithRelations, DatabaseError } from '../types/database';
import { db } from './queries';
import { getRealtimeManager } from './realtime';

interface UseWorkflowsState {
  workflows: Workflow[];
  loading: boolean;
  error: DatabaseError | null;
}

interface UseWorkflowState {
  workflow: WorkflowWithRelations | null;
  loading: boolean;
  error: DatabaseError | null;
  isSaving: boolean;
}

/**
 * Hook to fetch and manage all workflows for a user
 */
export const useWorkflows = (userId: string, options?: { realtime?: boolean; includeArchived?: boolean }) => {
  const [state, setState] = useState<UseWorkflowsState>({
    workflows: [],
    loading: true,
    error: null,
  });

  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial data
    const fetchWorkflows = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await db.getWorkflows(userId, options?.includeArchived);
        setState(prev => ({ ...prev, workflows: data, loading: false }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
          loading: false,
        }));
      }
    };

    fetchWorkflows();

    // Set up real-time subscription if enabled
    if (options?.realtime) {
      const realtimeManager = getRealtimeManager();
      subscriptionRef.current = realtimeManager.subscribe('workflows', userId, (event) => {
        setState(prev => {
          if (event.type === 'INSERT') {
            return { ...prev, workflows: [...prev.workflows, event.record] };
          } else if (event.type === 'UPDATE') {
            return {
              ...prev,
              workflows: prev.workflows.map(w => (w.id === event.record.id ? event.record : w)),
            };
          } else if (event.type === 'DELETE') {
            return {
              ...prev,
              workflows: prev.workflows.filter(w => w.id !== event.record.id),
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
  }, [userId, options?.includeArchived, options?.realtime]);

  const createWorkflow = useCallback(
    async (workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const newWorkflow = await db.createWorkflow(userId, workflow);
        setState(prev => ({
          ...prev,
          workflows: [...prev.workflows, newWorkflow],
        }));
        return newWorkflow;
      } catch (error) {
        const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
        setState(prev => ({ ...prev, error: dbError }));
        throw dbError;
      }
    },
    [userId]
  );

  const updateWorkflow = useCallback(
    async (workflowId: string, updates: Partial<Omit<Workflow, 'id' | 'created_at' | 'updated_at'>>) => {
      try {
        const updated = await db.updateWorkflow(workflowId, updates);
        setState(prev => ({
          ...prev,
          workflows: prev.workflows.map(w => (w.id === workflowId ? updated : w)),
        }));
        return updated;
      } catch (error) {
        const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
        setState(prev => ({ ...prev, error: dbError }));
        throw dbError;
      }
    },
    []
  );

  const deleteWorkflow = useCallback(async (workflowId: string) => {
    try {
      await db.deleteWorkflow(workflowId);
      setState(prev => ({
        ...prev,
        workflows: prev.workflows.filter(w => w.id !== workflowId),
      }));
    } catch (error) {
      const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
      setState(prev => ({ ...prev, error: dbError }));
      throw dbError;
    }
  }, []);

  const archiveWorkflow = useCallback(async (workflowId: string) => {
    try {
      const updated = await db.archiveWorkflow(workflowId);
      setState(prev => ({
        ...prev,
        workflows: prev.workflows.filter(w => w.id !== workflowId),
      }));
      return updated;
    } catch (error) {
      const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
      setState(prev => ({ ...prev, error: dbError }));
      throw dbError;
    }
  }, []);

  const refreshWorkflows = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const data = await db.getWorkflows(userId, options?.includeArchived);
      setState(prev => ({ ...prev, workflows: data, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
        loading: false,
      }));
    }
  }, [userId, options?.includeArchived]);

  return {
    ...state,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    archiveWorkflow,
    refreshWorkflows,
  };
};

/**
 * Hook to fetch and manage a single workflow with nodes and connections
 */
export const useWorkflow = (workflowId: string) => {
  const [state, setState] = useState<UseWorkflowState>({
    workflow: null,
    loading: true,
    error: null,
    isSaving: false,
  });

  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!workflowId) return;

    const fetchWorkflow = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await db.getWorkflowWithRelations(workflowId);
        setState(prev => ({ ...prev, workflow: data, loading: false }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
          loading: false,
        }));
      }
    };

    fetchWorkflow();

    // Subscribe to workflow changes
    subscriptionRef.current = getRealtimeManager().subscribe(
      'workflows',
      workflowId,
      async (event) => {
        if (event.type === 'UPDATE') {
          const updated = await db.getWorkflowWithRelations(workflowId).catch(() => null);
          if (updated) {
            setState(prev => ({ ...prev, workflow: updated }));
          }
        }
      }
    );

    return () => {
      if (subscriptionRef.current) {
        getRealtimeManager()
          .unsubscribe(subscriptionRef.current)
          .catch(console.error);
      }
    };
  }, [workflowId]);

  const updateWorkflow = useCallback(
    async (updates: Partial<Omit<Workflow, 'id' | 'created_at' | 'updated_at'>>) => {
      try {
        setState(prev => ({ ...prev, isSaving: true }));
        await db.updateWorkflow(workflowId, updates);
        const updated = await db.getWorkflowWithRelations(workflowId);
        setState(prev => ({
          ...prev,
          workflow: updated,
          isSaving: false,
        }));
      } catch (error) {
        const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
        setState(prev => ({ ...prev, error: dbError, isSaving: false }));
        throw dbError;
      }
    },
    [workflowId]
  );

  const refreshWorkflow = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const data = await db.getWorkflowWithRelations(workflowId);
      setState(prev => ({ ...prev, workflow: data, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
        loading: false,
      }));
    }
  }, [workflowId]);

  return {
    ...state,
    updateWorkflow,
    refreshWorkflow,
  };
};

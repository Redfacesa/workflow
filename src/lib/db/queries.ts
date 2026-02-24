// Database query layer - all CRUD operations for Supabase
// Includes error handling, retries, and cache integration

import { supabase } from '../supabase';
import {
  Workflow,
  WorkflowNode,
  WorkflowConnection,
  WorkflowWithRelations,
  WorkflowExecution,
  ExecutionNodeResult,
  ApiKey,
  BrandSettings,
  AccountSettings,
  Integration,
  WorkflowTemplate,
  SavedTemplate,
  AuditLog,
  WorkflowFavorite,
  DatabaseError,
  DEFAULT_RETRY_CONFIG,
  RetryConfig,
  PaginatedResponse,
} from '../types/database';
import { getCacheManager, cacheKeys } from './cache';

const cache = getCacheManager();

// ============================================================================
// ERROR HANDLING & RETRY LOGIC
// ============================================================================

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on auth/permission errors
      if (error instanceof Error && error.message.includes('permission')) {
        throw error;
      }

      if (attempt < config.maxAttempts) {
        const backoffMs = Math.min(
          config.initialBackoffMs * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxBackoffMs
        );
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw new DatabaseError(
    'RETRY_EXHAUSTED',
    `Failed after ${config.maxAttempts} attempts`,
    lastError
  );
}

function handleSupabaseError(error: any): DatabaseError {
  const message = error?.message || 'Unknown database error';
  const code = error?.code || 'UNKNOWN_ERROR';

  return new DatabaseError(code, message, error);
}

// ============================================================================
// WORKFLOWS
// ============================================================================

export const db = {
  // ========================================
  // WORKFLOWS - Full CRUD
  // ========================================

  async getWorkflows(userId: string, includeArchived = false) {
    const cacheKey = cacheKeys.workflows(userId);
    const cached = cache.get<Workflow[]>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        let query = supabase
          .from('workflows')
          .select('*')
          .eq('user_id', userId);

        if (!includeArchived) {
          query = query.is('archived_at', null);
        }

        const { data, error } = await query.order('updated_at', { ascending: false });

        if (error) throw handleSupabaseError(error);

        cache.set(cacheKey, data || []);
        return data || [];
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async getWorkflow(workflowId: string) {
    const cacheKey = cacheKeys.workflow(workflowId);
    const cached = cache.get<Workflow>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('id', workflowId)
          .single();

        if (error) throw handleSupabaseError(error);

        if (data) {
          cache.set(cacheKey, data);
        }
        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async getWorkflowWithRelations(workflowId: string): Promise<WorkflowWithRelations | null> {
    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) return null;

      const [nodes, connections] = await Promise.all([
        this.getWorkflowNodes(workflowId),
        this.getWorkflowConnections(workflowId),
      ]);

      return {
        ...workflow,
        nodes,
        connections,
      };
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async createWorkflow(userId: string, workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflows')
          .insert({
            user_id: userId,
            ...workflow,
          })
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        // Invalidate list cache
        cache.invalidate(cacheKeys.workflows(userId));

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async updateWorkflow(
    workflowId: string,
    updates: Partial<Omit<Workflow, 'id' | 'created_at' | 'updated_at'>>
  ) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflows')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflowId)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.workflow(workflowId));

        // Get user ID to invalidate list cache
        if (data?.user_id) {
          cache.invalidate(cacheKeys.workflows(data.user_id));
        }

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async deleteWorkflow(workflowId: string) {
    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) throw new DatabaseError('NOT_FOUND', 'Workflow not found');

      return await withRetry(async () => {
        const { error } = await supabase
          .from('workflows')
          .delete()
          .eq('id', workflowId);

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.workflow(workflowId));
        cache.invalidate(cacheKeys.workflows(workflow.user_id));
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async archiveWorkflow(workflowId: string) {
    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) throw new DatabaseError('NOT_FOUND', 'Workflow not found');

      return await this.updateWorkflow(workflowId, {
        archived_at: new Date().toISOString(),
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  // ========================================
  // WORKFLOW NODES
  // ========================================

  async getWorkflowNodes(workflowId: string) {
    const cacheKey = cacheKeys.workflowNodes(workflowId);
    const cached = cache.get<WorkflowNode[]>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflow_nodes')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('created_at', { ascending: true });

        if (error) throw handleSupabaseError(error);

        cache.set(cacheKey, data || []);
        return data || [];
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async createWorkflowNode(node: Omit<WorkflowNode, 'id' | 'created_at' | 'updated_at'>) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflow_nodes')
          .insert(node)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.workflowNodes(node.workflow_id));

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async updateWorkflowNode(
    nodeId: string,
    updates: Partial<Omit<WorkflowNode, 'id' | 'created_at' | 'updated_at'>>
  ) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflow_nodes')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', nodeId)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        if (data?.workflow_id) {
          cache.invalidate(cacheKeys.workflowNodes(data.workflow_id));
        }

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async deleteWorkflowNode(nodeId: string) {
    try {
      // Get node first to know workflow_id
      const { data: node } = await supabase
        .from('workflow_nodes')
        .select('workflow_id')
        .eq('id', nodeId)
        .single();

      return await withRetry(async () => {
        const { error } = await supabase
          .from('workflow_nodes')
          .delete()
          .eq('id', nodeId);

        if (error) throw handleSupabaseError(error);

        if (node?.workflow_id) {
          cache.invalidate(cacheKeys.workflowNodes(node.workflow_id));
        }
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  // ========================================
  // WORKFLOW CONNECTIONS
  // ========================================

  async getWorkflowConnections(workflowId: string) {
    const cacheKey = cacheKeys.workflowConnections(workflowId);
    const cached = cache.get<WorkflowConnection[]>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflow_connections')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('created_at', { ascending: true });

        if (error) throw handleSupabaseError(error);

        cache.set(cacheKey, data || []);
        return data || [];
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async createWorkflowConnection(
    connection: Omit<WorkflowConnection, 'id' | 'created_at'>
  ) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflow_connections')
          .insert(connection)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.workflowConnections(connection.workflow_id));

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async deleteWorkflowConnection(
    workflowId: string,
    connectionId: string
  ) {
    try {
      return await withRetry(async () => {
        const { error } = await supabase
          .from('workflow_connections')
          .delete()
          .eq('workflow_id', workflowId)
          .eq('connection_id', connectionId);

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.workflowConnections(workflowId));
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  // ========================================
  // WORKFLOW EXECUTIONS
  // ========================================

  async createExecution(
    execution: Omit<WorkflowExecution, 'id' | 'created_at'>
  ) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflow_executions')
          .insert(execution)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        cache.invalidatePattern(`executions:${execution.workflow_id}`);

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async getExecution(executionId: string) {
    const cacheKey = cacheKeys.execution(executionId);
    const cached = cache.get<WorkflowExecution>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflow_executions')
          .select('*')
          .eq('id', executionId)
          .single();

        if (error) throw handleSupabaseError(error);

        if (data) {
          cache.set(cacheKey, data);
        }

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async getExecutionHistory(
    workflowId: string,
    limit = 50,
    offset = 0
  ): Promise<PaginatedResponse<WorkflowExecution>> {
    try {
      return await withRetry(async () => {
        // Get total count
        const { count } = await supabase
          .from('workflow_executions')
          .select('*', { count: 'exact', head: true })
          .eq('workflow_id', workflowId);

        // Get paginated data
        const { data, error } = await supabase
          .from('workflow_executions')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw handleSupabaseError(error);

        const total = count || 0;

        return {
          data: data || [],
          total,
          page: Math.floor(offset / limit),
          pageSize: limit,
          hasMore: offset + limit < total,
        };
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async updateExecution(
    executionId: string,
    updates: Partial<Omit<WorkflowExecution, 'id' | 'created_at'>>
  ) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflow_executions')
          .update(updates)
          .eq('id', executionId)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.execution(executionId));

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  // ========================================
  // EXECUTION NODE RESULTS
  // ========================================

  async createExecutionResult(
    result: Omit<ExecutionNodeResult, 'id' | 'created_at'>
  ) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('execution_node_results')
          .insert(result)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.executionResults(result.execution_id));

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async updateExecutionResult(
    resultId: string,
    updates: Partial<Omit<ExecutionNodeResult, 'id' | 'created_at'>>
  ) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('execution_node_results')
          .update(updates)
          .eq('id', resultId)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async getExecutionResults(executionId: string) {
    const cacheKey = cacheKeys.executionResults(executionId);
    const cached = cache.get<ExecutionNodeResult[]>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('execution_node_results')
          .select('*')
          .eq('execution_id', executionId)
          .order('created_at', { ascending: true });

        if (error) throw handleSupabaseError(error);

        cache.set(cacheKey, data || []);

        return data || [];
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  // ========================================
  // API KEYS
  // ========================================

  async getApiKeys(userId: string) {
    const cacheKey = cacheKeys.apiKeys(userId);
    const cached = cache.get<ApiKey[]>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (error) throw handleSupabaseError(error);

        cache.set(cacheKey, data || []);

        return data || [];
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async getApiKey(userId: string, serviceName: string) {
    const cacheKey = cacheKeys.apiKey(userId, serviceName);
    const cached = cache.get<ApiKey>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', userId)
          .eq('service_name', serviceName)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw handleSupabaseError(error);
        }

        if (data) {
          cache.set(cacheKey, data);
        }

        return data || null;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async createApiKey(key: Omit<ApiKey, 'id' | 'created_at' | 'updated_at'>) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('api_keys')
          .insert(key)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.apiKeys(key.user_id));

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async updateApiKey(
    keyId: string,
    updates: Partial<Omit<ApiKey, 'id' | 'created_at' | 'updated_at'>>
  ) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('api_keys')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', keyId)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        const key = await this.getApiKey(updates.user_id || '', updates.service_name || '');
        if (key?.user_id) {
          cache.invalidate(cacheKeys.apiKeys(key.user_id));
        }

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async deleteApiKey(keyId: string, userId: string) {
    try {
      return await withRetry(async () => {
        const { error } = await supabase
          .from('api_keys')
          .delete()
          .eq('id', keyId);

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.apiKeys(userId));
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  // ========================================
  // BRAND SETTINGS
  // ========================================

  async getBrandSettings(userId: string) {
    const cacheKey = cacheKeys.brandSettings(userId);
    const cached = cache.get<BrandSettings>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('brand_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw handleSupabaseError(error);
        }

        if (data) {
          cache.set(cacheKey, data);
        }

        return data || null;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async upsertBrandSettings(
    userId: string,
    settings: Omit<BrandSettings, 'id' | 'created_at' | 'updated_at'>
  ) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('brand_settings')
          .upsert(
            {
              user_id: userId,
              ...settings,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.brandSettings(userId));

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  // ========================================
  // ACCOUNT SETTINGS
  // ========================================

  async getAccountSettings(userId: string) {
    const cacheKey = cacheKeys.accountSettings(userId);
    const cached = cache.get<AccountSettings>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('account_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw handleSupabaseError(error);
        }

        if (data) {
          cache.set(cacheKey, data);
        }

        return data || null;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async upsertAccountSettings(
    userId: string,
    settings: Omit<AccountSettings, 'id' | 'created_at' | 'updated_at'>
  ) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('account_settings')
          .upsert(
            {
              user_id: userId,
              ...settings,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.accountSettings(userId));

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  // ========================================
  // AUDIT LOGS
  // ========================================

  async getAuditLogs(
    userId: string,
    limit = 100,
    offset = 0
  ): Promise<PaginatedResponse<AuditLog>> {
    try {
      return await withRetry(async () => {
        const { count } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw handleSupabaseError(error);

        const total = count || 0;

        return {
          data: data || [],
          total,
          page: Math.floor(offset / limit),
          pageSize: limit,
          hasMore: offset + limit < total,
        };
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  // ========================================
  // WORKFLOW FAVORITES
  // ========================================

  async getFavorites(userId: string) {
    const cacheKey = cacheKeys.favorites(userId);
    const cached = cache.get<WorkflowFavorite[]>(cacheKey);
    if (cached) return cached;

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflow_favorites')
          .select('*')
          .eq('user_id', userId);

        if (error) throw handleSupabaseError(error);

        cache.set(cacheKey, data || []);

        return data || [];
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async addFavorite(userId: string, workflowId: string) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('workflow_favorites')
          .insert({
            user_id: userId,
            workflow_id: workflowId,
          })
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.favorites(userId));

        return data;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async removeFavorite(userId: string, workflowId: string) {
    try {
      return await withRetry(async () => {
        const { error } = await supabase
          .from('workflow_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('workflow_id', workflowId);

        if (error) throw handleSupabaseError(error);

        cache.invalidate(cacheKeys.favorites(userId));
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },
};

export default db;

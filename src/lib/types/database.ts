// Database type definitions for Creative Automation Workflow
// Auto-generated from SUPABASE_SCHEMA.sql

// ============================================================================
// USER PROFILES
// ============================================================================

export interface UserProfile {
  id: string; // UUID, references auth.users(id)
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// WORKFLOWS
// ============================================================================

export interface Workflow {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface WorkflowNode {
  id: string; // UUID
  workflow_id: string; // UUID
  node_type: string; // 'chatgpt', 'competitor-scan', etc.
  node_id: string; // unique within workflow
  label: string | null;
  position_x: number;
  position_y: number;
  config: Record<string, any>; // JSONB
  created_at: string;
  updated_at: string;
}

export interface WorkflowConnection {
  id: string; // UUID
  workflow_id: string; // UUID
  source_node_id: string;
  target_node_id: string;
  connection_id: string; // unique ID
  created_at: string;
}

// Full workflow structure (nodes + connections)
export interface WorkflowWithRelations extends Workflow {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

// ============================================================================
// WORKFLOW EXECUTION & RESULTS
// ============================================================================

export interface WorkflowExecution {
  id: string; // UUID
  workflow_id: string; // UUID
  user_id: string; // UUID
  status: 'running' | 'completed' | 'failed';
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  execution_time_ms: number | null;
  node_count: number | null;
  created_at: string;
}

export interface ExecutionNodeResult {
  id: string; // UUID
  execution_id: string; // UUID
  node_id: string;
  node_type: string;
  status: 'running' | 'completed' | 'failed';
  input_data: Record<string, any> | null; // JSONB
  output_data: Record<string, any> | null; // JSONB
  error_message: string | null;
  execution_time_ms: number | null;
  api_call_count: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// ============================================================================
// API KEYS & GATEWAYS
// ============================================================================

export interface ApiKey {
  id: string; // UUID
  user_id: string; // UUID
  service_name: string; // 'openai', 'anthropic', 'google', 'together', 'replicate', etc.
  encrypted_key: string; // encrypted (stored securely)
  is_master_key: boolean;
  gateway_type: 'together' | 'replicate' | 'custom' | null;
  gateway_endpoint: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Safe version without encrypted key (for UI)
export interface ApiKeyPublic extends Omit<ApiKey, 'encrypted_key'> {
  encrypted_key: '[REDACTED]';
}

// ============================================================================
// BRAND SETTINGS
// ============================================================================

export interface BrandSettings {
  id: string; // UUID
  user_id: string; // UUID
  brand_name: string | null;
  primary_color: string | null; // hex
  secondary_color: string | null;
  accent_color: string | null;
  logo_url: string | null;
  font_family: string;
  font_size_base: number;
  border_radius: number;
  brand_voice: string | null; // 'professional', 'casual', 'creative'
  tagline: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ACCOUNT SETTINGS
// ============================================================================

export interface AccountSettings {
  id: string; // UUID
  user_id: string; // UUID
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  email_on_completion: boolean;
  email_on_error: boolean;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// INTEGRATIONS (Third-party services)
// ============================================================================

export interface Integration {
  id: string; // UUID
  user_id: string; // UUID
  service_name: string; // 'slack', 'google-drive', 'dropbox', etc.
  is_connected: boolean;
  encrypted_token: string | null; // OAuth token
  metadata: Record<string, any>; // JSONB
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// WORKFLOW TEMPLATES
// ============================================================================

export interface WorkflowTemplate {
  id: string; // UUID
  name: string;
  description: string | null;
  category: string; // 'video', 'research', 'brand', 'social', etc.
  workflow_data: {
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
  }; // JSONB
  thumbnail_url: string | null;
  usage_count: number;
  rating: number;
  created_by: string | null; // UUID
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedTemplate {
  id: string; // UUID
  user_id: string; // UUID
  template_id: string; // UUID
  created_at: string;
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export interface AuditLog {
  id: string; // UUID
  user_id: string; // UUID
  action: string; // 'workflow_created', 'workflow_executed', 'api_key_added', etc.
  resource_type: string | null; // 'workflow', 'api_key', 'account', etc.
  resource_id: string | null;
  details: {
    old?: Record<string, any>;
    new?: Record<string, any>;
    changes?: Record<string, any>;
  } | null; // JSONB (redacted)
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============================================================================
// WORKFLOW FAVORITES
// ============================================================================

export interface WorkflowFavorite {
  id: string; // UUID
  user_id: string; // UUID
  workflow_id: string; // UUID
  created_at: string;
}

// ============================================================================
// QUERY PARAMETERS & FILTERS
// ============================================================================

export interface WorkflowQuery {
  userId: string;
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogQuery {
  userId: string;
  startDate?: string;
  endDate?: string;
  resourceType?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

export interface ExecutionHistoryQuery {
  workflowId?: string;
  userId: string;
  status?: 'running' | 'completed' | 'failed';
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// BATCH OPERATION TYPES
// ============================================================================

export interface BatchWorkflowSave {
  workflows: (Workflow & { nodes: WorkflowNode[]; connections: WorkflowConnection[] })[];
  overwrite?: boolean; // replace existing or update
}

export interface BatchApiKeySave {
  keys: ApiKey[];
}

// ============================================================================
// CACHE METADATA
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in ms
  isValid: boolean;
}

// ============================================================================
// REALTIME EVENT TYPES
// ============================================================================

export type RealtimeEvent = 
  | { type: 'INSERT'; table: string; record: any }
  | { type: 'UPDATE'; table: string; record: any }
  | { type: 'DELETE'; table: string; record: any };

export type RealtimeEventHandler = (event: RealtimeEvent) => void;

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class DatabaseError extends Error {
  constructor(
    public code: string,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export interface RetryConfig {
  maxAttempts: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  backoffMultiplier: number;
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialBackoffMs: 100,
  maxBackoffMs: 5000,
  backoffMultiplier: 2,
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

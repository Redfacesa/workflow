-- Creative Automation Workflow Database Schema
-- Copy and paste this entire script into Supabase SQL Editor
-- This creates all necessary tables with proper relationships and RLS policies

-- ============================================================================
-- 1. USER PROFILES (extends Supabase Auth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  organization TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. WORKFLOWS (user's workflow definitions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMP,
  UNIQUE(user_id, name)
);

-- ============================================================================
-- 3. WORKFLOW NODES (individual nodes within a workflow)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL, -- 'chatgpt', 'competitor-scan', 'video-generator', etc.
  node_id TEXT NOT NULL, -- unique within workflow (e.g., 'node-1')
  label TEXT,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  config JSONB DEFAULT '{}', -- stores node-specific settings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workflow_id, node_id)
);

-- ============================================================================
-- 4. WORKFLOW CONNECTIONS (edges between nodes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  source_node_id TEXT NOT NULL, -- references workflow_nodes.node_id
  target_node_id TEXT NOT NULL, -- references workflow_nodes.node_id
  connection_id TEXT NOT NULL, -- unique ID for the connection
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workflow_id, connection_id),
  UNIQUE(workflow_id, source_node_id, target_node_id)
);

-- ============================================================================
-- 5. WORKFLOW EXECUTIONS (tracks each time a workflow is run)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  error_message TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  execution_time_ms INTEGER,
  node_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. EXECUTION NODE RESULTS (stores output from each node in an execution)
-- ============================================================================

CREATE TABLE IF NOT EXISTS execution_node_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  api_call_count INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. API KEYS (encrypted storage of user's API keys)
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'together', 'replicate', etc.
  encrypted_key TEXT NOT NULL, -- encrypted API key (use Supabase Vault)
  is_master_key BOOLEAN DEFAULT false,
  gateway_type TEXT, -- 'together', 'replicate', 'custom', null for individual
  gateway_endpoint TEXT, -- for custom gateways
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_name)
);

-- ============================================================================
-- 8. BRAND SETTINGS (user's brand configuration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  brand_name TEXT,
  primary_color TEXT, -- hex color
  secondary_color TEXT,
  accent_color TEXT,
  logo_url TEXT,
  font_family TEXT DEFAULT 'Inter',
  font_size_base INTEGER DEFAULT 16,
  border_radius INTEGER DEFAULT 8,
  brand_voice TEXT, -- 'professional', 'casual', 'creative', etc.
  tagline TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. ACCOUNT SETTINGS (user account preferences)
-- ============================================================================

CREATE TABLE IF NOT EXISTS account_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light', -- 'light', 'dark', 'auto'
  notifications_enabled BOOLEAN DEFAULT true,
  email_on_completion BOOLEAN DEFAULT true,
  email_on_error BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. INTEGRATIONS (connected third-party services)
-- ============================================================================

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL, -- 'slack', 'google-drive', 'dropbox', etc.
  is_connected BOOLEAN DEFAULT false,
  encrypted_token TEXT, -- OAuth token (if needed)
  metadata JSONB DEFAULT '{}', -- service-specific metadata
  last_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_name)
);

-- ============================================================================
-- 11. WORKFLOW TEMPLATES (pre-built templates users can use)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT, -- 'video', 'research', 'brand', 'social', etc.
  workflow_data JSONB NOT NULL, -- full workflow structure (nodes + connections)
  thumbnail_url TEXT,
  usage_count INTEGER DEFAULT 0,
  rating FLOAT DEFAULT 0,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. SAVED TEMPLATES (user's bookmarked templates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, template_id)
);

-- ============================================================================
-- 13. AUDIT LOG (track user actions for security and debugging)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'workflow_created', 'workflow_executed', 'api_key_added', etc.
  resource_type TEXT, -- 'workflow', 'api_key', 'account', etc.
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 14. WORKFLOW FAVORITES (user's favorite workflows)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, workflow_id)
);

-- ============================================================================
-- INDEXES (improve query performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_connections_workflow_id ON workflow_connections(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_node_results_execution_id ON execution_node_results(execution_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service_name);
CREATE INDEX IF NOT EXISTS idx_brand_settings_user_id ON brand_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_account_settings_user_id ON account_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_templates_user_id ON saved_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_favorites_user_id ON workflow_favorites(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Ensure users only see their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_node_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies: Users can only see their own workflows
CREATE POLICY "Users can view own workflows" ON workflows
  FOR SELECT USING (
    user_id = auth.uid() OR is_public = true
  );

CREATE POLICY "Users can create workflows" ON workflows
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workflows" ON workflows
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own workflows" ON workflows
  FOR DELETE USING (user_id = auth.uid());

-- Policies: Users can only see nodes in their workflows
CREATE POLICY "Users can view own workflow nodes" ON workflow_nodes
  FOR SELECT USING (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own workflow nodes" ON workflow_nodes
  FOR INSERT WITH CHECK (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own workflow nodes" ON workflow_nodes
  FOR UPDATE USING (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own workflow nodes" ON workflow_nodes
  FOR DELETE USING (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

-- Policies: Users can only see connections in their workflows
CREATE POLICY "Users can view own workflow connections" ON workflow_connections
  FOR SELECT USING (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own workflow connections" ON workflow_connections
  FOR INSERT WITH CHECK (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own workflow connections" ON workflow_connections
  FOR DELETE USING (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

-- Policies: Users can only see their own executions
CREATE POLICY "Users can view own executions" ON workflow_executions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create executions" ON workflow_executions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policies: Users can only see results from their executions
CREATE POLICY "Users can view own execution results" ON execution_node_results
  FOR SELECT USING (
    execution_id IN (SELECT id FROM workflow_executions WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create execution results" ON execution_node_results
  FOR INSERT WITH CHECK (
    execution_id IN (SELECT id FROM workflow_executions WHERE user_id = auth.uid())
  );

-- Policies: Users can only see their own API keys
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create API keys" ON api_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (user_id = auth.uid());

-- Policies: Users can only see their own brand settings
CREATE POLICY "Users can view own brand settings" ON brand_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own brand settings" ON brand_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Policies: Users can only see their own account settings
CREATE POLICY "Users can view own account settings" ON account_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own account settings" ON account_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Policies: Users can only see their own integrations
CREATE POLICY "Users can view own integrations" ON integrations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own integrations" ON integrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own integrations" ON integrations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own integrations" ON integrations
  FOR DELETE USING (user_id = auth.uid());

-- Policies: Users can see templates and their saved list
CREATE POLICY "Anyone can view workflow templates" ON workflow_templates
  FOR SELECT USING (true);

CREATE POLICY "Users can save templates" ON saved_templates
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete saved templates" ON saved_templates
  FOR DELETE USING (user_id = auth.uid());

-- Policies: Users can see their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- Policies: Users can manage their favorites
CREATE POLICY "Users can manage own favorites" ON workflow_favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites" ON workflow_favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites" ON workflow_favorites
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- NOTES ON BEST PRACTICES:
-- ============================================================================
-- 1. API Keys should use Supabase's vault.decrypted_secrets for encryption
-- 2. JSONB columns (config, input_data, etc.) allow flexible data storage
-- 3. RLS policies ensure data isolation per user
-- 4. Indexes improve performance for common queries
-- 5. Soft deletes (archived_at) preserve workflow history
-- 6. Audit logs track all important actions for compliance
-- 7. UNIQUE constraints prevent duplicate entries
-- 8. Timestamps track creation and updates automatically

# Database Integration Guide - Option 3 (Production Ready)

This guide explains how to use the complete database layer with caching, real-time subscriptions, and error handling.

## Architecture Overview

```
Your React Components
         ↓
React Hooks (useWorkflows, useApiKeys, etc.)
         ↓
Database Layer (db query functions)
         ↓
Cache Manager (prevents N+1 queries)
         ↓
Real-time Manager (Supabase subscriptions)
         ↓
Supabase (Your Database)
```

---

## Components Created

### 1. **Type Definitions** (`src/lib/types/database.ts`)
- All TypeScript interfaces for database tables
- Error classes with retry logic
- Query parameter types

### 2. **Cache Manager** (`src/lib/db/cache.ts`)
- In-memory caching with TTL
- LRU eviction (~1000 entries)
- Cache invalidation patterns

### 3. **Database Queries** (`src/lib/db/queries.ts`)
- Full CRUD operations for all tables
- Automatic retry logic with exponential backoff
- Cache integration

### 4. **Real-time Manager** (`src/lib/db/realtime.ts`)
- Subscribe to table changes
- Filter by user_id automatically
- Unsubscribe management

### 5. **React Hooks**
- `useWorkflows()` - Manage all workflows
- `useWorkflow()` - Single workflow with relations
- `useApiKeys()` - Manage API keys
- `useAuditLogs()` - Paginated audit logs with real-time
- `useExecutions()` - Track workflow executions
- `useBrandSettings()` - Brand configuration
- `useAccountSettings()` - User preferences

---

## Quick Start Examples

### Example 1: Fetch All Workflows

```typescript
import { useWorkflows } from '@/lib/db';

export function WorkflowList() {
  const { workflows, loading, error, createWorkflow } = useWorkflows(userId, {
    realtime: true, // enables live updates
    includeArchived: false
  });

  if (loading) return <div>Loading workflows...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {workflows.map(wf => (
        <div key={wf.id}>{wf.name}</div>
      ))}
      <button onClick={() => createWorkflow({
        name: 'New Workflow',
        description: 'Demo',
        is_public: false,
        user_id: userId
      })}>
        Create Workflow
      </button>
    </div>
  );
}
```

### Example 2: Single Workflow with Nodes & Connections

```typescript
import { useWorkflow } from '@/lib/db';

export function WorkflowEditor({ workflowId }) {
  const {
    workflow,
    loading,
    error,
    updateWorkflow,
    isSaving
  } = useWorkflow(workflowId);

  if (!workflow) return null;

  // Access nodes: workflow.nodes
  // Access connections: workflow.connections

  const handleUpdate = async () => {
    await updateWorkflow({
      name: 'Updated Name',
      description: 'New description'
    });
  };

  return (
    <div>
      <h1>{workflow.name}</h1>
      <p>Nodes: {workflow.nodes.length}</p>
      <p>Connections: {workflow.connections.length}</p>
      <button onClick={handleUpdate} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Update'}
      </button>
    </div>
  );
}
```

### Example 3: Manage API Keys

```typescript
import { useApiKeys } from '@/lib/db';

export function ApiKeyManager() {
  const {
    keys,
    loading,
    createApiKey,
    deleteApiKey,
    getMasterKey,
    getKeyByService
  } = useApiKeys(userId, { realtime: true });

  const masterKey = getMasterKey();
  const openaiKey = getKeyByService('openai');

  const handleAddKey = async () => {
    await createApiKey({
      user_id: userId,
      service_name: 'openai',
      encrypted_key: 'your-key-here',
      is_master_key: false,
      is_active: true
    });
  };

  return (
    <div>
      {masterKey && <p>Master Key: {masterKey.gateway_type}</p>}
      {openaiKey && <p>OpenAI Key: Active</p>}
      <button onClick={handleAddKey}>Add API Key</button>
    </div>
  );
}
```

### Example 4: Real-time Audit Logs

```typescript
import { useAuditLogs, useRecentAuditActivity } from '@/lib/db';

export function AuditPanel() {
  // Get paginated audit logs
  const {
    logs,
    total,
    page,
    nextPage,
    prevPage,
    getLogsByAction
  } = useAuditLogs(userId, {
    pageSize: 50,
    realtime: true
  });

  // Get recent activity in real-time
  const recentLogs = useRecentAuditActivity(userId, 20);

  const workflowCreations = getLogsByAction('workflow_created');

  return (
    <div>
      <h3>Recent Activity</h3>
      {recentLogs.map(log => (
        <div key={log.id}>
          <p>{log.action} - {log.resource_type}</p>
          <small>{new Date(log.created_at).toLocaleString()}</small>
        </div>
      ))}

      <h3>All Audit Logs</h3>
      <p>Total: {total} | Page: {page}</p>
      {logs.map(log => (
        <div key={log.id}>{log.action}</div>
      ))}
      <button onClick={prevPage} disabled={page === 0}>Prev</button>
      <button onClick={nextPage}>Next</button>
    </div>
  );
}
```

### Example 5: Track Workflow Execution

```typescript
import { useExecution, useExecutionProgress } from '@/lib/db';

export function ExecutionMonitor({ executionId }) {
  // Real-time progress tracking
  const {
    totalNodes,
    completedCount,
    failedCount,
    progressPercent,
    isCompleted,
    isFailed
  } = useExecutionProgress(executionId);

  // Full execution details
  const {
    execution,
    nodeResults,
    getNodeResult
  } = useExecution(executionId, { realtime: true });

  return (
    <div>
      <h3>Workflow Execution Progress</h3>
      <div className="progress">
        <div style={{ width: `${progressPercent}%` }} />
        <p>{progressPercent}% Complete</p>
      </div>

      <div className="stats">
        <p>Total Nodes: {totalNodes}</p>
        <p>Completed: {completedCount} ✓</p>
        <p>Failed: {failedCount} ✗</p>
        <p>Running: Computing...</p>
      </div>

      {execution && (
        <div>
          <p>Status: {execution.status}</p>
          <p>Time: {execution.execution_time_ms}ms</p>
        </div>
      )}

      {isCompleted && <p>✓ Execution Complete!</p>}
      {isFailed && <p>✗ Execution Failed</p>}
    </div>
  );
}
```

### Example 6: User Settings

```typescript
import { useBrandSettings, useAccountSettings } from '@/lib/db';

export function SettingsPanel() {
  const brandSettings = useBrandSettings(userId);
  const accountSettings = useAccountSettings(userId);

  const handleBrandUpdate = async () => {
    await brandSettings.updateBrandSettings({
      brand_name: 'My Brand',
      primary_color: '#0066cc',
      font_family: 'Roboto'
    });
  };

  const handleThemeChange = async () => {
    await accountSettings.updateAccountSettings({
      theme: 'dark',
      notifications_enabled: false
    });
  };

  return (
    <div>
      <h2>Brand Settings</h2>
      <input
        value={brandSettings.settings?.brand_name || ''}
        onChange={e => handleBrandUpdate()}
        disabled={brandSettings.isSaving}
      />

      <h2>Account Settings</h2>
      <select onChange={e => handleThemeChange()}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto</option>
      </select>
    </div>
  );
}
```

---

## Advanced Usage

### Combining Multiple Hooks

```typescript
export function Dashboard({ userId }) {
  // Load everything in parallel
  const workflows = useWorkflows(userId, { realtime: true });
  const apiKeys = useApiKeys(userId, { realtime: true });
  const auditLogs = useAuditLogs(userId, { realtime: true });

  const isReady =
    !workflows.loading &&
    !apiKeys.loading &&
    !auditLogs.loading;

  if (!isReady) return <Spinner />;

  return (
    <div>
      <WorkflowList workflows={workflows.workflows} />
      <ApiKeySummary keys={apiKeys.keys} />
      <RecentActivity logs={auditLogs.logs} />
    </div>
  );
}
```

### Error Handling

```typescript
export function SafeComponent() {
  const { workflows, error, refreshWorkflows } = useWorkflows(userId);

  useEffect(() => {
    if (error) {
      console.error(`${error.code}: ${error.message}`);
      // Show user-friendly error message
      // Toast notification, error boundary, etc.
    }
  }, [error]);

  return (
    <div>
      {error && (
        <div className="error">
          <p>Failed to load workflows</p>
          <button onClick={refreshWorkflows}>Retry</button>
        </div>
      )}
      {/* render workflows */}
    </div>
  );
}
```

### Cache Management

```typescript
import { getCacheManager, cacheKeys } from '@/lib/db';

export function CacheDebugger() {
  const cache = getCacheManager();

  const handleClearCache = () => {
    cache.clear();
  };

  const handleInvalidateWorkflows = (userId) => {
    cache.invalidate(cacheKeys.workflows(userId));
  };

  const stats = cache.getStats();

  return (
    <div>
      <h3>Cache Stats</h3>
      <p>Size: {stats.size} / {stats.maxSize}</p>
      <button onClick={handleClearCache}>Clear All</button>
      <button onClick={() => handleInvalidateWorkflows(userId)}>
        Invalidate Workflows
      </button>
      <pre>{JSON.stringify(stats.entries, null, 2)}</pre>
    </div>
  );
}
```

### Real-time Subscriptions

```typescript
import { getRealtimeManager } from '@/lib/db';

export function CustomRealtimeSync({ userId }) {
  const [customData, setCustomData] = useState([]);

  useEffect(() => {
    const realtimeManager = getRealtimeManager();

    const subscriptionId = realtimeManager.subscribe(
      'workflows',
      userId,
      (event) => {
        console.log('Realtime event:', event);

        if (event.type === 'INSERT') {
          setCustomData(prev => [...prev, event.record]);
        } else if (event.type === 'UPDATE') {
          setCustomData(prev =>
            prev.map(item =>
              item.id === event.record.id ? event.record : item
            )
          );
        }
      }
    );

    // Check active subscriptions (for debugging)
    const active = realtimeManager.getActiveSubscriptions();
    console.log('Active subscriptions:', active);

    return () => {
      realtimeManager.unsubscribe(subscriptionId).catch(console.error);
    };
  }, [userId]);

  return <div>{customData.length} items</div>;
}
```

---

## Integration with Existing Code

### Update `apiKeyManager.ts` to use Supabase

```typescript
// OLD: localStorage only
// NEW: Supabase + localStorage cache

import { useApiKeys } from '@/lib/db';

export function useApiKeysWithCache(userId: string) {
  const { keys, createApiKey, deleteApiKey } = useApiKeys(userId, {
    realtime: true
  });

  // Falls back to old localStorage for offline support
  useEffect(() => {
    if (keys.length > 0) {
      keys.forEach(key => {
        localStorage.setItem(`api_key_${key.service_name}`, '***cached***');
      });
    }
  }, [keys]);

  return { keys, createApiKey, deleteApiKey };
}
```

### Update `WorkflowCanvas.tsx` to use database

```typescript
import { useWorkflow } from '@/lib/db';

export function WorkflowCanvas({ workflowId }) {
  const {
    workflow,
    loading,
    updateWorkflow,
    refreshWorkflow
  } = useWorkflow(workflowId);

  const handleSaveWorkflow = async () => {
    await updateWorkflow({
      name: nodes.length > 0 ? nodes[0].label : 'Untitled',
      description: 'Updated from canvas'
    });
  };

  const handleExecuteWorkflow = async () => {
    // Create execution record in database
    const execution = await db.createExecution({
      workflow_id: workflowId,
      user_id: currentUser.id,
      status: 'running',
      started_at: new Date().toISOString(),
      node_count: nodes.length
    });

    // Run workflow
    await executeWorkflow(nodes, connections, onProgress, apiKeys);

    // Update execution status
    await db.updateExecution(execution.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      execution_time_ms: Date.now() - startTime
    });
  };

  return (
    <div>
      {/* Canvas UI */}
      <button onClick={handleSaveWorkflow}>Save Workflow</button>
      <button onClick={handleExecuteWorkflow}>Run Workflow</button>
    </div>
  );
}
```

---

## Performance Tips

### 1. Use Real-time Subscriptions Wisely
```typescript
// ✓ GOOD: Only enable for visible data
const workflows = useWorkflows(userId, { realtime: true });

// ✗ AVOID: Don't subscribe to hidden/background components
const allWorkflows = useWorkflows(userId, { realtime: true });
const archivedWorkflows = useWorkflows(userId, { realtime: true });
```

### 2. Cache Invalidation Patterns
```typescript
const cache = getCacheManager();

// Invalidate specific list
cache.invalidate(cacheKeys.workflows(userId));

// Invalidate by pattern
cache.invalidatePattern(`workflows:${userId}`);

// Clear everything
cache.clear();
```

### 3. Batch Operations
```typescript
// ✓ GOOD: Parallel requests
const [workflows, keys, logs] = await Promise.all([
  db.getWorkflows(userId),
  db.getApiKeys(userId),
  db.getAuditLogs(userId, 50, 0)
]);

// ✗ AVOID: Sequential requests
const workflows = await db.getWorkflows(userId);
const keys = await db.getApiKeys(userId);
const logs = await db.getAuditLogs(userId, 50, 0);
```

### 4. Pagination for Large Datasets
```typescript
// ✓ GOOD: Load 50 at a time
const { logs, nextPage } = useAuditLogs(userId, { pageSize: 50 });

// ✗ AVOID: Load 10,000 at once
const { logs } = useAuditLogs(userId, { pageSize: 10000 });
```

---

## Debugging

### Enable Debug Logging

```typescript
// In a development component
export function DebugPanel() {
  useEffect(() => {
    const cache = getCacheManager();
    const realtime = getRealtimeManager();

    // Log cache changes
    setInterval(() => {
      console.log('Cache stats:', cache.getStats());
      console.log('Subscriptions:', realtime.getActiveSubscriptions());
    }, 5000);
  }, []);

  return null;
}
```

### Monitor Errors

```typescript
export function ErrorMonitor({ userId }) {
  const w = useWorkflows(userId);
  const k = useApiKeys(userId);
  const a = useAuditLogs(userId);

  useEffect(() => {
    if (w.error || k.error || a.error) {
      console.error({
        workflows: w.error,
        apiKeys: k.error,
        auditLogs: a.error
      });
    }
  }, [w.error, k.error, a.error]);

  return null;
}
```

---

## Next Steps

1. ✅ **Replace localStorage** - Update `apiKeyManager.ts` to use `useApiKeys()` hook
2. ✅ **Save workflows to database** - Update `WorkflowCanvas.tsx` to use `useWorkflow()` hook
3. ✅ **Track executions** - Save execution history using `db.createExecution()`
4. ✅ **Enable real-time** - Add real-time subscriptions to components
5. ✅ **Add audit logging** - Supabase triggers already handle this automatically

---

## Support

For issues or questions:
- Check the type definitions in `src/lib/types/database.ts`
- Review error handling in `src/lib/db/queries.ts`
- Inspect cache manager in `src/lib/db/cache.ts`
- Debug real-time in browser DevTools

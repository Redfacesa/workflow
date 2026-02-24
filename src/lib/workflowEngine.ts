import { WorkflowNode, Connection } from './nodeData';

/**
 * Result from executing a single node
 */
export interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'error' | 'pending';
  outputs: Record<string, any>;
  error?: string;
  startTime: number;
  endTime?: number;
}

/**
 * Context passed to node executors with all needed information
 */
export interface NodeExecutionContext {
  node: WorkflowNode;
  inputs: Record<string, any>;
  nodeTypes: Map<string, any>;
  previousResults: Map<string, NodeExecutionResult>;
  apiKeys?: Record<string, string>;
}

/**
 * Handler function for executing a specific node type
 */
export type NodeExecutor = (context: NodeExecutionContext) => Promise<Record<string, any>>;

/**
 * Registry for all node type executors
 */
class ExecutorRegistry {
  private executors: Map<string, NodeExecutor> = new Map();

  register(nodeTypeId: string, executor: NodeExecutor) {
    this.executors.set(nodeTypeId, executor);
  }

  get(nodeTypeId: string): NodeExecutor | undefined {
    return this.executors.get(nodeTypeId);
  }

  has(nodeTypeId: string): boolean {
    return this.executors.has(nodeTypeId);
  }
}

export const executorRegistry = new ExecutorRegistry();

/**
 * Resolves execution order using topological sort
 * Returns array of node IDs in execution order
 */
export function resolveExecutionOrder(
  nodes: WorkflowNode[],
  connections: Connection[]
): string[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph
  connections.forEach(conn => {
    adjacencyList.get(conn.fromNodeId)?.push(conn.toNodeId);
    inDegree.set(conn.toNodeId, (inDegree.get(conn.toNodeId) ?? 0) + 1);
  });

  // Kahn's algorithm (topological sort)
  const queue: string[] = [];
  const result: string[] = [];

  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);

    adjacencyList.get(nodeId)?.forEach(neighbor => {
      inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Check for cycles
  if (result.length !== nodes.length) {
    throw new Error('Workflow contains circular dependency');
  }

  return result;
}

/**
 * Collects input data for a node from previous execution results
 */
function collectNodeInputs(
  node: WorkflowNode,
  connections: Connection[],
  previousResults: Map<string, NodeExecutionResult>
): Record<string, any> {
  const inputs: Record<string, any> = {};

  // Find all connections feeding into this node
  const incomingConnections = connections.filter(c => c.toNodeId === node.id);

  incomingConnections.forEach(conn => {
    const sourceResult = previousResults.get(conn.fromNodeId);
    if (sourceResult && sourceResult.status === 'success') {
      const sourceOutputName = sourceResult.outputs[conn.fromOutput];
      inputs[`input_${conn.toInput}`] = sourceOutputName;
    }
  });

  return inputs;
}

/**
 * Main workflow execution engine
 */
export async function executeWorkflow(
  nodes: WorkflowNode[],
  connections: Connection[],
  onProgress?: (result: NodeExecutionResult) => void,
  apiKeys?: Record<string, string>
): Promise<Map<string, NodeExecutionResult>> {
  const results = new Map<string, NodeExecutionResult>();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Resolve execution order
  let executionOrder: string[];
  try {
    executionOrder = resolveExecutionOrder(nodes, connections);
  } catch (err) {
    throw new Error(`Failed to resolve execution order: ${err}`);
  }

  // Execute nodes in order
  for (const nodeId of executionOrder) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    const result: NodeExecutionResult = {
      nodeId,
      status: 'pending',
      outputs: {},
      startTime: Date.now()
    };

    try {
      // Collect inputs from previous nodes
      const inputs = collectNodeInputs(node, connections, results);

      // Get executor for this node type
      const executor = executorRegistry.get(node.nodeTypeId);
      if (!executor) {
        throw new Error(`No executor registered for node type: ${node.nodeTypeId}`);
      }

      // Execute the node with API keys if provided
      const context: NodeExecutionContext = {
        node,
        inputs,
        nodeTypes: nodeMap,
        previousResults: results,
        apiKeys
      };

      const outputs = await executor(context);
      result.status = 'success';
      result.outputs = outputs;
    } catch (err) {
      result.status = 'error';
      result.error = err instanceof Error ? err.message : String(err);
    }

    result.endTime = Date.now();
    results.set(nodeId, result);

    // Report progress
    if (onProgress) {
      onProgress(result);
    }
  }

  return results;
}

/**
 * Placeholder executors for each node type
 * These will be replaced with actual implementations in registerAllExecutors()
 */
export function registerDefaultExecutors() {
  const nodeTypes = [
    // Research nodes
    'competitor-scan',
    'hook-extractor',
    'trend-scanner',
    'audience-analyzer',
    // Create nodes
    'image-generator',
    'video-generator',
    'script-writer',
    'caption-writer',
    'voice-generator',
    'music-generator',
    'meme-generator',
    // Brand nodes
    'brand-formatter',
    'platform-resizer',
    'subtitle-styler',
    // Export nodes
    'google-drive-export',
    'share-link',
    // AI nodes
    'chatgpt-node',
    'gemini-node',
    'claude-node',
    'kling-node',
    'sora-node',
    'grok-node'
  ];

  nodeTypes.forEach(nodeType => {
    if (!executorRegistry.has(nodeType)) {
      executorRegistry.register(nodeType, async (context) => {
        // Placeholder: just return the node settings as output
        return {
          0: `Executed ${context.node.nodeTypeId}`,
          timestamp: new Date().toISOString(),
          settings: context.node.settings
        };
      });
    }
  });
}

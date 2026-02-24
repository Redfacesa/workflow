# Workflow Execution Engine Documentation

## Overview

The workflow execution engine is a real-time, asynchronous system for executing complex automation workflows. It supports 22 different node types across 5 categories: Research, Create, Brand, Export, and AI Models.

## Architecture

### Core Components

1. **`workflowEngine.ts`** - Main execution orchestration
   - `executeWorkflow()` - Runs the entire workflow with dependency resolution
   - `resolveExecutionOrder()` - Topological sort of nodes based on connections
   - `ExecutorRegistry` - Registry for all node type handlers

2. **`executors/`** - Modular executor implementations
   - `index.ts` - Central registration and exports
   - `aiNodes.ts` - ChatGPT, Claude, Gemini, Kling, Sora, Grok
   - `researchNodes.ts` - Competitor, Hooks, Trends, Audience analysis
   - `createNodes.ts` - Image, Video, Script, Caption, Voice, Music, Meme
   - `brandExportNodes.ts` - Brand formatting, Resizing, Subtitles, Drive export, Share links

3. **`apiKeyManager.ts`** - API credential management

## How Workflows Execute

### 1. Ordering
The engine determines execution order using **topological sort** (Kahn's algorithm):
- Nodes with no incoming connections execute first
- Downstream nodes wait for their dependencies to complete
- Circular dependencies are detected and rejected

### 2. Data Piping
Nodes pass data through **input/output connections**:
- Each node has **inputs** and **outputs**
- Connections specify: `fromNodeId`, `toNodeId`, `fromOutput`, `toInput`
- Data flows automatically from upstream outputs to downstream inputs

### 3. Progress Tracking
The `onProgress` callback reports each node's completion:
```typescript
result: {
  nodeId: string,
  status: 'success' | 'error' | 'pending',
  outputs: Record<string, any>,      // Generated outputs
  error?: string,                    // Error message if failed
  startTime: number,
  endTime?: number
}
```

## How to Register a Executor

### Basic Pattern

```typescript
import { NodeExecutor, NodeExecutionContext } from '../workflowEngine';

export const myNodeExecutor: NodeExecutor = async (context: NodeExecutionContext) => {
  const { node, inputs, apiKeys, previousResults } = context;

  // Access node settings
  const setting1 = node.settings.myKey || 'default';

  // Access inputs from connected upstream nodes
  const upstreamData = inputs.input_0;

  // Optional: use API key if available
  const apiKey = apiKeys?.MY_API_KEY;

  // Perform work (with mock fallback)
  try {
    const result = await callSomeApi(upstreamData, setting1, apiKey);
    return { 0: result };  // output 0
  } catch (err) {
    return { 0: '[Mock] Fallback data when API unavailable' };
  }
};
```

### Register in `executors/index.ts`

```typescript
import { myNodeExecutor } from './myNodes';

export function registerAllExecutors() {
  // ... other registrations ...
  executorRegistry.register('my-node-type', myNodeExecutor);
}
```

## API Keys Configuration

### Setting API Keys

```typescript
import { apiKeyManager } from './apiKeyManager';

// Initialize and set
await apiKeyManager.initialize();
apiKeyManager.setKey('OPENAI_API_KEY', 'sk-...');
```

### In Workflow Execution

```typescript
const apiKeys = apiKeyManager.getAllKeys();
await executeWorkflow(nodes, connections, onProgress, apiKeys);
```

### Available API Keys

- `OPENAI_API_KEY` - For ChatGPT/Sora
- `ANTHROPIC_API_KEY` - For Claude
- `GOOGLE_AI_API_KEY` - For Gemini
- `GOOGLE_OAUTH_TOKEN` - For Google Drive export
- `KLING_API_KEY` - For Kling video generation
- `XAI_API_KEY` - For Grok
- `REPLICATE_API_KEY` - For image generation
- `STABILITY_API_KEY` - For stable diffusion
- `ELEVENLABS_API_KEY` - For voice generation
- `GOOGLE_TTS_API_KEY` - For Google text-to-speech

## Node Types

### AI Models (6)
- **chatgpt-node** - OpenAI GPT-5 models
- **claude-node** - Anthropic Claude variants
- **gemini-node** - Google Gemini multimodal
- **kling-node** - Kling AI video generation
- **sora-node** - OpenAI Sora video
- **grok-node** - xAI Grok witty generation

### Research (4)
- **competitor-scan** - Analyze competitor presence
- **hook-extractor** - Extract winning hooks
- **trend-scanner** - Find trending formats
- **audience-analyzer** - Identify target segments

### Create (7)
- **image-generator** - Generate AI images
- **video-generator** - Create videos from scripts
- **script-writer** - Write ad scripts
- **caption-writer** - Generate social captions
- **voice-generator** - Generate voiceovers
- **music-generator** - Create background music
- **meme-generator** - Generate viral memes

### Brand & Export (5)
- **brand-formatter** - Apply brand styles
- **platform-resizer** - Resize for multiple platforms
- **subtitle-styler** - Add styled subtitles
- **google-drive-export** - Save to Google Drive
- **share-link** - Generate shareable links

## Example Workflow

```typescript
// 1. Research phase
competitor-scan → hook-extractor
       ↓              ↓
     [hooks]    [trends]
                      ↓
// 2. Creation phase
    chatgpt-node (write script)
           ↓
   video-generator
           ↓
   voice-generator
           ↓
   subtitle-styler
           ↓
// 3. Export phase
brand-formatter
           ↓
platform-resizer
           ↓
google-drive-export
```

## Error Handling

- **Missing executor**: "No executor registered for node type: X"
- **Circular dependencies**: "Workflow contains circular dependency"
- **API failure**: Executors fallback to mock data if API unavailable
- **Missing inputs**: Nodes use defaults or empty values

## Performance

- **Sequential execution** within dependency chains
- **Parallel execution** between independent branches
- **Progress tracking** for real-time UI updates
- **Typical execution**: 1-5 seconds per workflow (depends on API latency)

## Extending the System

To add a new node type:

1. Create executor in `executors/newNodes.ts`
2. Register in `executors/index.ts`
3. Add node type definition to `nodeData.ts`
4. Create template workflows using the new node

That's it! The engine handles everything else.

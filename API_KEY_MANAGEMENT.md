# API Key Management System

## Overview

The workflow system now supports two ways to configure API access for AI models and services:

1. **Individual API Keys** - Configure each service separately (OpenAI, Anthropic, Google, etc.)
2. **Master API Gateway** - Use a single API key that works with all AI models through a unified gateway

## UI Access

Open **Settings → API Keys** to configure API credentials.

---

## Two Configuration Approaches

### Approach 1: Individual API Keys

Best for: Users with existing accounts across multiple AI services.

**Supported Services:**
- OpenAI (ChatGPT/Sora)
- Anthropic (Claude)
- Google (Gemini)
- Kling AI (Kling)
- xAI (Grok)
- Replicate (Image/video generation)
- Google OAuth (Drive export)

**How to Use:**
1. Go to Settings → API Keys
2. Select "Individual Keys" gateway (default)
3. Click "Get API key" link for each service
4. Paste your API key in the input field
5. Click "Save"
6. Each node will use its configured service's API key

**Example:**
- ChatGPT node uses `OPENAI_API_KEY`
- Claude node uses `ANTHROPIC_API_KEY`
- etc.

---

### Approach 2: Master API Gateway (Recommended)

Best for: Cost-effective universal AI access with 100+ models.

**Supported Gateways:**

#### Together AI
- **URL:** https://www.together.ai
- **Models:** 100+ open-source models (Llama, Mistral, etc.)
- **Cost:** Very affordable
- **Best for:** Budget-conscious users, LLM-only workflows

#### Replicate
- **URL:** https://replicate.com
- **Models:** 50+ image/video/text generation models
- **Cost:** Pay-as-you-go
- **Best for:** Image and video generation

#### Custom Gateway
- **URL:** Your own API server
- **Models:** Whatever your gateway supports
- **Cost:** Depends on your implementation
- **Best for:** Enterprise, self-hosted solutions

**How to Use:**
1. Go to Settings → API Keys
2. Click "Universal Gateway Setup"
3. Select a gateway (e.g., Together AI)
4. Get a master API key from that gateway
5. Paste it in the "Master API Key" field
6. Click "Save"
7. All AI nodes automatically use your gateway

**Master Key Fallback Logic:**
```
For any AI node (ChatGPT, Claude, etc.):
1. Check if master gateway is configured
2. If YES → Use master gateway (all AI routes through one key)
3. If NO → Check for individual API key for that service
4. If NO → Return mock demo data
```

---

## Configuration Examples

### Example 1: Using Together AI for Everything

```
1. Create free account at https://www.together.ai
2. Copy your API key
3. Settings → API Keys → Universal Gateway Setup
4. Select "Together AI"
5. Paste key → Save
6. Now ChatGPT, Claude, Gemini, Grok nodes all work!
```

**Model Routing:**
- ChatGPT node → `meta-llama/Llama-3-70b-chat-hf`
- Claude node → `NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO`
- Gemini node → `meta-llama/Llama-3-70b-chat-hf`
- Grok node → `meta-llama/Llama-3-70b-chat-hf`

---

### Example 2: Mixed Setup

```
Master Gateway: Together AI (for text generation)
Individual Keys: Google (for Gemini images)
```

**Logic:**
- ChatGPT node → Uses Together AI gateway
- Claude node → Uses Together AI gateway
- Gemini node → Tries master gateway first, then falls back to individual GOOGLE_AI_API_KEY
- Kling node → Uses individual KLING_API_KEY if set

---

### Example 3: Full Individual Keys

```
No gateway configured.
Each service has its own API key:
- OpenAI API key → for ChatGPT/Sora
- Anthropic API key → for Claude
- Google API key → for Gemini
- Kling API key → for Kling
- xAI API key → for Grok
```

---

## API Key Security

⚠️ **Important:** API keys are currently stored in **localStorage** (browser storage).

### Development/Testing:
- localStorage storage is fine for local development
- Keys persist across browser sessions
- Keys are NOT sent to our servers

### Production/Security Best Practices:
1. **Backend Storage:** Move keys to encrypted database (Supabase Vault)
2. **API Relay:** Create backend endpoint that calls AI APIs on behalf of user
3. **Environment Variables:** Store keys as environment variables on backend
4. **Redis Cache:** Cache API responses to reduce token usage
5. **Audit Logging:** Log all API calls for security

---

## How the Master Gateway Works

### Architecture

```
┌─────────────────┐
│ AI Node (e.g.   │
│  ChatGPT)       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Executor checks:        │
│ 1. Master gateway?      │
│ 2. Individual key?      │
│ 3. Demo fallback?       │
└────────┬────────────────┘
         │
    ┌────┴────────────────────┐
    │                         │
    ▼ (if gateway)            ▼ (if individual key)
┌──────────────┐        ┌─────────────────┐
│ API Gateway  │        │ Direct API Call │
│ (Together,   │        │ (OpenAI,       │
│  Replicate)  │        │  Anthropic)    │
└──────────────┘        └─────────────────┘
    │                         │
    ▼                         ▼
  Returns text/image/video   Returns text/image/video
```

### Code Example

```typescript
// In chatgptExecutor
if (apiGateway.isConfigured()) {
  // Uses master key + gateway
  return await apiGateway.callLLM({
    model: 'gpt-5',
    prompt: userPrompt,
    temperature: 0.7
  });
} else if (apiKeys?.OPENAI_API_KEY) {
  // Uses individual OpenAI key
  return await fetch('https://api.openai.com/v1/chat/completions', {...})
} else {
  // Falls back to demo
  return `[Mock] ${prompt}`
}
```

---

## Supported AI Models via Master Gateway

### Through Together AI Gateway (100+ models)

**Popular Models:**
- Llama 3 (70B, 8B)
- Mistral 7B
- Mixtral 8x7B
- Yi 34B
- NeuralChat
- Starling
- And 90+ more...

### Through Replicate Gateway (50+ models)

**Popular Models:**
- Stable Diffusion 3
- FLUX.1
- RunwayML Gen3
- Llama 2/3
- Mistral
- And 40+ more...

---

## Workflow Execution with Keys

When you click "Run Workflow":

```
1. Fetch all configured API keys from storage
2. Pass them to executeWorkflow()
3. Each node's executor receives keys + gateway config
4. Executor decides which API to call
5. Execute and return results
6. UI updates with progress
```

**Code in WorkflowCanvas.tsx:**
```typescript
const simulateRun = async () => {
  // Step 1: Get keys
  await apiKeyManager.initialize();
  const apiKeys = apiKeyManager.getAllKeys();
  
  // Step 2: Execute with keys
  await executeWorkflow(nodes, connections, onProgress, apiKeys);
  
  // Step 3: Display results
  // ...
}
```

---

## Troubleshooting

### "No executor registered for node type"
→ Node executors not initialized. Check that `registerAllExecutors()` is called in WorkflowCanvas.

### "Invalid API Key"
→ Check if key is correct, has correct permissions, hasn't expired.

### "Real API unavailable. Using demo response."
→ No API key configured OR API call failed. Check API status and your internet connection.

### "Circular dependency in workflow"
→ Two nodes are connected in a loop. Fix the connections.

---

## Future Improvements

1. **Encryption:** Encrypt keys with user's password before localStorage
2. **Backend Vault:** Move keys to Supabase Secrets Vault
3. **Key Rotation:** Auto-rotate keys periodically
4. **Rate Limiting:** Monitor API usage and rate limit per user
5. **Cost Tracking:** Show estimated costs before workflow runs
6. **Webhook Support:** Accept API responses via webhooks for long-running tasks
7. **API Key Expiration:** Set expiration dates for keys
8. **Multi-Key Support:** Use different keys for different workflows

---

## Support

For API key issues:
- **OpenAI:** https://platform.openai.com/docs
- **Anthropic:** https://claude.ai/docs
- **Google Gemini:** https://ai.google.dev/
- **Kling:** https://klingai.com/docs
- **Together AI:** https://www.together.ai/docs
- **Replicate:** https://replicate.com/docs

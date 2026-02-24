# Quick Start: Running Your First Workflow

## 5-Minute Setup

### Step 1: Configure API Access (Choose One)

#### Option A: Quick Start with Together AI (30 seconds)
```
1. Go to https://www.together.ai
2. Sign up for free account
3. Copy your API key
4. In app: Settings → API Keys
5. Toggle to "Universal Gateway Setup"
6. Select "Together AI"
7. Paste key → Click Save
✓ Done! All AI nodes now work
```

#### Option B: Use Individual Keys (5 minutes)
```
1. Get individual API keys:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com
   - Google: https://ai.google.dev
   - Kling: https://klingai.com
   
2. In app: Settings → API Keys
3. Click "Individual Keys" (or leave as default)
4. Paste each key in its service box
5. Click Save for each
✓ Done! Each service has its own key
```

#### Option C: No Setup (Start Now)
```
Skip setup. All nodes return realistic demo data.
Perfect for testing workflows before adding real keys.
```

---

## Step 2: Create a Simple Workflow

### Example: Generate Video from Text

1. **Click Canvas** → Add nodes:
   - **Research Node**: "Trend Scanner"
     - Input: Define topic
     - Output: Trending ideas
   
   - **AI Node**: "ChatGPT"
     - Input: Write script for video
     - Output: Video script
   
   - **Creation Node**: "Video Generator"
     - Input: Receive script
     - Output: Video URL

2. **Connect Nodes**:
   - Trend Scanner → ChatGPT (pass trends)
   - ChatGPT → Video Generator (pass script)

3. **Click "Run Workflow"**
   - You'll see progress for each node
   - View results in real-time

---

## Step 3: Try These Pre-Built Workflows

### Workflow 1: Content Idea to Final Export
```
Trend Scanner 
    → ChatGPT (write script)
    → Video Generator
    → Brand Formatter (apply brand colors)
    → Google Drive Export
```
**Time:** ~30 seconds | **Output:** Video file on Drive

### Workflow 2: Competitor Analysis
```
Competitor Scan
    → Hook Extractor
    → ChatGPT (create hooks)
    → Caption Writer
    → Brand Formatter
```
**Time:** ~15 seconds | **Output:** Formatted captions

### Workflow 3: Full Content Pipeline
```
Audience Analyzer
    → ChatGPT (write multiple scripts)
    → Video Generator × 3 (create variations)
    → Music Generator (generate music for each)
    → Caption Writer (captions for all)
    → Platform Resizer (TikTok, Instagram, YouTube)
    → Google Drive Export (save all)
```
**Time:** ~2 minutes | **Output:** 3 platform-optimized videos

---

## Master Gateway vs Individual Keys: Decide Now

### Choose Master Gateway If:
✓ You want simplicity (1 API key for everything)
✓ You want cost-effectiveness (Together AI is cheap)
✓ You don't have existing AI service accounts
✓ You like auto model-routing
**→ Recommended for 90% of users**

### Choose Individual Keys If:
✓ You already have OpenAI/Anthropic/Google accounts
✓ You need specific model versions
✓ You want per-service control
✓ You have enterprise accounts with special pricing
**→ Recommended for power users**

### Choose No Setup If:
✓ You just want to test workflows
✓ You're trying before committing
✓ You want to see demo responses
**→ Recommended for learning**

---

## Step-by-Step: Configuring Together AI

### 1. Create Together AI Account
```
Visit: https://www.together.ai
- Click "Sign Up"
- Enter email/password
- Verify email
- Complete onboarding
```

### 2. Get Your API Key
```
- Click your profile (top right)
- Select "Settings"
- Click "API Keys"
- Click "Create Token"
- Copy the key (keep it secret!)
```

### 3. Add to Creative Automation
```
- Click "Settings" (gear icon)
- Select "API Keys" tab
- Click "Universal Gateway Setup"
- Choose "Together AI"
- Paste your API key
- Click "Save Configuration"
- You'll see "✓ Gateway configured"
```

### 4. Test It
```
- Go to Canvas
- Add a "ChatGPT" node
- Click "Run Workflow"
- Watch it execute in real-time!
```

---

## Understanding the Results

### Node Output Types

**Text Nodes:**
```
ChatGPT, Claude, Gemini, Grok
→ Returns: Text prompt responses
→ Display: In node output panel
```

**Research Nodes:**
```
Competitor Scan, Trend Scanner
→ Returns: JSON data (competitors, trends, hooks)
→ Display: Structured results
```

**Creation Nodes:**
```
Video, Image, Music Generators
→ Returns: URLs to generated files
→ Display: Preview + download link
```

**Brand Nodes:**
```
Brand Formatter, Platform Resizer, Caption Writer
→ Returns: Formatted content
→ Display: Formatted text/styled captions
```

**Export Nodes:**
```
Google Drive Export, Share Link
→ Returns: Drive link or share URL
→ Display: Clickable link
```

---

## Workflow Execution Order

The system automatically determines execution order based on connections.

### Example: Topological Sort in Action

```
If you have:
  A → B → C
  
Execution order:
1. Run A first
2. A finishes → Pass output to B
3. B runs with A's output
4. B finishes → Pass output to C
5. C runs with B's output
6. All done!
```

### Complex Dependencies

```
If you have:
  A → D
  B → D
  C → D
  
Execution order:
1. Run A, B, C in parallel (no dependencies)
2. All finish → Pass all outputs to D
3. D runs with all inputs
4. Done!
```

---

## Common Workflows Ready to Copy

### 5-Minute Video Generation
**Nodes:** Trend Scanner → ChatGPT → Video Generator → Brand Formatter

**Setup:**
1. Add those 4 nodes
2. Connect in order
3. Run
4. Video generated with your branding

### Daily Content Pipeline
**Nodes:** Audience Analyzer → ChatGPT → Image Generator → Caption Writer → Platform Resizer

**Setup:**
1. Add those 5 nodes
2. ChatGPT set to "creative mode" with 3-5 image variations
3. Image Generator creates images
4. Platform Resizer handles TikTok (1080x1920), Instagram (1080x1080), YouTube (1280x720)

### Competitor Intelligence
**Nodes:** Competitor Scan → Hook Extractor → ChatGPT → Google Drive Export

**Setup:**
1. Add those 4 nodes
2. Competitor Scan finds 5-10 competitors
3. Hook Extractor pulls key hooks
4. ChatGPT creates counter-hooks
5. Export to Drive with analysis

---

## Troubleshooting

### "Real API unavailable. Using demo response."
**Problem:** No API key configured
**Solution:** 
```
1. Settings → API Keys
2. Add Master API key (Together AI recommended)
   OR individual API key
3. Run workflow again
```

### "Node execution failed"
**Problem:** API request failed (usually API error or network)
**Solution:**
```
1. Check API key is correct
2. Check API service status (uptime.com)
3. Check internet connection
4. Try again after 60 seconds
```

### "Circular dependency detected"
**Problem:** Two nodes reference each other
**Solution:**
```
1. Check your connections
2. Remove circular connection
3. Redraw connections in one direction
```

### Node returns empty results
**Problem:** Previous node didn't produce output
**Solution:**
```
1. Check previous node output (click node)
2. Ensure previous node ran successfully
3. Check node inputs are filled
```

---

## What Happens When You Run a Workflow

### Behind the Scenes

```
Step 1: You click "Run Workflow"
  └─ App fetches all configured API keys

Step 2: System analyzes connections
  └─ Builds execution order (topological sort)
  └─ Detects any circular dependencies

Step 3: Execute in order
  ├─ Find node executor (ChatGPT, VideoGen, etc.)
  ├─ Collect node inputs
  ├─ Fetch required API key (gateway or individual)
  ├─ Call API with proper credentials
  ├─ Store results in node output
  └─ Pass to next node (if connected)

Step 4: Live feedback
  ├─ UI updates with progress bars
  ├─ Shows which node is running
  ├─ Shows results as they complete
  └─ Displays any errors

Step 5: Workflow complete
  └─ All node outputs available
  └─ Ready for export or download
```

---

## Next Steps

### Try Now:
1. Pick an API setup (Together AI recommended)
2. Add 3-4 nodes to canvas
3. Connect them
4. Click "Run Workflow"
5. See results in real-time

### After First Run:
- Experiment with different node combinations
- Build reusable templates
- Create content at scale
- Export to Drive/social media

### Want More?
- Check [API_KEY_MANAGEMENT.md](API_KEY_MANAGEMENT.md) for detailed setup
- Check [WORKFLOW_ENGINE.md](WORKFLOW_ENGINE.md) for technical details
- Review node types in [Components Reference](src/components)

---

**You're ready!** Start by visiting Settings → API Keys and choose your setup.

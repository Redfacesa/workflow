# AI Creative Factory Workflow (Product & Architecture Brief)

This repository captures the product blueprint for a **visual, no‑code AI creative factory** that lets users discover winning ideas, generate content, and publish — without prompts or design tools.

## Product Vision
**“Your AI Creative Team in one workspace.”**  
Users create high‑quality content quickly by learning from what already works — ethically and creatively.

## Target Users
- Small business owners
- Marketing teams
- Graphic designers
- Social media managers
- Agencies

## Core Workflow (Plain English)
1. **Study competitors** (URLs, social handles, uploads)
2. **Extract winning ideas** (hooks, styles, structures)
3. **Generate assets** (graphics, videos, memes)
4. **Refine + export** (brand formatting)
5. **Publish** (Drive export now, scheduling later)

---

## High‑Level System Architecture

### 1) Input Layer — “Inspiration Engine”
**Inputs**
- Competitor website URL
- Instagram / TikTok handle
- YouTube link
- Existing ad upload
- Industry type (e.g., restaurant, fintech, church)

**AI Actions**
- Analyze tone & voice
- Extract hooks & angles
- Detect design styles
- Identify video patterns
- Highlight emotional triggers

**Models**
- LLMs for idea extraction
- Vision models for image & video analysis

---

### 2) Idea Board — “What’s Working?”
**Output becomes cards, not text.**

Each card includes:
- Headline ideas
- Ad angles
- Visual style notes
- Video structure
- CTA examples

User actions:
- 👍 Save
- ✏️ Edit
- 🔁 Remix
- 🧠 Combine ideas

---

### 3) Core Tool Modes (Tabs)

#### 🎨 Graphic Design Mode
**Flow:** Idea Card → Style Picker → Generate → Edit → Export

Connected tools:
- Image generation (logos, posters, ads)
- Brand colors auto‑applied
- Font pairing AI
- Layout suggestions

No prompts exposed to users.

#### 🎬 Video / Ad Mode (Key Value Driver)
Users select:
- Goal (sell, funny, explain, announce)
- Platform (TikTok, Reels, YouTube)
- Style (cinematic, meme, UGC, animation)

AI builds:
- Script
- Scene breakdown
- Visual direction
- Captions + hashtags

Integrations:
- Sora / Veo / Kling (video)
- Voice models
- Music generators

Outputs:
- Full video
- Short clips
- Ad variations

#### 😂 Funny / Viral Content Mode
AI studies:
- Trending formats
- Industry humor
- Cultural tone

Outputs:
- Skit scripts
- Meme templates
- Reaction videos
- Voice‑over jokes

---

## Visual Workflow Builder (No‑Code Nodes)

**Example flow**

Competitor Scan  
↓  
Idea Extractor  
↓  
Video Generator  
↓  
Caption Writer  
↓  
Brand Formatter  
↓  
Export to Google Drive

Each node offers:
- Simple toggles
- Pre‑configured defaults
- One‑click reuse
- Optional advanced settings

---

## “One API to All Models” (Model Gateway)

You will build a **Model Gateway** that exposes a single API to the frontend and routes calls to:
- ChatGPT‑class LLMs
- Nano Banana (image)
- Kling / Sora / Veo (video)
- Voice & music models

**Why it matters**
- Standardizes API calls
- Hides provider keys from clients
- Enables safety limits, billing, and usage control

**Example endpoints**
- `POST /generate/text`
- `POST /generate/image`
- `POST /generate/video`
- `POST /generate/audio`

---

## Google‑First Auth + Storage (No Media Stored)

**User account = Google Sign‑In.**  
**All generated assets are saved to the user’s Google Drive.**

Minimal data stored in your DB (no media):
- User id
- Subscription plan / credits
- Encrypted Google refresh token
- Workflow definitions (small JSON)
- Usage logs (for billing & abuse prevention)

**Drive folder structure**
- `MyApp/Brand Kits/`
- `MyApp/Projects/<project>/Exports/`

---

## MVP Scope (Phase 1)
Ship only what proves the concept:

✅ Google Login + Drive setup  
✅ Visual workflow builder (basic nodes)  
✅ Idea cards  
✅ Graphic generation  
✅ Video generation  
✅ Model Gateway (text/image/video)

---

## Phase 2 Enhancements
- Scheduling
- Analytics & performance tracking
- A/B testing
- Team collaboration
- Agency white‑labeling

---

## Monetization Options
- Subscription tiers
- Pay‑per‑video
- Agency white‑label
- Enterprise custom workflows

---

## Positioning (Investor‑Ready)
**Not** “an AI tool.”  
**Yes**: “Your AI Creative Team in one workspace.”

**Promise:**  
“Create high‑quality content in minutes by learning from what already works — ethically and creatively.”

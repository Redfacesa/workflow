export interface NodeType {
  id: string;
  type: string;
  category: 'research' | 'create' | 'brand' | 'export' | 'ai';
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  inputs: string[];
  outputs: string[];
  settings: NodeSetting[];
}

export interface NodeSetting {
  key: string;
  label: string;
  type: 'text' | 'select' | 'toggle' | 'number' | 'textarea';
  options?: string[];
  defaultValue?: string | number | boolean;
}

export interface WorkflowNode {
  id: string;
  nodeTypeId: string;
  x: number;
  y: number;
  settings: Record<string, any>;
  status?: 'idle' | 'running' | 'complete' | 'error';
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromOutput: number;
  toInput: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  category: string;
  icon: string;
}

export interface IdeaCard {
  id: string;
  title: string;
  type: 'hook' | 'visual' | 'cta' | 'angle' | 'script' | 'meme';
  content: string;
  score: number;
  tags: string[];
  isSaved: boolean;
}

export const NODE_TYPES: NodeType[] = [
  // Research Nodes
  {
    id: 'competitor-scan',
    type: 'competitor-scan',
    category: 'research',
    name: 'Competitor Scan',
    description: 'Analyze competitor websites, ads, and social presence',
    icon: 'Search',
    color: '#3b82f6',
    bgColor: '#1e3a5f',
    inputs: [],
    outputs: ['analysis'],
    settings: [
      { key: 'url', label: 'Competitor URL', type: 'text' },
      { key: 'depth', label: 'Analysis Depth', type: 'select', options: ['Quick', 'Standard', 'Deep'], defaultValue: 'Standard' }
    ]
  },
  {
    id: 'hook-extractor',
    type: 'hook-extractor',
    category: 'research',
    name: 'Hook Extractor',
    description: 'Extract winning hooks, headlines, and emotional triggers',
    icon: 'Zap',
    color: '#f59e0b',
    bgColor: '#5f4a1e',
    inputs: ['content'],
    outputs: ['hooks'],
    settings: [
      { key: 'count', label: 'Number of Hooks', type: 'number', defaultValue: 10 },
      { key: 'style', label: 'Hook Style', type: 'select', options: ['Emotional', 'Curiosity', 'Pain Point', 'Benefit', 'All'], defaultValue: 'All' }
    ]
  },
  {
    id: 'trend-scanner',
    type: 'trend-scanner',
    category: 'research',
    name: 'Trend Scanner',
    description: 'Scan trending content formats and viral patterns',
    icon: 'TrendingUp',
    color: '#10b981',
    bgColor: '#1e5f3a',
    inputs: [],
    outputs: ['trends'],
    settings: [
      { key: 'platform', label: 'Platform', type: 'select', options: ['TikTok', 'Instagram', 'YouTube', 'Twitter/X', 'All'], defaultValue: 'All' },
      { key: 'industry', label: 'Industry', type: 'text' }
    ]
  },
  {
    id: 'audience-analyzer',
    type: 'audience-analyzer',
    category: 'research',
    name: 'Audience Analyzer',
    description: 'Identify target audience segments and preferences',
    icon: 'Users',
    color: '#8b5cf6',
    bgColor: '#3a1e5f',
    inputs: ['data'],
    outputs: ['audience'],
    settings: [
      { key: 'demographic', label: 'Focus', type: 'select', options: ['Age', 'Interest', 'Behavior', 'All'], defaultValue: 'All' }
    ]
  },
  // Create Nodes
  {
    id: 'image-generator',
    type: 'image-generator',
    category: 'create',
    name: 'Image Generator',
    description: 'Generate stunning visuals, posters, and ad creatives',
    icon: 'Image',
    color: '#ec4899',
    bgColor: '#5f1e3a',
    inputs: ['prompt', 'style'],
    outputs: ['image'],
    settings: [
      { key: 'style', label: 'Style', type: 'select', options: ['Photorealistic', 'Illustration', 'Minimalist', 'Bold', '3D', 'Vintage'], defaultValue: 'Photorealistic' },
      { key: 'size', label: 'Size', type: 'select', options: ['1:1 Square', '16:9 Landscape', '9:16 Portrait', '4:5 Instagram'], defaultValue: '1:1 Square' }
    ]
  },
  {
    id: 'video-generator',
    type: 'video-generator',
    category: 'create',
    name: 'Video Generator',
    description: 'Create videos from scripts with AI-powered scene generation',
    icon: 'Video',
    color: '#ef4444',
    bgColor: '#5f1e1e',
    inputs: ['script', 'style'],
    outputs: ['video'],
    settings: [
      { key: 'platform', label: 'Platform', type: 'select', options: ['TikTok', 'Reels', 'YouTube Shorts', 'YouTube', 'Facebook'], defaultValue: 'TikTok' },
      { key: 'style', label: 'Style', type: 'select', options: ['Cinematic', 'UGC', 'Animation', 'Meme', 'Professional'], defaultValue: 'Cinematic' },
      { key: 'duration', label: 'Duration', type: 'select', options: ['15s', '30s', '60s', '90s'], defaultValue: '30s' }
    ]
  },
  {
    id: 'script-writer',
    type: 'script-writer',
    category: 'create',
    name: 'Script Writer',
    description: 'Write compelling ad scripts with scene breakdowns',
    icon: 'FileText',
    color: '#06b6d4',
    bgColor: '#1e4a5f',
    inputs: ['hooks', 'audience'],
    outputs: ['script'],
    settings: [
      { key: 'goal', label: 'Goal', type: 'select', options: ['Sell', 'Educate', 'Entertain', 'Announce', 'Inspire'], defaultValue: 'Sell' },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Funny', 'Urgent', 'Emotional'], defaultValue: 'Casual' }
    ]
  },
  {
    id: 'caption-writer',
    type: 'caption-writer',
    category: 'create',
    name: 'Caption Writer',
    description: 'Generate captions, hashtags, and CTAs for social media',
    icon: 'MessageSquare',
    color: '#14b8a6',
    bgColor: '#1e5f4a',
    inputs: ['content'],
    outputs: ['captions'],
    settings: [
      { key: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'TikTok', 'Twitter/X', 'LinkedIn', 'Facebook'], defaultValue: 'Instagram' },
      { key: 'includeHashtags', label: 'Include Hashtags', type: 'toggle', defaultValue: true }
    ]
  },
  {
    id: 'voice-generator',
    type: 'voice-generator',
    category: 'create',
    name: 'Voice Generator',
    description: 'Generate natural voiceovers for videos and ads',
    icon: 'Mic',
    color: '#f97316',
    bgColor: '#5f3a1e',
    inputs: ['script'],
    outputs: ['audio'],
    settings: [
      { key: 'voice', label: 'Voice', type: 'select', options: ['Male Professional', 'Female Professional', 'Male Casual', 'Female Casual', 'Character'], defaultValue: 'Female Professional' },
      { key: 'speed', label: 'Speed', type: 'select', options: ['Slow', 'Normal', 'Fast'], defaultValue: 'Normal' }
    ]
  },
  {
    id: 'music-generator',
    type: 'music-generator',
    category: 'create',
    name: 'Music Generator',
    description: 'Create background music and sound effects',
    icon: 'Music',
    color: '#a855f7',
    bgColor: '#4a1e5f',
    inputs: ['mood'],
    outputs: ['music'],
    settings: [
      { key: 'genre', label: 'Genre', type: 'select', options: ['Pop', 'Lo-Fi', 'Cinematic', 'Hip-Hop', 'Ambient', 'Electronic'], defaultValue: 'Pop' },
      { key: 'duration', label: 'Duration (sec)', type: 'number', defaultValue: 30 }
    ]
  },
  {
    id: 'meme-generator',
    type: 'meme-generator',
    category: 'create',
    name: 'Meme Generator',
    description: 'Create viral memes and funny content for your brand',
    icon: 'Smile',
    color: '#eab308',
    bgColor: '#5f4a1e',
    inputs: ['topic'],
    outputs: ['meme'],
    settings: [
      { key: 'format', label: 'Format', type: 'select', options: ['Classic Meme', 'Reaction', 'Skit Script', 'Tweet Style', 'Relatable'], defaultValue: 'Classic Meme' },
      { key: 'industry', label: 'Industry', type: 'text' }
    ]
  },
  // Brand Nodes
  {
    id: 'brand-formatter',
    type: 'brand-formatter',
    category: 'brand',
    name: 'Brand Formatter',
    description: 'Apply brand colors, fonts, and style guidelines',
    icon: 'Palette',
    color: '#6366f1',
    bgColor: '#1e1e5f',
    inputs: ['content'],
    outputs: ['branded'],
    settings: [
      { key: 'primaryColor', label: 'Primary Color', type: 'text', defaultValue: '#6366f1' },
      { key: 'fontStyle', label: 'Font Style', type: 'select', options: ['Modern', 'Classic', 'Bold', 'Minimal', 'Playful'], defaultValue: 'Modern' }
    ]
  },
  {
    id: 'platform-resizer',
    type: 'platform-resizer',
    category: 'brand',
    name: 'Platform Resizer',
    description: 'Auto-resize content for different social platforms',
    icon: 'Maximize2',
    color: '#0ea5e9',
    bgColor: '#1e3a5f',
    inputs: ['content'],
    outputs: ['resized'],
    settings: [
      { key: 'platforms', label: 'Target Platforms', type: 'select', options: ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter/X', 'LinkedIn', 'All'], defaultValue: 'All' }
    ]
  },
  {
    id: 'subtitle-styler',
    type: 'subtitle-styler',
    category: 'brand',
    name: 'Subtitle Styler',
    description: 'Add styled captions and subtitles to videos',
    icon: 'Type',
    color: '#d946ef',
    bgColor: '#5f1e5f',
    inputs: ['video', 'script'],
    outputs: ['subtitled'],
    settings: [
      { key: 'style', label: 'Style', type: 'select', options: ['Hormozi', 'Clean', 'Bold Pop', 'Minimal', 'Karaoke'], defaultValue: 'Bold Pop' }
    ]
  },
  // Export Nodes
  {
    id: 'google-drive-export',
    type: 'google-drive-export',
    category: 'export',
    name: 'Save to Drive',
    description: 'Export directly to your Google Drive',
    icon: 'HardDrive',
    color: '#22c55e',
    bgColor: '#1e5f2a',
    inputs: ['content'],
    outputs: [],
    settings: [
      { key: 'folder', label: 'Drive Folder', type: 'text', defaultValue: 'RedFace/Exports' },
      { key: 'format', label: 'Format', type: 'select', options: ['PNG', 'JPG', 'MP4', 'GIF', 'PDF'], defaultValue: 'PNG' }
    ]
  },
  {
    id: 'share-link',
    type: 'share-link',
    category: 'export',
    name: 'Share Link',
    description: 'Generate a shareable preview link',
    icon: 'Share2',
    color: '#64748b',
    bgColor: '#2a2a3f',
    inputs: ['content'],
    outputs: [],
    settings: [
      { key: 'expiry', label: 'Link Expiry', type: 'select', options: ['1 Hour', '24 Hours', '7 Days', '30 Days', 'Never'], defaultValue: '7 Days' }
    ]
  },
  // AI Model Nodes
  {
    id: 'chatgpt-node',
    type: 'chatgpt-node',
    category: 'ai',
    name: 'ChatGPT / GPT-5',
    description: 'OpenAI GPT models for text generation and analysis',
    icon: 'Bot',
    color: '#10b981',
    bgColor: '#1e5f3a',
    inputs: ['prompt'],
    outputs: ['text'],
    settings: [
      { key: 'model', label: 'Model', type: 'select', options: ['GPT-5', 'GPT-5 Mini', 'GPT-5 Nano'], defaultValue: 'GPT-5 Mini' },
      { key: 'temperature', label: 'Creativity', type: 'select', options: ['Low', 'Medium', 'High'], defaultValue: 'Medium' }
    ]
  },
  {
    id: 'gemini-node',
    type: 'gemini-node',
    category: 'ai',
    name: 'Gemini Pro',
    description: 'Google Gemini for multimodal AI tasks',
    icon: 'Sparkles',
    color: '#3b82f6',
    bgColor: '#1e3a5f',
    inputs: ['prompt'],
    outputs: ['text', 'image'],
    settings: [
      { key: 'model', label: 'Model', type: 'select', options: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Gemini Flash Lite'], defaultValue: 'Gemini 2.5 Flash' }
    ]
  },
  {
    id: 'claude-node',
    type: 'claude-node',
    category: 'ai',
    name: 'Claude',
    description: 'Anthropic Claude for creative writing and analysis',
    icon: 'Brain',
    color: '#d97706',
    bgColor: '#5f3a1e',
    inputs: ['prompt'],
    outputs: ['text'],
    settings: [
      { key: 'model', label: 'Model', type: 'select', options: ['Claude 4.1 Opus', 'Claude 4.5 Sonnet', 'Claude 4.5 Haiku'], defaultValue: 'Claude 4.5 Sonnet' }
    ]
  },
  {
    id: 'kling-node',
    type: 'kling-node',
    category: 'ai',
    name: 'Kling AI',
    description: 'Kling AI for high-quality video generation',
    icon: 'Film',
    color: '#ef4444',
    bgColor: '#5f1e1e',
    inputs: ['prompt', 'image'],
    outputs: ['video'],
    settings: [
      { key: 'quality', label: 'Quality', type: 'select', options: ['Standard', 'High', 'Ultra'], defaultValue: 'High' },
      { key: 'duration', label: 'Duration', type: 'select', options: ['5s', '10s', '30s'], defaultValue: '10s' }
    ]
  },
  {
    id: 'sora-node',
    type: 'sora-node',
    category: 'ai',
    name: 'Sora',
    description: 'OpenAI Sora for cinematic video generation',
    icon: 'Clapperboard',
    color: '#8b5cf6',
    bgColor: '#3a1e5f',
    inputs: ['prompt'],
    outputs: ['video'],
    settings: [
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['720p', '1080p', '4K'], defaultValue: '1080p' }
    ]
  },
  {
    id: 'grok-node',
    type: 'grok-node',
    category: 'ai',
    name: 'Grok',
    description: 'xAI Grok for witty, real-time content generation',
    icon: 'Flame',
    color: '#f97316',
    bgColor: '#5f3a1e',
    inputs: ['prompt'],
    outputs: ['text'],
    settings: [
      { key: 'mode', label: 'Mode', type: 'select', options: ['Regular', 'Fun', 'Unhinged'], defaultValue: 'Regular' }
    ]
  }
];

export const WORKFLOW_TEMPLATES: Workflow[] = [
  {
    id: 'social-post-maker',
    name: 'Social Post Maker',
    description: 'Scan competitors → Extract hooks → Generate image → Write caption → Export',
    category: 'Marketing',
    icon: 'Image',
    nodes: [
      { id: 'n1', nodeTypeId: 'competitor-scan', x: 100, y: 200, settings: {} },
      { id: 'n2', nodeTypeId: 'hook-extractor', x: 350, y: 200, settings: {} },
      { id: 'n3', nodeTypeId: 'image-generator', x: 600, y: 150, settings: {} },
      { id: 'n4', nodeTypeId: 'caption-writer', x: 600, y: 300, settings: {} },
      { id: 'n5', nodeTypeId: 'brand-formatter', x: 850, y: 200, settings: {} },
      { id: 'n6', nodeTypeId: 'google-drive-export', x: 1100, y: 200, settings: {} }
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', fromOutput: 0, toInput: 0 },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', fromOutput: 0, toInput: 0 },
      { id: 'c3', fromNodeId: 'n2', toNodeId: 'n4', fromOutput: 0, toInput: 0 },
      { id: 'c4', fromNodeId: 'n3', toNodeId: 'n5', fromOutput: 0, toInput: 0 },
      { id: 'c5', fromNodeId: 'n5', toNodeId: 'n6', fromOutput: 0, toInput: 0 }
    ]
  },
  {
    id: 'video-ad-factory',
    name: 'Video Ad Factory',
    description: 'Research trends → Write script → Generate video → Add voice → Style subtitles → Export',
    category: 'Video',
    icon: 'Video',
    nodes: [
      { id: 'n1', nodeTypeId: 'trend-scanner', x: 100, y: 200, settings: {} },
      { id: 'n2', nodeTypeId: 'script-writer', x: 350, y: 200, settings: {} },
      { id: 'n3', nodeTypeId: 'video-generator', x: 600, y: 150, settings: {} },
      { id: 'n4', nodeTypeId: 'voice-generator', x: 600, y: 300, settings: {} },
      { id: 'n5', nodeTypeId: 'subtitle-styler', x: 850, y: 200, settings: {} },
      { id: 'n6', nodeTypeId: 'google-drive-export', x: 1100, y: 200, settings: {} }
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', fromOutput: 0, toInput: 0 },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', fromOutput: 0, toInput: 0 },
      { id: 'c3', fromNodeId: 'n2', toNodeId: 'n4', fromOutput: 0, toInput: 0 },
      { id: 'c4', fromNodeId: 'n3', toNodeId: 'n5', fromOutput: 0, toInput: 0 },
      { id: 'c5', fromNodeId: 'n5', toNodeId: 'n6', fromOutput: 0, toInput: 0 }
    ]
  },
  {
    id: 'viral-meme-machine',
    name: 'Viral Meme Machine',
    description: 'Scan trends → Extract humor → Generate memes → Write captions → Share',
    category: 'Viral',
    icon: 'Smile',
    nodes: [
      { id: 'n1', nodeTypeId: 'trend-scanner', x: 100, y: 200, settings: {} },
      { id: 'n2', nodeTypeId: 'hook-extractor', x: 350, y: 200, settings: {} },
      { id: 'n3', nodeTypeId: 'meme-generator', x: 600, y: 200, settings: {} },
      { id: 'n4', nodeTypeId: 'caption-writer', x: 850, y: 200, settings: {} },
      { id: 'n5', nodeTypeId: 'share-link', x: 1100, y: 200, settings: {} }
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', fromOutput: 0, toInput: 0 },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', fromOutput: 0, toInput: 0 },
      { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4', fromOutput: 0, toInput: 0 },
      { id: 'c4', fromNodeId: 'n4', toNodeId: 'n5', fromOutput: 0, toInput: 0 }
    ]
  },
  {
    id: 'brand-content-suite',
    name: 'Brand Content Suite',
    description: 'Analyze brand → Generate multi-platform content → Apply branding → Resize → Export all',
    category: 'Brand',
    icon: 'Palette',
    nodes: [
      { id: 'n1', nodeTypeId: 'competitor-scan', x: 100, y: 200, settings: {} },
      { id: 'n2', nodeTypeId: 'audience-analyzer', x: 350, y: 200, settings: {} },
      { id: 'n3', nodeTypeId: 'image-generator', x: 600, y: 100, settings: {} },
      { id: 'n4', nodeTypeId: 'caption-writer', x: 600, y: 300, settings: {} },
      { id: 'n5', nodeTypeId: 'brand-formatter', x: 850, y: 100, settings: {} },
      { id: 'n6', nodeTypeId: 'platform-resizer', x: 850, y: 300, settings: {} },
      { id: 'n7', nodeTypeId: 'google-drive-export', x: 1100, y: 200, settings: {} }
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', fromOutput: 0, toInput: 0 },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', fromOutput: 0, toInput: 0 },
      { id: 'c3', fromNodeId: 'n2', toNodeId: 'n4', fromOutput: 0, toInput: 0 },
      { id: 'c4', fromNodeId: 'n3', toNodeId: 'n5', fromOutput: 0, toInput: 0 },
      { id: 'c5', fromNodeId: 'n4', toNodeId: 'n6', fromOutput: 0, toInput: 0 },
      { id: 'c6', fromNodeId: 'n5', toNodeId: 'n7', fromOutput: 0, toInput: 0 },
      { id: 'c7', fromNodeId: 'n6', toNodeId: 'n7', fromOutput: 0, toInput: 0 }
    ]
  },
  {
    id: 'ai-powered-ads',
    name: 'AI-Powered Ad Campaign',
    description: 'Use multiple AI models to create a complete ad campaign with variations',
    category: 'Ads',
    icon: 'Sparkles',
    nodes: [
      { id: 'n1', nodeTypeId: 'gemini-node', x: 100, y: 150, settings: {} },
      { id: 'n2', nodeTypeId: 'chatgpt-node', x: 100, y: 300, settings: {} },
      { id: 'n3', nodeTypeId: 'hook-extractor', x: 350, y: 200, settings: {} },
      { id: 'n4', nodeTypeId: 'image-generator', x: 600, y: 100, settings: {} },
      { id: 'n5', nodeTypeId: 'kling-node', x: 600, y: 300, settings: {} },
      { id: 'n6', nodeTypeId: 'brand-formatter', x: 850, y: 200, settings: {} },
      { id: 'n7', nodeTypeId: 'google-drive-export', x: 1100, y: 200, settings: {} }
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n3', fromOutput: 0, toInput: 0 },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', fromOutput: 0, toInput: 0 },
      { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4', fromOutput: 0, toInput: 0 },
      { id: 'c4', fromNodeId: 'n3', toNodeId: 'n5', fromOutput: 0, toInput: 0 },
      { id: 'c5', fromNodeId: 'n4', toNodeId: 'n6', fromOutput: 0, toInput: 0 },
      { id: 'c6', fromNodeId: 'n5', toNodeId: 'n6', fromOutput: 0, toInput: 0 },
      { id: 'c7', fromNodeId: 'n6', toNodeId: 'n7', fromOutput: 0, toInput: 0 }
    ]
  },
  {
    id: 'competitor-intelligence',
    name: 'Competitor Intelligence',
    description: 'Deep-dive competitor analysis with actionable idea cards',
    category: 'Research',
    icon: 'Search',
    nodes: [
      { id: 'n1', nodeTypeId: 'competitor-scan', x: 100, y: 150, settings: {} },
      { id: 'n2', nodeTypeId: 'trend-scanner', x: 100, y: 300, settings: {} },
      { id: 'n3', nodeTypeId: 'hook-extractor', x: 400, y: 150, settings: {} },
      { id: 'n4', nodeTypeId: 'audience-analyzer', x: 400, y: 300, settings: {} },
      { id: 'n5', nodeTypeId: 'claude-node', x: 700, y: 200, settings: {} },
      { id: 'n6', nodeTypeId: 'google-drive-export', x: 1000, y: 200, settings: {} }
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n3', fromOutput: 0, toInput: 0 },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n4', fromOutput: 0, toInput: 0 },
      { id: 'c3', fromNodeId: 'n3', toNodeId: 'n5', fromOutput: 0, toInput: 0 },
      { id: 'c4', fromNodeId: 'n4', toNodeId: 'n5', fromOutput: 0, toInput: 0 },
      { id: 'c5', fromNodeId: 'n5', toNodeId: 'n6', fromOutput: 0, toInput: 0 }
    ]
  }
];

export const SAMPLE_IDEA_CARDS: IdeaCard[] = [
  { id: '1', title: '"Stop scrolling — this changes everything"', type: 'hook', content: 'Curiosity-driven hook that creates an open loop. Works best for educational or transformation content.', score: 9, tags: ['Curiosity', 'Scroll-Stopper'], isSaved: false },
  { id: '2', title: 'Split-screen before/after transformation', type: 'visual', content: 'Visual pattern showing dramatic transformation. High engagement on Reels and TikTok.', score: 8, tags: ['Visual', 'Transformation'], isSaved: false },
  { id: '3', title: '"DM me [keyword] for the free guide"', type: 'cta', content: 'Interactive CTA that drives DMs and builds engagement metrics. Works across all platforms.', score: 9, tags: ['CTA', 'Lead Gen'], isSaved: true },
  { id: '4', title: 'Pain point → Agitation → Solution framework', type: 'angle', content: 'Classic PAS framework adapted for short-form video. Hook with pain, agitate, present solution.', score: 8, tags: ['Framework', 'Copywriting'], isSaved: false },
  { id: '5', title: '3-scene product demo with trending audio', type: 'script', content: 'Quick product showcase: Problem scene → Using product → Amazing result. Overlay trending sound.', score: 7, tags: ['Product', 'Demo'], isSaved: true },
  { id: '6', title: '"POV: You finally found [product]"', type: 'meme', content: 'POV meme format adapted for brand content. Relatable humor drives shares and saves.', score: 8, tags: ['Meme', 'POV', 'Relatable'], isSaved: false },
  { id: '7', title: 'Founder story with raw footage', type: 'angle', content: 'Authentic behind-the-scenes content. Show the real journey, struggles, and wins.', score: 9, tags: ['Authentic', 'Story'], isSaved: false },
  { id: '8', title: '"What I wish I knew before starting [business]"', type: 'hook', content: 'Experience-based hook that positions authority while creating curiosity about lessons learned.', score: 8, tags: ['Authority', 'Curiosity'], isSaved: true },
];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  research: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  create: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  brand: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  export: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  ai: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' }
};

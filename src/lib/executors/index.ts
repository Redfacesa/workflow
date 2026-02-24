import { executorRegistry } from '../workflowEngine';

// Import all executor functions
import {
  chatgptExecutor,
  claudeExecutor,
  geminiExecutor,
  klingExecutor,
  soraExecutor,
  grokExecutor
} from './aiNodes';

import {
  competitorScanExecutor,
  hookExtractorExecutor,
  trendScannerExecutor,
  audienceAnalyzerExecutor
} from './researchNodes';

import {
  imageGeneratorExecutor,
  videoGeneratorExecutor,
  scriptWriterExecutor,
  captionWriterExecutor,
  voiceGeneratorExecutor,
  musicGeneratorExecutor,
  memeGeneratorExecutor
} from './createNodes';

import {
  brandFormatterExecutor,
  platformResizerExecutor,
  subtitleStylerExecutor,
  googleDriveExportExecutor,
  shareLinkExecutor
} from './brandExportNodes';

/**
 * Registers all node executors
 * Call this once at app initialization
 */
export function registerAllExecutors() {
  // AI Model Nodes
  executorRegistry.register('chatgpt-node', chatgptExecutor);
  executorRegistry.register('gemini-node', geminiExecutor);
  executorRegistry.register('claude-node', claudeExecutor);
  executorRegistry.register('kling-node', klingExecutor);
  executorRegistry.register('sora-node', soraExecutor);
  executorRegistry.register('grok-node', grokExecutor);

  // Research Nodes
  executorRegistry.register('competitor-scan', competitorScanExecutor);
  executorRegistry.register('hook-extractor', hookExtractorExecutor);
  executorRegistry.register('trend-scanner', trendScannerExecutor);
  executorRegistry.register('audience-analyzer', audienceAnalyzerExecutor);

  // Create Nodes
  executorRegistry.register('image-generator', imageGeneratorExecutor);
  executorRegistry.register('video-generator', videoGeneratorExecutor);
  executorRegistry.register('script-writer', scriptWriterExecutor);
  executorRegistry.register('caption-writer', captionWriterExecutor);
  executorRegistry.register('voice-generator', voiceGeneratorExecutor);
  executorRegistry.register('music-generator', musicGeneratorExecutor);
  executorRegistry.register('meme-generator', memeGeneratorExecutor);

  // Brand & Export Nodes
  executorRegistry.register('brand-formatter', brandFormatterExecutor);
  executorRegistry.register('platform-resizer', platformResizerExecutor);
  executorRegistry.register('subtitle-styler', subtitleStylerExecutor);
  executorRegistry.register('google-drive-export', googleDriveExportExecutor);
  executorRegistry.register('share-link', shareLinkExecutor);
}

export {
  chatgptExecutor,
  claudeExecutor,
  geminiExecutor,
  klingExecutor,
  soraExecutor,
  grokExecutor,
  competitorScanExecutor,
  hookExtractorExecutor,
  trendScannerExecutor,
  audienceAnalyzerExecutor,
  imageGeneratorExecutor,
  videoGeneratorExecutor,
  scriptWriterExecutor,
  captionWriterExecutor,
  voiceGeneratorExecutor,
  musicGeneratorExecutor,
  memeGeneratorExecutor,
  brandFormatterExecutor,
  platformResizerExecutor,
  subtitleStylerExecutor,
  googleDriveExportExecutor,
  shareLinkExecutor
};

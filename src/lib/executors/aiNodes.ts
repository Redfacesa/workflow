import { NodeExecutor, NodeExecutionContext } from '../workflowEngine';
import { apiGateway } from '../apiGateway';

/**
 * ChatGPT / GPT-5 Node Executor
 * Generates text using OpenAI models
 * Falls back to master API gateway if available
 */
export const chatgptExecutor: NodeExecutor = async (context: NodeExecutionContext) => {
  const { node, inputs, apiKeys } = context;
  const prompt = inputs.input_0 || node.settings.prompt || 'Generate creative content';
  const model = node.settings.model || 'GPT-5 Mini';
  const temperature = node.settings.temperature === 'High' ? 0.8 : node.settings.temperature === 'Low' ? 0.2 : 0.5;

  try {
    // Try master API gateway first
    if (apiGateway.isConfigured()) {
      const content = await apiGateway.callLLM({
        model: 'gpt-5',
        prompt,
        temperature,
        maxTokens: 1000
      });
      return { 0: content };
    }

    // Fall back to direct OpenAI API
    const apiKey = apiKeys?.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        0: `Generated content using ${model}:\n\n"${prompt}"\n\nThis is a demonstration response. To use real ChatGPT, configure your OpenAI API key or set up a master gateway.`
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model.toLowerCase().includes('nano') ? 'gpt-4o-mini' : 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No response generated';

    return { 0: content };
  } catch (err) {
    console.error('ChatGPT execution error:', err);
    return {
      0: `[Mock] Generated using ${model}:\n\n${prompt}\n\nNote: Real API unavailable. Using demo response.`
    };
  }
};

/**
 * Claude (Anthropic) Node Executor
 * Generates text using Claude models
 * Falls back to master API gateway if available
 */
export const claudeExecutor: NodeExecutor = async (context: NodeExecutionContext) => {
  const { node, inputs, apiKeys } = context;
  const prompt = inputs.input_0 || node.settings.prompt || 'Generate creative content';
  const model = node.settings.model || 'Claude 4.5 Sonnet';

  try {
    // Try master API gateway first
    if (apiGateway.isConfigured()) {
      const content = await apiGateway.callLLM({
        model: 'claude-sonnet',
        prompt,
        temperature: 0.7,
        maxTokens: 1024
      });
      return { 0: content };
    }

    // Fall back to direct Anthropic API
    const apiKey = apiKeys?.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        0: `Generated content using ${model}:\n\n"${prompt}"\n\nThis is a demonstration response. To use real Claude, configure your Anthropic API key or set up a master gateway.`
      };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model.toLowerCase().includes('opus') ? 'claude-3-opus-20240229' : model.toLowerCase().includes('haiku') ? 'claude-3-5-haiku-20241022' : 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const content = data.content?.[0]?.text || 'No response generated';

    return { 0: content };
  } catch (err) {
    console.error('Claude execution error:', err);
    return {
      0: `[Mock] Generated using ${model}:\n\n${prompt}\n\nNote: Real API unavailable. Using demo response.`
    };
  }
};

/**
 * Gemini Pro (Google) Node Executor
 * Multimodal AI for text and image generation
 * Falls back to master API gateway if available
 */
export const geminiExecutor: NodeExecutor = async (context: NodeExecutionContext) => {
  const { node, inputs, apiKeys } = context;
  const prompt = inputs.input_0 || node.settings.prompt || 'Generate creative content';
  const model = node.settings.model || 'Gemini 2.5 Flash';

  try {
    // Try master API gateway first
    if (apiGateway.isConfigured()) {
      const content = await apiGateway.callLLM({
        model: 'gemini-pro',
        prompt,
        temperature: 0.7,
        maxTokens: 1000
      });
      return { 0: content, 1: null };
    }

    // Fall back to direct Google API
    const apiKey = apiKeys?.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return {
        0: `Text response from ${model}`,
        1: null
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.toLowerCase().replace(' ', '-')}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return {
      0: content,
      1: null
    };
  } catch (err) {
    console.error('Gemini execution error:', err);
    return {
      0: `[Mock] Generated using ${model}:\n\n${prompt}`,
      1: null
    };
  }
};

/**
 * Kling AI Node Executor
 * Video generation from prompts
 * Falls back to master API gateway if available
 */
export const klingExecutor: NodeExecutor = async (context: NodeExecutionContext) => {
  const { node, inputs, apiKeys } = context;
  const prompt = inputs.input_0 || node.settings.prompt || 'Generate a creative video';
  const quality = node.settings.quality || 'High';
  const duration = node.settings.duration || '10s';

  try {
    // Try master API gateway first
    if (apiGateway.isConfigured()) {
      const content = await apiGateway.callLLM({
        model: 'default',
        prompt: `Generate a ${quality} quality ${duration} video with this description: ${prompt}`
      });
      return { 0: content };
    }

    const apiKey = apiKeys?.KLING_API_KEY;
    if (!apiKey) {
      return {
        0: `[Mock Video] Generated ${quality} quality ${duration} video using prompt:\n${prompt}\n\nTo generate real videos, configure your Kling AI API key or set up a master gateway.`
      };
    }

    const response = await fetch('https://api.klingai.com/v1/videos/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        quality: quality.toLowerCase(),
        duration: parseInt(duration),
        aspectRatio: '16:9'
      })
    });

    if (!response.ok) {
      throw new Error(`Kling API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const videoUrl = data.result?.url || data.url || 'https://example.com/video.mp4';

    return { 0: videoUrl };
  } catch (err) {
    console.error('Kling execution error:', err);
    return {
      0: `[Mock Video] ${quality} quality ${duration} video generated from:\n${prompt}`
    };
  }
};

/**
 * Sora (OpenAI) Node Executor
 * Cinematic video generation
 * Falls back to master API gateway if available
 */
export const soraExecutor: NodeExecutor = async (context: NodeExecutionContext) => {
  const { node, inputs, apiKeys } = context;
  const prompt = inputs.input_0 || node.settings.prompt || 'Generate a cinematic video';
  const resolution = node.settings.resolution || '1080p';

  try {
    // Try master API gateway first
    if (apiGateway.isConfigured()) {
      const content = await apiGateway.callLLM({
        model: 'default',
        prompt: `Generate a cinematic ${resolution} video: ${prompt}`
      });
      return { 0: content };
    }

    const apiKey = apiKeys?.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        0: `[Mock Sora Video] ${resolution} video:\n${prompt}\n\nConfigure OpenAI API key or set up a master gateway for real Sora generation.`
      };
    }

    const response = await fetch('https://api.openai.com/v1/videos/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        model: 'sora-1.0',
        quality: 'hd',
        duration: 60
      })
    });

    if (!response.ok) {
      throw new Error(`Sora API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return { 0: data.data?.[0]?.url || 'https://example.com/sora-video.mp4' };
  } catch (err) {
    console.error('Sora execution error:', err);
    return {
      0: `[Mock] Sora ${resolution} video:\n${prompt}\n\nReal API unavailable.`
    };
  }
};

/**
 * Grok (xAI) Node Executor
 * Witty real-time content generation
 * Falls back to master API gateway if available
 */
export const grokExecutor: NodeExecutor = async (context: NodeExecutionContext) => {
  const { node, inputs, apiKeys } = context;
  const prompt = inputs.input_0 || node.settings.prompt || 'Generate witty content';
  const mode = node.settings.mode || 'Regular';

  try {
    // Try master API gateway first
    if (apiGateway.isConfigured()) {
      const content = await apiGateway.callLLM({
        model: 'default',
        prompt: `In ${mode} mode, respond to this: ${prompt}`
      });
      return { 0: content };
    }

    const apiKey = apiKeys?.XAI_API_KEY;
    if (!apiKey) {
      return {
        0: `[Mock Grok] ${mode} mode response:\n\n"${prompt}"\n\nConfigure xAI API key or set up a master gateway for real Grok responses.`
      };
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        temperature: mode === 'Unhinged' ? 0.9 : mode === 'Fun' ? 0.7 : 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return { 0: data.choices?.[0]?.message?.content || 'No response' };
  } catch (err) {
    console.error('Grok execution error:', err);
    return {
      0: `[Mock Grok - ${mode}] "${prompt}"\n\nReal API unavailable.`
    };
  }
};

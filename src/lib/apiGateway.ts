/**
 * API Gateway - Routes to multiple AI services using a master API key
 * This allows using a single unified API key for all AI model operations
 */

export interface ApiGatewayConfig {
  masterApiKey: string;
  gateway: 'together' | 'replicate' | 'custom' | 'none';
  customGatewayUrl?: string;
}

/**
 * Universal API Gateway service
 * Supports routing through Together AI, Replicate, or custom gateway
 */
export class ApiGateway {
  private config: ApiGatewayConfig;

  constructor(config?: ApiGatewayConfig) {
    this.config = config || {
      masterApiKey: '',
      gateway: 'none'
    };
  }

  setConfig(config: ApiGatewayConfig) {
    this.config = config;
  }

  /**
   * Call an LLM through the gateway
   */
  async callLLM(params: {
    model: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    if (!this.config.masterApiKey) {
      throw new Error('No master API key configured');
    }

    if (this.config.gateway === 'together') {
      return this.callTogether(params);
    } else if (this.config.gateway === 'replicate') {
      return this.callReplicate(params);
    } else if (this.config.gateway === 'custom' && this.config.customGatewayUrl) {
      return this.callCustom(params);
    } else {
      throw new Error('No valid gateway configured');
    }
  }

  /**
   * Call through Together AI (supports 100+ open-source models)
   */
  private async callTogether(params: {
    model: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.masterApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.mapToTogetherModel(params.model),
        messages: [{ role: 'user', content: params.prompt }],
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Together API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated';
  }

  /**
   * Call through Replicate (supports image/video generation + text)
   */
  private async callReplicate(params: {
    model: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.config.masterApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: this.mapToReplicateModel(params.model),
        input: {
          prompt: params.prompt,
          max_tokens: params.maxTokens || 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    // Replicate returns async - you'd need to poll for results
    return data.output?.[0] || 'Processing...';
  }

  /**
   * Call through custom gateway
   */
  private async callCustom(params: {
    model: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const response = await fetch(this.config.customGatewayUrl!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.masterApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: params.model,
        prompt: params.prompt,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Custom gateway error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return data.result || data.content || 'No response generated';
  }

  /**
   * Map model names to Together AI equivalent
   */
  private mapToTogetherModel(model: string): string {
    const modelMap: Record<string, string> = {
      'gpt-5': 'meta-llama/Llama-3-70b-chat-hf',
      'gpt-5-mini': 'meta-llama/Llama-3-8b-chat-hf',
      'claude-opus': 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
      'claude-sonnet': 'meta-llama/Llama-3-70b-chat-hf',
      'gemini-pro': 'meta-llama/Llama-3-70b-chat-hf',
      'default': 'meta-llama/Llama-3-70b-chat-hf'
    };
    return modelMap[model] || modelMap['default'];
  }

  /**
   * Map model names to Replicate equivalent
   */
  private mapToReplicateModel(model: string): string {
    // Replicate uses version hashes - these are examples
    const modelMap: Record<string, string> = {
      'default': 'meta/llama-2-70b-chat'
    };
    return modelMap[model] || modelMap['default'];
  }

  /**
   * Check if gateway is configured
   */
  isConfigured(): boolean {
    return !!this.config.masterApiKey && this.config.gateway !== 'none';
  }

  /**
   * Get current gateway info
   */
  getConfig(): ApiGatewayConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const apiGateway = new ApiGateway();

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, Trash2, Plus, ChevronDown } from 'lucide-react';
import { apiKeyManager } from '@/lib/apiKeyManager';
import { apiGateway } from '@/lib/apiGateway';

type ApiKeyType = 'OPENAI_API_KEY' | 'ANTHROPIC_API_KEY' | 'GOOGLE_AI_API_KEY' | 'KLING_API_KEY' | 'XAI_API_KEY' | 'REPLICATE_API_KEY' | 'STABILITY_API_KEY' | 'ELEVENLABS_API_KEY' | 'GOOGLE_OAUTH_TOKEN';

interface ApiKeyField {
  key: ApiKeyType;
  name: string;
  description: string;
  example: string;
  docUrl?: string;
}

const API_KEYS: ApiKeyField[] = [
  {
    key: 'OPENAI_API_KEY',
    name: 'OpenAI (ChatGPT / Sora)',
    description: 'For GPT models and video generation',
    example: 'sk-proj-...',
    docUrl: 'https://platform.openai.com/api-keys'
  },
  {
    key: 'ANTHROPIC_API_KEY',
    name: 'Anthropic (Claude)',
    description: 'For Claude text generation',
    example: 'sk-ant-...',
    docUrl: 'https://console.anthropic.com/account/keys'
  },
  {
    key: 'GOOGLE_AI_API_KEY',
    name: 'Google (Gemini)',
    description: 'For Gemini multimodal AI',
    example: 'AIzaSy...',
    docUrl: 'https://makersuite.google.com/app/apikey'
  },
  {
    key: 'KLING_API_KEY',
    name: 'Kling AI',
    description: 'For Kling video generation',
    example: 'sk_live_...',
    docUrl: 'https://klingai.com/api'
  },
  {
    key: 'XAI_API_KEY',
    name: 'xAI (Grok)',
    description: 'For Grok API access',
    example: 'xai-...',
    docUrl: 'https://docs.x.ai'
  },
  {
    key: 'REPLICATE_API_KEY',
    name: 'Replicate',
    description: 'For image/video generation via open models',
    example: 'r8_...',
    docUrl: 'https://replicate.com/account/api-tokens'
  },
  {
    key: 'GOOGLE_OAUTH_TOKEN',
    name: 'Google OAuth (Drive)',
    description: 'For Google Drive export',
    example: 'ya29.a0...',
    docUrl: 'https://myaccount.google.com/permissions'
  }
];

interface GatewayOption {
  id: 'together' | 'replicate' | 'custom' | 'none';
  name: string;
  description: string;
  models: number;
  costEffective: boolean;
}

const GATEWAYS: GatewayOption[] = [
  {
    id: 'together',
    name: 'Together AI',
    description: 'Access 100+ open-source models with one key. Most cost-effective.',
    models: 100,
    costEffective: true
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Run ML models in the cloud. Great for image/video generation.',
    models: 50,
    costEffective: true
  },
  {
    id: 'custom',
    name: 'Custom Gateway',
    description: 'Use your own API gateway or service.',
    models: -1,
    costEffective: false
  },
  {
    id: 'none',
    name: 'Individual Keys',
    description: 'Configure each service separately.',
    models: -1,
    costEffective: false
  }
];

const ApiKeySettings: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [gateway, setGateway] = useState<'together' | 'replicate' | 'custom' | 'none'>('none');
  const [masterKey, setMasterKey] = useState('');
  const [customGatewayUrl, setCustomGatewayUrl] = useState('');
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [showGatewaySetup, setShowGatewaySetup] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const loadKeys = async () => {
      await apiKeyManager.initialize();
      const keys = apiKeyManager.getAllKeys();
      setApiKeys(keys);

      const gatewayConfig = apiGateway.getConfig();
      setGateway(gatewayConfig.gateway);
      setMasterKey(gatewayConfig.masterApiKey);
      setCustomGatewayUrl(gatewayConfig.customGatewayUrl || '');
    };
    loadKeys();
  }, []);

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleKeyChange = (key: ApiKeyType, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  };

  const saveApiKey = (key: ApiKeyType) => {
    setSaveStatus('saving');
    try {
      apiKeyManager.setKey(key, apiKeys[key] || '');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const clearApiKey = (key: ApiKeyType) => {
    setApiKeys(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    apiKeyManager.clearKey(key);
    setVisibleKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const saveMasterKeyConfig = async () => {
    setSaveStatus('saving');
    try {
      apiGateway.setConfig({
        masterApiKey: masterKey,
        gateway,
        customGatewayUrl
      });

      // Also save to local manager for persistence
      apiKeyManager.setKey('GATEWAY_MASTER_KEY' as any, masterKey);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const configuredCount = Object.values(apiKeys).filter(Boolean).length;
  const gatewayConfigured = gateway !== 'none' && masterKey;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">API Configuration</h2>
        <p className="text-gray-400 mt-1">Configure API keys for AI services and content generation</p>
      </div>

      {/* Gateway Setup Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              🎯 Universal Gateway Setup
              {gatewayConfigured && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Active</span>}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Use a single master API key to access multiple AI models
            </p>
          </div>
          <button
            onClick={() => setShowGatewaySetup(!showGatewaySetup)}
            className="text-purple-400 hover:text-purple-300"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${showGatewaySetup ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showGatewaySetup && (
          <div className="mt-6 space-y-6">
            {/* Gateway Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Select Gateway</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GATEWAYS.map(gw => (
                  <button
                    key={gw.id}
                    onClick={() => setGateway(gw.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      gateway === gw.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-white">{gw.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{gw.description}</p>
                        {gw.models > 0 && (
                          <p className="text-xs text-purple-300 mt-1">💰 {gw.models}+ models available</p>
                        )}
                      </div>
                      {gateway === gw.id && <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Master API Key Input */}
            {gateway !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Master API Key</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showMasterKey ? 'text' : 'password'}
                      value={masterKey}
                      onChange={e => setMasterKey(e.target.value)}
                      placeholder={gateway === 'together' ? 'Enter Together AI API key...' : gateway === 'replicate' ? 'Enter Replicate API token...' : 'Enter master API key...'}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setShowMasterKey(!showMasterKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showMasterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={saveMasterKeyConfig}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                      saveStatus === 'saved'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-purple-600 text-white hover:bg-purple-500'
                    }`}
                  >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                  </button>
                </div>

                {gateway === 'together' && (
                  <a
                    href="https://www.together.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block"
                  >
                    Get a Together AI key →
                  </a>
                )}
              </div>
            )}

            {/* Custom Gateway URL */}
            {gateway === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gateway URL</label>
                <input
                  type="url"
                  value={customGatewayUrl}
                  onChange={e => setCustomGatewayUrl(e.target.value)}
                  placeholder="https://api.yourgateways.com/v1/chat"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            )}

            {gateway !== 'none' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  ✨ With {GATEWAYS.find(g => g.id === gateway)?.name}, all AI nodes will route through your master key.
                  No need to set individual API keys.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Individual Keys Section */}
      {gateway === 'none' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Individual API Keys</h3>
              <p className="text-gray-400 text-sm mt-1">
                {configuredCount > 0
                  ? `${configuredCount} of ${API_KEYS.length} services configured`
                  : 'Configure API keys for individual services'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {API_KEYS.map(field => {
              const value = apiKeys[field.key] || '';
              const isConfigured = !!value;

              return (
                <div
                  key={field.key}
                  className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{field.name}</h4>
                        {isConfigured && (
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Configured</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{field.description}</p>
                      {field.docUrl && (
                        <a
                          href={field.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block"
                        >
                          Get API key →
                        </a>
                      )}
                    </div>

                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={visibleKeys.has(field.key) ? 'text' : 'password'}
                          value={value}
                          onChange={e => handleKeyChange(field.key, e.target.value)}
                          placeholder={field.example}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                        />
                        <button
                          onClick={() => toggleKeyVisibility(field.key)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm"
                        >
                          {visibleKeys.has(field.key) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <button
                        onClick={() => saveApiKey(field.key)}
                        disabled={!value}
                        className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                          !value
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-500'
                        }`}
                      >
                        Save
                      </button>

                      {isConfigured && (
                        <button
                          onClick={() => clearApiKey(field.key)}
                          className="px-3 py-2 rounded text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          <strong>How it works:</strong> {gatewayConfigured
            ? `Your workflows will use ${GATEWAYS.find(g => g.id === gateway)?.name} to access all AI models. This is cost-effective and gives you access to 100+ models.`
            : 'Each AI node will use its configured API key. For maximum flexibility, set up a gateway above.'}
        </p>
      </div>
    </div>
  );
};

export default ApiKeySettings;

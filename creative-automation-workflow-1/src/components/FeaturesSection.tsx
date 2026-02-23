import React from 'react';
import { 
  Sparkles, Zap, Brain, Eye, Video, Image, Mic, Music,
  Shield, Globe, Layers, ArrowRight, Bot, Film, Flame,
  Target, TrendingUp, Palette
} from 'lucide-react';

interface FeaturesSectionProps {
  onNavigate: (view: string) => void;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate }) => {
  const aiModels = [
    { name: 'GPT-5', color: '#10b981', icon: Bot, desc: 'Text & Copy' },
    { name: 'Gemini Pro', color: '#3b82f6', icon: Sparkles, desc: 'Multimodal AI' },
    { name: 'Claude', color: '#d97706', icon: Brain, desc: 'Creative Writing' },
    { name: 'Kling AI', color: '#ef4444', icon: Film, desc: 'Video Gen' },
    { name: 'Sora', color: '#8b5cf6', icon: Video, desc: 'Cinematic Video' },
    { name: 'Grok', color: '#f97316', icon: Flame, desc: 'Real-time Content' },
    { name: 'DALL-E', color: '#ec4899', icon: Image, desc: 'Image Gen' },
    { name: 'ElevenLabs', color: '#06b6d4', icon: Mic, desc: 'Voice & Audio' },
  ];

  const features = [
    {
      icon: Target,
      title: 'Competitor Intelligence',
      description: 'Scan any website, social profile, or ad. AI extracts hooks, design patterns, emotional triggers, and winning strategies.',
      color: '#3b82f6',
    },
    {
      icon: Layers,
      title: 'Visual Workflow Builder',
      description: 'Drag-and-drop nodes to create content pipelines. Connect AI models, formatters, and exporters — zero code required.',
      color: '#a855f7',
    },
    {
      icon: Palette,
      title: 'Multi-Mode Creation',
      description: 'Switch between Graphic Design, Video/Ad, and Viral Content modes. Each optimized for different creative outputs.',
      color: '#ec4899',
    },
    {
      icon: Shield,
      title: 'Google Drive Storage',
      description: 'All your creative assets saved directly to Google Drive. We never store your content — you own everything.',
      color: '#22c55e',
    }
  ];

  return (
    <div className="bg-[#0a0a1a] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* AI Models Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">One API, All Models</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Every AI Model.{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              One Gateway.
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
            Access GPT-5, Gemini, Claude, Kling AI, Sora, Grok, and more through a single unified interface. 
            The system automatically picks the best model for each task.
          </p>

          {/* AI Model cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {aiModels.map((model) => {
              const Icon = model.icon;
              return (
                <div
                  key={model.name}
                  className="group p-4 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: model.color + '15' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: model.color }} />
                  </div>
                  <div className="text-xs font-bold text-white">{model.name}</div>
                  <div className="text-[10px] text-gray-500">{model.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={feature.title}
                className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}
              >
                {/* Text */}
                <div className="flex-1">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: feature.color + '15' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed mb-6">{feature.description}</p>
                  <button 
                    onClick={() => onNavigate('workflow')}
                    className="group flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: feature.color }}
                  >
                    Try it now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Icon-based visual instead of image */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-2xl blur-xl" style={{ backgroundColor: feature.color + '08' }} />
                    <div className="relative rounded-xl overflow-hidden border border-gray-800/50 bg-[#0d0d1a] p-8 flex flex-col items-center justify-center h-64 sm:h-80">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: feature.color + '15' }}>
                        <Icon className="w-10 h-10" style={{ color: feature.color }} />
                      </div>
                      <p className="text-lg font-bold text-white">{feature.title}</p>
                      <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">{feature.description.split('.')[0]}.</p>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a]/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-12">
            From idea to published content in 4 simple steps
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Research', desc: 'Scan competitors, trends, and winning content', icon: TrendingUp, color: '#3b82f6' },
              { step: '02', title: 'Ideate', desc: 'AI extracts hooks, angles, and creative concepts', icon: Zap, color: '#f59e0b' },
              { step: '03', title: 'Create', desc: 'Generate graphics, videos, scripts, and ads', icon: Sparkles, color: '#ec4899' },
              { step: '04', title: 'Export', desc: 'Save to Drive, share links, or publish directly', icon: Globe, color: '#22c55e' }
            ].map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={step.step} className="relative">
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-gray-700 to-transparent" />
                  )}
                  <div className="p-6 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50 hover:border-gray-700/50 transition-all">
                    <div className="text-3xl font-black mb-3" style={{ color: step.color + '40' }}>{step.step}</div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: step.color + '15' }}>
                      <StepIcon className="w-5 h-5" style={{ color: step.color }} />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;

import React from 'react';
import { ArrowRight, Play, Sparkles, Zap, Shield, Globe } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onWatchDemo }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a1a]">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">No-Code AI Creative Factory</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">NEW</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6">
            <span className="block">Your AI</span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Creative Team
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mt-2 text-gray-300">
              in One Workspace
            </span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed">
            Turn competitor success into your content. Design graphics, produce videos, 
            create viral ads — all with visual drag-and-drop workflows. 
            <span className="text-white font-medium"> No prompts. No code. No agencies.</span>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Start Creating Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={onWatchDemo}
              className="group flex items-center gap-3 px-8 py-4 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Workflow preview image */}
          {/* Workflow preview - CSS visual instead of image */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-2xl blur-xl" />
            <div className="relative rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl bg-[#0d0d1a] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="flex-1 h-6 bg-gray-800/50 rounded-lg ml-4" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {['Competitor\nAnalysis', 'AI Script\nGenerator', 'Visual\nDesigner', 'Export\nto Drive'].map((label, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-700/40 bg-gradient-to-br from-purple-900/20 to-transparent flex flex-col items-center gap-2 text-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      ['bg-blue-500/20', 'bg-pink-500/20', 'bg-cyan-500/20', 'bg-green-500/20'][i]
                    }`}>
                      <Sparkles className={`w-5 h-5 ${['text-blue-400', 'text-pink-400', 'text-cyan-400', 'text-green-400'][i]}`} />
                    </div>
                    <span className="text-xs text-gray-400 whitespace-pre-line">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                {[0,1,2].map(i => <div key={i} className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-40" />)}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Zap, label: 'AI Models Connected', value: '20+' },
            { icon: Globe, label: 'Workflows Created', value: '50K+' },
            { icon: Shield, label: 'Assets Generated', value: '2M+' },
            { icon: Sparkles, label: 'Time Saved', value: '95%' }
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <stat.icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted by logos section */}
      <div className="relative z-10 border-t border-white/[0.05] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 mb-8 uppercase tracking-widest">Trusted by creative teams worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-40">
            {['Shopify', 'Nike', 'Spotify', 'Airbnb', 'Stripe', 'Notion'].map((brand) => (
              <span key={brand} className="text-lg sm:text-xl font-bold text-gray-400 tracking-wider">{brand}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

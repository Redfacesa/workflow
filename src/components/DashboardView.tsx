import React, { useState } from 'react';
import { 
  Plus, ArrowRight, Clock, Zap, Image, Video, Smile, 
  TrendingUp, Sparkles, Layers, BarChart3, FolderOpen,
  Search, Bot, Film, Brain, Calendar, Settings, Bell,
  Target, Globe, Palette, BookOpen, MessageCircle, Star,
  ArrowUp, Play, Eye, Heart, HardDrive
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  const recentProjects = [
    { id: '1', name: 'Summer Campaign 2026', type: 'workflow', nodes: 6, lastEdited: '2 hours ago', status: 'active' },
    { id: '2', name: 'Competitor Analysis - Nike', type: 'analysis', nodes: 0, lastEdited: '5 hours ago', status: 'complete' },
    { id: '3', name: 'TikTok Ad Series', type: 'video', nodes: 8, lastEdited: '1 day ago', status: 'active' },
    { id: '4', name: 'Brand Meme Pack', type: 'viral', nodes: 4, lastEdited: '2 days ago', status: 'draft' },
    { id: '5', name: 'Product Launch Graphics', type: 'graphic', nodes: 5, lastEdited: '3 days ago', status: 'complete' },
  ];

  const quickActions = [
    { icon: Search, label: 'Analyze Competitor', desc: 'Scan a competitor website', color: '#3b82f6', action: () => onNavigate('analysis') },
    { icon: Layers, label: 'New Workflow', desc: 'Build from scratch', color: '#a855f7', action: () => onNavigate('workflow') },
    { icon: Image, label: 'Create Graphic', desc: 'Design a visual', color: '#ec4899', action: () => onNavigate('studio') },
    { icon: Video, label: 'Create Video', desc: 'Generate a video ad', color: '#ef4444', action: () => onNavigate('studio') },
    { icon: Smile, label: 'Viral Content', desc: 'Make memes & skits', color: '#f59e0b', action: () => onNavigate('studio') },
    { icon: BookOpen, label: 'Templates', desc: 'Use a template', color: '#06b6d4', action: () => onNavigate('templates') },
    { icon: HardDrive, label: 'My Drive', desc: 'Browse saved assets', color: '#2563eb', action: () => onNavigate('drive') },
    { icon: BarChart3, label: 'Analytics', desc: 'View performance', color: '#8b5cf6', action: () => onNavigate('analytics') },
  ];


  const stats = [
    { label: 'Generations', value: '247', change: '+12%', icon: Sparkles, color: '#a855f7' },
    { label: 'Workflows', value: '12', change: '+3', icon: Layers, color: '#3b82f6' },
    { label: 'Ideas Saved', value: '89', change: '+24', icon: Zap, color: '#f59e0b' },
    { label: 'Credits Left', value: '753', change: '', icon: BarChart3, color: '#22c55e' },
  ];

  const activityFeed = [
    { action: 'Generated 4 ad variations', time: '15 min ago', icon: Image, color: '#ec4899' },
    { action: 'Completed competitor scan for Airbnb', time: '1 hour ago', icon: Search, color: '#3b82f6' },
    { action: 'Saved 3 hooks to Idea Board', time: '2 hours ago', icon: Zap, color: '#f59e0b' },
    { action: 'Ran "Video Ad Factory" workflow', time: '3 hours ago', icon: Play, color: '#22c55e' },
    { action: 'Scheduled 2 posts for Instagram', time: '5 hours ago', icon: Calendar, color: '#8b5cf6' },
    { action: 'Created brand kit "Summer Vibes"', time: '1 day ago', icon: Palette, color: '#06b6d4' },
  ];

  const typeIcons: Record<string, React.ElementType> = {
    workflow: Layers, analysis: Search, video: Video, viral: Smile, graphic: Image
  };

  const typeColors: Record<string, string> = {
    workflow: '#a855f7', analysis: '#3b82f6', video: '#ef4444', viral: '#f59e0b', graphic: '#ec4899'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{greeting}, Creator</h1>
          <p className="text-gray-500">Your AI creative workspace is ready</p>
        </div>
        <button onClick={() => onNavigate('workflow')}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50 hover:border-gray-700/50 transition-all cursor-pointer"
              onClick={() => onNavigate('analytics')}>
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
                {stat.change && (
                  <span className="text-[10px] font-medium text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <ArrowUp className="w-3 h-3" />{stat.change}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.action}
                className="group p-4 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-200 text-left hover:-translate-y-0.5"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: action.color + '15' }}
                >
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div className="text-xs font-medium text-white group-hover:text-purple-300 transition-colors">{action.label}</div>
                <div className="text-[10px] text-gray-600">{action.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent Projects</h2>
            <button onClick={() => onNavigate('projects')} className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentProjects.map((project) => {
              const Icon = typeIcons[project.type] || Layers;
              const color = typeColors[project.type] || '#a855f7';
              return (
                <button
                  key={project.id}
                  onClick={() => onNavigate('workflow')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1a1a2e]/40 border border-gray-800/30 hover:border-gray-700/50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '15' }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors truncate">{project.name}</div>
                    <div className="text-xs text-gray-600">
                      {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                      {project.nodes > 0 && ` · ${project.nodes} nodes`}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      project.status === 'active' ? 'bg-green-500/10 text-green-400' :
                      project.status === 'complete' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {project.status}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {project.lastEdited}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Activity</h2>
          <div className="bg-[#1a1a2e]/40 rounded-xl border border-gray-800/30 p-4">
            <div className="space-y-4">
              {activityFeed.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: item.color + '15' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">{item.action}</p>
                      <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />{item.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Models status */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Connected AI Models</h2>
          <button onClick={() => onNavigate('settings')} className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
            Manage <Settings className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3">
          {[
            { name: 'GPT-5', icon: Bot, color: '#10b981', status: 'online' },
            { name: 'Gemini', icon: Sparkles, color: '#3b82f6', status: 'online' },
            { name: 'Claude', icon: Brain, color: '#d97706', status: 'online' },
            { name: 'Kling AI', icon: Film, color: '#ef4444', status: 'online' },
            { name: 'Sora', icon: Video, color: '#8b5cf6', status: 'beta' },
            { name: 'Grok', icon: Zap, color: '#f97316', status: 'online' },
            { name: 'DALL-E', icon: Image, color: '#ec4899', status: 'online' },
            { name: 'ElevenLabs', icon: MessageCircle, color: '#06b6d4', status: 'online' },
          ].map(model => {
            const Icon = model.icon;
            return (
              <div key={model.name} className="p-3 rounded-xl bg-[#1a1a2e]/40 border border-gray-800/30 flex items-center gap-3 hover:border-gray-700/50 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: model.color + '15' }}>
                  <Icon className="w-4 h-4" style={{ color: model.color }} />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{model.name}</div>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${model.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-[10px] text-gray-500">{model.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming scheduled posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Upcoming Posts</h2>
          <button onClick={() => onNavigate('schedule')} className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
            View calendar <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Summer Sale Announcement', platform: 'Instagram', time: 'Tomorrow, 10:00 AM', color: '#e11d48' },
            { title: 'Product Demo Video', platform: 'TikTok', time: 'Feb 25, 2:00 PM', color: '#000000' },
            { title: 'Behind the Scenes', platform: 'Instagram', time: 'Feb 26, 9:00 AM', color: '#e11d48' },
            { title: 'Industry Meme', platform: 'Twitter/X', time: 'Feb 27, 12:00 PM', color: '#1d9bf0' },
          ].map((post, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#1a1a2e]/40 border border-gray-800/30 hover:border-gray-700/50 transition-all cursor-pointer"
              onClick={() => onNavigate('schedule')}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: post.color }} />
                <span className="text-[10px] text-gray-500">{post.platform}</span>
              </div>
              <p className="text-xs font-medium text-white mb-1 truncate">{post.title}</p>
              <p className="text-[10px] text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />{post.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

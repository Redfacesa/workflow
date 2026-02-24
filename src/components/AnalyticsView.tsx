import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Eye, Heart, Share2, MessageSquare,
  ArrowUp, ArrowDown, Calendar, Download, Filter, Sparkles,
  Image, Video, Smile, Layers, Zap, Clock, Target, Globe
} from 'lucide-react';

type TimeRange = '7d' | '30d' | '90d' | 'all';

const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const overviewStats = [
    { label: 'Total Generations', value: '1,247', change: '+18%', up: true, icon: Sparkles, color: '#a855f7' },
    { label: 'Content Created', value: '342', change: '+24%', up: true, icon: Image, color: '#ec4899' },
    { label: 'Workflows Run', value: '89', change: '+12%', up: true, icon: Layers, color: '#3b82f6' },
    { label: 'Time Saved', value: '156h', change: '+32%', up: true, icon: Clock, color: '#22c55e' },
    { label: 'Credits Used', value: '2,847', change: '-8%', up: false, icon: Zap, color: '#f59e0b' },
    { label: 'Avg. Quality Score', value: '8.4', change: '+0.3', up: true, icon: Target, color: '#06b6d4' },
  ];

  const contentPerformance = [
    { type: 'Social Posts', count: 156, engagement: '12.4K', growth: '+24%', icon: Image, color: '#ec4899' },
    { type: 'Video Ads', count: 42, engagement: '89.2K', growth: '+45%', icon: Video, color: '#ef4444' },
    { type: 'Memes', count: 67, engagement: '234K', growth: '+67%', icon: Smile, color: '#f59e0b' },
    { type: 'Ad Campaigns', count: 23, engagement: '45.6K', growth: '+18%', icon: Target, color: '#a855f7' },
    { type: 'Blog Graphics', count: 34, engagement: '8.9K', growth: '+12%', icon: Globe, color: '#3b82f6' },
  ];

  const aiModelUsage = [
    { model: 'GPT-5', usage: 420, percentage: 34, color: '#10b981' },
    { model: 'Gemini Flash', usage: 312, percentage: 25, color: '#3b82f6' },
    { model: 'Claude', usage: 189, percentage: 15, color: '#d97706' },
    { model: 'DALL-E', usage: 156, percentage: 13, color: '#ec4899' },
    { model: 'Kling AI', usage: 98, percentage: 8, color: '#ef4444' },
    { model: 'Others', usage: 72, percentage: 5, color: '#64748b' },
  ];

  const weeklyData = [
    { day: 'Mon', generations: 45, credits: 120 },
    { day: 'Tue', generations: 62, credits: 180 },
    { day: 'Wed', generations: 38, credits: 95 },
    { day: 'Thu', generations: 71, credits: 210 },
    { day: 'Fri', generations: 55, credits: 165 },
    { day: 'Sat', generations: 28, credits: 72 },
    { day: 'Sun', generations: 18, credits: 48 },
  ];

  const maxGen = Math.max(...weeklyData.map(d => d.generations));

  const topContent = [
    { title: 'Summer Sale Banner', type: 'Graphic', views: '12.4K', engagement: '8.2%', platform: 'Instagram' },
    { title: 'Product Launch Video', type: 'Video', views: '45.2K', engagement: '12.1%', platform: 'TikTok' },
    { title: 'Industry Meme Series', type: 'Meme', views: '89.1K', engagement: '15.4%', platform: 'Twitter/X' },
    { title: 'Brand Story Reel', type: 'Video', views: '23.8K', engagement: '9.7%', platform: 'Reels' },
    { title: 'Competitor Comparison', type: 'Graphic', views: '8.9K', engagement: '6.3%', platform: 'LinkedIn' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your creative performance and AI usage</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(range => (
            <button key={range} onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}>
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 text-xs hover:text-white transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {overviewStats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
                <span className={`text-[10px] font-medium flex items-center gap-0.5 ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-[10px] text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50">
          <h3 className="text-sm font-bold text-white mb-4">Weekly Activity</h3>
          <div className="flex items-end gap-3 h-48">
            {weeklyData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative" style={{ height: `${(d.generations / maxGen) * 100}%`, minHeight: '8px' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-800 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {d.generations} gens
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Model Usage */}
        <div className="p-6 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50">
          <h3 className="text-sm font-bold text-white mb-4">AI Model Usage</h3>
          <div className="space-y-3">
            {aiModelUsage.map(model => (
              <div key={model.model}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">{model.model}</span>
                  <span className="text-xs text-gray-500">{model.usage} ({model.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${model.percentage}%`, backgroundColor: model.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Performance */}
        <div className="p-6 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50">
          <h3 className="text-sm font-bold text-white mb-4">Content Performance</h3>
          <div className="space-y-3">
            {contentPerformance.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.type} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/20 border border-gray-800/30">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + '15' }}>
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-white">{item.type}</div>
                    <div className="text-[10px] text-gray-500">{item.count} pieces created</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{item.engagement}</div>
                    <div className="text-[10px] text-green-400">{item.growth}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="p-6 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50">
          <h3 className="text-sm font-bold text-white mb-4">Top Performing Content</h3>
          <div className="space-y-3">
            {topContent.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/20 border border-gray-800/30">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{item.title}</div>
                  <div className="text-[10px] text-gray-500">{item.type} · {item.platform}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1"><Eye className="w-3 h-3 text-gray-500" />{item.views}</div>
                  <div className="text-[10px] text-green-400">{item.engagement} eng.</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;

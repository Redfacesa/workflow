import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Clock, X,
  Image, Video, Smile, Instagram, Globe, Trash2, Edit3,
  Check, Loader2, ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ScheduledPost {
  id: string;
  title: string;
  platform: string;
  content: string;
  scheduled_at: string;
  status: string;
}

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#e11d48' },
  { id: 'tiktok', label: 'TikTok', color: '#000000' },
  { id: 'youtube', label: 'YouTube', color: '#ef4444' },
  { id: 'twitter', label: 'Twitter/X', color: '#1d9bf0' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0a66c2' },
  { id: 'facebook', label: 'Facebook', color: '#1877f2' },
];

const SchedulingView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('instagram');
  const [newContent, setNewContent] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase.from('scheduled_posts').select('*').order('scheduled_at');
    if (data && data.length > 0) {
      setPosts(data);
    } else {
      // Demo data
      const now = new Date();
      const demoData: ScheduledPost[] = [
        { id: '1', title: 'Summer Sale Announcement', platform: 'instagram', content: 'Big summer sale starting now!', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0).toISOString(), status: 'scheduled' },
        { id: '2', title: 'Product Demo Video', platform: 'tiktok', content: 'Quick product demo', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0).toISOString(), status: 'scheduled' },
        { id: '3', title: 'Behind the Scenes', platform: 'instagram', content: 'BTS of our creative process', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 9, 0).toISOString(), status: 'scheduled' },
        { id: '4', title: 'Industry Meme', platform: 'twitter', content: 'When the AI generates fire content', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 12, 0).toISOString(), status: 'scheduled' },
        { id: '5', title: 'Case Study Post', platform: 'linkedin', content: 'How we helped XYZ increase engagement', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 11, 0).toISOString(), status: 'scheduled' },
        { id: '6', title: 'Tutorial Video', platform: 'youtube', content: 'How to use RedFace workflow builder', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 15, 0).toISOString(), status: 'draft' },
        { id: '7', title: 'Customer Spotlight', platform: 'instagram', content: 'Featuring our amazing customer', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0).toISOString(), status: 'published' },
        { id: '8', title: 'Weekly Tips', platform: 'twitter', content: '5 tips for better content', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 9, 0).toISOString(), status: 'published' },
      ];
      setPosts(demoData);
    }
  };

  const createPost = async () => {
    if (!newTitle.trim() || !selectedDate) return;
    const scheduledAt = new Date(`${selectedDate}T${newTime}:00`).toISOString();
    const newPost: ScheduledPost = {
      id: `post-${Date.now()}`, title: newTitle, platform: newPlatform,
      content: newContent, scheduled_at: scheduledAt, status: 'scheduled'
    };
    setPosts(prev => [...prev, newPost]);
    await supabase.from('scheduled_posts').insert({
      title: newTitle, platform: newPlatform, content: newContent,
      scheduled_at: scheduledAt, status: 'scheduled'
    });
    setShowNewPost(false);
    setNewTitle('');
    setNewContent('');
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    supabase.from('scheduled_posts').delete().eq('id', id);
  };

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getPostsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter(p => p.scheduled_at.startsWith(dateStr));
  };

  const getPlatformColor = (platform: string) => PLATFORMS.find(p => p.id === platform)?.color || '#6366f1';

  const statusConfig: Record<string, { bg: string; text: string }> = {
    scheduled: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    published: { bg: 'bg-green-500/10', text: 'text-green-400' },
    draft: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
    failed: { bg: 'bg-red-500/10', text: 'text-red-400' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-400" />
            Content Schedule
          </h1>
          <p className="text-sm text-gray-500 mt-1">{posts.filter(p => p.status === 'scheduled').length} posts scheduled</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-800/50 overflow-hidden">
            <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 text-xs ${viewMode === 'month' ? 'bg-purple-600/20 text-purple-300' : 'bg-[#1a1a2e]/60 text-gray-500'}`}>
              Calendar
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs ${viewMode === 'list' ? 'bg-purple-600/20 text-purple-300' : 'bg-[#1a1a2e]/60 text-gray-500'}`}>
              List
            </button>
          </div>
          <button onClick={() => { setSelectedDate(today.toISOString().split('T')[0]); setShowNewPost(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all">
            <Plus className="w-4 h-4" /> Schedule Post
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="bg-[#1a1a2e]/60 rounded-xl border border-gray-800/50 overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
            <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white">{monthNames[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-800/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-xs font-bold text-gray-500 uppercase">{day}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] p-2 border-r border-b border-gray-800/30 bg-gray-900/20" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dayPosts = getPostsForDate(day);
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              return (
                <div key={day}
                  className={`min-h-[100px] p-2 border-r border-b border-gray-800/30 cursor-pointer hover:bg-purple-500/5 transition-colors ${isToday ? 'bg-purple-500/5' : ''}`}
                  onClick={() => { setSelectedDate(dateStr); setShowNewPost(true); }}>
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'text-purple-400' : 'text-gray-500'}`}>
                    {isToday ? (
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">{day}</span>
                    ) : day}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map(post => (
                      <div key={post.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: getPlatformColor(post.platform) + '15', color: getPlatformColor(post.platform) }}
                        onClick={e => e.stopPropagation()}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getPlatformColor(post.platform) }} />
                        <span className="truncate">{post.title}</span>
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-[10px] text-gray-500 px-1.5">+{dayPosts.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="space-y-2">
          {posts.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()).map(post => {
            const date = new Date(post.scheduled_at);
            const status = statusConfig[post.status] || statusConfig.draft;
            return (
              <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50 hover:border-gray-700/50 transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getPlatformColor(post.platform) + '15' }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPlatformColor(post.platform) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{post.title}</div>
                  <div className="text-xs text-gray-500">{PLATFORMS.find(p => p.id === post.platform)?.label || post.platform}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-300">{date.toLocaleDateString()}</div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>{post.status}</span>
                <button onClick={() => deletePost(post.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Platform legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {PLATFORMS.map(p => (
          <div key={p.id} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[10px] text-gray-500">{p.label}</span>
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowNewPost(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/50 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Schedule Post</h3>
                <button onClick={() => setShowNewPost(false)} className="p-2 rounded-lg hover:bg-gray-800"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Post title..."
                  className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => setNewPlatform(p.id)}
                      className={`p-2 rounded-lg border text-center text-xs transition-all ${
                        newPlatform === p.id ? 'border-purple-500/50 bg-purple-600/10 text-white' : 'border-gray-700/30 text-gray-500 hover:border-gray-600'
                      }`}>
                      <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: p.color }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
                  <input type="date" value={selectedDate || ''} onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Time</label>
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Content</label>
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Write your post content..." rows={3}
                  className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" />
              </div>
              <button onClick={createPost} disabled={!newTitle.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50">
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulingView;

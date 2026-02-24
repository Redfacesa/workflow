import React, { useState, useEffect } from 'react';
import {
  FolderOpen, Plus, Search, Filter, Grid3X3, List, MoreHorizontal,
  Layers, Image, Video, Smile, Sparkles, Clock, Trash2, Copy,
  Edit3, ArrowRight, Star, StarOff, SortAsc, ChevronDown, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  nodes_count: number;
  description: string;
  created_at: string;
  updated_at: string;
  isFavorite?: boolean;
}

interface ProjectsViewProps {
  onNavigate: (view: string) => void;
  onOpenProject?: (projectId: string) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ onNavigate, onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState('workflow');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('updated_at', { ascending: false });
    if (data && data.length > 0) {
      setProjects(data.map(p => ({ ...p, isFavorite: false })));
    } else {
      // Demo data
      setProjects([
        { id: '1', name: 'Summer Campaign 2026', type: 'workflow', status: 'active', nodes_count: 6, description: 'Full social media campaign with competitor analysis', created_at: '2026-02-20T10:00:00Z', updated_at: '2026-02-23T08:00:00Z', isFavorite: true },
        { id: '2', name: 'Competitor Analysis - Nike', type: 'analysis', status: 'complete', nodes_count: 0, description: 'Deep dive into Nike marketing strategy', created_at: '2026-02-19T10:00:00Z', updated_at: '2026-02-23T05:00:00Z', isFavorite: false },
        { id: '3', name: 'TikTok Ad Series', type: 'video', status: 'active', nodes_count: 8, description: '5-part TikTok ad series for product launch', created_at: '2026-02-18T10:00:00Z', updated_at: '2026-02-22T10:00:00Z', isFavorite: true },
        { id: '4', name: 'Brand Meme Pack', type: 'viral', status: 'draft', nodes_count: 4, description: 'Monthly meme content pack for social media', created_at: '2026-02-17T10:00:00Z', updated_at: '2026-02-21T10:00:00Z', isFavorite: false },
        { id: '5', name: 'Product Launch Graphics', type: 'graphic', status: 'complete', nodes_count: 5, description: 'Launch day graphics for all platforms', created_at: '2026-02-16T10:00:00Z', updated_at: '2026-02-20T10:00:00Z', isFavorite: false },
        { id: '6', name: 'Q1 Content Calendar', type: 'workflow', status: 'active', nodes_count: 12, description: 'Full quarter content production pipeline', created_at: '2026-02-15T10:00:00Z', updated_at: '2026-02-19T10:00:00Z', isFavorite: false },
        { id: '7', name: 'Instagram Reels Strategy', type: 'video', status: 'draft', nodes_count: 3, description: 'Weekly Reels content strategy', created_at: '2026-02-14T10:00:00Z', updated_at: '2026-02-18T10:00:00Z', isFavorite: false },
        { id: '8', name: 'Email Campaign Visuals', type: 'graphic', status: 'complete', nodes_count: 7, description: 'Email header images and CTA buttons', created_at: '2026-02-13T10:00:00Z', updated_at: '2026-02-17T10:00:00Z', isFavorite: false },
      ]);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    const newProject: Project = {
      id: `proj-${Date.now()}`, name: newProjectName, type: newProjectType,
      status: 'draft', nodes_count: 0, description: '',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(), isFavorite: false
    };
    setProjects(prev => [newProject, ...prev]);
    await supabase.from('projects').insert({ name: newProjectName, type: newProjectType });
    setShowNewModal(false);
    setNewProjectName('');
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    supabase.from('projects').delete().eq('id', id);
  };

  const duplicateProject = (project: Project) => {
    const dup: Project = { ...project, id: `proj-${Date.now()}`, name: `${project.name} (Copy)`, status: 'draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setProjects(prev => [dup, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const renameProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: editName } : p));
    setEditingProject(null);
  };

  const typeIcons: Record<string, React.ElementType> = { workflow: Layers, analysis: Search, video: Video, viral: Smile, graphic: Image };
  const typeColors: Record<string, string> = { workflow: '#a855f7', analysis: '#3b82f6', video: '#ef4444', viral: '#f59e0b', graphic: '#ec4899' };
  const statusColors: Record<string, string> = { active: 'bg-green-500/10 text-green-400', complete: 'bg-blue-500/10 text-blue-400', draft: 'bg-gray-500/10 text-gray-400' };

  const filtered = projects
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || p.type === filterType;
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-purple-400" />
            Projects
          </h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} projects total</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a2e]/60 border border-gray-800/50 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
        </div>
        <div className="flex gap-2">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2.5 bg-[#1a1a2e]/60 border border-gray-800/50 rounded-lg text-xs text-gray-400 focus:outline-none">
            <option value="all">All Types</option>
            <option value="workflow">Workflows</option>
            <option value="analysis">Analysis</option>
            <option value="video">Video</option>
            <option value="graphic">Graphic</option>
            <option value="viral">Viral</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-[#1a1a2e]/60 border border-gray-800/50 rounded-lg text-xs text-gray-400 focus:outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="complete">Complete</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2.5 bg-[#1a1a2e]/60 border border-gray-800/50 rounded-lg text-xs text-gray-400 focus:outline-none">
            <option value="updated_at">Last Modified</option>
            <option value="created_at">Created</option>
            <option value="name">Name</option>
          </select>
          <div className="flex rounded-lg border border-gray-800/50 overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-purple-600/20 text-purple-300' : 'bg-[#1a1a2e]/60 text-gray-500'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-purple-600/20 text-purple-300' : 'bg-[#1a1a2e]/60 text-gray-500'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(project => {
            const Icon = typeIcons[project.type] || Layers;
            const color = typeColors[project.type] || '#a855f7';
            return (
              <div key={project.id} className="group bg-[#1a1a2e]/60 rounded-xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-200 overflow-hidden cursor-pointer"
                onClick={() => onNavigate('workflow')}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); toggleFavorite(project.id); }}
                        className={`p-1.5 rounded-lg transition-colors ${project.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}>
                        {project.isFavorite ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  {editingProject === project.id ? (
                    <div className="flex gap-1 mb-2" onClick={e => e.stopPropagation()}>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                        className="flex-1 px-2 py-1 bg-gray-800 border border-purple-500/50 rounded text-sm text-white focus:outline-none" />
                      <button onClick={() => renameProject(project.id)} className="text-green-400 p-1"><Sparkles className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors truncate">{project.name}</h3>
                  )}
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{project.description || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[project.status] || statusColors.draft}`}>
                      {project.status}
                    </span>
                    <span className="text-[10px] text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(project.updated_at)}</span>
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t border-gray-800/30 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingProject(project.id); setEditName(project.name); }} className="p-1.5 rounded text-gray-600 hover:text-white"><Edit3 className="w-3 h-3" /></button>
                    <button onClick={() => duplicateProject(project)} className="p-1.5 rounded text-gray-600 hover:text-white"><Copy className="w-3 h-3" /></button>
                    <button onClick={() => deleteProject(project.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => onNavigate('workflow')} className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 text-[10px] font-medium hover:bg-purple-600/30">
                    Open <ArrowRight className="w-3 h-3 inline ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(project => {
            const Icon = typeIcons[project.type] || Layers;
            const color = typeColors[project.type] || '#a855f7';
            return (
              <div key={project.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1a2e]/40 border border-gray-800/30 hover:border-gray-700/50 transition-all cursor-pointer group"
                onClick={() => onNavigate('workflow')}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '15' }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-purple-300 truncate">{project.name}</div>
                  <div className="text-xs text-gray-600">{project.type} {project.nodes_count > 0 && `· ${project.nodes_count} nodes`}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[project.status]}`}>{project.status}</span>
                <span className="text-[10px] text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(project.updated_at)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button onClick={() => duplicateProject(project)} className="p-1.5 rounded text-gray-600 hover:text-white"><Copy className="w-3 h-3" /></button>
                  <button onClick={() => deleteProject(project.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No projects found</p>
          <button onClick={() => setShowNewModal(true)} className="mt-3 text-sm text-purple-400 hover:text-purple-300">Create your first project</button>
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowNewModal(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/50 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">New Project</h3>
                <button onClick={() => setShowNewModal(false)} className="p-2 rounded-lg hover:bg-gray-800"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Name</label>
                <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="My Awesome Campaign"
                  className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'workflow', label: 'Workflow', icon: Layers, color: '#a855f7' },
                    { id: 'video', label: 'Video', icon: Video, color: '#ef4444' },
                    { id: 'graphic', label: 'Graphic', icon: Image, color: '#ec4899' },
                  ].map(t => {
                    const TIcon = t.icon;
                    return (
                      <button key={t.id} onClick={() => setNewProjectType(t.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          newProjectType === t.id ? 'border-purple-500/50 bg-purple-600/10' : 'border-gray-700/30 bg-gray-800/20 hover:border-gray-600'
                        }`}>
                        <TIcon className="w-5 h-5 mx-auto mb-1" style={{ color: t.color }} />
                        <span className="text-xs text-gray-300">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={createProject} disabled={!newProjectName.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50">
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;

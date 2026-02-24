import React, { useState } from 'react';
import { 
  Search, Image, Video, Smile, Palette, Sparkles, ArrowRight, 
  Copy, Eye, Clock, Zap, TrendingUp, Play, Star, Filter
} from 'lucide-react';
import { WORKFLOW_TEMPLATES, NODE_TYPES, type Workflow } from '@/lib/nodeData';


const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Marketing: { icon: Image, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  Video: { icon: Video, color: 'text-red-400', bg: 'bg-red-500/10' },
  Viral: { icon: Smile, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  Brand: { icon: Palette, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  Ads: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  Research: { icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10' }
};

const TEMPLATE_IMAGES = [
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563870265_752e3107.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563872027_0f1dec47.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563881414_2b709336.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563822739_3f93c1d0.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563823200_71ded830.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563824102_cf13d25e.jpg',
];

interface TemplateGalleryProps {
  onSelectTemplate: (template: Workflow) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<Workflow | null>(null);

  const categories = ['all', ...Object.keys(CATEGORY_CONFIG)];

  const filteredTemplates = WORKFLOW_TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#0d0d1a] rounded-xl border border-gray-800/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Copy className="w-5 h-5 text-cyan-400" />
              Workflow Templates
            </h2>
            <p className="text-sm text-gray-500 mt-1">Ready-made workflows — clone and customize in seconds</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                    : 'bg-gray-800/30 text-gray-500 border border-gray-700/30 hover:text-gray-300'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((template, index) => {
          const catConfig = CATEGORY_CONFIG[template.category] || CATEGORY_CONFIG.Marketing;
          const CatIcon = catConfig.icon;
          const imageUrl = TEMPLATE_IMAGES[index % TEMPLATE_IMAGES.length];

          return (
            <div
              key={template.id}
              className="group bg-[#1a1a2e]/80 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => setPreviewTemplate(template)}
            >
              {/* Template image */}
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <div className={`px-2 py-1 rounded-md ${catConfig.bg} backdrop-blur-sm flex items-center gap-1.5`}>
                    <CatIcon className={`w-3 h-3 ${catConfig.color}`} />
                    <span className={`text-[10px] font-bold ${catConfig.color}`}>{template.category}</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <div className="px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] text-gray-300">{template.nodes.length} nodes</span>
                  </div>
                </div>
              </div>

              {/* Template info */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-300 transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{template.description}</p>
                
                {/* Node flow preview */}
                <div className="flex items-center gap-1 overflow-hidden">
                  {template.nodes.slice(0, 5).map((node, i) => (
                    <React.Fragment key={node.id}>
                      <div className="w-6 h-6 rounded bg-gray-800/80 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full" style={{ 
                          backgroundColor: ['#3b82f6', '#f59e0b', '#ec4899', '#06b6d4', '#22c55e', '#8b5cf6'][i % 6] 
                        }} />
                      </div>
                      {i < Math.min(template.nodes.length - 1, 4) && (
                        <ArrowRight className="w-3 h-3 text-gray-700 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                  {template.nodes.length > 5 && (
                    <span className="text-[10px] text-gray-600 ml-1">+{template.nodes.length - 5}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-t border-gray-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>~2 min setup</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectTemplate(template); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 text-xs font-medium hover:bg-purple-600/30 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Use Template
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/50 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{previewTemplate.name}</h3>
                <button onClick={() => setPreviewTemplate(null)} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                  <span className="text-gray-400 text-sm">Close</span>
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-6">{previewTemplate.description}</p>

              {/* Workflow steps */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Workflow Steps</h4>
                {previewTemplate.nodes.map((node, i) => {
                  const nt = NODE_TYPES.find((t) => t.id === node.nodeTypeId);

                  return (
                    <div key={node.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: nt?.color || '#6366f1' }}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{nt?.name || 'Node'}</div>
                        <div className="text-xs text-gray-500">{nt?.description || ''}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => { onSelectTemplate(previewTemplate); setPreviewTemplate(null); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;

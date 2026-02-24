import React, { useState } from 'react';
import { 
  Search, Zap, TrendingUp, Users, Image, Video, FileText, MessageSquare, 
  Mic, Music, Smile, Palette, Maximize2, Type, HardDrive, Share2, 
  Bot, Sparkles, Brain, Film, Flame, ChevronDown, ChevronRight,
  GripVertical
} from 'lucide-react';
import { NODE_TYPES, CATEGORY_COLORS, type NodeType } from '@/lib/nodeData';

const ICON_MAP: Record<string, React.ElementType> = {
  Search, Zap, TrendingUp, Users, Image, Video, FileText, MessageSquare,
  Mic, Music, Smile, Palette, Maximize2, Type, HardDrive, Share2,
  Bot, Sparkles, Brain, Film, Clapperboard: Film, Flame
};



const CATEGORY_LABELS: Record<string, string> = {
  research: 'Research',
  create: 'Create',
  brand: 'Brand',
  export: 'Export',
  ai: 'AI Models'
};

interface NodePaletteProps {
  onAddNode: (nodeTypeId: string) => void;
  searchQuery?: string;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode, searchQuery = '' }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['research', 'create', 'brand', 'export', 'ai'])
  );
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filteredNodes = NODE_TYPES.filter(nt => 
    nt.name.toLowerCase().includes(localSearch.toLowerCase()) ||
    nt.description.toLowerCase().includes(localSearch.toLowerCase())
  );

  const categories = ['research', 'create', 'brand', 'export', 'ai'];

  return (
    <div className="w-64 bg-[#12121f] border-r border-gray-800/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <h3 className="text-sm font-bold text-white mb-3">Node Library</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Node categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {categories.map(category => {
          const catNodes = filteredNodes.filter(nt => nt.category === category);
          if (catNodes.length === 0) return null;
          const colors = CATEGORY_COLORS[category];
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${colors.bg} hover:opacity-80 transition-opacity`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                  {CATEGORY_LABELS[category]}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">{catNodes.length}</span>
                  {isExpanded ? (
                    <ChevronDown className={`w-3.5 h-3.5 ${colors.text}`} />
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 ${colors.text}`} />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-1 space-y-0.5 pl-1">
                  {catNodes.map(nodeType => {
                    const Icon = ICON_MAP[nodeType.icon] || Sparkles;
                    return (
                      <button
                        key={nodeType.id}
                        onClick={() => onAddNode(nodeType.id)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group text-left"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <GripVertical className="w-3 h-3 text-gray-700 group-hover:text-gray-500 flex-shrink-0" />
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: nodeType.color + '15' }}
                          >
                            <Icon className="w-3.5 h-3.5" style={{ color: nodeType.color }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-gray-300 group-hover:text-white truncate">
                              {nodeType.name}
                            </div>
                            <div className="text-[10px] text-gray-600 truncate">
                              {nodeType.description.substring(0, 35)}...
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom info */}
      <div className="p-3 border-t border-gray-800/50">
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
          <Sparkles className="w-3 h-3" />
          <span>{NODE_TYPES.length} nodes available</span>
        </div>
      </div>
    </div>
  );
};

export default NodePalette;

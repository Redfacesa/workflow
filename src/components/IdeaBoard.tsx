import React, { useState } from 'react';
import { 
  Bookmark, BookmarkCheck, Edit3, RefreshCw, Combine, Sparkles, 
  Zap, Eye, MessageSquare, Target, Film, Smile, Filter, Search,
  ThumbsUp, ArrowUpRight, X
} from 'lucide-react';
import { SAMPLE_IDEA_CARDS, type IdeaCard } from '@/lib/nodeData';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  hook: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Hook' },
  visual: { icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Visual' },
  cta: { icon: Target, color: 'text-green-400', bg: 'bg-green-500/10', label: 'CTA' },
  angle: { icon: ArrowUpRight, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Ad Angle' },
  script: { icon: Film, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Script' },
  meme: { icon: Smile, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Meme' }
};

interface IdeaBoardProps {
  onUseIdea?: (idea: IdeaCard) => void;
}

const IdeaBoard: React.FC<IdeaBoardProps> = ({ onUseIdea }) => {
  const [cards, setCards] = useState<IdeaCard[]>(SAMPLE_IDEA_CARDS);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const toggleSave = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, isSaved: !c.isSaved } : c));
  };

  const startEdit = (card: IdeaCard) => {
    setEditingCard(card.id);
    setEditText(card.title);
  };

  const saveEdit = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, title: editText } : c));
    setEditingCard(null);
  };

  const filteredCards = cards.filter(c => {
    const matchesFilter = filter === 'all' || c.type === filter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const types = ['all', 'hook', 'visual', 'cta', 'angle', 'script', 'meme'];

  return (
    <div className="bg-[#0d0d1a] rounded-xl border border-gray-800/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Idea Board
            </h2>
            <p className="text-sm text-gray-500 mt-1">What's working — extracted from competitor analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{filteredCards.length} ideas</span>
            <span className="text-xs text-gray-700">|</span>
            <span className="text-xs text-purple-400">{cards.filter(c => c.isSaved).length} saved</span>
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
              placeholder="Search ideas..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {types.map(type => {
              const config = type === 'all' ? null : TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === type 
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                      : 'bg-gray-800/30 text-gray-500 border border-gray-700/30 hover:text-gray-300'
                  }`}
                >
                  {type === 'all' ? 'All' : config?.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCards.map(card => {
          const config = TYPE_CONFIG[card.type];
          const Icon = config.icon;
          const isEditing = editingCard === card.id;

          return (
            <div
              key={card.id}
              className="group bg-[#1a1a2e]/80 rounded-xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-200 overflow-hidden"
            >
              {/* Card header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`px-2 py-1 rounded-md ${config.bg} flex items-center gap-1.5`}>
                    <Icon className={`w-3 h-3 ${config.color}`} />
                    <span className={`text-[10px] font-bold ${config.color}`}>{config.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i < Math.ceil(card.score / 2) ? 'bg-purple-500' : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500 ml-1">{card.score}/10</span>
                  </div>
                </div>

                {/* Title */}
                {isEditing ? (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-2 py-1 bg-gray-800 border border-purple-500/50 rounded text-sm text-white focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(card.id)} className="text-green-400 hover:text-green-300">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingCard(null)} className="text-gray-500 hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{card.title}</h3>
                )}

                <p className="text-xs text-gray-500 leading-relaxed">{card.content}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {card.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-800/50 text-[10px] text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card actions */}
              <div className="px-4 py-2.5 border-t border-gray-800/30 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleSave(card.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      card.isSaved ? 'text-purple-400 bg-purple-500/10' : 'text-gray-600 hover:text-gray-400'
                    }`}
                    title={card.isSaved ? 'Unsave' : 'Save'}
                  >
                    {card.isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => startEdit(card)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 transition-colors"
                    title="Remix"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => onUseIdea?.(card)}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 text-[10px] font-medium hover:bg-purple-600/30 transition-colors"
                >
                  Use in Workflow
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IdeaBoard;

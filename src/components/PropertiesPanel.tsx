import React, { useState } from 'react';
import { 
  X, Settings, Trash2, Copy, Play, ChevronDown,
  Search, Zap, TrendingUp, Users, Image, Video, FileText, MessageSquare, 
  Mic, Music, Smile, Palette, Maximize2, Type, HardDrive, Share2, 
  Bot, Sparkles, Brain, Film, Flame
} from 'lucide-react';
import { NODE_TYPES, type WorkflowNode, type NodeType } from '@/lib/nodeData';

const ICON_MAP: Record<string, React.ElementType> = {
  Search, Zap, TrendingUp, Users, Image, Video, FileText, MessageSquare,
  Mic, Music, Smile, Palette, Maximize2, Type, HardDrive, Share2,
  Bot, Sparkles, Brain, Film, Clapperboard: Film, Flame
};


interface PropertiesPanelProps {
  selectedNode: WorkflowNode | null;
  onClose: () => void;
  onUpdateSettings: (nodeId: string, settings: Record<string, any>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onRunNode: (nodeId: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onClose,
  onUpdateSettings,
  onDeleteNode,
  onDuplicateNode,
  onRunNode
}) => {
  if (!selectedNode) {
    return (
      <div className="w-72 bg-[#12121f] border-l border-gray-800/50 flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Settings className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Select a node to view its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const nodeType = NODE_TYPES.find(nt => nt.id === selectedNode.nodeTypeId);
  if (!nodeType) return null;

  const Icon = ICON_MAP[nodeType.icon] || Sparkles;

  return (
    <div className="w-72 bg-[#12121f] border-l border-gray-800/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Node Properties</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: nodeType.color + '20' }}
          >
            <Icon className="w-5 h-5" style={{ color: nodeType.color }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{nodeType.name}</h3>
            <p className="text-[10px] text-gray-500">{nodeType.category.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-3 border-b border-gray-800/50">
        <p className="text-xs text-gray-400 leading-relaxed">{nodeType.description}</p>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Configuration</h4>
        
        {nodeType.settings.map(setting => (
          <div key={setting.key}>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {setting.label}
            </label>
            {setting.type === 'select' ? (
              <div className="relative">
                <select
                  value={selectedNode.settings[setting.key] || setting.defaultValue || ''}
                  onChange={(e) => onUpdateSettings(selectedNode.id, { 
                    ...selectedNode.settings, 
                    [setting.key]: e.target.value 
                  })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 appearance-none focus:outline-none focus:border-purple-500/50"
                >
                  {setting.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>
            ) : setting.type === 'toggle' ? (
              <button
                onClick={() => onUpdateSettings(selectedNode.id, {
                  ...selectedNode.settings,
                  [setting.key]: !(selectedNode.settings[setting.key] ?? setting.defaultValue)
                })}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  (selectedNode.settings[setting.key] ?? setting.defaultValue) 
                    ? 'bg-purple-600' 
                    : 'bg-gray-700'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  (selectedNode.settings[setting.key] ?? setting.defaultValue) 
                    ? 'translate-x-5' 
                    : 'translate-x-0.5'
                }`} />
              </button>
            ) : setting.type === 'number' ? (
              <input
                type="number"
                value={selectedNode.settings[setting.key] || setting.defaultValue || 0}
                onChange={(e) => onUpdateSettings(selectedNode.id, {
                  ...selectedNode.settings,
                  [setting.key]: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-purple-500/50"
              />
            ) : setting.type === 'textarea' ? (
              <textarea
                value={selectedNode.settings[setting.key] || setting.defaultValue || ''}
                onChange={(e) => onUpdateSettings(selectedNode.id, {
                  ...selectedNode.settings,
                  [setting.key]: e.target.value
                })}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            ) : (
              <input
                type="text"
                value={selectedNode.settings[setting.key] || setting.defaultValue || ''}
                onChange={(e) => onUpdateSettings(selectedNode.id, {
                  ...selectedNode.settings,
                  [setting.key]: e.target.value
                })}
                placeholder={`Enter ${setting.label.toLowerCase()}...`}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
              />
            )}
          </div>
        ))}

        {/* I/O info */}
        <div className="pt-4 border-t border-gray-800/50">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Inputs / Outputs</h4>
          <div className="space-y-2">
            {nodeType.inputs.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500/30 border border-purple-500" />
                <span className="text-xs text-gray-400">Inputs: {nodeType.inputs.join(', ')}</span>
              </div>
            )}
            {nodeType.outputs.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500/30 border border-cyan-500" />
                <span className="text-xs text-gray-400">Outputs: {nodeType.outputs.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-800/50 space-y-2">
        <button
          onClick={() => onRunNode(selectedNode.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          Run This Node
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onDuplicateNode(selectedNode.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 text-xs hover:text-white transition-colors"
          >
            <Copy className="w-3 h-3" />
            Duplicate
          </button>
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;

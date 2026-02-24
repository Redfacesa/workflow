import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Search, Zap, TrendingUp, Users, Image, Video, FileText, MessageSquare, 
  Mic, Music, Smile, Palette, Maximize2, Type, HardDrive, Share2, 
  Bot, Sparkles, Brain, Film, Flame, Play, Square, 
  Settings, Trash2, Plus, GripVertical, ChevronDown, X, Check, AlertCircle, Loader
} from 'lucide-react';
import { NODE_TYPES, type WorkflowNode, type Connection, type NodeType } from '@/lib/nodeData';
import { executeWorkflow, registerDefaultExecutors, type NodeExecutionResult } from '@/lib/workflowEngine';
import { registerAllExecutors } from '@/lib/executors';
import { apiKeyManager } from '@/lib/apiKeyManager';

const ICON_MAP: Record<string, React.ElementType> = {
  Search, Zap, TrendingUp, Users, Image, Video, FileText, MessageSquare,
  Mic, Music, Smile, Palette, Maximize2, Type, HardDrive, Share2,
  Bot, Sparkles, Brain, Film, Clapperboard: Film, Flame
};



interface WorkflowCanvasProps {
  initialNodes?: WorkflowNode[];
  initialConnections?: Connection[];
  onNodesChange?: (nodes: WorkflowNode[]) => void;
  onRun?: () => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialNodes = [],
  initialConnections = [],
  onNodesChange,
  onRun
}) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ nodeId: string; outputIndex: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [runningNodes, setRunningNodes] = useState<Set<string>>(new Set());
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [executionResults, setExecutionResults] = useState<Map<string, NodeExecutionResult>>(new Map());
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorNodes, setErrorNodes] = useState<Set<string>>(new Set());
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [nodeMenuPos, setNodeMenuPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize executors on mount
  useEffect(() => {
    registerAllExecutors();
    registerDefaultExecutors();
  }, []);

  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
      setConnections(initialConnections);
    }
  }, [initialNodes, initialConnections]);

  const getNodeType = (nodeTypeId: string): NodeType | undefined => {
    return NODE_TYPES.find(nt => nt.id === nodeTypeId);
  };

  const getNodeCenter = (node: WorkflowNode) => {
    return { x: node.x + 100, y: node.y + 40 };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === svgRef.current) {
      setSelectedNode(null);
      if (e.button === 0) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
      }
    }
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom;
    setMousePos({ x, y });

    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }

    if (draggingNode) {
      setNodes(prev => prev.map(n => 
        n.id === draggingNode 
          ? { ...n, x: x - dragOffset.x, y: y - dragOffset.y }
          : n
      ));
    }
  }, [isPanning, panStart, draggingNode, dragOffset, canvasOffset, zoom]);

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNode(null);
    setConnecting(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom;

    setDraggingNode(nodeId);
    setDragOffset({ x: x - node.x, y: y - node.y });
    setSelectedNode(nodeId);
  };

  const handleOutputClick = (e: React.MouseEvent, nodeId: string, outputIndex: number) => {
    e.stopPropagation();
    setConnecting({ nodeId, outputIndex });
  };

  const handleInputClick = (e: React.MouseEvent, nodeId: string, inputIndex: number) => {
    e.stopPropagation();
    if (connecting && connecting.nodeId !== nodeId) {
      const newConn: Connection = {
        id: `c-${Date.now()}`,
        fromNodeId: connecting.nodeId,
        toNodeId: nodeId,
        fromOutput: connecting.outputIndex,
        toInput: inputIndex
      };
      setConnections(prev => [...prev, newConn]);
      setConnecting(null);
    }
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    setSelectedNode(null);
  };

  const addNode = (nodeTypeId: string, x?: number, y?: number) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      nodeTypeId,
      x: x || nodeMenuPos.x || 400,
      y: y || nodeMenuPos.y || 200,
      settings: {}
    };
    setNodes(prev => [...prev, newNode]);
    setShowNodeMenu(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom;
    setNodeMenuPos({ x, y });
    setShowNodeMenu(true);
  };

  const simulateRun = async () => {
    if (nodes.length === 0) return;
    
    setIsExecuting(true);
    setRunningNodes(new Set());
    setCompletedNodes(new Set());
    setErrorNodes(new Set());
    setExecutionResults(new Map());

    try {
      // Initialize and get API keys
      await apiKeyManager.initialize();
      const apiKeys = apiKeyManager.getAllKeys();

      await executeWorkflow(
        nodes,
        connections,
        (result: NodeExecutionResult) => {
          // Update UI as each node completes
          if (result.status === 'success') {
            setRunningNodes(prev => {
              const next = new Set(prev);
              next.delete(result.nodeId);
              return next;
            });
            setCompletedNodes(prev => new Set([...prev, result.nodeId]));
          } else if (result.status === 'error') {
            setRunningNodes(prev => {
              const next = new Set(prev);
              next.delete(result.nodeId);
              return next;
            });
            setErrorNodes(prev => new Set([...prev, result.nodeId]));
          }

          // Store the result
          setExecutionResults(prev => {
            const next = new Map(prev);
            next.set(result.nodeId, result);
            return next;
          });
        },
        apiKeys
      );
    } catch (err) {
      console.error('Workflow execution failed:', err);
      alert(`Workflow error: ${err}`);
    } finally {
      setIsExecuting(false);
      if (onRun) onRun();
    }
  };

  const renderConnection = (conn: Connection) => {
    const fromNode = nodes.find(n => n.id === conn.fromNodeId);
    const toNode = nodes.find(n => n.id === conn.toNodeId);
    if (!fromNode || !toNode) return null;

    const fromX = fromNode.x + 200;
    const fromY = fromNode.y + 40;
    const toX = toNode.x;
    const toY = toNode.y + 40;
    const midX = (fromX + toX) / 2;

    const isActive = runningNodes.has(conn.fromNodeId) || runningNodes.has(conn.toNodeId);
    const isComplete = completedNodes.has(conn.fromNodeId) && completedNodes.has(conn.toNodeId);

    return (
      <g key={conn.id}>
        <path
          d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
          fill="none"
          stroke={isComplete ? '#22c55e' : isActive ? '#a855f7' : '#374151'}
          strokeWidth={2}
          strokeDasharray={isActive ? '8 4' : 'none'}
          className={isActive ? 'animate-dash' : ''}
        />
        {isActive && (
          <circle r={4} fill="#a855f7">
            <animateMotion
              dur="1s"
              repeatCount="indefinite"
              path={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
            />
          </circle>
        )}
      </g>
    );
  };

  const renderNode = (node: WorkflowNode) => {
    const nodeType = getNodeType(node.nodeTypeId);
    if (!nodeType) return null;

    const IconComponent = ICON_MAP[nodeType.icon] || Sparkles;
    const isSelected = selectedNode === node.id;
    const isRunning = runningNodes.has(node.id);
    const isComplete = completedNodes.has(node.id);
    const hasError = errorNodes.has(node.id);
    const result = executionResults.get(node.id);

    return (
      <div
        key={node.id}
        className={`absolute select-none transition-shadow duration-200 ${draggingNode === node.id ? 'z-50' : 'z-10'}`}
        style={{ left: node.x, top: node.y, width: 200 }}
        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
      >
        <div className={`
          rounded-xl border-2 transition-all duration-200 cursor-grab active:cursor-grabbing
          ${isSelected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700/50 hover:border-gray-600'}
          ${isRunning ? 'border-purple-500 shadow-lg shadow-purple-500/30 animate-pulse' : ''}
          ${hasError ? 'border-red-500/50 shadow-lg shadow-red-500/10' : ''}
          ${isComplete && !hasError ? 'border-green-500/50 shadow-lg shadow-green-500/10' : ''}
          bg-[#1a1a2e]/95 backdrop-blur-sm
        `}>
          {/* Node header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-700/30">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: nodeType.color + '20' }}
            >
              <IconComponent className="w-4 h-4" style={{ color: nodeType.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{nodeType.name}</div>
              <div className="text-[10px] text-gray-500 truncate">{nodeType.description.substring(0, 30)}...</div>
            </div>
            {isRunning && (
              <Loader className="w-4 h-4 text-purple-500 animate-spin" />
            )}
            {isComplete && !hasError && (
              <Check className="w-4 h-4 text-green-500" />
            )}
            {hasError && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>

          {/* Node settings preview */}
          <div className="px-3 py-2 space-y-1">
            {nodeType.settings.slice(0, 2).map(setting => (
              <div key={setting.key} className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">{setting.label}</span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {node.settings[setting.key] || setting.defaultValue || '—'}
                </span>
              </div>
            ))}
          </div>

          {/* Error message display */}
          {hasError && result?.error && (
            <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/20">
              <p className="text-[10px] text-red-400">{result.error}</p>
            </div>
          )}

          {/* Execution result display */}
          {result && result.status === 'success' && (
            <div className="px-3 py-2 bg-green-500/5 border-t border-green-500/20">
              <div className="text-[10px] text-green-400 space-y-1">
                {Object.entries(result.outputs).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-1">
                    <span className="text-gray-500">→</span>
                    <span className="truncate">
                      {typeof value === 'string' ? value.substring(0, 30) : JSON.stringify(value).substring(0, 30)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input ports */}
          {nodeType.inputs.length > 0 && (
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {nodeType.inputs.map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all
                    ${connecting ? 'border-purple-500 bg-purple-500/30 scale-125' : 'border-gray-600 bg-gray-800 hover:border-purple-400'}
                  `}
                  onClick={(e) => handleInputClick(e, node.id, i)}
                />
              ))}
            </div>
          )}

          {/* Output ports */}
          {nodeType.outputs.length > 0 && (
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {nodeType.outputs.map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all
                    ${connecting?.nodeId === node.id ? 'border-green-500 bg-green-500/30' : 'border-gray-600 bg-gray-800 hover:border-cyan-400 hover:bg-cyan-500/20'}
                  `}
                  onClick={(e) => handleOutputClick(e, node.id, i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Delete button on selected */}
        {isSelected && (
          <button
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 transition-colors z-50"
            onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-[#0d0d1a] overflow-hidden rounded-xl border border-gray-800/50">
      {/* Canvas toolbar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setNodeMenuPos({ x: 300, y: 200 }); setShowNodeMenu(true); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Node
          </button>
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
            className="px-2 py-2 rounded-lg bg-gray-800/80 border border-gray-700/50 text-gray-400 hover:text-white transition-colors text-sm"
          >
            +
          </button>
          <span className="text-xs text-gray-500 px-1">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.3))}
            className="px-2 py-2 rounded-lg bg-gray-800/80 border border-gray-700/50 text-gray-400 hover:text-white transition-colors text-sm"
          >
            -
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={simulateRun}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 transition-all text-sm shadow-lg shadow-green-500/20"
          >
            {isExecuting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Workflow
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <div
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '3000px',
            height: '2000px',
            position: 'relative'
          }}
        >
          {/* Grid dots */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.05)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Connections SVG */}
          <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            {connections.map(renderConnection)}
            {/* Active connection line */}
            {connecting && (
              <path
                d={`M ${nodes.find(n => n.id === connecting.nodeId)!.x + 200} ${nodes.find(n => n.id === connecting.nodeId)!.y + 40} 
                    C ${mousePos.x} ${nodes.find(n => n.id === connecting.nodeId)!.y + 40}, 
                      ${nodes.find(n => n.id === connecting.nodeId)!.x + 200} ${mousePos.y}, 
                      ${mousePos.x} ${mousePos.y}`}
                fill="none"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="8 4"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map(renderNode)}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">Double-click to add nodes</p>
                <p className="text-gray-600 text-sm mt-1">or use the Add Node button above</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Node menu popup */}
      {showNodeMenu && (
        <div className="absolute inset-0 z-40" onClick={() => setShowNodeMenu(false)}>
          <div 
            className="absolute bg-[#1a1a2e] border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 w-72 max-h-96 overflow-y-auto"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-700/30">
              <p className="text-sm font-semibold text-white">Add Node</p>
              <p className="text-xs text-gray-500">Click a node to add it to the canvas</p>
            </div>
            {['research', 'create', 'brand', 'export', 'ai'].map(category => (
              <div key={category} className="p-2">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 px-2 mb-1 font-bold">
                  {category}
                </p>
                {NODE_TYPES.filter(nt => nt.category === category).map(nt => {
                  const Icon = ICON_MAP[nt.icon] || Sparkles;
                  return (
                    <button
                      key={nt.id}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                      onClick={() => addNode(nt.id)}
                    >
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: nt.color + '20' }}>
                        <Icon className="w-3 h-3" style={{ color: nt.color }} />
                      </div>
                      <span className="text-xs text-gray-300">{nt.name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS for dash animation */}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -24; }
        }
        .animate-dash {
          animation: dash 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WorkflowCanvas;

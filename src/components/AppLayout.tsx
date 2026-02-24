import React, { useState, useCallback, useEffect } from 'react';
import { 
  Sparkles, Menu, X, Layers, Search, Image, Smile, 
  LayoutDashboard, BookOpen, User, ChevronDown, Bell,
  Settings, LogOut, Zap, HardDrive, FolderOpen, BarChart3,
  Calendar, Bot, Check, Clock, Loader2, Cloud
} from 'lucide-react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import PricingSection from './PricingSection';
import Footer from './Footer';
import DashboardView from './DashboardView';
import WorkflowCanvas from './WorkflowCanvas';
import NodePalette from './NodePalette';
import PropertiesPanel from './PropertiesPanel';
import CompetitorAnalysis from './CompetitorAnalysis';
import IdeaBoard from './IdeaBoard';
import TemplateGallery from './TemplateGallery';
import CreationStudio from './CreationStudio';
import SignInModal from './SignInModal';
import SettingsView from './SettingsView';
import ProjectsView from './ProjectsView';
import AnalyticsView from './AnalyticsView';
import SchedulingView from './SchedulingView';
import AIAssistant from './AIAssistant';
import DriveView from './DriveView';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { WORKFLOW_TEMPLATES, NODE_TYPES, type WorkflowNode, type Connection, type Workflow } from '@/lib/nodeData';

type AppView = 'landing' | 'dashboard' | 'workflow' | 'analysis' | 'ideas' | 'templates' | 'studio' | 'settings' | 'projects' | 'analytics' | 'schedule' | 'drive';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const AppLayout: React.FC = () => {
  const { user, profile, isAuthenticated, isLoading: authLoading, signOut, driveConnected } = useAuth();

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [showSignIn, setShowSignIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Workflow builder state
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
  const [workflowConnections, setWorkflowConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');

  // Handle password reset and drive_connected from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      setCurrentView('settings');
      window.history.replaceState({}, '', '/');
    }
    if (params.get('drive_connected') === 'true') {
      // User just connected Google Drive, navigate to Drive view
      setCurrentView('drive');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Redirect to dashboard after auth
  useEffect(() => {
    if (isAuthenticated && currentView === 'landing') {
      // Don't auto-redirect, let user choose
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    if (data && data.length > 0) {
      setNotifications(data);
    } else {
      setNotifications([
        { id: '1', title: 'Welcome to RedFace!', message: 'Your AI creative workspace is ready.', type: 'success', is_read: false, created_at: new Date().toISOString() },
      ]);
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    if (user) await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user.id);
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    if (user) await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navigateTo = useCallback((view: string) => {
    if (view === 'pricing') {
      if (currentView === 'landing') {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setCurrentView('landing');
        setTimeout(() => {
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }
    setCurrentView(view as AppView);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigateTo('dashboard');
    } else {
      setShowSignIn(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('landing');
    setShowUserMenu(false);
  };

  const handleSelectTemplate = (template: Workflow) => {
    setWorkflowNodes(template.nodes);
    setWorkflowConnections(template.connections);
    setWorkflowName(template.name);
    navigateTo('workflow');
  };

  const handleAddNode = (nodeTypeId: string) => {
    const existingNodes = workflowNodes.length;
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      nodeTypeId,
      x: 150 + (existingNodes % 4) * 250,
      y: 150 + Math.floor(existingNodes / 4) * 150,
      settings: {}
    };
    setWorkflowNodes(prev => [...prev, newNode]);
  };

  const selectedNode = workflowNodes.find(n => n.id === selectedNodeId) || null;

  const handleUpdateSettings = (nodeId: string, settings: Record<string, any>) => {
    setWorkflowNodes(prev => prev.map(n => n.id === nodeId ? { ...n, settings } : n));
  };

  const handleDeleteNode = (nodeId: string) => {
    setWorkflowNodes(prev => prev.filter(n => n.id !== nodeId));
    setWorkflowConnections(prev => prev.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    setSelectedNodeId(null);
  };

  const handleDuplicateNode = (nodeId: string) => {
    const node = workflowNodes.find(n => n.id === nodeId);
    if (node) {
      const newNode: WorkflowNode = { ...node, id: `node-${Date.now()}`, x: node.x + 50, y: node.y + 50 };
      setWorkflowNodes(prev => [...prev, newNode]);
    }
  };

  // Derived user display info
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator';
  const displayEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const credits = profile?.credits ?? 1000;

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'workflow', label: 'Workflows', icon: Layers },
    { id: 'analysis', label: 'Research', icon: Search },
    { id: 'ideas', label: 'Ideas', icon: Zap },
    { id: 'studio', label: 'Studio', icon: Image },
    { id: 'templates', label: 'Templates', icon: BookOpen },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'drive', label: 'Drive', icon: HardDrive },
  ];

  const notifTypeColors: Record<string, string> = {
    success: 'bg-green-500', info: 'bg-blue-500', warning: 'bg-yellow-500', error: 'bg-red-500',
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Top navigation bar
  const renderNavbar = () => (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${
      currentView === 'landing' ? 'bg-[#0a0a1a]/80' : 'bg-[#0a0a1a]'
    } backdrop-blur-xl border-b border-gray-800/50`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'landing')} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black text-white hidden sm:block">RedFace</span>
            </button>

            {/* Nav items (logged in) */}
            {(isAuthenticated || currentView !== 'landing') && (
              <div className="hidden xl:flex items-center gap-0.5 ml-6">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isDrive = item.id === 'drive';
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        currentView === item.id
                          ? 'bg-purple-600/20 text-purple-300'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                      {isDrive && driveConnected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {currentView === 'landing' && !isAuthenticated && (
              <>
                <button onClick={() => navigateTo('workflow')} className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors">
                  Features
                </button>
                <button onClick={() => navigateTo('templates')} className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors">
                  Templates
                </button>
                <button onClick={() => navigateTo('pricing')} className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors">
                  Pricing
                </button>
              </>
            )}

            {authLoading ? (
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                {/* Credits */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">{credits} credits</span>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                    className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-gray-400" />
                    {unreadCount > 0 && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white">{unreadCount}</span>
                      </div>
                    )}
                  </button>

                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                      <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a2e] border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-gray-800/50 flex items-center justify-between">
                          <p className="text-sm font-bold text-white">Notifications</p>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[10px] text-purple-400 hover:text-purple-300">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map(notif => (
                            <button
                              key={notif.id}
                              onClick={() => markNotificationRead(notif.id)}
                              className={`w-full flex items-start gap-3 p-3 text-left hover:bg-white/[0.02] transition-colors border-b border-gray-800/20 ${
                                !notif.is_read ? 'bg-purple-500/5' : ''
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notifTypeColors[notif.type] || 'bg-gray-500'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium ${notif.is_read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                <p className="text-[10px] text-gray-600 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{timeAgo(notif.created_at)}
                                </p>
                              </div>
                              {!notif.is_read && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />}
                            </button>
                          ))}
                        </div>
                        {notifications.length === 0 && (
                          <div className="p-6 text-center">
                            <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">No notifications</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <ChevronDown className="w-3 h-3 text-gray-500 hidden sm:block" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1a2e] border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-gray-800/50">
                          <p className="text-sm font-medium text-white truncate">{displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.min((credits / 1000) * 100, 100)}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-500">{credits}</span>
                          </div>
                        </div>
                        <div className="p-1">
                          <button onClick={() => { navigateTo('dashboard'); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </button>
                          <button onClick={() => { navigateTo('projects'); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors">
                            <FolderOpen className="w-4 h-4" /> My Projects
                          </button>
                          <button onClick={() => { navigateTo('analytics'); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors">
                            <BarChart3 className="w-4 h-4" /> Analytics
                          </button>
                          <button onClick={() => { navigateTo('schedule'); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors">
                            <Calendar className="w-4 h-4" /> Schedule
                          </button>
                          <button onClick={() => { navigateTo('drive'); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors">
                            <HardDrive className="w-4 h-4" /> Google Drive
                            {driveConnected && <div className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto" />}
                          </button>
                          <button onClick={() => { navigateTo('settings'); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors">
                            <Settings className="w-4 h-4" /> Settings
                          </button>
                        </div>
                        <div className="p-1 border-t border-gray-800/50">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSignIn(true)}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0a0a1a] border-t border-gray-800/50 p-4 space-y-1 max-h-[70vh] overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isDrive = item.id === 'drive';
            return (
              <button
                key={item.id}
                onClick={() => { navigateTo(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  currentView === item.id
                    ? 'bg-purple-600/20 text-purple-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {isDrive && driveConnected && <div className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto" />}
              </button>
            );
          })}
          <div className="border-t border-gray-800/50 pt-2 mt-2">
            <button onClick={() => { navigateTo('settings'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.03]">
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  // Render the current view
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <div className="bg-[#0a0a1a]">
            <HeroSection 
              onGetStarted={handleGetStarted} 
              onWatchDemo={() => navigateTo('workflow')} 
            />
            <FeaturesSection onNavigate={navigateTo} />
            <PricingSection onSelectPlan={() => handleGetStarted()} />
            <Footer onNavigate={navigateTo} />
          </div>
        );

      case 'dashboard':
        return (
          <div className="pt-16 min-h-screen bg-[#0a0a1a]">
            <DashboardView onNavigate={navigateTo} />
          </div>
        );

      case 'projects':
        return (
          <div className="pt-16 min-h-screen bg-[#0a0a1a]">
            <ProjectsView onNavigate={navigateTo} />
          </div>
        );

      case 'workflow':
        return (
          <div className="pt-16 h-screen bg-[#0a0a1a] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800/50 bg-[#0d0d1a]">
              <div className="flex items-center gap-3">
                <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)}
                  className="bg-transparent text-white font-bold text-sm focus:outline-none border-b border-transparent hover:border-gray-700 focus:border-purple-500 px-1 py-0.5" />
                <span className="text-[10px] text-gray-600 bg-gray-800/50 px-2 py-0.5 rounded">{workflowNodes.length} nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setWorkflowNodes([]); setWorkflowConnections([]); setWorkflowName('Untitled Workflow'); }}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white border border-gray-700/50 hover:border-gray-600 transition-colors">Clear</button>
                <button className="px-3 py-1.5 rounded-lg text-xs text-gray-300 bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors">Save</button>
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <NodePalette onAddNode={handleAddNode} />
              <div className="flex-1">
                <WorkflowCanvas initialNodes={workflowNodes} initialConnections={workflowConnections} onNodesChange={setWorkflowNodes} />
              </div>
              <PropertiesPanel selectedNode={selectedNode} onClose={() => setSelectedNodeId(null)} onUpdateSettings={handleUpdateSettings}
                onDeleteNode={handleDeleteNode} onDuplicateNode={handleDuplicateNode} onRunNode={(nodeId) => console.log('Running node:', nodeId)} />
            </div>
          </div>
        );

      case 'analysis':
        return (<div className="pt-16 min-h-screen bg-[#0a0a1a]"><div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><CompetitorAnalysis /></div></div>);
      case 'ideas':
        return (<div className="pt-16 min-h-screen bg-[#0a0a1a]"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><IdeaBoard onUseIdea={() => navigateTo('workflow')} /></div></div>);
      case 'templates':
        return (<div className="pt-16 min-h-screen bg-[#0a0a1a]"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><TemplateGallery onSelectTemplate={handleSelectTemplate} /></div></div>);
      case 'studio':
        return (<div className="pt-16 min-h-screen bg-[#0a0a1a]"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><CreationStudio /></div></div>);
      case 'settings':
        return (<div className="pt-16 min-h-screen bg-[#0a0a1a]"><SettingsView onNavigate={navigateTo} /></div>);
      case 'analytics':
        return (<div className="pt-16 min-h-screen bg-[#0a0a1a]"><AnalyticsView /></div>);
      case 'schedule':
        return (<div className="pt-16 min-h-screen bg-[#0a0a1a]"><SchedulingView /></div>);
      case 'drive':
        return (<div className="pt-16 min-h-screen bg-[#0a0a1a]"><DriveView onNavigate={navigateTo} /></div>);
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {renderNavbar()}
      {renderView()}
      <SignInModal 
        isOpen={showSignIn} 
        onClose={() => setShowSignIn(false)}
        onSuccess={() => {
          setShowSignIn(false);
          navigateTo('dashboard');
        }}
      />
      {isAuthenticated && <AIAssistant />}
    </div>
  );
};

export default AppLayout;

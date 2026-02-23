import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive, FolderOpen, ArrowLeft, RefreshCw, Upload, Plus,
  Trash2, ExternalLink, Grid3X3, List, Search, X, Loader2,
  Image, Video, FileText, File, Music, Code, ChevronRight,
  Download, Eye, FolderPlus, Check, AlertCircle, Cloud,
  ArrowRight, Settings, Layers
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  checkDriveConnection,
  setupDriveFolders,
  listDriveFiles,
  uploadToDrive,
  createDriveFolder,
  deleteDriveFile,
  getDriveQuota,
  formatBytes,
  getFileTypeInfo,
  timeAgo,
  type DriveFile,
  type DriveQuota,
} from '@/lib/driveHelpers';

interface DriveViewProps {
  onNavigate: (view: string) => void;
  onImportToWorkflow?: (file: DriveFile) => void;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

const DriveView: React.FC<DriveViewProps> = ({ onNavigate, onImportToWorkflow }) => {
  const { driveConnected, connectGoogleDrive, disconnectGoogleDrive, checkDriveConnection: authCheckDrive } = useAuth();

  // Connection state
  const [isConnected, setIsConnected] = useState(driveConnected);
  const [driveUser, setDriveUser] = useState<{ displayName: string; emailAddress: string; photoLink?: string } | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);

  // File browser state
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [redfaceFolderId, setRedfaceFolderId] = useState<string | null>(null);
  const [exportsFolderId, setExportsFolderId] = useState<string | null>(null);

  // Quota state
  const [quota, setQuota] = useState<DriveQuota | null>(null);

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<DriveFile | null>(null);

  // Upload state
  const [uploadName, setUploadName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadType, setUploadType] = useState('text/plain');
  const [isUploading, setIsUploading] = useState(false);

  // New folder state
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Action feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const result = await checkDriveConnection();
      setIsConnected(result.connected);
      if (result.connected) {
        setDriveUser(result.user || null);
        setRedfaceFolderId(result.redface_folder_id || null);
        setExportsFolderId(result.exports_folder_id || null);

        if (result.redface_folder_id) {
          setCurrentFolderId(result.redface_folder_id);
          setBreadcrumbs([{ id: result.redface_folder_id, name: 'RedFace' }]);
          await loadFiles(result.redface_folder_id);
        }

        // Load quota
        try {
          const q = await getDriveQuota();
          setQuota(q);
        } catch { /* ignore quota errors */ }
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      setIsConnected(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleSetupFolders = async () => {
    setIsSettingUp(true);
    try {
      const result = await setupDriveFolders();
      if (result.success) {
        setRedfaceFolderId(result.redface_folder_id);
        setExportsFolderId(result.exports_folder_id);
        setCurrentFolderId(result.redface_folder_id);
        setBreadcrumbs([{ id: result.redface_folder_id, name: 'RedFace' }]);
        await loadFiles(result.redface_folder_id);
        showFeedback('success', 'RedFace folders created in your Google Drive!');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to set up folders');
    } finally {
      setIsSettingUp(false);
    }
  };

  const loadFiles = async (folderId?: string) => {
    setIsLoading(true);
    try {
      const result = await listDriveFiles(folderId || currentFolderId || undefined);
      setFiles(result.files || []);
    } catch (err: any) {
      if (err.message?.includes('NOT_CONNECTED') || err.message?.includes('TOKEN_EXPIRED')) {
        setIsConnected(false);
        showFeedback('error', 'Google Drive connection expired. Please reconnect.');
      } else {
        showFeedback('error', err.message || 'Failed to load files');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToFolder = async (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
    await loadFiles(folderId);
  };

  const navigateToBreadcrumb = async (index: number) => {
    const crumb = breadcrumbs[index];
    setCurrentFolderId(crumb.id);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    await loadFiles(crumb.id);
  };

  const handleUpload = async () => {
    if (!uploadName.trim() || !uploadContent.trim()) return;
    setIsUploading(true);
    try {
      const result = await uploadToDrive(uploadName, uploadContent, uploadType, currentFolderId || undefined);
      if (result.success) {
        showFeedback('success', `"${uploadName}" uploaded successfully!`);
        setShowUploadModal(false);
        setUploadName('');
        setUploadContent('');
        await loadFiles(currentFolderId || undefined);
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      const result = await createDriveFolder(newFolderName, currentFolderId || undefined);
      if (result.success) {
        showFeedback('success', `Folder "${newFolderName}" created!`);
        setShowNewFolderModal(false);
        setNewFolderName('');
        await loadFiles(currentFolderId || undefined);
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteDriveFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setShowDeleteConfirm(null);
      showFeedback('success', 'File deleted');
    } catch (err: any) {
      showFeedback('error', err.message || 'Delete failed');
    }
  };

  const handleImport = (file: DriveFile) => {
    if (onImportToWorkflow) {
      onImportToWorkflow(file);
      showFeedback('success', `"${file.name}" imported to workflow!`);
    } else {
      onNavigate('workflow');
      showFeedback('success', `Navigate to Workflows to use "${file.name}"`);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive();
    setIsConnected(false);
    setDriveUser(null);
    setFiles([]);
    setBreadcrumbs([]);
    setCurrentFolderId(null);
    showFeedback('success', 'Google Drive disconnected');
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') return FolderOpen;
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('text') || mimeType.includes('document')) return FileText;
    if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('html')) return Code;
    return File;
  };

  // Not connected state
  if (isCheckingConnection) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Checking Google Drive connection...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-green-500/20 border border-blue-500/20 flex items-center justify-center mb-6">
            <HardDrive className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Connect Google Drive</h1>
          <p className="text-gray-400 text-center max-w-md mb-2">
            Save your AI-generated content directly to Google Drive. Access your creative assets from anywhere.
          </p>
          <p className="text-gray-500 text-sm text-center max-w-md mb-8">
            RedFace will create a dedicated folder structure in your Drive to organize all exports, images, scripts, and videos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl w-full">
            {[
              { icon: Cloud, title: 'Auto-Sync', desc: 'Generated content saves automatically to your Drive' },
              { icon: FolderOpen, title: 'Organized', desc: 'RedFace/Exports folder structure keeps things tidy' },
              { icon: Layers, title: 'Re-Import', desc: 'Bring Drive assets back into your workflows' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="p-4 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50 text-center">
                  <Icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white mb-1">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={connectGoogleDrive}
            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Connect with Google
          </button>

          <p className="text-[11px] text-gray-600 mt-4 text-center max-w-sm">
            We only request access to files created by RedFace (drive.file scope). We cannot see your other Drive files.
          </p>
        </div>
      </div>
    );
  }

  // Connected but no folder setup
  if (!redfaceFolderId) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Google Drive Connected!</h2>
          {driveUser && (
            <p className="text-gray-400 text-sm mb-6">Signed in as {driveUser.emailAddress}</p>
          )}
          <p className="text-gray-500 text-center max-w-md mb-8">
            Let's set up your RedFace folder structure in Google Drive. This creates a "RedFace" folder with an "Exports" subfolder.
          </p>
          <button
            onClick={handleSetupFolders}
            disabled={isSettingUp}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50"
          >
            {isSettingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderPlus className="w-5 h-5" />}
            {isSettingUp ? 'Creating Folders...' : 'Set Up RedFace Folders'}
          </button>
        </div>
      </div>
    );
  }

  // Main Drive browser
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Feedback toast */}
      {feedback && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-right ${
          feedback.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 p-0.5 hover:bg-white/10 rounded">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <HardDrive className="w-6 h-6 text-blue-400" />
            My Drive
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">
              Connected{driveUser ? ` as ${driveUser.emailAddress}` : ''}
            </span>
            {quota && (
              <span className="text-xs text-gray-600">
                · {formatBytes(quota.storageQuota.usage)} / {formatBytes(quota.storageQuota.limit)} used
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 text-xs hover:text-white hover:border-gray-600 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" /> New Folder
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-600/30 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
          <button
            onClick={() => loadFiles(currentFolderId || undefined)}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleDisconnect}
            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
            title="Disconnect Google Drive"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quota bar */}
      {quota && (
        <div className="mb-6 p-4 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Storage</span>
            <span className="text-xs text-gray-500">
              {formatBytes(quota.storageQuota.usage)} of {formatBytes(quota.storageQuota.limit)}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  (parseInt(quota.storageQuota.usage) / parseInt(quota.storageQuota.limit)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Breadcrumbs + Search + View toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-sm overflow-x-auto">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.id}>
              {i > 0 && <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />}
              <button
                onClick={() => navigateToBreadcrumb(i)}
                className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${
                  i === breadcrumbs.length - 1
                    ? 'text-white font-medium bg-gray-800/50'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
                }`}
              >
                {i === 0 && <HardDrive className="w-3 h-3 inline mr-1" />}
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-8 pr-3 py-2 w-48 bg-gray-800/30 border border-gray-700/50 rounded-lg text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-gray-800/30 rounded-lg border border-gray-700/50 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-purple-600/20 text-purple-300' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-purple-600/20 text-purple-300' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* File browser */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
          <p className="text-gray-500 text-sm">Loading files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#1a1a2e]/30 rounded-xl border border-gray-800/30">
          <FolderOpen className="w-16 h-16 text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium mb-1">
            {searchQuery ? 'No files match your search' : 'This folder is empty'}
          </p>
          <p className="text-gray-600 text-sm mb-6">
            {searchQuery ? 'Try a different search term' : 'Upload files or generate content to see them here'}
          </p>
          {!searchQuery && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 text-purple-300 text-sm hover:bg-purple-600/30 transition-colors"
              >
                <Upload className="w-4 h-4" /> Upload File
              </button>
              <button
                onClick={() => onNavigate('studio')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 text-gray-400 text-sm hover:text-white transition-colors"
              >
                <Layers className="w-4 h-4" /> Create Content
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredFiles.map(file => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            const typeInfo = getFileTypeInfo(file.mimeType);
            const FileIcon = getFileIcon(file.mimeType);

            return (
              <div
                key={file.id}
                className="group relative p-3 rounded-xl bg-[#1a1a2e]/60 border border-gray-800/50 hover:border-gray-700/50 transition-all cursor-pointer"
                onClick={() => {
                  if (isFolder) {
                    navigateToFolder(file.id, file.name);
                  } else {
                    setShowPreview(file);
                  }
                }}
              >
                {/* Thumbnail / Icon */}
                <div className="aspect-square rounded-lg overflow-hidden mb-2.5 flex items-center justify-center" style={{ backgroundColor: typeInfo.bgColor }}>
                  {file.thumbnailLink && !isFolder ? (
                    <img
                      src={file.thumbnailLink}
                      alt={file.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
                      }}
                    />
                  ) : (
                    <FileIcon className="w-10 h-10" style={{ color: typeInfo.color }} />
                  )}
                </div>

                {/* File info */}
                <p className="text-xs font-medium text-white truncate mb-0.5" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: typeInfo.bgColor, color: typeInfo.color }}>
                    {typeInfo.label}
                  </span>
                  {file.size && !isFolder && (
                    <span className="text-[10px] text-gray-600">{formatBytes(file.size)}</span>
                  )}
                </div>

                {/* Hover actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {!isFolder && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleImport(file); }}
                      className="p-1.5 rounded-lg bg-purple-600/80 text-white hover:bg-purple-500 transition-colors"
                      title="Import to workflow"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  )}
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-gray-700/80 text-white hover:bg-gray-600 transition-colors"
                      title="Open in Drive"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(file.id); }}
                    className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="bg-[#1a1a2e]/40 rounded-xl border border-gray-800/30 overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_120px_100px] gap-4 px-4 py-2.5 border-b border-gray-800/50 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            <span>Name</span>
            <span>Type</span>
            <span>Modified</span>
            <span className="text-right">Size</span>
          </div>
          {filteredFiles.map(file => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            const typeInfo = getFileTypeInfo(file.mimeType);
            const FileIcon = getFileIcon(file.mimeType);

            return (
              <div
                key={file.id}
                className="group grid grid-cols-[1fr_100px_120px_100px] gap-4 px-4 py-3 border-b border-gray-800/20 hover:bg-white/[0.02] transition-colors cursor-pointer items-center"
                onClick={() => {
                  if (isFolder) {
                    navigateToFolder(file.id, file.name);
                  } else {
                    setShowPreview(file);
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: typeInfo.bgColor }}>
                    <FileIcon className="w-4 h-4" style={{ color: typeInfo.color }} />
                  </div>
                  <span className="text-sm text-white truncate">{file.name}</span>
                </div>
                <span className="text-xs text-gray-500">{typeInfo.label}</span>
                <span className="text-xs text-gray-600">{file.modifiedTime ? timeAgo(file.modifiedTime) : '-'}</span>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-gray-600">{file.size ? formatBytes(file.size) : '-'}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    {!isFolder && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImport(file); }}
                        className="p-1 rounded hover:bg-purple-500/20 text-gray-500 hover:text-purple-400 transition-colors"
                        title="Import"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(file.id); }}
                      className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick folders */}
      {breadcrumbs.length === 1 && redfaceFolderId && !searchQuery && filteredFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-white mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {exportsFolderId && (
              <button
                onClick={() => navigateToFolder(exportsFolderId, 'Exports')}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#1a1a2e]/40 border border-gray-800/30 hover:border-gray-700/50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Exports</p>
                  <p className="text-[10px] text-gray-500">Generated content</p>
                </div>
              </button>
            )}
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="flex items-center gap-3 p-4 rounded-xl bg-[#1a1a2e]/40 border border-dashed border-gray-700/50 hover:border-purple-500/30 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">New Folder</p>
                <p className="text-[10px] text-gray-600">Organize your files</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/50 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-400" /> Upload to Drive
                </h3>
                <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-lg hover:bg-gray-800">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">File Name</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                  placeholder="e.g., campaign-script.txt"
                  className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Content Type</label>
                <select
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="text/plain">Plain Text (.txt)</option>
                  <option value="text/markdown">Markdown (.md)</option>
                  <option value="text/html">HTML (.html)</option>
                  <option value="application/json">JSON (.json)</option>
                  <option value="text/csv">CSV (.csv)</option>
                  <option value="text/css">CSS (.css)</option>
                  <option value="application/javascript">JavaScript (.js)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Content</label>
                <textarea
                  value={uploadContent}
                  onChange={e => setUploadContent(e.target.value)}
                  placeholder="Paste your content here..."
                  rows={8}
                  className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 resize-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Uploading to: {breadcrumbs.map(b => b.name).join(' / ') || 'RedFace'}</span>
              </div>

              <button
                onClick={handleUpload}
                disabled={isUploading || !uploadName.trim() || !uploadContent.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? 'Uploading...' : 'Upload to Google Drive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowNewFolderModal(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/50 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-yellow-400" /> New Folder
                </h3>
                <button onClick={() => setShowNewFolderModal(false)} className="p-2 rounded-lg hover:bg-gray-800">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="e.g., Campaign Assets"
                  className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
                  onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                />
              </div>

              <button
                onClick={handleCreateFolder}
                disabled={isCreatingFolder || !newFolderName.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreatingFolder ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                {isCreatingFolder ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/50 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">Delete File?</h3>
                <p className="text-sm text-gray-400 mt-1">This will permanently delete the file from your Google Drive.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowPreview(null)}>
          <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/50 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {(() => {
                  const typeInfo = getFileTypeInfo(showPreview.mimeType);
                  const FileIcon = getFileIcon(showPreview.mimeType);
                  return (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: typeInfo.bgColor }}>
                      <FileIcon className="w-4 h-4" style={{ color: typeInfo.color }} />
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{showPreview.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {getFileTypeInfo(showPreview.mimeType).label}
                    {showPreview.size && ` · ${formatBytes(showPreview.size)}`}
                    {showPreview.modifiedTime && ` · Modified ${timeAgo(showPreview.modifiedTime)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { handleImport(showPreview); setShowPreview(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 text-xs font-medium hover:bg-purple-600/30 transition-colors"
                >
                  <Download className="w-3 h-3" /> Import
                </button>
                {showPreview.webViewLink && (
                  <a
                    href={showPreview.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 text-xs hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> Open in Drive
                  </a>
                )}
                <button onClick={() => setShowPreview(null)} className="p-1.5 rounded-lg hover:bg-gray-800">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 flex items-center justify-center min-h-[300px]">
              {showPreview.thumbnailLink ? (
                <img
                  src={showPreview.thumbnailLink.replace('=s220', '=s800')}
                  alt={showPreview.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              ) : (
                <div className="text-center">
                  {(() => {
                    const typeInfo = getFileTypeInfo(showPreview.mimeType);
                    const FileIcon = getFileIcon(showPreview.mimeType);
                    return (
                      <>
                        <FileIcon className="w-20 h-20 mx-auto mb-4" style={{ color: typeInfo.color }} />
                        <p className="text-gray-400 text-sm">Preview not available</p>
                        <p className="text-gray-600 text-xs mt-1">Open in Google Drive to view this file</p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveView;

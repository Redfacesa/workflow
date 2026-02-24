import { supabase } from '@/lib/supabase';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  iconLink?: string;
  imageMediaMetadata?: {
    width?: number;
    height?: number;
  };
}

export interface DriveQuota {
  storageQuota: {
    limit: string;
    usage: string;
    usageInDrive: string;
    usageInDriveTrash: string;
  };
  user: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
}

export type DriveAction = 
  | 'store-token'
  | 'check-connection'
  | 'disconnect'
  | 'setup-folders'
  | 'list-files'
  | 'upload-file'
  | 'create-folder'
  | 'delete-file'
  | 'get-quota';

async function invokeDrive(action: DriveAction, body: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke('google-drive', {
    body: { action, ...body },
  });

  if (error) {
    // Check if it's a function invocation error with a response body
    const errMsg = typeof error === 'object' && error !== null 
      ? (error as any).message || JSON.stringify(error)
      : String(error);
    throw new Error(errMsg);
  }

  // Check for error in response data
  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function checkDriveConnection(): Promise<{
  connected: boolean;
  user?: { displayName: string; emailAddress: string; photoLink?: string };
  redface_folder_id?: string;
  exports_folder_id?: string;
}> {
  try {
    return await invokeDrive('check-connection');
  } catch {
    return { connected: false };
  }
}

export async function setupDriveFolders(): Promise<{
  success: boolean;
  redface_folder_id: string;
  exports_folder_id: string;
}> {
  return invokeDrive('setup-folders');
}

export async function listDriveFiles(folderId?: string, pageToken?: string, pageSize = 50): Promise<{
  files: DriveFile[];
  nextPageToken?: string;
  folder_id: string;
}> {
  return invokeDrive('list-files', {
    folder_id: folderId,
    page_token: pageToken,
    page_size: pageSize,
  });
}

export async function uploadToDrive(
  fileName: string,
  content: string,
  mimeType: string,
  folderId?: string,
  isBase64 = false
): Promise<{ success: boolean; file: DriveFile }> {
  const body: Record<string, any> = {
    file_name: fileName,
    mime_type: mimeType,
    folder_id: folderId,
  };

  if (isBase64) {
    body.base64_content = content;
  } else {
    body.content = content;
  }

  return invokeDrive('upload-file', body);
}

export async function createDriveFolder(
  folderName: string,
  parentId?: string
): Promise<{ success: boolean; folder: DriveFile }> {
  return invokeDrive('create-folder', {
    folder_name: folderName,
    parent_id: parentId,
  });
}

export async function deleteDriveFile(fileId: string): Promise<{ success: boolean }> {
  return invokeDrive('delete-file', { file_id: fileId });
}

export async function getDriveQuota(): Promise<DriveQuota> {
  return invokeDrive('get-quota');
}

// Helper to format bytes
export function formatBytes(bytes: number | string, decimals = 1): string {
  const b = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (b === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Helper to get file type icon/color
export function getFileTypeInfo(mimeType: string): { label: string; color: string; bgColor: string } {
  if (mimeType === 'application/vnd.google-apps.folder') {
    return { label: 'Folder', color: '#f59e0b', bgColor: '#f59e0b15' };
  }
  if (mimeType.startsWith('image/')) {
    return { label: 'Image', color: '#ec4899', bgColor: '#ec489915' };
  }
  if (mimeType.startsWith('video/')) {
    return { label: 'Video', color: '#ef4444', bgColor: '#ef444415' };
  }
  if (mimeType.startsWith('audio/')) {
    return { label: 'Audio', color: '#8b5cf6', bgColor: '#8b5cf615' };
  }
  if (mimeType.includes('pdf')) {
    return { label: 'PDF', color: '#ef4444', bgColor: '#ef444415' };
  }
  if (mimeType.includes('document') || mimeType.includes('text')) {
    return { label: 'Document', color: '#3b82f6', bgColor: '#3b82f615' };
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
    return { label: 'Spreadsheet', color: '#22c55e', bgColor: '#22c55e15' };
  }
  if (mimeType.includes('presentation')) {
    return { label: 'Slides', color: '#f97316', bgColor: '#f9731615' };
  }
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('html')) {
    return { label: 'Code', color: '#06b6d4', bgColor: '#06b6d415' };
  }
  return { label: 'File', color: '#6b7280', bgColor: '#6b728015' };
}

// Helper to get time ago string
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

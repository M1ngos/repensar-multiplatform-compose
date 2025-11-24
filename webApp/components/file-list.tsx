'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Trash2, File, Image, FileText, Eye } from 'lucide-react';
import { filesApi } from '@/lib/api/files';
import { FileUpload } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileListProps {
  files: FileUpload[];
  onDelete?: (fileId: number) => void;
  className?: string;
}

export function FileList({ files, onDelete, className }: FileListProps) {
  const t = useTranslations('Files.toast');
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-sky" />;
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileText className="h-5 w-5 text-sunset" />;
    }
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const handleDownload = (file: FileUpload) => {
    const url = filesApi.getFileUrl(file.file_path);
    window.open(url, '_blank');
  };

  const handleView = (file: FileUpload) => {
    const url = filesApi.getFileUrl(file.file_path);
    if (file.mime_type.startsWith('image/') || file.mime_type.includes('pdf')) {
      window.open(url, '_blank');
    } else {
      handleDownload(file);
    }
  };

  const handleDelete = async (fileId: number) => {
    try {
      await filesApi.deleteFile(fileId);
      onDelete?.(fileId);
      toast.success(t('deleteSuccess'));
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error(t('deleteError'));
    } finally {
      setDeleteFileId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (files.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg',
        className
      )}>
        <File className="h-12 w-12 text-muted-foreground/20 mb-2" />
        <p className="text-sm text-muted-foreground">No files attached</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-2', className)}>
        {files.map((file) => (
          <div
            key={file.id}
            className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            {file.mime_type.startsWith('image/') && file.thumbnail_path ? (
              <img
                src={filesApi.getFileUrl(file.thumbnail_path)}
                alt={file.filename}
                className="h-12 w-12 rounded object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                {getFileIcon(file.mime_type)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.filename}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(file.file_size)}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(file.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleView(file)}
                title="View"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDownload(file)}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteFileId(file.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteFileId !== null} onOpenChange={() => setDeleteFileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFileId && handleDelete(deleteFileId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, File, Image, FileText, Loader2 } from 'lucide-react';
import { filesApi } from '@/lib/api/files';
import { FileCategory, FileUpload as FileUploadType } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileUploadProps {
  category: FileCategory;
  projectId?: number;
  taskId?: number;
  volunteerId?: number;
  onUploadComplete?: (file: FileUploadType) => void;
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  category,
  projectId,
  taskId,
  volunteerId,
  onUploadComplete,
  maxSizeMB = 10,
  accept = 'image/*,application/pdf,.doc,.docx',
  multiple = false,
  className,
}: FileUploadProps) {
  const t = useTranslations('Files.toast');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      // Validate file sizes
      const oversizedFiles = fileArray.filter(f => f.size > maxSizeBytes);
      if (oversizedFiles.length > 0) {
        toast.error(t('sizeTooLarge', { size: maxSizeMB }));
        return;
      }

      if (!multiple && fileArray.length > 1) {
        toast.error(t('selectOneFile'));
        return;
      }

      setSelectedFiles(fileArray);

      // Auto-upload
      setUploading(true);
      try {
        for (const file of fileArray) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('category', category);
          if (projectId) formData.append('project_id', projectId.toString());
          if (taskId) formData.append('task_id', taskId.toString());
          if (volunteerId) formData.append('volunteer_id', volunteerId.toString());

          const uploadedFile = await filesApi.uploadFile(formData);
          onUploadComplete?.(uploadedFile);
          toast.success(t('uploadSuccess', { filename: file.name }));
        }
        setSelectedFiles([]);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(t('uploadError'));
      } finally {
        setUploading(false);
      }
    },
    [category, projectId, taskId, volunteerId, maxSizeMB, multiple, onUploadComplete, t]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading}
        />

        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-sm font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">
                {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">
                Max file size: {maxSizeMB}MB
              </p>
            </>
          )}
        </label>
      </div>

      {selectedFiles.length > 0 && !uploading && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Selected files:</p>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              <div className="text-muted-foreground">{getFileIcon(file)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

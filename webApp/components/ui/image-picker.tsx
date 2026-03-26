'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePlus, X, Loader2, Upload } from 'lucide-react';
import { filesApi } from '@/lib/api/files';
import { FileCategory } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/** Standard web image MIME types accepted by the picker */
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml';
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.webp,.svg';

interface ImagePickerProps {
    /** Current image URL (controlled) */
    value?: string;
    /** Called with the new URL after a successful upload, or '' when cleared */
    onChange: (url: string) => void;
    /** Optional label shown above the picker */
    label?: string;
    /** Category passed to the upload API (default: 'other') */
    category?: FileCategory;
    /** Additional class names for the wrapper div */
    className?: string;
    /** Whether the picker is disabled */
    disabled?: boolean;
}

/**
 * ImagePicker — inline image selector that uploads to the backend and
 * returns the resulting URL via onChange.
 *
 * Supports: JPEG, PNG, GIF, WebP, SVG
 * Max size: 10 MB (enforced server-side; client shows a friendly error)
 */
export function ImagePicker({
    value,
    onChange,
    label,
    category = FileCategory.OTHER,
    className,
    disabled = false,
}: ImagePickerProps) {
    const t = useTranslations('ImagePicker');
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    /** Resolve the URL to display in the preview */
    const previewUrl = localPreview ?? (value || null);
    const hasImage = !!previewUrl;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input so the same file can be re-selected after removal
        e.target.value = '';

        // Client-side size guard (10 MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error(t('tooLarge'));
            return;
        }

        // Show instant local preview while uploading
        const objectUrl = URL.createObjectURL(file);
        setLocalPreview(objectUrl);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);

            const uploaded = await filesApi.uploadFile(formData);

            // Use the URL as-is: if it is already absolute (http/https) keep it;
            // otherwise it is a relative path (e.g. /uploads/profile/image.jpg) that
            // will be served through the Next.js rewrite proxy — no base-URL injection needed.
            const absoluteUrl = uploaded.url;

            onChange(absoluteUrl);
            toast.success(t('uploadSuccess'));
        } catch (err) {
            console.error('Image upload failed:', err);
            toast.error(t('uploadError'));
            // Revert preview
            setLocalPreview(null);
        } finally {
            URL.revokeObjectURL(objectUrl);
            setLocalPreview(null);
            setUploading(false);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalPreview(null);
        onChange('');
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleClick = () => {
        if (!disabled && !uploading) inputRef.current?.click();
    };

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </p>
            )}

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept={`${ACCEPTED_TYPES},${ACCEPTED_EXTENSIONS}`}
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || uploading}
            />

            {hasImage ? (
                /* ── Preview mode ──────────────────────────────────────────── */
                <div className="relative group w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                        src={previewUrl!}
                        alt={t('preview')}
                        className="w-full max-h-48 object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                    />

                    {/* Overlay on hover */}
                    <div className={cn(
                        'absolute inset-0 flex items-center justify-center gap-2',
                        'bg-black/0 group-hover:bg-black/40 transition-all duration-200',
                        uploading && 'bg-black/40'
                    )}>
                        {uploading ? (
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleClick}
                                    disabled={disabled}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                    {t('change')}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleRemove}
                                    disabled={disabled}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    {t('remove')}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                /* ── Empty / picker mode ───────────────────────────────────── */
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={disabled || uploading}
                    className={cn(
                        'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed',
                        'py-8 px-4 text-sm text-muted-foreground transition-colors',
                        'hover:border-primary/50 hover:bg-muted/40 hover:text-foreground',
                        (disabled || uploading) && 'cursor-not-allowed opacity-60',
                    )}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span>{t('uploading')}</span>
                        </>
                    ) : (
                        <>
                            <ImagePlus className="h-8 w-8" />
                            <span className="font-medium">{t('select')}</span>
                            <span className="text-xs">{t('formats')}</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

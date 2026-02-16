'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { contactApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { Unauthorized } from '@/components/unauthorized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Mail, Eye, Trash2, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import type { ContactSubmission } from '@/lib/api/types';

export default function ContactSubmissionsPage() {
  const t = useTranslations('StaffMember.contactSubmissions');
  const { user, isAuthLoading } = useAuth();

  // Filters state
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<ContactSubmission | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch contact submissions
  const { data: submissionsData, mutate: refreshSubmissions, isLoading } = useSWR(
    user ? 'contact-submissions' : null,
    () => contactApi.listSubmissions({ limit: 100 })
  );

  // Filter submissions
  const filteredSubmissions = submissionsData?.items?.filter(submission => {
    // Status filter
    if (statusFilter === 'unread' && submission.is_read) return false;
    if (statusFilter === 'read' && !submission.is_read) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        submission.name?.toLowerCase().includes(query) ||
        submission.email?.toLowerCase().includes(query) ||
        submission.message?.toLowerCase().includes(query)
      );
    }

    return true;
  }) || [];

  // Permission check
  if (isAuthLoading) {
    return <LoadingSkeleton />;
  }

  if (!user || (user.user_type !== 'admin' && user.user_type !== 'staff_member')) {
    return <Unauthorized />;
  }

  // Handlers
  const handleViewDetails = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);

    // Mark as read if unread
    if (!submission.is_read) {
      handleMarkAsRead(submission);
    }
  };

  const handleMarkAsRead = async (submission: ContactSubmission) => {
    if (submission.is_read) return;

    try {
      await contactApi.markAsRead(submission.id);
      toast.success(t('messages.markedAsRead'));
      refreshSubmissions();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDeleteClick = (submission: ContactSubmission) => {
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!submissionToDelete) return;

    setIsProcessing(true);
    try {
      await contactApi.deleteSubmission(submissionToDelete.id);
      toast.success(t('messages.deleteSuccess'));
      refreshSubmissions();
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    } catch (error) {
      console.error('Failed to delete submission:', error);
      toast.error(t('messages.deleteError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('filters.search')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('filters.status')}</label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
                  <SelectItem value="unread">{t('filters.unread')}</SelectItem>
                  <SelectItem value="read">{t('filters.read')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('filters.search')}</label>
              <Input
                placeholder={t('filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                {t('filters.clearFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('title')}
            </div>
            <Badge variant="secondary">
              {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'submission' : 'submissions'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredSubmissions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <Mail className="h-12 w-12 text-muted-foreground" />
                <EmptyTitle>{t('empty.title')}</EmptyTitle>
                <EmptyDescription>{t('empty.description')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.date')}</TableHead>
                    <TableHead>{t('table.name')}</TableHead>
                    <TableHead>{t('table.email')}</TableHead>
                    <TableHead>{t('table.message')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead className="text-right">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id} className={!submission.is_read ? 'bg-muted/30' : ''}>
                      <TableCell className="font-medium">
                        {format(new Date(submission.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!submission.is_read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500" title="Unread" />
                          )}
                          {submission.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{submission.email}</TableCell>
                      <TableCell className="max-w-md truncate">{submission.message}</TableCell>
                      <TableCell>
                        <Badge variant={submission.is_read ? 'secondary' : 'default'}>
                          {submission.is_read ? t('statuses.read') : t('statuses.new')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(submission)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('viewDialog.title')}</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('viewDialog.from')}
                  </label>
                  <p className="text-sm">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('viewDialog.email')}
                  </label>
                  <p className="text-sm">{selectedSubmission.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('viewDialog.submittedOn')}
                </label>
                <p className="text-sm">
                  {format(new Date(selectedSubmission.created_at), 'MMMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('viewDialog.message')}
                </label>
                <p className="text-sm whitespace-pre-wrap mt-2 p-4 bg-muted rounded-lg">
                  {selectedSubmission.message}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <a href={`mailto:${selectedSubmission.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    {t('viewDialog.reply')}
                  </a>
                </Button>
                <Button onClick={() => setViewDialogOpen(false)}>
                  {t('viewDialog.close')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact submission from {submissionToDelete?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('actions.delete')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

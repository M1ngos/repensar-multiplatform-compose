'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { achievementsApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { Unauthorized } from '@/components/unauthorized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  DialogDescription,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Target, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import type { Achievement } from '@/lib/api/types';
import { AchievementType } from '@/lib/api/types';

type AchievementFormData = {
  name: string;
  description: string;
  achievement_type: AchievementType | '';
  target: number;
  points_reward: number;
  badge_id?: number;
};

const ACHIEVEMENT_TYPES = Object.values(AchievementType);

export default function AchievementManagementPage() {
  const t = useTranslations('Admin.achievements');
  const { user, isAuthLoading } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AchievementFormData>({
    name: '',
    description: '',
    achievement_type: '',
    target: 1,
    points_reward: 50,
  });

  // Fetch achievements
  const { data: achievements, mutate: refreshAchievements, isLoading } = useSWR(
    user ? 'achievements-admin' : null,
    () => achievementsApi.list()
  );

  // Permission check
  if (isAuthLoading) {
    return <LoadingSkeleton />;
  }

  if (!user || user.user_type !== 'admin') {
    return <Unauthorized />;
  }

  // Filter achievements
  const filteredAchievements = achievements?.filter(achievement => {
    if (typeFilter !== 'all' && achievement.achievement_type !== typeFilter) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        achievement.name?.toLowerCase().includes(query) ||
        achievement.description?.toLowerCase().includes(query) ||
        achievement.achievement_type?.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  // Get target from criteria
  const getTarget = (achievement: Achievement): number => {
    return (achievement.criteria as Record<string, number>)?.required ?? 0;
  };

  // Handlers
  const handleCreateClick = () => {
    setFormData({
      name: '',
      description: '',
      achievement_type: '',
      target: 1,
      points_reward: 50,
    });
    setCreateDialogOpen(true);
  };

  const handleEditClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setFormData({
      name: achievement.name,
      description: achievement.description || '',
      achievement_type: achievement.achievement_type,
      target: getTarget(achievement),
      points_reward: achievement.points_reward,
      badge_id: achievement.badge_id ?? undefined,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setDeleteDialogOpen(true);
  };

  const handleCreateAchievement = async () => {
    if (!formData.name || !formData.achievement_type || formData.target < 1) {
      toast.error(t('messages.fillRequired'));
      return;
    }

    setIsProcessing(true);
    try {
      await achievementsApi.create({
        name: formData.name,
        description: formData.description,
        achievement_type: formData.achievement_type as AchievementType,
        criteria: { required: formData.target },
        points_reward: formData.points_reward,
        badge_id: formData.badge_id ?? null,
        tracks_progress: true,
      });

      toast.success(t('messages.createSuccess'));
      refreshAchievements();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create achievement:', error);
      toast.error(t('messages.createError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateAchievement = async () => {
    if (!selectedAchievement || !formData.name || !formData.achievement_type) {
      toast.error(t('messages.fillRequired'));
      return;
    }

    setIsProcessing(true);
    try {
      await achievementsApi.update(selectedAchievement.id, {
        name: formData.name,
        description: formData.description,
        achievement_type: formData.achievement_type as AchievementType,
        criteria: { required: formData.target },
        points_reward: formData.points_reward,
        badge_id: formData.badge_id ?? null,
      });

      toast.success(t('messages.updateSuccess'));
      refreshAchievements();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update achievement:', error);
      toast.error(t('messages.updateError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAchievement = async () => {
    if (!selectedAchievement) return;

    setIsProcessing(true);
    try {
      await achievementsApi.delete(selectedAchievement.id);
      toast.success(t('messages.deleteSuccess'));
      refreshAchievements();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete achievement:', error);
      toast.error(t('messages.deleteError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
  };

  const AchievementForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name">{t('createDialog.nameLabel')} *</Label>
          <Input
            id="name"
            placeholder={t('createDialog.namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">{t('createDialog.descriptionLabel')}</Label>
          <Textarea
            id="description"
            placeholder={t('createDialog.descriptionPlaceholder')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="achievement_type">{t('createDialog.categoryLabel')} *</Label>
          <Select
            value={formData.achievement_type}
            onValueChange={(v) => setFormData({ ...formData, achievement_type: v as AchievementType })}
          >
            <SelectTrigger id="achievement_type">
              <SelectValue placeholder={t('createDialog.categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {ACHIEVEMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target">{t('createDialog.targetLabel')} *</Label>
          <Input
            id="target"
            type="number"
            min="1"
            placeholder={t('createDialog.targetPlaceholder')}
            value={formData.target}
            onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">{t('createDialog.pointsLabel')}</Label>
          <Input
            id="points"
            type="number"
            min="0"
            value={formData.points_reward}
            onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="badge">{t('createDialog.badgeLabel')}</Label>
          <Input
            id="badge"
            type="number"
            placeholder={t('createDialog.badgePlaceholder')}
            value={formData.badge_id || ''}
            onChange={(e) => setFormData({ ...formData, badge_id: e.target.value ? parseInt(e.target.value) : undefined })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createButton')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('searchTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t('searchLabel')}</Label>
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('categoryLabel')}</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {ACHIEVEMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                {t('clearFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Table */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredAchievements.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <Empty>
              <EmptyHeader>
                <Target className="h-12 w-12 text-muted-foreground" />
                <EmptyTitle>{t('noAchievementsTitle')}</EmptyTitle>
                <EmptyDescription>
                  {searchQuery || typeFilter !== 'all'
                    ? t('noAchievementsDescription')
                    : t('noAchievementsEmpty')}
                </EmptyDescription>
              </EmptyHeader>
              {!searchQuery && typeFilter === 'all' && (
                <Button onClick={handleCreateClick} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createButton')}
                </Button>
              )}
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.achievement')}</TableHead>
                    <TableHead>{t('table.category')}</TableHead>
                    <TableHead>{t('table.target')}</TableHead>
                    <TableHead>{t('table.pointsReward')}</TableHead>
                    <TableHead className="text-right">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAchievements.map((achievement) => (
                    <TableRow key={achievement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {achievement.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {achievement.achievement_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{getTarget(achievement)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {achievement.points_reward} {t('table.pts')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(achievement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(achievement)}
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
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('createDialog.title')}</DialogTitle>
            <DialogDescription>{t('createDialog.description')}</DialogDescription>
          </DialogHeader>
          <AchievementForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isProcessing}>
              {t('createDialog.cancelButton')}
            </Button>
            <Button onClick={handleCreateAchievement} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('createDialog.creating')}
                </>
              ) : (
                t('createDialog.createButton')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('editDialog.title')}</DialogTitle>
            <DialogDescription>{t('editDialog.description')}</DialogDescription>
          </DialogHeader>
          <AchievementForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isProcessing}>
              {t('createDialog.cancelButton')}
            </Button>
            <Button onClick={handleUpdateAchievement} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('editDialog.updating')}
                </>
              ) : (
                t('editDialog.updateButton')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description', { name: selectedAchievement?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>{t('deleteDialog.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAchievement}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('deleteDialog.deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('deleteDialog.deleteButton')}
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
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

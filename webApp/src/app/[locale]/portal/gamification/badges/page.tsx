'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { badgesApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { Unauthorized } from '@/components/unauthorized';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Award, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import type { Badge as BadgeType } from '@/lib/api/types';
import { BadgeCategory, BadgeRarity } from '@/lib/api/types';

const BADGE_CATEGORIES = Object.values(BadgeCategory);
const BADGE_RARITIES = Object.values(BadgeRarity);

type BadgeFormData = {
  name: string;
  description: string;
  category: BadgeCategory | '';
  rarity: BadgeRarity | '';
  color: string;
  points_value: number;
  icon_url: string;
};

export default function BadgeManagementPage() {
  const t = useTranslations('Admin.badges');
  const { user, isAuthLoading } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<BadgeFormData>({
    name: '',
    description: '',
    category: '',
    rarity: '',
    color: '#10b981',
    points_value: 10,
    icon_url: '',
  });

  // Fetch badges
  const { data: badges, mutate: refreshBadges, isLoading } = useSWR(
    user ? 'badges-admin' : null,
    () => badgesApi.list()
  );

  // Permission check
  if (isAuthLoading) {
    return <LoadingSkeleton />;
  }

  if (!user || user.user_type !== 'admin') {
    return <Unauthorized />;
  }

  // Filter badges
  const filteredBadges = badges?.filter(badge => {
    // Category filter
    if (categoryFilter !== 'all' && badge.category !== categoryFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        badge.name?.toLowerCase().includes(query) ||
        badge.description?.toLowerCase().includes(query) ||
        badge.category?.toLowerCase().includes(query)
      );
    }

    return true;
  }) || [];

  // Use enum categories
  const categories = BADGE_CATEGORIES;

  // Handlers
  const handleCreateClick = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      rarity: '',
      color: '#10b981',
      points_value: 10,
      icon_url: '',
    });
    setCreateDialogOpen(true);
  };

  const handleEditClick = (badge: BadgeType) => {
    setSelectedBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description || '',
      category: badge.category,
      rarity: badge.rarity,
      color: badge.color || '#10b981',
      points_value: badge.points_value,
      icon_url: badge.icon_url || '',
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (badge: BadgeType) => {
    setSelectedBadge(badge);
    setDeleteDialogOpen(true);
  };

  const handleCreateBadge = async () => {
    if (!formData.name || !formData.category || !formData.rarity) {
      toast.error(t('messages.fillRequired'));
      return;
    }

    setIsProcessing(true);
    try {
      await badgesApi.create({
        name: formData.name,
        description: formData.description,
        category: formData.category as BadgeCategory,
        rarity: formData.rarity as BadgeRarity,
        color: formData.color,
        points_value: formData.points_value,
        icon_url: formData.icon_url || '🏆',
      });

      toast.success(t('messages.createSuccess'));
      refreshBadges();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create badge:', error);
      toast.error(t('messages.createError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateBadge = async () => {
    if (!selectedBadge || !formData.name || !formData.category || !formData.rarity) {
      toast.error(t('messages.fillRequired'));
      return;
    }

    setIsProcessing(true);
    try {
      await badgesApi.update(selectedBadge.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category as BadgeCategory,
        rarity: formData.rarity as BadgeRarity,
        color: formData.color,
        points_value: formData.points_value,
        icon_url: formData.icon_url,
      });

      toast.success(t('messages.updateSuccess'));
      refreshBadges();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update badge:', error);
      toast.error(t('messages.updateError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBadge = async () => {
    if (!selectedBadge) return;

    setIsProcessing(true);
    try {
      await badgesApi.delete(selectedBadge.id);
      toast.success(t('messages.deleteSuccess'));
      refreshBadges();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete badge:', error);
      toast.error(t('messages.deleteError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
  };

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
            {/* Search */}
            <div className="space-y-2">
              <Label>{t('searchLabel')}</Label>
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>{t('categoryLabel')}</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                {t('clearFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Grid */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredBadges.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <Empty>
              <EmptyHeader>
                <Award className="h-12 w-12 text-muted-foreground" />
                <EmptyTitle>{t('noBadgesTitle')}</EmptyTitle>
                <EmptyDescription>
                  {searchQuery || categoryFilter !== 'all'
                    ? t('noBadgesDescription')
                    : t('noBadgesEmpty')}
                </EmptyDescription>
              </EmptyHeader>
              {!searchQuery && categoryFilter === 'all' && (
                <Button onClick={handleCreateClick} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createButton')}
                </Button>
              )}
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredBadges.map((badge) => (
            <Card key={badge.id}>
              <CardHeader>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="text-5xl">{badge.icon_url || '🏆'}</div>
                  <CardTitle className="text-lg">{badge.name}</CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {badge.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center mb-3">
                  {badge.description}
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{badge.points_value}</p>
                    <p className="text-xs text-muted-foreground">{t('points')}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold capitalize">{badge.rarity}</p>
                    <p className="text-xs text-muted-foreground">Rarity</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditClick(badge)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('editButton')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDeleteClick(badge)}
                >
                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                  {t('deleteButton')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Badge Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('createDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('createDialog.nameLabel')} *</Label>
              <Input
                id="name"
                placeholder={t('createDialog.namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('createDialog.descriptionLabel')}</Label>
              <Textarea
                id="description"
                placeholder={t('createDialog.descriptionPlaceholder')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t('createDialog.categoryLabel')} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as BadgeCategory })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={t('createDialog.categoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rarity">Rarity *</Label>
                <Select
                  value={formData.rarity}
                  onValueChange={(v) => setFormData({ ...formData, rarity: v as BadgeRarity })}
                >
                  <SelectTrigger id="rarity">
                    <SelectValue placeholder="Select rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_RARITIES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">{t('createDialog.pointsLabel')}</Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={formData.points_value}
                  onChange={(e) => setFormData({ ...formData, points_value: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">{t('createDialog.iconLabel')}</Label>
              <Input
                id="icon"
                placeholder={t('createDialog.iconPlaceholder')}
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isProcessing}>
              {t('createDialog.cancelButton')}
            </Button>
            <Button onClick={handleCreateBadge} disabled={isProcessing}>
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

      {/* Edit Badge Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('editDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t('createDialog.nameLabel')} *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">{t('createDialog.descriptionLabel')}</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">{t('createDialog.categoryLabel')} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as BadgeCategory })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-rarity">Rarity *</Label>
                <Select
                  value={formData.rarity}
                  onValueChange={(v) => setFormData({ ...formData, rarity: v as BadgeRarity })}
                >
                  <SelectTrigger id="edit-rarity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_RARITIES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-points">{t('createDialog.pointsLabel')}</Label>
                <Input
                  id="edit-points"
                  type="number"
                  min="0"
                  value={formData.points_value}
                  onChange={(e) => setFormData({ ...formData, points_value: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-icon">{t('createDialog.iconLabel')}</Label>
              <Input
                id="edit-icon"
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isProcessing}>
              {t('createDialog.cancelButton')}
            </Button>
            <Button onClick={handleUpdateBadge} disabled={isProcessing}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description', { name: selectedBadge?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>{t('deleteDialog.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBadge}
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
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-20 w-20 mx-auto rounded-full" />
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-5 w-20 mx-auto" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
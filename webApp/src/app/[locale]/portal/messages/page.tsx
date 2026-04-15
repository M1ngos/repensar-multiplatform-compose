'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { communicationApi, ConversationResponse } from '@/lib/api/communication';
import { usersApi } from '@/lib/api';
import type { UserSummary } from '@/lib/api/types';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { MessageSquare, Bell, Send, Pin, Clock, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

function formatMessageDate(dateStr: string): string {
    const date = parseISO(dateStr);
    if (isToday(date)) {
        return format(date, 'HH:mm');
    }
    if (isYesterday(date)) {
        return 'Yesterday';
    }
    return format(date, 'MMM dd');
}

export default function MessagesPage() {
    const { user } = useAuth();
    const t = useTranslations('Dashboard.messages');
    const [activeTab, setActiveTab] = useState('conversations');
    const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // New conversation dialog
    const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
    const [newConvTitle, setNewConvTitle] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch users for new conversation selection
    const { data: usersData } = useSWR(
        user?.id ? 'all-users-for-conversation' : null,
        () => usersApi.getUsers({ page_size: 100 })
    );

    const { data: conversations, isLoading: conversationsLoading, mutate: mutateConversations } = useSWR(
        user?.id ? 'my-conversations' : null,
        () => communicationApi.getConversations()
    );

    const { data: announcementsData, isLoading: announcementsLoading } = useSWR(
        user?.id ? 'my-announcements' : null,
        () => communicationApi.getAnnouncements()
    );

    const { data: messagesData, isLoading: messagesLoading, mutate: mutateMessages } = useSWR(
        selectedConversation?.id ? ['conversation-messages', selectedConversation.id] : null,
        () => selectedConversation ? communicationApi.getMessages(selectedConversation.id) : null
    );

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        setIsSending(true);
        try {
            await communicationApi.sendMessage(selectedConversation.id, {
                content: newMessage,
            });
            setNewMessage('');
            mutateMessages();
            mutateConversations();
            toast.success(t('messageSent'));
        } catch (_error) {
            toast.error(t('messageError'));
        } finally {
            setIsSending(false);
        }
    };

    const handleCreateConversation = async () => {
        if (selectedUsers.length === 0) {
            toast.error(t('conversations.selectUsers'));
            return;
        }

        setIsCreating(true);
        try {
            const newConv = await communicationApi.createConversation({
                type: selectedUsers.length > 1 ? 'group' : 'direct',
                title: newConvTitle || undefined,
                participant_ids: selectedUsers,
            });
            setIsNewConversationOpen(false);
            setNewConvTitle('');
            setSelectedUsers([]);
            mutateConversations();
            setSelectedConversation(newConv);
            toast.success(t('conversations.created'));
        } catch (_error) {
            toast.error(t('conversations.createError'));
        } finally {
            setIsCreating(false);
        }
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // Helper to get conversation display name
    const getConversationName = (conv: ConversationResponse) => {
        if (conv.title) return conv.title;
        // For direct messages, show other participant's name
        const otherParticipant = conv.participants.find(p => p.user_id !== user?.id);
        return otherParticipant?.user_name || `User ${otherParticipant?.user_id}` || t('conversations.direct');
    };

    // Mark messages as read when viewing a conversation
    useEffect(() => {
        if (selectedConversation && messagesData?.messages) {
            // Mark unread messages as read
            messagesData.messages.forEach(async (msg) => {
                if (msg.sender_id !== user?.id) {
                    try {
                        await communicationApi.markAsRead(selectedConversation.id, msg.id);
                    } catch (_e) {
                        // Ignore errors for mark as read
                    }
                }
            });
            // Refresh conversations to update unread count
            mutateConversations();
        }
    }, [selectedConversation, messagesData]);

    if (conversationsLoading || announcementsLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={t('title')}
                description={t('subtitle')}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 lg:w-auto">
                    <TabsTrigger value="conversations">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {t('tabs.conversations')}
                        {conversations && conversations.reduce((acc, c) => acc + c.unread_total, 0) > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                                {conversations?.reduce((acc, c) => acc + c.unread_total, 0)}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="announcements">
                        <Bell className="h-4 w-4 mr-2" />
                        {t('tabs.announcements')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="conversations" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    {t('conversations.new')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>{t('conversations.newTitle')}</DialogTitle>
                                    <DialogDescription>
                                        {t('conversations.newDesc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="conv-title">{t('conversations.groupName')}</Label>
                                        <Input
                                            id="conv-title"
                                            placeholder={t('conversations.groupNamePlaceholder')}
                                            value={newConvTitle}
                                            onChange={(e) => setNewConvTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('conversations.selectUsers')}</Label>
                                        <div className="border rounded-md max-h-60 overflow-y-auto space-y-1 p-2">
                                            {usersData?.data?.filter((u: UserSummary) => u.id !== user?.id).map((u: UserSummary) => (
                                                <div key={u.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer transition-colors" onClick={() => toggleUserSelection(u.id)}>
                                                    <Checkbox
                                                        checked={selectedUsers.includes(u.id)}
                                                        onCheckedChange={() => toggleUserSelection(u.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={u.profile_picture || undefined} />
                                                        <AvatarFallback>
                                                            {u.name?.charAt(0) || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{u.name}</p>
                                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedUsers.length} selected
                                    </span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setIsNewConversationOpen(false)}>
                                            {t('conversations.cancel')}
                                        </Button>
                                        <Button onClick={handleCreateConversation} disabled={isCreating || selectedUsers.length === 0}>
                                            {isCreating ? t('conversations.creating') : t('conversations.create')}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4 h-[600px]">
                        {/* Conversations List */}
                        <Card className="md:col-span-1 overflow-hidden">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-semibold">{t('conversations.title')}</CardTitle>
                            </CardHeader>
                            <ScrollArea className="h-[calc(100%-60px)]">
                                <CardContent className="p-2 space-y-1">
                                    {!conversations || conversations.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">{t('conversations.empty')}</p>
                                        </div>
                                    ) : (
                                        conversations.map((conv) => (
                                            <div
                                                key={conv.id}
                                                onClick={() => setSelectedConversation(conv)}
                                                className={`p-3 rounded-lg cursor-pointer transition-all ${
                                                    selectedConversation?.id === conv.id
                                                        ? 'bg-primary/10 border border-primary/20'
                                                        : 'hover:bg-muted/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {getConversationName(conv).charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {conv.unread_total > 0 && (
                                                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center">
                                                                {conv.unread_total > 9 ? '9+' : conv.unread_total}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium text-sm truncate">
                                                                {getConversationName(conv)}
                                                            </p>
                                                            {conv.last_message_at && (
                                                                <span className="text-xs text-muted-foreground shrink-0">
                                                                    {formatMessageDate(conv.last_message_at)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {conv.type === 'group' 
                                                                ? `${conv.participants.length} ${t('conversations.participants')}`
                                                                : t('conversations.direct')
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </ScrollArea>
                        </Card>

                        {/* Messages Area */}
                        <Card className="md:col-span-3 overflow-hidden">
                            {selectedConversation ? (
                                <>
                                    <CardHeader className="pb-3 border-b bg-muted/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {getConversationName(selectedConversation).charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-base">
                                                        {getConversationName(selectedConversation)}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground">
                                                        {selectedConversation.type === 'group'
                                                            ? `${selectedConversation.participants.length} ${t('conversations.participants')}`
                                                            : 'Direct message'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedConversation.type === 'group' && (
                                                <div className="flex -space-x-2">
                                                    {selectedConversation.participants.slice(0, 4).map((p) => (
                                                        <Avatar key={p.id} className="h-7 w-7 border-2 border-background">
                                                            <AvatarFallback className="text-xs">
                                                                {p.user_id}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                    {selectedConversation.participants.length > 4 && (
                                                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs">
                                                            +{selectedConversation.participants.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <ScrollArea className="h-[calc(100%-140px)]">
                                        <div className="p-4 space-y-4">
                                            {messagesLoading ? (
                                                <div className="space-y-4">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[70%] rounded-2xl p-3 ${i % 2 === 0 ? 'bg-muted' : 'bg-primary/10'}`}>
                                                                <Skeleton className="h-4 w-32 mb-2" />
                                                                <Skeleton className="h-3 w-16" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : messagesData?.messages.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                                                    <p className="text-muted-foreground">{t('conversations.noMessages')}</p>
                                                </div>
                                            ) : (
                                                messagesData?.messages.map((msg, idx) => {
                                                    const isOwn = msg.sender_id === user?.id;
                                                    const showAvatar = idx === 0 || messagesData.messages[idx - 1].sender_id !== msg.sender_id;
                                                    return (
                                                        <div
                                                            key={msg.id}
                                                            className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            {!isOwn && showAvatar && (
                                                                <Avatar className="h-8 w-8 mt-auto">
                                                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                                        {msg.sender_name?.charAt(0) || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                            {!isOwn && !showAvatar && <div className="w-8" />}
                                                            <div
                                                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                                                    isOwn
                                                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                                        : 'bg-muted rounded-bl-sm'
                                                                }`}
                                                            >
                                                                {!isOwn && showAvatar && (
                                                                    <p className="text-xs font-medium mb-1 text-muted-foreground">
                                                                        {msg.sender_name || `User ${msg.sender_id}`}
                                                                    </p>
                                                                )}
                                                                <p className="text-sm break-words">{msg.content}</p>
                                                                <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                                    <Clock className="h-3 w-3" />
                                                                    {format(parseISO(msg.created_at), 'MMM dd, HH:mm')}
                                                                    {msg.is_edited && <span className="italic">(edited)</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </ScrollArea>
                                    <div className="p-3 border-t bg-muted/30">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder={t('conversations.placeholder')}
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                                className="flex-1"
                                            />
                                            <Button
                                                onClick={handleSendMessage}
                                                disabled={isSending || !newMessage.trim()}
                                                size="icon"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold mb-2">{t('conversations.select')}</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs">
                                        Choose a conversation from the list to start messaging
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="announcements" className="space-y-4">
                    {!announcementsData?.announcements || announcementsData.announcements.length === 0 ? (
                        <Card className="p-8">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{t('announcements.empty')}</EmptyTitle>
                                    <EmptyDescription>
                                        No announcements to display
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {announcementsData.announcements.map((announcement) => (
                                <Card key={announcement.id} className={`overflow-hidden ${announcement.is_pinned ? 'border-l-4 border-l-primary' : ''}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {announcement.is_pinned && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Pin className="h-3 w-3" />
                                                        {t('announcements.pinned')}
                                                    </Badge>
                                                )}
                                                <CardTitle className="text-lg">{announcement.title}</CardTitle>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {announcement.priority === 10 && (
                                                    <Badge variant="destructive">Critical</Badge>
                                                )}
                                                {announcement.priority === 5 && (
                                                    <Badge variant="default">Important</Badge>
                                                )}
                                                {announcement.priority === 0 && (
                                                    <Badge variant="outline">Normal</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Avatar className="h-5 w-5">
                                                <AvatarFallback className="text-[10px]">
                                                    {announcement.creator_name?.charAt(0) || 'A'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{announcement.creator_name || 'Admin'}</span>
                                            <span>•</span>
                                            <Clock className="h-3 w-3" />
                                            <span>{format(parseISO(announcement.publish_at), 'MMM dd, yyyy • HH:mm')}</span>
                                        </div>
                                    </CardHeader>
                                    <Separator />
                                    <CardContent className="pt-4">
                                        <div className="prose prose-sm max-w-none">
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                                            <div className="flex items-center gap-2">
                                                {announcement.is_read ? (
                                                    <Badge variant="outline" className="gap-1">
                                                        <Bell className="h-3 w-3" />
                                                        {t('announcements.read')}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="default" className="gap-1">
                                                        <Bell className="h-3 w-3" />
                                                        New
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {announcement.expire_at 
                                                    ? `Expires: ${format(parseISO(announcement.expire_at), 'MMM dd, yyyy')}`
                                                    : 'No expiration'
                                                }
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
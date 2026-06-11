import React, { useState } from 'react';
import { Heart, ChatCircle, UserPlus, Bell, CircleNotch } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

export default function NotificationItem({ notification, onRead }) {
    const { sender, type, is_read, created_at, id } = notification;
    const [loading, setLoading] = useState(false);

    const iconMap = {
        like: { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/20' },
        comment: { icon: ChatCircle, color: 'text-blue-400', bg: 'bg-blue-500/20' },
        follow: { icon: UserPlus, color: 'text-teal-400', bg: 'bg-teal-500/20' },
    };

    const messageMap = {
        like: 'liked your post',
        comment: 'commented on your post',
        follow: 'started following you',
    };

    const handleRead = async () => {
        if (is_read || loading) return;
        setLoading(true);
        try {
            await onRead(id);
        } finally {
            setLoading(false);
        }
    };

    const avatar = sender?.profile?.profile_image;
    const meta = iconMap[type] || { icon: Bell, color: 'text-slate-400', bg: 'bg-white/10' };
    const Icon = meta.icon;

    return (
        <button
            onClick={handleRead}
            className={cn(
                'flex w-full items-center gap-4 border-b border-white/[0.04] px-6 py-4 text-left transition-all duration-200 hover:bg-white/[0.03]',
                !is_read && 'notif-unread bg-gradient-to-r from-violet-500/[0.04] to-transparent'
            )}
        >
            <div className="relative shrink-0">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 ring-2 ring-white/10">
                    {avatar ? (
                        <img src={avatar.startsWith('http') ? avatar : `/storage/${avatar}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-sm font-bold text-violet-300">{sender?.name?.charAt(0) || '?'}</span>
                    )}
                </div>
                <div className={cn('absolute -bottom-1 -right-1 rounded-full p-1', meta.bg)}>
                    <Icon className={cn('h-3 w-3', meta.color)} weight="fill" />
                </div>
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-300">
                    <span className="font-bold text-white">{sender?.name}</span>{' '}
                    {messageMap[type] || 'sent you a notification'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            {loading ? (
                <CircleNotch className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
            ) : !is_read ? (
                <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-blue-400 to-fuchsia-400" />
            ) : null}
        </button>
    );
}

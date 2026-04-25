import React, { useState } from 'react';
import { Heart, ChatCircle, UserPlus, Bell, CircleNotch } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

export default function NotificationItem({ notification, onRead }) {
    const { from_user, type, is_read, created_at, id } = notification;
    const [loading, setLoading] = useState(false);

    const iconMap = {
        like: <Heart className="h-4 w-4 text-rose-400" weight="fill" />,
        comment: <ChatCircle className="h-4 w-4 text-blue-400" weight="fill" />,
        follow: <UserPlus className="h-4 w-4 text-emerald-400" weight="fill" />,
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

    const avatar = from_user?.profile?.profile_image;

    return (
        <button
            onClick={handleRead}
            className={cn(
                "flex w-full items-center gap-4 px-6 py-4 text-left transition",
                is_read ? "bg-transparent hover:bg-slate-900/60" : "bg-emerald-600/5 hover:bg-emerald-600/10"
            )}
        >
            <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-800">
                    {avatar ? (
                        <img src={avatar.startsWith('http') ? avatar : `/storage/${avatar}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-sm font-semibold text-slate-300">{from_user?.name?.charAt(0) || '?'}</span>
                    )}
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-full border border-slate-900 bg-slate-900 p-1">
                    {iconMap[type] || <Bell className="h-4 w-4 text-slate-400" />}
                </div>
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-300">
                    <span className="font-semibold text-slate-100">{from_user?.name}</span>{' '}
                    {messageMap[type] || 'sent you a notification'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    {new Date(created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </div>

            {loading ? (
                <CircleNotch className="h-4 w-4 animate-spin text-slate-400" />
            ) : !is_read ? (
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
            ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            )}
        </button>
    );
}

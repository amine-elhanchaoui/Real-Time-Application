import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import NotificationItem from '../components/NotificationItem';
import { useEchoPrivate } from '../hooks/useEcho';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(response.data);
            setError('');

            // Automatically mark all notifications as read if any are unread
            if (response.data.some((item) => !item.is_read)) {
                await axios.post('/api/notifications/read-all', {}, { headers: { Authorization: `Bearer ${token}` } });
                setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
                window.dispatchEvent(new CustomEvent('unread-counts-updated'));
            }
        } catch (requestError) {
            console.error(requestError);
            setError('Unable to load notifications.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEchoPrivate(
        userId ? `App.Models.User.${userId}` : null,
        '.GotNewNotification',
        () => fetchNotifications(),
        Boolean(userId)
    );

    const handleRead = async (id) => {
        try {
            await axios.post(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setNotifications((items) => items.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
            window.dispatchEvent(new CustomEvent('unread-counts-updated'));
        } catch (requestError) {
            console.error(requestError);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <CircleNotch className="h-8 w-8 animate-spin text-violet-400" />
                <p className="text-sm text-slate-400">Loading alerts…</p>
            </div>
        );
    }

    const unreadCount = notifications.filter((item) => !item.is_read).length;

    return (
        <section className="surface-glow mx-auto max-w-2xl overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-white/[0.06] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20">
                        <Bell className="h-6 w-6 text-violet-400" weight="duotone" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Activity</p>
                        <h1 className="text-xl font-bold text-white">Notifications</h1>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/20 to-fuchsia-500/20 px-3 py-1 text-xs font-bold text-violet-300 ring-1 ring-violet-500/30">
                        {unreadCount} new
                    </span>
                )}
            </div>

            {error && (
                <div className="border-b border-white/[0.06] px-6 py-4">
                    <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                        <WarningCircle className="h-4 w-4" />
                        {error}
                        <button onClick={fetchNotifications} className="ml-auto font-semibold underline underline-offset-4">Retry</button>
                    </div>
                </div>
            )}

            <div>
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} onRead={handleRead} />
                    ))
                ) : !error ? (
                    <div className="px-6 py-16 text-center">
                        <Bell className="mx-auto h-12 w-12 text-violet-400/30" weight="duotone" />
                        <h2 className="mt-4 text-base font-bold text-white">All quiet</h2>
                        <p className="mt-2 text-sm text-slate-400">Notifications will appear here when someone interacts with you.</p>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

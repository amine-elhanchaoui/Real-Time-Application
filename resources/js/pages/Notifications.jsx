import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import NotificationItem from '../components/NotificationItem';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchNotifications();

        const userId = localStorage.getItem('user_id');
        if (window.Echo && userId) {
            const channel = window.Echo.private(`App.Models.User.${userId}`);
            const listener = () => fetchNotifications();
            channel.listen('.GotNewNotification', listener);
            return () => window.Echo.leaveChannel(`App.Models.User.${userId}`);
        }
    }, [token]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(response.data);
            setError('');
        } catch (requestError) {
            console.error(requestError);
            setError('Unable to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id) => {
        try {
            await axios.post(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((items) => items.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
        } catch (requestError) {
            console.error(requestError);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <CircleNotch className="h-8 w-8 animate-spin text-blue-400" />
                <p className="text-sm text-slate-400">Loading notifications...</p>
            </div>
        );
    }

    const unreadCount = notifications.filter((item) => !item.is_read).length;

    return (
        <section className="surface mx-auto max-w-3xl overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-emerald-600/10 p-3 text-emerald-400 shadow-sm">
                        <Bell className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-100">Notifications</h1>
                        <p className="text-sm text-slate-400">Important activity from your network.</p>
                    </div>
                </div>
                <div className="status-chip">{unreadCount} unread</div>
            </div>

            {error && (
                <div className="border-b border-slate-800 px-6 py-4">
                    <div className="surface-muted flex items-center gap-2 p-3 text-sm text-red-300">
                        <WarningCircle className="h-4 w-4" />
                        {error}
                        <button onClick={fetchNotifications} className="ml-auto text-white underline underline-offset-4">Retry</button>
                    </div>
                </div>
            )}

            <div className="divide-y divide-slate-800">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} onRead={handleRead} />
                    ))
                ) : !error ? (
                    <div className="px-6 py-12 text-center">
                        <h2 className="text-base font-semibold text-slate-100">No notifications yet</h2>
                        <p className="mt-2 text-sm text-slate-400">When someone interacts with your content, it will show up here.</p>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

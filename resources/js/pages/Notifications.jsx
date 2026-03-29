import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationItem from '../components/NotificationItem';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchNotifications();
        
        const userId = localStorage.getItem('user_id');
        if (window.Echo && userId) {
            window.Echo.private(`App.Models.User.${userId}`)
                .listen('GotNewNotification', (e) => {
                    fetchNotifications();
                });
                
            return () => window.Echo.leaveChannel(`App.Models.User.${userId}`);
        }
    }, [token]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRead = async (id) => {
        try {
            await axios.post(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <span className="px-2 py-1 bg-cyan-500/10 text-cyan-500 text-xs font-bold rounded-full border border-cyan-500/20">
                    {notifications.filter(n => !n.is_read).length} New
                </span>
            </div>
            <div className="divide-y divide-slate-800/50">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <NotificationItem 
                            key={notification.id} 
                            notification={notification} 
                            onRead={handleRead} 
                        />
                    ))
                ) : (
                    <div className="p-20 text-center">
                        <p className="text-slate-500 italic">No notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

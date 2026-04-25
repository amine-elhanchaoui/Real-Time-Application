import { useState, useEffect } from 'react';

export const usePresence = () => {
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!window.Echo || !token) {
            setOnlineUsers([]);
            return;
        }

        const channel = window.Echo.join('presence-online');

        channel
            .here((users) => {
                console.log('Online users initial list:', users);
                setOnlineUsers(users);
            })
            .joining((user) => {
                console.log('User joining:', user);
                setOnlineUsers((prev) => {
                    if (prev.some(u => u.id === user.id)) return prev;
                    return [...prev, user];
                });
            })
            .leaving((user) => {
                console.log('User leaving:', user);
                setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
            })
            .error((error) => {
                console.error('Presence channel error:', error);
            });

        return () => {
            window.Echo.leave('presence-online');
        };
    }, [window.Echo]);

    const isUserOnline = (userId) => {
        return onlineUsers.some((user) => (user.id === userId || user.id === parseInt(userId)));
    };

    return { onlineUsers, isUserOnline };
};

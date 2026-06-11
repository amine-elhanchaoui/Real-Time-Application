import React, { useEffect, useState } from 'react';

export default function ConnectionStatus() {
    const [status, setStatus] = useState('connecting');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            setStatus('offline');
            return;
        }

        const bindConnection = () => {
            const connection = window.Echo?.connector?.pusher?.connection;
            if (!connection) {
                setStatus('connecting');
                return null;
            }

            const onConnected = () => setStatus('connected');
            const onDisconnected = () => setStatus('disconnected');
            const onUnavailable = () => setStatus('disconnected');

            connection.bind('connected', onConnected);
            connection.bind('disconnected', onDisconnected);
            connection.bind('unavailable', onUnavailable);

            if (connection.state === 'connected') setStatus('connected');

            return () => {
                connection.unbind('connected', onConnected);
                connection.unbind('disconnected', onDisconnected);
                connection.unbind('unavailable', onUnavailable);
            };
        };

        let cleanup = bindConnection();
        if (!cleanup) {
            const timer = setInterval(() => {
                cleanup = bindConnection();
                if (cleanup) clearInterval(timer);
            }, 500);
            return () => {
                clearInterval(timer);
                cleanup?.();
            };
        }

        return cleanup;
    }, [token]);

    if (!token) return null;

    if (status === 'connected') {
        return (
            <span className="badge-live hidden sm:inline-flex">
                <span className="badge-live-dot" />
                Live
            </span>
        );
    }

    if (status === 'connecting') {
        return <span className="badge-offline hidden sm:inline-flex">Connecting…</span>;
    }

    return <span className="badge-offline hidden sm:inline-flex">Offline</span>;
}

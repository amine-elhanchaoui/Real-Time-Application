import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const handleAuthChange = () => {
            setToken(localStorage.getItem('token'));
        };
        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login');
    };

    React.useEffect(() => {
        if (!token) return;

        const fetchUnreadCount = async () => {
            try {
                const response = await axios.get('/api/notifications/unread-count', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUnreadCount(response.data.count);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUnreadCount();

        const userId = localStorage.getItem('user_id');
        if (window.Echo && userId) {
            window.Echo.private(`App.Models.User.${userId}`)
                .listen('GotNewNotification', (e) => {
                    setUnreadCount(prev => prev + 1);
                });
                
            return () => window.Echo.leaveChannel(`App.Models.User.${userId}`);
        }
    }, [token]);

    return (
        <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tighter">
                    Komuniziert
                </Link>
                <div className="flex items-center gap-6">
                    {token ? (
                        <>
                            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Feed</Link>
                            <Link to="/notifications" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </Link>
                            <Link to={`/profile/${localStorage.getItem('user_id')}`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                Profile
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-all"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                            <Link 
                                to="/register" 
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-semibold text-white transition-all"
                            >
                                Join Now
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

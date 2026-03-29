import React from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [unreadCount, setUnreadCount] = React.useState(0);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
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
        const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10s
        return () => clearInterval(interval);
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

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HouseLine, Bell, ChatCircleDots, User, SignOut, List, X, CircleNotch } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatUnread, setChatUnread] = useState(0);
    const [loadingCounts, setLoadingCounts] = useState(false);

    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('user_id');
    const isAuth = Boolean(token);

    useEffect(() => {
        if (!isAuth || !currentUserId) return;
        fetchUnread();

        if (window.Echo) {
            const channel = window.Echo.private(`App.Models.User.${currentUserId}`);
            const listener = () => fetchUnread();
            channel.listen('.GotNewNotification', listener).listen('.MessageSent', listener);
            return () => window.Echo.leaveChannel(`App.Models.User.${currentUserId}`);
        }
    }, [isAuth, currentUserId]);

    const fetchUnread = async () => {
        setLoadingCounts(true);
        try {
            const [notifRes, chatRes] = await Promise.all([
                axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/conversations', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setUnreadCount(notifRes.data.filter((item) => !item.is_read).length);
            setChatUnread(chatRes.data.reduce((total, item) => total + (item.unread_count || 0), 0));
        } catch (error) {
            console.error('Failed to fetch navbar counts', error);
        } finally {
            setLoadingCounts(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    const currentUserName = localStorage.getItem('user_name') || 'User';
    const profileImage = localStorage.getItem('profile_image');
    const navItems = [
        { path: '/', icon: HouseLine, label: 'Home', badge: 0 },
        { path: '/chat', icon: ChatCircleDots, label: 'Messages', badge: chatUnread },
        { path: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
        { path: `/profile/${currentUserId}`, icon: User, label: 'Profile', badge: 0 },
    ];

    return (
        <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-600/10 p-1 shadow-sm">
                        <img src="/storage/logo.jpeg" alt="Social Media App Logo" className="h-full w-full rounded-xl object-cover" />
                    </div>
                    <div>
                        <p className="text-base font-bold tracking-tight text-slate-100">Harmony</p>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500">Social Network</p>
                    </div>
                </Link>

                {isAuth && (
                    <div className="hidden items-center gap-2 md:flex">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const isProfile = item.label === 'Profile';
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                                        isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                    )}
                                >
                                    {isProfile && profileImage ? (
                                        <div className={cn("h-5 w-5 overflow-hidden rounded-full ring-2", isActive ? "ring-emerald-500" : "ring-slate-700")}>
                                            <img src={profileImage} alt="" className="h-full w-full object-cover" />
                                        </div>
                                    ) : (
                                        <item.icon weight={isActive ? 'fill' : 'regular'} className="h-5 w-5" />
                                    )}
                                    <span>{item.label}</span>
                                    {item.badge > 0 && (
                                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white shadow-lg shadow-emerald-600/20">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {!isAuth && (
                        <>
                            <button onClick={() => navigate('/login')} className="btn-outline px-4 py-2 text-sm">Login</button>
                            <button onClick={() => navigate('/register')} className="btn-primary px-4 py-2 text-sm">Create account</button>
                        </>
                    )}

                    {isAuth && (
                        <>
                            {loadingCounts && <CircleNotch className="hidden h-4 w-4 animate-spin text-slate-500 md:block" />}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen((value) => !value)}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-2 py-2 transition hover:border-slate-700"
                                >
                                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-800">
                                        {profileImage ? (
                                            <img src={profileImage} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="hidden text-left sm:block">
                                        <p className="max-w-[140px] truncate text-sm font-medium text-slate-100">{currentUserName}</p>
                                        <p className="text-xs text-slate-500">Signed in</p>
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 top-14 w-52 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl">
                                        <Link
                                            to={`/profile/${currentUserId}`}
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                        >
                                            <User className="h-4 w-4" />
                                            My profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                                        >
                                            <SignOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsMenuOpen((value) => !value)}
                                className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 md:hidden"
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isAuth && isMenuOpen && (
                <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-2 px-4 pb-4 sm:px-6 md:hidden lg:px-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm",
                                location.pathname === item.path
                                    ? "border-slate-700 bg-slate-900 text-white"
                                    : "border-slate-800 bg-slate-950 text-slate-400"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                {item.label === 'Profile' && profileImage ? (
                                    <img src={profileImage} alt="" className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-700" />
                                ) : (
                                    <item.icon className="h-5 w-5" />
                                )}
                                {item.label}
                            </span>
                            {item.badge > 0 && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white shadow-sm shadow-emerald-600/20">{item.badge}</span>}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}

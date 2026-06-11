import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HouseLine, Bell, ChatCircleDots, User, SignOut, List, X, CircleNotch } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { useEchoChannel } from '../hooks/useEcho';
import ConnectionStatus from './ConnectionStatus';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatUnread, setChatUnread] = useState(0);
    const [loadingCounts, setLoadingCounts] = useState(false);
    const [pingNotifications, setPingNotifications] = useState(false);
    const [pingMessages, setPingMessages] = useState(false);

    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('user_id');
    const isAuth = Boolean(token);

    const fetchUnread = useCallback(async () => {
        if (!token) return;
        setLoadingCounts(true);
        try {
            const [notifRes, chatRes] = await Promise.all([
                axios.get('/api/notifications/unread-count', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/messages/unread-count', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setUnreadCount(notifRes.data.count);
            setChatUnread(chatRes.data.count);
        } catch (error) {
            console.error('Failed to fetch navbar counts', error);
        } finally {
            setLoadingCounts(false);
        }
    }, [token]);

    useEffect(() => {
        if (!isAuth || !currentUserId) return;
        fetchUnread();
    }, [isAuth, currentUserId, fetchUnread]);

    useEffect(() => {
        if (!isAuth) return;
        const handleUpdate = () => {
            fetchUnread();
        };
        window.addEventListener('unread-counts-updated', handleUpdate);
        return () => window.removeEventListener('unread-counts-updated', handleUpdate);
    }, [isAuth, fetchUnread]);

    useEchoChannel(
        currentUserId ? `App.Models.User.${currentUserId}` : null,
        {
            '.GotNewNotification': () => {
                setPingNotifications(true);
                setTimeout(() => setPingNotifications(false), 600);
                fetchUnread();
            }
        },
        Boolean(isAuth && currentUserId)
    );

    useEchoChannel(
        currentUserId ? `chat.${currentUserId}` : null,
        {
            '.MessageSent': () => {
                setPingMessages(true);
                setTimeout(() => setPingMessages(false), 600);
                fetchUnread();
            }
        },
        Boolean(isAuth && currentUserId)
    );

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

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: '/', icon: HouseLine, label: 'Home', badge: 0 },
        { path: '/chat', icon: ChatCircleDots, label: 'Chat', badge: chatUnread },
        { path: '/notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
        { path: `/profile/${currentUserId}`, icon: User, label: 'Profile', badge: 0 },
    ];

    return (
        <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
            <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-3xl border border-white/[0.08] bg-[rgba(10,10,18,0.85)] px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:px-5">
                <Link to="/" className="group flex items-center gap-3">
                    <div className="logo-ring h-11 w-11 shrink-0">
                        <div className="logo-ring-inner h-full w-full">
                            <img src="/storage/logo.jpeg" alt="Harmony" className="h-full w-full rounded-[12px] object-cover" />
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-bold tracking-tight text-white">Harmony</p>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-400">Energy Network</p>
                    </div>
                </Link>

                {isAuth && (
                    <div className="hidden items-center gap-1 md:flex">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            const isProfile = item.label === 'Profile';
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn('nav-pill', active && 'nav-pill-active')}
                                >
                                    {isProfile && profileImage ? (
                                        <img src={profileImage} alt="" className={cn('h-5 w-5 rounded-full object-cover ring-2', active ? 'ring-violet-400' : 'ring-white/10')} />
                                    ) : (
                                        <item.icon weight={active ? 'fill' : 'regular'} className="h-4 w-4" />
                                    )}
                                    <span>{item.label}</span>
                                    {item.badge > 0 && (
                                        <span className={cn(
                                            "ml-0.5 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 px-1.5 py-0.5 text-[10px] font-bold text-white transition-all duration-300",
                                            item.label === 'Alerts' && pingNotifications && 'animate-badge-ping',
                                            item.label === 'Chat' && pingMessages && 'animate-badge-ping'
                                        )}>
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3">
                    <ConnectionStatus />

                    {!isAuth && (
                        <>
                            <button onClick={() => navigate('/login')} className="btn-ghost hidden sm:inline-flex">Login</button>
                            <button onClick={() => navigate('/register')} className="btn-primary px-4 py-2 text-sm">Join</button>
                        </>
                    )}

                    {isAuth && (
                        <>
                            {loadingCounts && <CircleNotch className="hidden h-4 w-4 animate-spin text-violet-400 md:block" />}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen((v) => !v)}
                                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition hover:border-white/20 hover:bg-white/[0.08]"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20">
                                        {profileImage ? (
                                            <img src={profileImage} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-4 w-4 text-violet-300" />
                                        )}
                                    </div>
                                    <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-200 sm:block">{currentUserName}</span>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 top-12 w-48 rounded-2xl border border-white/10 bg-[rgba(12,12,22,0.95)] p-1.5 shadow-2xl backdrop-blur-xl">
                                        <Link
                                            to={`/profile/${currentUserId}`}
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white"
                                        >
                                            <User className="h-4 w-4" />
                                            My profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                                        >
                                            <SignOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsMenuOpen((v) => !v)}
                                className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 md:hidden"
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {isAuth && isMenuOpen && (
                <div className="mx-auto mt-2 grid w-full max-w-6xl grid-cols-2 gap-2 rounded-3xl border border-white/[0.08] bg-[rgba(10,10,18,0.9)] p-3 backdrop-blur-xl md:hidden">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                'flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition',
                                isActive(item.path)
                                    ? 'border border-violet-500/30 bg-violet-500/10 text-white'
                                    : 'border border-white/[0.06] text-slate-400'
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </span>
                            {item.badge > 0 && (
                                <span className={cn(
                                    "rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 px-2 py-0.5 text-xs text-white transition-all duration-300",
                                    item.label === 'Alerts' && pingNotifications && 'animate-badge-ping',
                                    item.label === 'Chat' && pingMessages && 'animate-badge-ping'
                                )}>{item.badge}</span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}

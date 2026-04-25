import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CircleNotch, WarningCircle, UsersThree } from '@phosphor-icons/react';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { usePresence } from '../hooks/usePresence';

export default function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { onlineUsers } = usePresence();
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('user_id');
    const currentUserName = localStorage.getItem('user_name') || 'there';

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/api/posts', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const postsData = response.data.data || response.data;
            setPosts(Array.isArray(postsData) ? postsData : []);
        } catch (requestError) {
            console.error(requestError);
            setError('Unable to load the feed right now.');
        } finally {
            setLoading(false);
        }
    };

    const otherOnlineUsers = onlineUsers.filter((user) => String(user.id) !== String(currentUserId));

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
                <section className="surface p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-100">Welcome back, {currentUserName}</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                                Share an update, see what people posted, and jump into conversations without all the extra noise.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="status-chip">{posts.length} posts loaded</div>
                            <div className="status-chip">{otherOnlineUsers.length} online now</div>
                        </div>
                    </div>
                </section>

                <CreatePost onRefresh={fetchPosts} />

                {error && (
                    <div className="surface-muted flex items-center gap-3 p-4 text-red-300">
                        <WarningCircle className="h-5 w-5 shrink-0" />
                        <span className="text-sm">{error}</span>
                        <button onClick={fetchPosts} className="ml-auto text-sm text-white underline underline-offset-4">Retry</button>
                    </div>
                )}

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="section-title">Latest posts</h2>
                            <p className="section-copy">A clean feed with the most recent activity.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="surface flex min-h-[280px] flex-col items-center justify-center gap-4 p-10">
                            <CircleNotch className="h-8 w-8 animate-spin text-emerald-400" />
                            <p className="text-sm text-slate-400">Loading feed...</p>
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map((post) => <PostCard key={post.id} post={post} onRefresh={fetchPosts} />)
                    ) : !error ? (
                        <div className="surface p-10 text-center">
                            <h3 className="text-base font-semibold text-slate-100">No posts yet</h3>
                            <p className="mt-2 text-sm text-slate-400">Create the first post to start the conversation.</p>
                        </div>
                    ) : null}
                </section>
            </div>

            <aside className="space-y-6">
                <section className="surface p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-600/10 p-3 text-emerald-400 shadow-sm">
                            <UsersThree className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="section-title">Online now</h2>
                            <p className="section-copy">People you can message right away.</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {otherOnlineUsers.length > 0 ? (
                            otherOnlineUsers.slice(0, 8).map((user) => {
                                const image = user.profile?.profile_image;
                                const avatar = image ? `/storage/${image}` : null;
                                return (
                                    <Link
                                        key={user.id}
                                        to={`/profile/${user.id}`}
                                        className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-3 transition hover:border-slate-700 hover:bg-slate-900"
                                    >
                                        <div className="relative">
                                            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-800">
                                                {avatar ? (
                                                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-semibold text-slate-300">{user.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-slate-100">{user.name}</p>
                                            <p className="text-xs text-slate-500">Available for chat</p>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="surface-muted p-4 text-sm text-slate-400">Nobody else is online right now.</div>
                        )}
                    </div>
                </section>
            </aside>
        </div>
    );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkle, UsersThree } from '@phosphor-icons/react';
import CreatePost from '../components/CreatePost';
import InfinitePostList from '../components/InfinitePostList';
import { usePresence } from '../hooks/usePresence';

export default function Dashboard() {
    const [feedKey, setFeedKey] = useState(0);
    const { onlineUsers } = usePresence();
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('user_id');
    const currentUserName = localStorage.getItem('user_name') || 'there';

    const otherOnlineUsers = onlineUsers.filter((user) => String(user.id) !== String(currentUserId));

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-6">
                <section className="surface-glow overflow-hidden p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <Sparkle className="h-4 w-4 text-fuchsia-400" weight="fill" />
                                <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Your Feed</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">
                                Hey, <span className="text-gradient">{currentUserName}</span>
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                                Scroll for more posts. Like, comment, and chat in real time.
                            </p>
                        </div>
                        <div className="stat-card flex items-center gap-3 px-4 py-3">
                            <UsersThree className="h-5 w-5 text-teal-400" weight="duotone" />
                            <div>
                                <p className="text-lg font-bold text-white">{otherOnlineUsers.length}</p>
                                <p className="text-xs text-slate-500">Online now</p>
                            </div>
                        </div>
                    </div>
                </section>

                <CreatePost onRefresh={() => setFeedKey((k) => k + 1)} />

                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Infinite feed</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <InfinitePostList key={`${token}-${feedKey}`} token={token} />
                </section>
            </div>

            <aside className="space-y-4">
                <section className="surface-glow p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20">
                            <UsersThree className="h-5 w-5 text-teal-400" weight="duotone" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">Online Now</h2>
                            <p className="text-xs text-slate-500">Tap to message</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {otherOnlineUsers.length > 0 ? (
                            otherOnlineUsers.slice(0, 8).map((user) => {
                                const image = user.profile?.profile_image;
                                const avatar = image?.startsWith('http') ? image : image ? `/storage/${image}` : null;
                                return (
                                    <Link
                                        key={user.id}
                                        to={`/chat/${user.id}`}
                                        className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition hover:border-violet-500/30 hover:bg-violet-500/5"
                                    >
                                        <div className="relative shrink-0">
                                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20">
                                                {avatar ? (
                                                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-violet-300">{user.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#07070f] bg-teal-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">{user.name}</p>
                                            <p className="text-[10px] text-teal-400">Message live</p>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="rounded-2xl border border-white/[0.06] p-4 text-center text-sm text-slate-500">
                                Nobody else online right now.
                            </div>
                        )}
                    </div>
                </section>
            </aside>
        </div>
    );
}

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatCircleDots, MagnifyingGlass, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import ChatWindow from '../components/ChatWindow';
import { cn } from '../lib/utils';
import { useEchoPrivate } from '../hooks/useEcho';

export default function Chat() {
    const { userId: routeUserId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('user_id');

    const [conversations, setConversations] = useState([]);
    const [activePartnerId, setActivePartnerId] = useState(routeUserId || null);
    const [activePartner, setActivePartner] = useState(null);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [directPartner, setDirectPartner] = useState(null);

    const fetchConversations = useCallback(async () => {
        setLoadingConversations(true);
        try {
            const response = await axios.get('/api/conversations', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConversations(response.data);
            setError('');
        } catch (requestError) {
            console.error(requestError);
            setError('Unable to load conversations.');
        } finally {
            setLoadingConversations(false);
        }
    }, [token]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (routeUserId) setActivePartnerId(routeUserId);
    }, [routeUserId]);

    useEffect(() => {
        if (!activePartnerId) return;

        const foundConversation = conversations.find((item) => String(item.partner.id) === String(activePartnerId));
        if (foundConversation) {
            setActivePartner(foundConversation.partner);
            setDirectPartner(null);
        } else if (directPartner && String(directPartner.id) === String(activePartnerId)) {
            setActivePartner(directPartner);
        } else {
            fetchDirectPartner(activePartnerId);
        }
    }, [activePartnerId, conversations, directPartner]);

    useEchoPrivate(
        currentUserId ? `chat.${currentUserId}` : null,
        '.MessageSent',
        (event) => {
            const message = event.message ?? event;
            const partnerId =
                String(message.sender_id) === String(currentUserId)
                    ? String(message.receiver_id)
                    : String(message.sender_id);
            const isActiveThread = String(activePartnerId) === partnerId;
            const isIncoming = String(message.sender_id) !== String(currentUserId);

            setConversations((items) => {
                const existing = items.find((item) => String(item.partner.id) === partnerId);
                if (!existing) {
                    fetchConversations();
                    return items;
                }

                const updated = items.map((item) => {
                    if (String(item.partner.id) !== partnerId) return item;
                    return {
                        ...item,
                        last_message: message,
                        unread_count: isActiveThread ? 0 : (item.unread_count || 0) + (isIncoming ? 1 : 0),
                    };
                });

                return updated.sort(
                    (a, b) => new Date(b.last_message?.created_at || 0) - new Date(a.last_message?.created_at || 0)
                );
            });
        },
        Boolean(currentUserId)
    );

    const fetchDirectPartner = async (userId) => {
        try {
            const response = await axios.get(`/api/profile/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDirectPartner(response.data);
            setActivePartner(response.data);
        } catch (requestError) {
            console.error(requestError);
        }
    };

    const selectConversation = (partnerId) => {
        if (!partnerId) {
            setActivePartnerId(null);
            setActivePartner(null);
            navigate('/chat', { replace: true });
            return;
        }
        setActivePartnerId(String(partnerId));
        navigate(`/chat/${partnerId}`, { replace: true });
        setConversations((items) =>
            items.map((item) => (String(item.partner.id) === String(partnerId) ? { ...item, unread_count: 0 } : item))
        );
    };

    const avatarUrl = (user) => {
        const image = user?.profile?.profile_image;
        if (!image) return null;
        return image.startsWith('http') ? image : `/storage/${image}`;
    };

    const filteredConversations = conversations.filter((item) =>
        item.partner.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="grid h-[calc(100vh-12rem)] lg:h-[calc(100vh-9.5rem)] gap-4 lg:grid-cols-[320px_1fr] overflow-hidden">
            <aside className={cn(
                "surface-glow overflow-hidden flex flex-col transition-all duration-300 h-full",
                activePartnerId ? "hidden lg:flex" : "flex"
            )}>
                <div className="border-b border-white/[0.06] p-5 shrink-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Messages</p>
                    <h1 className="mt-1 text-xl font-bold text-white">Conversations</h1>

                    <div className="relative mt-4">
                        <MagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search…"
                            className="input-minimal pl-11"
                        />
                    </div>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-2">
                    {loadingConversations ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4">
                            <CircleNotch className="h-6 w-6 animate-spin text-violet-400" />
                            <p className="text-sm text-slate-400">Loading…</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                            <WarningCircle className="h-4 w-4" />
                            {error}
                        </div>
                    ) : filteredConversations.length > 0 ? (
                        <div className="space-y-1">
                            {filteredConversations.map(({ partner, last_message, unread_count }) => {
                                const isActive = String(partner.id) === String(activePartnerId);
                                return (
                                    <button
                                        key={partner.id}
                                        onClick={() => selectConversation(partner.id)}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200',
                                            isActive
                                                ? 'bg-gradient-to-r from-blue-500/15 to-violet-500/15 ring-1 ring-violet-500/30'
                                                : 'hover:bg-white/[0.04]'
                                        )}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20">
                                                {avatarUrl(partner) ? (
                                                    <img src={avatarUrl(partner)} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-violet-300">{partner.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            {unread_count > 0 && (
                                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 text-[9px] font-bold text-white">
                                                    {unread_count > 9 ? '9+' : unread_count}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={cn('truncate text-sm font-semibold', isActive ? 'text-white' : 'text-slate-300')}>{partner.name}</p>
                                            <p className="truncate text-xs text-slate-500">
                                                {last_message?.sender_id == currentUserId ? 'You: ' : ''}
                                                {last_message?.body || 'Start chatting'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
                            <ChatCircleDots className="h-10 w-10 text-violet-400/30" weight="duotone" />
                            <p className="text-sm text-slate-400">No conversations yet.</p>
                        </div>
                    )}
                </div>
            </aside>

            <div className={cn(
                "min-w-0 h-full",
                activePartnerId ? "block" : "hidden lg:block"
            )}>
                {activePartnerId && activePartner ? (
                    <ChatWindow
                        key={activePartnerId}
                        partnerId={activePartnerId}
                        partnerName={activePartner.name}
                        partnerAvatar={avatarUrl(activePartner)}
                        currentUserId={currentUserId}
                        token={token}
                        onNewMessage={fetchConversations}
                        onBack={() => selectConversation(null)}
                    />
                ) : (
                    <div className="surface-glow flex h-full flex-col items-center justify-center p-10 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/10 to-fuchsia-500/10">
                            <ChatCircleDots className="h-10 w-10 text-violet-400/60" weight="duotone" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Pick a conversation</h2>
                        <p className="mt-2 max-w-xs text-sm text-slate-400">Select someone from the left to start messaging in real time.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

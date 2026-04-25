import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatCircleDots, MagnifyingGlass, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import ChatWindow from '../components/ChatWindow';
import { cn } from '../lib/utils';

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

    useEffect(() => {
        fetchConversations();
    }, []);

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

    const fetchConversations = async () => {
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
    };

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
        <section className="grid min-h-[calc(100vh-12rem)] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="surface overflow-hidden">
                <div className="border-b border-slate-800 p-5">
                    <h1 className="text-xl font-semibold text-slate-100">Messages</h1>
                    <p className="mt-1 text-sm text-slate-400">Open a conversation and reply in real time.</p>

                    <div className="relative mt-4">
                        <MagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search conversations"
                            className="input-minimal pl-11"
                        />
                    </div>
                </div>

                <div className="custom-scrollbar max-h-[calc(100vh-20rem)] overflow-y-auto p-3">
                    {loadingConversations ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4">
                            <CircleNotch className="h-6 w-6 animate-spin text-blue-400" />
                            <p className="text-sm text-slate-400">Loading conversations...</p>
                        </div>
                    ) : error ? (
                        <div className="surface-muted flex items-center gap-2 p-4 text-sm text-red-300">
                            <WarningCircle className="h-4 w-4" />
                            {error}
                        </div>
                    ) : filteredConversations.length > 0 ? (
                        <div className="space-y-2">
                            {filteredConversations.map(({ partner, last_message, unread_count }) => {
                                const isActive = String(partner.id) === String(activePartnerId);
                                return (
                                    <button
                                        key={partner.id}
                                        onClick={() => selectConversation(partner.id)}
                                        className={cn(
                                            "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                                            isActive
                                                ? "border-slate-700 bg-slate-800"
                                                : "border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900"
                                        )}
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-800">
                                            {avatarUrl(partner) ? (
                                                <img src={avatarUrl(partner)} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-semibold text-slate-300">{partner.name?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="truncate text-sm font-medium text-slate-100">{partner.name}</p>
                                                {unread_count > 0 && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white shadow-sm shadow-emerald-600/20">{unread_count}</span>}
                                            </div>
                                            <p className="truncate text-xs text-slate-500">
                                                {last_message?.sender_id == currentUserId ? 'You: ' : ''}
                                                {last_message?.body || 'Start a conversation'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
                            <ChatCircleDots className="h-10 w-10 text-slate-600" />
                            <p className="text-sm text-slate-400">No conversations found.</p>
                        </div>
                    )}
                </div>
            </aside>

            <div className="min-w-0">
                {activePartnerId && activePartner ? (
                    <ChatWindow
                        key={activePartnerId}
                        partnerId={activePartnerId}
                        partnerName={activePartner.name}
                        partnerAvatar={avatarUrl(activePartner)}
                        currentUserId={currentUserId}
                        token={token}
                        onNewMessage={fetchConversations}
                    />
                ) : (
                    <div className="surface flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center p-10 text-center">
                        <ChatCircleDots className="h-14 w-14 text-slate-600" />
                        <h2 className="mt-4 text-xl font-semibold text-slate-100">Select a conversation</h2>
                        <p className="mt-2 max-w-md text-sm text-slate-400">Choose a person from the left panel to start messaging.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

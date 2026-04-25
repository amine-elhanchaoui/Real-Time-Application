import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { PaperPlaneRight, CircleNotch, WarningCircle, Check } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

export default function ChatWindow({ partnerId, partnerName, partnerAvatar, currentUserId, token, onNewMessage }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!partnerId) return;
        setLoading(true);
        setError('');
        fetchHistory();
    }, [partnerId]);

    useEffect(() => {
        if (!window.Echo || !currentUserId) return;
        const channel = window.Echo.private(`chat.${currentUserId}`);

        const listener = (event) => {
            const message = event.message;
            const isCurrentThread =
                (String(message.sender_id) === String(partnerId) && String(message.receiver_id) === String(currentUserId)) ||
                (String(message.sender_id) === String(currentUserId) && String(message.receiver_id) === String(partnerId));

            if (!isCurrentThread) return;

            setMessages((items) => {
                if (items.some((item) => item.id === message.id)) return items;
                const tempIndex = items.findIndex((item) => item.isTemp && item.body === message.body);
                if (tempIndex !== -1) {
                    const next = [...items];
                    next[tempIndex] = message;
                    return next;
                }
                return [...items, message];
            });

            if (onNewMessage) onNewMessage(message);
        };

        channel.listen('.MessageSent', listener);
        return () => window.Echo.leaveChannel(`chat.${currentUserId}`);
    }, [currentUserId, partnerId, onNewMessage]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`/api/messages/${partnerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(response.data.messages);
        } catch (requestError) {
            console.error(requestError);
            setError('Could not load this conversation.');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (event) => {
        event.preventDefault();
        if (!input.trim() || sending) return;

        const body = input.trim();
        const tempId = `temp-${Date.now()}`;
        setInput('');
        setSending(true);
        setMessages((items) => [
            ...items,
            {
                id: tempId,
                sender_id: currentUserId,
                receiver_id: partnerId,
                body,
                created_at: new Date().toISOString(),
                isTemp: true,
            },
        ]);

        try {
            const response = await axios.post(
                '/api/messages',
                { receiver_id: partnerId, body },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages((items) => items.map((item) => (item.id === tempId ? response.data : item)));
            if (onNewMessage) onNewMessage(response.data);
        } catch (requestError) {
            console.error(requestError);
            setMessages((items) => items.map((item) => (item.id === tempId ? { ...item, isTemp: false, isError: true } : item)));
        } finally {
            setSending(false);
        }
    };

    const formatTime = (value) => (value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

    return (
        <section className="surface flex min-h-[calc(100vh-12rem)] flex-col overflow-hidden">
            <header className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-800">
                    {partnerAvatar ? (
                        <img src={partnerAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-sm font-semibold text-slate-300">{partnerName?.charAt(0)}</span>
                    )}
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">{partnerName}</h2>
                    <p className="text-xs text-slate-500">Real-time conversation</p>
                </div>
            </header>

            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto bg-slate-950/40 px-5 py-5">
                {loading ? (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4">
                        <CircleNotch className="h-6 w-6 animate-spin text-blue-400" />
                        <p className="text-sm text-slate-400">Loading messages...</p>
                    </div>
                ) : error ? (
                    <div className="surface-muted flex items-center gap-2 p-4 text-sm text-red-300">
                        <WarningCircle className="h-4 w-4" />
                        {error}
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((message) => {
                        const isMine = String(message.sender_id) === String(currentUserId);
                        return (
                            <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                                <div className="max-w-[78%]">
                                    <div
                                        className={cn(
                                            "rounded-2xl px-4 py-3 text-sm leading-6",
                                            isMine ? "rounded-br-md bg-emerald-600 text-white" : "rounded-bl-md bg-slate-800 text-slate-100",
                                            message.isTemp && "opacity-70",
                                            message.isError && "border border-red-500/40 bg-red-500/10 text-red-200"
                                        )}
                                    >
                                        {message.body}
                                    </div>
                                    <div className={cn("mt-1 flex items-center gap-1 text-xs text-slate-500", isMine ? "justify-end" : "justify-start")}>
                                        <span>{message.isTemp ? 'Sending...' : message.isError ? 'Failed to send' : formatTime(message.created_at)}</span>
                                        {isMine && !message.isTemp && !message.isError && <Check className="h-3 w-3" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                        <PaperPlaneRight className="h-10 w-10 text-slate-600" />
                        <p className="text-sm text-slate-400">No messages yet. Start the conversation.</p>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <footer className="border-t border-slate-800 p-4">
                <form onSubmit={sendMessage} className="flex gap-3">
                    <input
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Type your message..."
                        autoComplete="off"
                        className="input-minimal"
                        disabled={sending}
                    />
                    <button type="submit" disabled={!input.trim() || sending} className="btn-primary px-4">
                        {sending ? <CircleNotch className="h-4 w-4 animate-spin" /> : <PaperPlaneRight className="h-4 w-4" />}
                    </button>
                </form>
            </footer>
        </section>
    );
}

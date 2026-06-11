import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { PaperPlaneRight, CircleNotch, WarningCircle, Check, ChatTeardropDots, ArrowLeft } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { useEchoPrivate } from '../hooks/useEcho';

export default function ChatWindow({ partnerId, partnerName, partnerAvatar, currentUserId, token, onNewMessage, onBack }) {
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

    useEchoPrivate(
        currentUserId ? `chat.${currentUserId}` : null,
        '.MessageSent',
        (event) => {
            const message = event.message ?? event;
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

            // If we receive a message in real-time and it is incoming in the current thread, mark it as read on the backend
            if (String(message.sender_id) === String(partnerId)) {
                axios.post(`/api/messages/${partnerId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
                    .then(() => {
                        window.dispatchEvent(new CustomEvent('unread-counts-updated'));
                    })
                    .catch((err) => console.error('Failed to mark incoming message as read', err));
            }

            if (onNewMessage) onNewMessage(message);
        },
        Boolean(currentUserId && partnerId)
    );

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`/api/messages/${partnerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(response.data.messages);
            window.dispatchEvent(new CustomEvent('unread-counts-updated'));
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
            { id: tempId, sender_id: currentUserId, receiver_id: partnerId, body, created_at: new Date().toISOString(), isTemp: true },
        ]);

        try {
            const response = await axios.post('/api/messages', { receiver_id: partnerId, body }, { headers: { Authorization: `Bearer ${token}` } });
            setMessages((items) => items.map((item) => (item.id === tempId ? response.data : item)));
            if (onNewMessage) onNewMessage(response.data);
        } catch (requestError) {
            setMessages((items) => items.map((item) => (item.id === tempId ? { ...item, isTemp: false, isError: true } : item)));
        } finally {
            setSending(false);
        }
    };

    const formatTime = (value) => (value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

    return (
        <section className="surface-glow flex h-full flex-col overflow-hidden">
            <header className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="mr-1 rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/[0.08] lg:hidden animate-pulse-once"
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                )}
                <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 ring-2 ring-violet-500/30">
                        {partnerAvatar ? (
                            <img src={partnerAvatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold text-violet-300">{partnerName?.charAt(0)}</span>
                        )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0f0f1c] bg-teal-400" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white">{partnerName}</h2>
                    <p className="flex items-center gap-1.5 text-xs text-teal-400">
                        <span className="badge-live-dot" />
                        Live chat
                    </p>
                </div>
            </header>

            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-transparent to-black/20 px-5 py-5">
                {loading ? (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4">
                        <CircleNotch className="h-7 w-7 animate-spin text-violet-400" />
                        <p className="text-sm text-slate-400">Loading messages…</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        <WarningCircle className="h-4 w-4" />
                        {error}
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((message) => {
                        const isMine = String(message.sender_id) === String(currentUserId);
                        return (
                            <div key={message.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                                <div className="max-w-[80%]">
                                    <div
                                        className={cn(
                                            'rounded-2xl px-4 py-2.5 text-sm leading-6',
                                            isMine ? 'bubble-mine rounded-br-sm text-white' : 'bubble-theirs rounded-bl-sm text-slate-100',
                                            message.isTemp && 'opacity-60',
                                            message.isError && 'border border-red-500/40 bg-red-500/10 text-red-200'
                                        )}
                                    >
                                        {message.body}
                                    </div>
                                    <div className={cn('mt-1 flex items-center gap-1 text-[10px] text-slate-500', isMine ? 'justify-end' : 'justify-start')}>
                                        <span>{message.isTemp ? 'Sending…' : message.isError ? 'Failed' : formatTime(message.created_at)}</span>
                                        {isMine && !message.isTemp && !message.isError && <Check className="h-3 w-3 text-teal-400" weight="bold" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                        <ChatTeardropDots className="h-12 w-12 text-violet-400/40" weight="duotone" />
                        <p className="text-sm text-slate-400">Say hello — start the conversation!</p>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <footer className="border-t border-white/[0.06] p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message…"
                        autoComplete="off"
                        className="input-minimal flex-1"
                        disabled={sending}
                    />
                    <button type="submit" disabled={!input.trim() || sending} className="btn-primary shrink-0 px-4">
                        {sending ? <CircleNotch className="h-4 w-4 animate-spin" /> : <PaperPlaneRight className="h-4 w-4" weight="fill" />}
                    </button>
                </form>
            </footer>
        </section>
    );
}

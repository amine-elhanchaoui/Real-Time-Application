import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart, ChatCircle, PaperPlaneTilt, CircleNotch, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

export default function PostCard({ post, onRefresh }) {
    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [commenting, setCommenting] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [commentSuccess, setCommentSuccess] = useState(false);
    const [liking, setLiking] = useState(false);
    const [likeError, setLikeError] = useState('');

    const currentUserId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    const [optimisticLiked, setOptimisticLiked] = useState(post.likes?.some((like) => String(like.user_id) === String(currentUserId)));
    const [optimisticLikeCount, setOptimisticLikeCount] = useState(post.likes?.length || 0);

    useEffect(() => {
        setOptimisticLiked(post.likes?.some((like) => String(like.user_id) === String(currentUserId)));
        setOptimisticLikeCount(post.likes?.length || 0);
    }, [post.likes, currentUserId]);

    useEffect(() => {
        if (!window.Echo) return;
        const channel = window.Echo.channel(`post.${post.id}`);
        const onComment = () => onRefresh();
        const onLike = () => onRefresh();
        channel.listen('.GotNewComment', onComment).listen('.GotNewLike', onLike);
        return () => {
            channel.stopListening('.GotNewComment', onComment);
            channel.stopListening('.GotNewLike', onLike);
        };
    }, [post.id, onRefresh]);

    const avatarUrl = (user) => {
        if (!user?.profile?.profile_image) return null;
        return user.profile.profile_image.startsWith('http') ? user.profile.profile_image : `/storage/${user.profile.profile_image}`;
    };

    const handleLike = async () => {
        if (liking) return;
        setLikeError('');
        const wasLiked = optimisticLiked;
        setOptimisticLiked(!wasLiked);
        setOptimisticLikeCount((v) => (wasLiked ? v - 1 : v + 1));
        setLiking(true);
        try {
            await axios.post('/api/likes/toggle', { post_id: post.id }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (requestError) {
            setOptimisticLiked(wasLiked);
            setOptimisticLikeCount((v) => (wasLiked ? v + 1 : v - 1));
            setLikeError('Could not update like.');
            setTimeout(() => setLikeError(''), 2500);
        } finally {
            setLiking(false);
        }
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        if (!commentContent.trim() || commenting) return;
        setCommenting(true);
        setCommentError('');
        setCommentSuccess(false);
        try {
            await axios.post('/api/comments', { post_id: post.id, content: commentContent }, { headers: { Authorization: `Bearer ${token}` } });
            setCommentContent('');
            setCommentSuccess(true);
            setShowComments(true);
            setTimeout(() => setCommentSuccess(false), 2500);
            onRefresh();
        } catch (requestError) {
            setCommentError(requestError.response?.data?.message || 'Could not send comment.');
        } finally {
            setCommenting(false);
        }
    };

    return (
        <article className="surface-glow overflow-hidden transition-all duration-300 hover:shadow-[0_16px_48px_rgba(139,92,246,0.12)]">
            <div className="flex items-start gap-3 p-5">
                <Link to={`/profile/${post.user_id}`} className="shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 ring-2 ring-white/10 transition hover:ring-violet-500/40">
                        {avatarUrl(post.user) ? (
                            <img src={avatarUrl(post.user)} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold text-violet-300">{post.user?.name?.charAt(0)}</span>
                        )}
                    </div>
                </Link>
                <div className="min-w-0 flex-1">
                    <Link to={`/profile/${post.user_id}`} className="text-sm font-bold text-white hover:text-violet-300">
                        {post.user?.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                        {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            <div className="px-5 pb-4">
                <h3 className="text-lg font-bold text-white">{post.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-300">{post.content}</p>
            </div>

            {post.image && (
                <div className="border-y border-white/[0.06] bg-black/20">
                    <img src={post.image.startsWith('http') ? post.image : `/storage/${post.image}`} alt="" className="max-h-[480px] w-full object-contain" />
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 px-5 py-4">
                <button
                    onClick={handleLike}
                    disabled={liking}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all',
                        optimisticLiked
                            ? 'bg-gradient-to-r from-rose-500/20 to-fuchsia-500/20 text-rose-300 ring-1 ring-rose-500/30'
                            : 'border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-rose-500/30 hover:text-rose-300'
                    )}
                >
                    {liking ? <CircleNotch className="h-4 w-4 animate-spin" /> : <Heart weight={optimisticLiked ? 'fill' : 'regular'} className="h-4 w-4" />}
                    {optimisticLikeCount}
                </button>

                <button
                    onClick={() => setShowComments((v) => !v)}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all',
                        showComments
                            ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                            : 'border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-violet-500/30 hover:text-violet-300'
                    )}
                >
                    <ChatCircle className="h-4 w-4" />
                    {post.comments?.length || 0}
                </button>

                {likeError && <span className="text-xs text-red-400">{likeError}</span>}
            </div>

            {showComments && (
                <div className="border-t border-white/[0.06] bg-white/[0.02] p-5">
                    <div className="custom-scrollbar mb-4 max-h-[320px] space-y-2 overflow-y-auto">
                        {post.comments?.length ? (
                            post.comments.map((comment) => (
                                <div key={comment.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
                                    <div className="mb-1 flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-white">{comment.user?.name}</span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300">{comment.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="rounded-2xl border border-white/[0.06] p-4 text-center text-sm text-slate-500">No comments yet.</p>
                        )}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="Write a comment…"
                                className="input-minimal"
                                disabled={commenting}
                            />
                            <button type="submit" disabled={!commentContent.trim() || commenting} className="btn-primary shrink-0 px-4">
                                {commenting ? <CircleNotch className="h-4 w-4 animate-spin" /> : <PaperPlaneTilt className="h-4 w-4" />}
                            </button>
                        </div>
                        {commentError && (
                            <div className="flex items-center gap-2 text-sm text-red-400">
                                <WarningCircle className="h-4 w-4" />
                                {commentError}
                            </div>
                        )}
                        {commentSuccess && (
                            <div className="flex items-center gap-2 text-sm text-teal-400">
                                <CheckCircle className="h-4 w-4" />
                                Comment added!
                            </div>
                        )}
                    </form>
                </div>
            )}
        </article>
    );
}

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
        channel.listen('.GotNewComment', () => onRefresh()).listen('.GotNewLike', () => onRefresh());
        return () => window.Echo.leaveChannel(`post.${post.id}`);
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
        setOptimisticLikeCount((value) => (wasLiked ? value - 1 : value + 1));
        setLiking(true);

        try {
            await axios.post('/api/likes/toggle', { post_id: post.id }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (requestError) {
            console.error(requestError);
            setOptimisticLiked(wasLiked);
            setOptimisticLikeCount((value) => (wasLiked ? value + 1 : value - 1));
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
            await axios.post(
                '/api/comments',
                { post_id: post.id, content: commentContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCommentContent('');
            setCommentSuccess(true);
            setShowComments(true);
            setTimeout(() => setCommentSuccess(false), 2500);
            onRefresh();
        } catch (requestError) {
            console.error(requestError);
            setCommentError(requestError.response?.data?.message || 'Could not send comment.');
        } finally {
            setCommenting(false);
        }
    };

    return (
        <article className="surface overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-5">
                <div className="flex min-w-0 items-center gap-3">
                    <Link to={`/profile/${post.user_id}`} className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-800">
                        {avatarUrl(post.user) ? (
                            <img src={avatarUrl(post.user)} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-sm font-semibold text-slate-300">{post.user?.name?.charAt(0)}</span>
                        )}
                    </Link>
                    <div className="min-w-0">
                        <Link to={`/profile/${post.user_id}`} className="truncate text-sm font-semibold text-slate-100 hover:text-blue-400">
                            {post.user?.name}
                        </Link>
                        <p className="text-xs text-slate-500">
                            {new Date(post.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-5">
                <h3 className="text-lg font-semibold text-slate-100">{post.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{post.content}</p>
            </div>

            {post.image && (
                <div className="border-y border-slate-800 bg-slate-950">
                    <img src={post.image.startsWith('http') ? post.image : `/storage/${post.image}`} alt="" className="max-h-[520px] w-full object-contain" />
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 px-5 py-4">
                <button
                    onClick={handleLike}
                    disabled={liking}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                        optimisticLiked ? "bg-emerald-600/15 text-emerald-300" : "bg-slate-950 text-slate-300 hover:bg-slate-800"
                    )}
                >
                    {liking ? <CircleNotch className="h-4 w-4 animate-spin" /> : <Heart weight={optimisticLiked ? 'fill' : 'regular'} className="h-4 w-4" />}
                    {optimisticLikeCount}
                </button>

                <button
                    onClick={() => setShowComments((value) => !value)}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                        showComments ? "bg-slate-800 text-white" : "bg-slate-950 text-slate-300 hover:bg-slate-800"
                    )}
                >
                    <ChatCircle className="h-4 w-4" />
                    {post.comments?.length || 0} comments
                </button>

                {likeError && <span className="text-xs text-red-300">{likeError}</span>}
            </div>

            {showComments && (
                <div className="border-t border-slate-800 bg-slate-950/50 p-5">
                    <div className="custom-scrollbar mb-4 max-h-[360px] space-y-3 overflow-y-auto">
                        {post.comments?.length ? (
                            post.comments.map((comment) => (
                                <div key={comment.id} className="surface-muted p-4">
                                    <div className="mb-1 flex items-center justify-between gap-3">
                                        <span className="text-sm font-medium text-slate-100">{comment.user?.name}</span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300">{comment.content}</p>
                                </div>
                            ))
                        ) : (
                            <div className="surface-muted p-4 text-sm text-slate-400">No comments yet.</div>
                        )}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="space-y-3">
                        <div className="flex gap-3">
                            <input
                                value={commentContent}
                                onChange={(event) => setCommentContent(event.target.value)}
                                placeholder="Write a comment..."
                                className="input-minimal"
                                disabled={commenting}
                            />
                            <button type="submit" disabled={!commentContent.trim() || commenting} className="btn-primary px-4">
                                {commenting ? <CircleNotch className="h-4 w-4 animate-spin" /> : <PaperPlaneTilt className="h-4 w-4" />}
                            </button>
                        </div>

                        {commentError && (
                            <div className="flex items-center gap-2 text-sm text-red-300">
                                <WarningCircle className="h-4 w-4" />
                                {commentError}
                            </div>
                        )}

                        {commentSuccess && (
                            <div className="flex items-center gap-2 text-sm text-emerald-300">
                                <CheckCircle className="h-4 w-4" />
                                Comment added.
                            </div>
                        )}
                    </form>
                </div>
            )}
        </article>
    );
}

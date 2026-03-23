import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function PostCard({ post, onRefresh }) {
    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const token = localStorage.getItem('token');

    const handleLike = async () => {
        try {
            await axios.post('/api/likes/toggle', { post_id: post.id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/comments', { post_id: post.id, content: commentContent }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCommentContent('');
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl transition-all hover:border-slate-700">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Link to={`/profile/${post.user_id}`} className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden border border-slate-700 transition-transform active:scale-95">
                        {post.user?.profile?.profile_image ? (
                            <img 
                                src={post.user.profile.profile_image.startsWith('http') ? post.user.profile.profile_image : `/storage/${post.user.profile.profile_image}`} 
                                alt="" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            post.user?.name?.charAt(0) || '?'
                        )}
                    </Link>
                    <div>
                        <Link to={`/profile/${post.user_id}`} className="font-bold text-slate-100 hover:text-cyan-400 transition-colors">{post.user?.name}</Link>
                        <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">{post.title}</h3>
                <p className="text-slate-400 whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>
                {post.image && (
                    <div className="rounded-2xl overflow-hidden border border-slate-800 mb-4">
                        <img 
                            src={post.image.startsWith('http') ? post.image : `/storage/${post.image}`} 
                            alt="" 
                            className="w-full h-auto max-h-[500px] object-cover" 
                        />
                    </div>
                )}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center gap-6">
                <button 
                    onClick={handleLike}
                    className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group"
                >
                    <div className="p-2 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold">{post.likes?.length || 0}</span>
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group"
                >
                    <div className="p-2 rounded-xl group-hover:bg-blue-500/10 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold">{post.comments?.length || 0}</span>
                </button>
            </div>

            {showComments && (
                <div className="p-6 border-t border-slate-800 bg-slate-950/30">
                    <div className="space-y-6 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {post.comments?.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
                                    {comment.user?.name?.charAt(0)}
                                </div>
                                <div className="bg-slate-800/50 rounded-2xl px-4 py-2 border border-slate-800/50 flex-1">
                                    <p className="text-xs font-bold text-slate-300 mb-1">{comment.user?.name}</p>
                                    <p className="text-sm text-slate-400">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="relative">
                        <input
                            type="text"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-slate-800 border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-1 focus:ring-cyan-500/50"
                        />
                        <button 
                            type="submit"
                            className="absolute right-2 top-1.5 p-1.5 text-cyan-500 hover:text-cyan-400"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

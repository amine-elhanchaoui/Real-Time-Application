import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!id || id === 'null' || id === 'undefined') {
            navigate('/');
            return;
        }
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`/api/profile/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            if (err.response?.status === 404) {
                navigate('/');
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    if (!user) return (
        <div className="text-center py-20">
            <p className="text-slate-500 italic">User not found or profile unavailable.</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center gap-10 border-b border-slate-800 pb-12">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1">
                    <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center border-4 border-slate-950">
                        {user.profile?.profile_image ? (
                            <img 
                                src={user.profile.profile_image.startsWith('http') ? user.profile.profile_image : `/storage/${user.profile.profile_image}`} 
                                alt="" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <span className="text-5xl font-black text-slate-100">{user.name?.charAt(0)}</span>
                        )}
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <h2 className="text-3xl font-black text-white">{user.name}</h2>
                        {localStorage.getItem('user_id') == id && (
                             <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-all border border-slate-700">
                                Edit Profile
                            </button>
                        )}
                    </div>
                    <div className="flex justify-center md:justify-start gap-8 text-sm">
                        <span><strong className="text-white">{user.posts?.length || 0}</strong> Posts</span>
                        <span><strong className="text-white">{user.comments?.length || 0}</strong> Comments</span>
                        <span><strong className="text-white">{user.likes?.length || 0}</strong> Likes</span>
                    </div>
                    <div className="max-w-md">
                        <p className="font-bold text-slate-200">@{user.profile?.username || user.name?.toLowerCase().replace(' ', '')}</p>
                        <p className="text-slate-400 mt-1 leading-relaxed">{user.profile?.bio || 'No bio yet.'}</p>
                    </div>
                </div>
            </div>

            {/* Posts Grid/List */}
            <div className="space-y-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Recent Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.posts?.map(post => (
                        <PostCard key={post.id} post={{...post, user}} onRefresh={fetchProfile} />
                    ))}
                </div>
                {user.posts?.length === 0 && (
                     <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 border-dashed">
                        <p className="text-slate-500 italic">No posts shared yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

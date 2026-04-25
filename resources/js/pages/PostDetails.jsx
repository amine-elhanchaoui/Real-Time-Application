import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { ArrowLeft, CircleNotch, WarningCircle } from '@phosphor-icons/react';

export default function PostDetails() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchPost();
    }, [id, token]);

    const fetchPost = async () => {
        try {
            const response = await axios.get(`/api/posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPost(response.data);
            setError('');
        } catch (err) {
            console.error(err);
            if (err.response?.status === 404) {
                setError('Post not found.');
            } else {
                setError('Failed to load transmission.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-screen gap-4">
            <CircleNotch className="w-10 h-10 text-violet-500 animate-spin" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Fetching Signal...</p>
        </div>
    );

    if (error || !post) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <WarningCircle weight="bold" className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{error || 'Entry Lost'}</h3>
            <button onClick={() => navigate('/')} className="btn-outline">Return to Feed</button>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20 px-4">
            <div className="flex pt-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-100 transition-colors font-bold text-[10px] uppercase tracking-widest"
                >
                    <ArrowLeft weight="bold" className="w-4 h-4" />
                    <span>Back</span>
                </button>
            </div>
            
            <div className="card-minimal p-1 bg-slate-900 border-violet-500/20 shadow-xl shadow-violet-500/5">
                <PostCard post={post} onRefresh={fetchPost} />
            </div>

            <div className="pt-20 text-center opacity-20 border-t border-slate-800/50">
                <p className="text-[10px] uppercase font-bold tracking-widest italic text-slate-500">Post Detail Terminal</p>
            </div>
        </div>
    );
}

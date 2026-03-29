import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';

export default function PostDetails() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
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
            setLoading(false);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                navigate('/');
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    if (!post) return (
        <div className="text-center p-20 text-slate-400">
            Post not found.
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
            </div>
            <PostCard post={post} onRefresh={fetchPost} />
        </div>
    );
}

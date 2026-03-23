import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import InfinitePostList from '../components/InfinitePostList';

export default function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchPosts();
    }, [token]);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('/api/posts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <CreatePost onPostCreated={() => window.location.reload()} />
            <InfinitePostList token={token} />
        </div>
    );
}

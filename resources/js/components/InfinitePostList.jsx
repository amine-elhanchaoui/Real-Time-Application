import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import PostCard from './PostCard';

export default function InfinitePostList({ initialPosts = [], token }) {
    const [posts, setPosts] = useState(initialPosts);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observer = useRef();

    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        if (page === 1 && posts.length > 0) return; // Skip initial load if we have posts
        fetchMorePosts();
    }, [page]);

    const fetchMorePosts = async () => {
        if (!hasMore || loading) return;
        setLoading(true);
        try {
            const response = await axios.get(`/api/posts?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newPosts = response.data.data;
            setPosts(prev => [...prev, ...newPosts]);
            setHasMore(response.data.next_page_url !== null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setPage(1);
        setHasMore(true);
        try {
            const response = await axios.get(`/api/posts?page=1`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(response.data.data);
            setHasMore(response.data.next_page_url !== null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {posts.map((post, index) => {
                if (posts.length === index + 1) {
                    return (
                        <div ref={lastPostElementRef} key={post.id}>
                            <PostCard post={post} onRefresh={handleRefresh} />
                        </div>
                    );
                } else {
                    return <PostCard key={post.id} post={post} onRefresh={handleRefresh} />;
                }
            })}
            {loading && (
                <div className="flex justify-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            )}
            {!hasMore && posts.length > 0 && (
                <p className="text-center text-slate-500 py-10 italic">You've reached the end of the galaxy.</p>
            )}
        </div>
    );
}

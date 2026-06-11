import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { CircleNotch } from '@phosphor-icons/react';
import PostCard from './PostCard';

export default function InfinitePostList({ token }) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const observer = useRef();

    const fetchPage = useCallback(async (pageNum, replace = false) => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get(`/api/posts?page=${pageNum}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const newPosts = response.data.data || [];
            setPosts((prev) => (replace ? newPosts : [...prev, ...newPosts]));
            setHasMore(Boolean(response.data.next_page_url));
        } catch (err) {
            console.error('Failed to load posts', err);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [token]);

    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        setInitialLoading(true);
        fetchPage(1, true);
    }, [token, fetchPage]);

    useEffect(() => {
        if (page === 1) return;
        fetchPage(page);
    }, [page, fetchPage]);

    const handleRefresh = () => {
        setPage(1);
        setHasMore(true);
        fetchPage(1, true);
    };

    const lastPostRef = useCallback(
        (node) => {
            if (loading || initialLoading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prev) => prev + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, initialLoading, hasMore]
    );

    if (initialLoading) {
        return (
            <div className="surface flex min-h-[280px] flex-col items-center justify-center gap-4 p-10">
                <CircleNotch className="h-8 w-8 animate-spin text-violet-400" />
                <p className="text-sm text-slate-400">Loading feed…</p>
            </div>
        );
    }

    if (!posts.length) {
        return (
            <div className="surface p-12 text-center">
                <p className="text-sm text-slate-400">No posts yet. Run the seeder to add fake users and posts.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post, index) => {
                const isLast = index === posts.length - 1;
                return (
                    <div key={post.id} ref={isLast ? lastPostRef : null}>
                        <PostCard post={post} onRefresh={handleRefresh} />
                    </div>
                );
            })}

            {loading && page > 1 && (
                <div className="flex justify-center py-8">
                    <CircleNotch className="h-7 w-7 animate-spin text-violet-400" />
                </div>
            )}

            {!hasMore && (
                <p className="py-8 text-center text-xs font-medium uppercase tracking-widest text-slate-500">
                    You reached the end
                </p>
            )}
        </div>
    );
}

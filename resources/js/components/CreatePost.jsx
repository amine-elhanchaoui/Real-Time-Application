import React, { useState } from 'react';
import axios from 'axios';
import { Image, PaperPlaneTilt, X, CircleNotch, WarningCircle, CheckCircle, PencilLine } from '@phosphor-icons/react';

export default function CreatePost({ onRefresh }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const token = localStorage.getItem('token');
    const profileImage = localStorage.getItem('profile_image');

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be under 2MB.');
            return;
        }
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!title.trim() || !content.trim() || loading) return;

        setLoading(true);
        setError('');
        setSuccess(false);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) formData.append('image', image);

        try {
            await axios.post('/api/posts', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            setTitle('');
            setContent('');
            setImage(null);
            setPreview(null);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2500);
            onRefresh();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to publish your post.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="surface-glow p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20">
                    <PencilLine className="h-5 w-5 text-violet-400" weight="duotone" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white">Create a post</h2>
                    <p className="text-xs text-slate-500">Share something with your network</p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="hidden shrink-0 sm:block">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 ring-2 ring-white/10">
                        {profileImage ? (
                            <img src={profileImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold text-violet-300">U</span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 space-y-3">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Give it a title…"
                        className="input-minimal font-medium"
                        disabled={loading}
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="input-minimal min-h-[120px] resize-none"
                        disabled={loading}
                    />

                    {preview && (
                        <div className="relative overflow-hidden rounded-2xl border border-white/10">
                            <img src={preview} alt="Preview" className="max-h-[280px] w-full object-contain bg-black/20" />
                            <button
                                type="button"
                                onClick={() => { setImage(null); setPreview(null); }}
                                className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm hover:bg-black/80"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 transition hover:border-white/20 hover:text-white">
                            <Image className="h-4 w-4" />
                            Add photo
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={loading} />
                        </label>
                        <button type="submit" disabled={!title.trim() || !content.trim() || loading} className="btn-primary min-w-[130px]">
                            {loading ? <CircleNotch className="h-4 w-4 animate-spin" /> : <PaperPlaneTilt className="h-4 w-4" />}
                            Publish
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                            <WarningCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 rounded-xl border border-teal-500/20 bg-teal-500/10 p-3 text-sm text-teal-300">
                            <CheckCircle className="h-4 w-4" />
                            Published successfully!
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
}

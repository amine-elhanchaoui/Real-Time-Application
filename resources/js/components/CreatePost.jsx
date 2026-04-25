import React, { useState } from 'react';
import axios from 'axios';
import { Image, PaperPlaneTilt, X, CircleNotch, WarningCircle, CheckCircle } from '@phosphor-icons/react';

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
            setError('Image size must be less than 2MB.');
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
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
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
        <section className="surface p-6">
            <div className="mb-5">
                <h2 className="section-title">Create a post</h2>
                <p className="section-copy">Keep it simple. A clear title, useful text, and an image only when it helps.</p>
            </div>

            <div className="flex gap-4">
                <div className="hidden sm:block">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-800">
                        {profileImage ? (
                            <img src={profileImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-sm font-semibold text-slate-300">U</span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Post title"
                        className="input-minimal"
                        disabled={loading}
                    />
                    <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="What do you want to share?"
                        className="input-minimal min-h-[140px] resize-none"
                        disabled={loading}
                    />

                    {preview && (
                        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                            <img src={preview} alt="Preview" className="max-h-[320px] w-full object-contain" />
                            <button
                                type="button"
                                onClick={() => {
                                    setImage(null);
                                    setPreview(null);
                                }}
                                className="absolute right-3 top-3 rounded-full bg-slate-900/90 p-2 text-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                            <Image className="h-5 w-5 text-slate-400" />
                            Add image
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={loading} />
                        </label>

                        <button type="submit" disabled={!title.trim() || !content.trim() || loading} className="btn-primary min-w-[140px]">
                            {loading ? <CircleNotch className="h-5 w-5 animate-spin" /> : <PaperPlaneTilt className="h-5 w-5" />}
                            Publish
                        </button>
                    </div>

                    {error && (
                        <div className="surface-muted flex items-center gap-2 p-3 text-sm text-red-300">
                            <WarningCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="surface-muted flex items-center gap-2 p-3 text-sm text-emerald-300">
                            <CheckCircle className="h-4 w-4" />
                            Your post was published.
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
}

import React, { useState } from 'react';
import axios from 'axios';

export default function CreatePost({ onPostCreated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            if (image) formData.append('image', image);

            await axios.post('/api/posts', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setTitle('');
            setContent('');
            setImage(null);
            setImagePreview(null);
            onPostCreated();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title of your post..."
                    className="w-full bg-transparent text-xl font-bold border-none focus:ring-0 placeholder-slate-600 text-white"
                    required
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[100px] placeholder-slate-600 text-slate-300"
                    required
                />
                
                {imagePreview && (
                    <div className="relative mb-4 group">
                        <img src={imagePreview} alt="Preview" className="w-full rounded-2xl border border-slate-700 max-h-96 object-cover" />
                        <button 
                            type="button"
                            onClick={() => { setImage(null); setImagePreview(null); }}
                            className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                        <label className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-xl cursor-pointer transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || (!content.trim() && !image)}
                        className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-2xl font-bold text-white shadow-lg shadow-cyan-500/20 transform transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post Now'}
                    </button>
                </div>
            </form>
        </div>
    );
}

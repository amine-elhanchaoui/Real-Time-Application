import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { EnvelopeSimple, CalendarBlank, PencilSimple, UserPlus, UserCheck, ChatCircleDots, CameraPlus, X, CircleNotch, IdentificationBadge, WarningCircle } from '@phosphor-icons/react';
import PostCard from '../components/PostCard';
import { cn } from '../lib/utils';

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('user_id');

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followingLoading, setFollowingLoading] = useState(false);
    const [counts, setCounts] = useState({ followers_count: 0, following_count: 0 });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '', bio: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!id || id === 'null' || id === 'undefined') {
            navigate('/');
            return;
        }

        fetchProfile();
        fetchFollowCounts();
        if (id !== currentUserId) checkFollowStatus();
    }, [id, currentUserId]);

    const avatarSrc = (image) => {
        if (!image) return null;
        return image.startsWith('http') ? image : `/storage/${image}`;
    };

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/api/profile/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setUser(response.data);
            setEditForm({
                name: response.data.name,
                email: response.data.email,
                bio: response.data.profile?.bio || '',
            });
        } catch (requestError) {
            console.error(requestError);
            setError('Profile not found or unavailable.');
            if (requestError.response?.status === 404) {
                setTimeout(() => navigate('/'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowCounts = async () => {
        try {
            const response = await axios.get(`/api/follows/${id}/counts`, { headers: { Authorization: `Bearer ${token}` } });
            setCounts(response.data);
        } catch (requestError) {
            console.error(requestError);
        }
    };

    const checkFollowStatus = async () => {
        try {
            const response = await axios.get(`/api/follows/${id}/check`, { headers: { Authorization: `Bearer ${token}` } });
            setIsFollowing(response.data.is_following);
        } catch (requestError) {
            console.error(requestError);
        }
    };

    const handleFollowToggle = async () => {
        if (followingLoading) return;
        setFollowingLoading(true);
        try {
            const response = await axios.post(
                '/api/follows/toggle',
                { user_id: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsFollowing(response.data.is_following);
            fetchFollowCounts();
        } catch (requestError) {
            console.error(requestError);
        } finally {
            setFollowingLoading(false);
        }
    };

    const handleEditSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        setEditError('');
        setEditSuccess(false);

        try {
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('email', editForm.email);
            formData.append('bio', editForm.bio);
            if (imageFile) formData.append('profile_image', imageFile);
            formData.append('_method', 'PUT');

            const response = await axios.post(`/api/profile/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUser((previous) => ({ ...previous, ...response.data }));
            const newImage = response.data.profile?.profile_image;
            if (newImage) {
                localStorage.setItem('profile_image', newImage.startsWith('http') ? newImage : `/storage/${newImage}`);
            }

            setEditSuccess(true);
            setTimeout(() => {
                setEditSuccess(false);
                setShowEditModal(false);
            }, 1000);
        } catch (requestError) {
            console.error(requestError);
            setEditError(requestError.response?.data?.message || 'Could not update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <CircleNotch className="h-8 w-8 animate-spin text-blue-400" />
                <p className="text-sm text-slate-400">Loading profile...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="surface mx-auto max-w-xl p-10 text-center">
                <IdentificationBadge className="mx-auto h-14 w-14 text-slate-500" />
                <h2 className="mt-4 text-xl font-semibold text-slate-100">Profile unavailable</h2>
                <p className="mt-2 text-sm text-slate-400">{error || 'This account could not be loaded.'}</p>
                <button onClick={() => navigate('/')} className="btn-outline mt-6">Back to home</button>
            </div>
        );
    }

    const profileImage = avatarSrc(user.profile?.profile_image);

    return (
        <div className="space-y-6">
            <section className="surface overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-emerald-600/20 via-slate-900 to-teal-500/10" />
                <div className="px-6 pb-6 sm:px-8">
                    <div className="-mt-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-slate-900 bg-slate-800">
                                {profileImage || imagePreview ? (
                                    <img src={imagePreview || profileImage} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-slate-300">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                                {currentUserId === id && (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="absolute inset-0 flex items-center justify-center bg-slate-950/55 text-white opacity-0 transition hover:opacity-100"
                                    >
                                        <CameraPlus className="h-6 w-6" />
                                    </button>
                                )}
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold text-slate-100">{user.name}</h1>
                                <p className="mt-1 text-sm text-slate-500">@{user.name?.toLowerCase().replace(/\s+/g, '_')}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="status-chip">
                                        <EnvelopeSimple className="h-4 w-4" />
                                        {user.email}
                                    </span>
                                    <span className="status-chip">
                                        <CalendarBlank className="h-4 w-4" />
                                        Joined {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                            {currentUserId === id ? (
                                <button onClick={() => setShowEditModal(true)} className="btn-primary">
                                    <PencilSimple className="h-4 w-4" />
                                    Edit profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={followingLoading}
                                        className={cn("btn-base border", isFollowing ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" : "btn-primary")}
                                    >
                                        {followingLoading ? (
                                            <CircleNotch className="h-4 w-4 animate-spin" />
                                        ) : isFollowing ? (
                                            <>
                                                <UserCheck className="h-4 w-4" />
                                                Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="h-4 w-4" />
                                                Follow
                                            </>
                                        )}
                                    </button>
                                    <button onClick={() => navigate(`/chat/${id}`)} className="btn-outline">
                                        <ChatCircleDots className="h-4 w-4" />
                                        Message
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-300">
                        {user.profile?.bio || 'No bio added yet.'}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="surface-muted p-4">
                            <p className="text-2xl font-semibold text-slate-100">{user.posts?.length || 0}</p>
                            <p className="mt-1 text-sm text-slate-500">Posts</p>
                        </div>
                        <div className="surface-muted p-4">
                            <p className="text-2xl font-semibold text-slate-100">{counts.followers_count}</p>
                            <p className="mt-1 text-sm text-slate-500">Followers</p>
                        </div>
                        <div className="surface-muted p-4">
                            <p className="text-2xl font-semibold text-slate-100">{counts.following_count}</p>
                            <p className="mt-1 text-sm text-slate-500">Following</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="section-title">Posts</h2>
                    <p className="section-copy">Everything published by this user.</p>
                </div>

                {user.posts?.length ? (
                    user.posts.map((post) => <PostCard key={post.id} post={{ ...post, user }} onRefresh={fetchProfile} />)
                ) : (
                    <div className="surface p-8 text-center text-sm text-slate-400">No posts to show yet.</div>
                )}
            </section>

            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                    <div className="surface w-full max-w-lg p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-100">Edit profile</h3>
                                <p className="mt-1 text-sm text-slate-400">Update your public information.</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSave} className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-800">
                                    {imagePreview || profileImage ? (
                                        <img src={imagePreview || profileImage} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-slate-300">
                                            {user.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-outline">
                                        <CameraPlus className="h-4 w-4" />
                                        Change photo
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(event) => {
                                            const file = event.target.files[0];
                                            if (!file) return;
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-300">Name</label>
                                <input
                                    className="input-minimal"
                                    value={editForm.name}
                                    onChange={(event) => setEditForm((form) => ({ ...form, name: event.target.value }))}
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-300">Email</label>
                                <input
                                    type="email"
                                    className="input-minimal"
                                    value={editForm.email}
                                    onChange={(event) => setEditForm((form) => ({ ...form, email: event.target.value }))}
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-300">Bio</label>
                                <textarea
                                    className="input-minimal min-h-[120px] resize-none"
                                    value={editForm.bio}
                                    onChange={(event) => setEditForm((form) => ({ ...form, bio: event.target.value }))}
                                    disabled={saving}
                                />
                            </div>

                            {editError && (
                                <div className="surface-muted flex items-center gap-2 p-3 text-sm text-red-300">
                                    <WarningCircle className="h-4 w-4" />
                                    {editError}
                                </div>
                            )}

                            {editSuccess && <div className="surface-muted p-3 text-sm text-emerald-300">Profile updated successfully.</div>}

                            <button type="submit" disabled={saving} className="btn-primary w-full">
                                {saving ? <CircleNotch className="h-5 w-5 animate-spin" /> : 'Save changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

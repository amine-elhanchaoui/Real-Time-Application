import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { EnvelopeSimple, LockSimple, CircleNotch, WarningCircle } from '@phosphor-icons/react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_id', response.data.user.id);
            localStorage.setItem('user_name', response.data.user.name);
            localStorage.setItem('user_role', response.data.user.role);

            const profileImage = response.data.user.profile?.profile_image;
            if (profileImage) {
                localStorage.setItem('profile_image', profileImage.startsWith('http') ? profileImage : `/storage/${profileImage}`);
            }

            window.location.href = '/';
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl items-center justify-center">
            <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="surface hidden p-8 lg:flex lg:flex-col lg:justify-between border-l-4 border-l-emerald-600">
                    <div>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/5 p-1">
                                <img src="/storage/logo.jpeg" alt="Logo" className="h-full w-full rounded-xl object-cover shadow-2xl shadow-emerald-500/20" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Energy App</h1>
                                <div className="status-chip border-emerald-500/30 text-emerald-400 bg-emerald-500/10">v2.0 Stable</div>
                            </div>
                        </div>
                        <h2 className="text-4xl font-semibold leading-tight text-slate-100">
                            Efficient energy management, <span className="text-emerald-500">simplified</span>.
                        </h2>
                        <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
                            Track your resources, manage operations, and stay connected with your team in one unified, real-time platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="surface-muted p-4 border-b-2 border-b-emerald-600/50">
                            <p className="text-2xl font-semibold text-slate-100">Analytics</p>
                            <p className="mt-1 text-sm text-slate-500">Real-time data</p>
                        </div>
                        <div className="surface-muted p-4">
                            <p className="text-2xl font-semibold text-slate-100">Alerts</p>
                            <p className="mt-1 text-sm text-slate-500">Instant updates</p>
                        </div>
                        <div className="surface-muted p-4">
                            <p className="text-2xl font-semibold text-slate-100">Reports</p>
                            <p className="mt-1 text-sm text-slate-500">Unified views</p>
                        </div>
                    </div>
                </section>

                <section className="surface p-6 sm:p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-100">Welcome Back</h2>
                        <p className="mt-2 text-sm text-slate-400">Please enter your credentials to access the system.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email Address</label>
                            <div className="relative">
                                <EnvelopeSimple className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    className="input-minimal pl-11 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-sm"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="yourname@energy-app.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                            </div>
                            <div className="relative">
                                <LockSimple className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    className="input-minimal pl-11 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-sm"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="surface-muted flex items-center gap-3 border-l-4 border-l-red-500 p-4 text-sm text-red-100 bg-red-500/10">
                                <WarningCircle className="h-5 w-5 text-red-400" />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base shadow-xl">
                            {loading ? <CircleNotch className="h-5 w-5 animate-spin" /> : 'Access Dashboard'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        New team member?{' '}
                        <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                            Request Access
                        </Link>
                    </p>
                </section>
            </div>
        </div>
    );
}

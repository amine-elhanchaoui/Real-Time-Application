import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { EnvelopeSimple, LockSimple, CircleNotch, WarningCircle, Lightning, ChartLine, BellRinging } from '@phosphor-icons/react';

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

            if (window.initEcho) window.initEcho();
            window.location.href = '/';
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center justify-center py-8">
            <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="auth-hero hidden flex-col justify-between lg:flex">
                    <div>
                        <div className="mb-10 flex items-center gap-4">
                            <div className="logo-ring h-16 w-16">
                                <div className="logo-ring-inner h-full w-full">
                                    <img src="/storage/logo.jpeg" alt="Harmony" className="h-full w-full rounded-[14px] object-cover" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Harmony</h1>
                                <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Connected Digital Solutions</p>
                            </div>
                        </div>

                        <h2 className="text-4xl font-bold leading-tight text-white">
                            Energy management,{' '}
                            <span className="text-gradient">reimagined.</span>
                        </h2>
                        <p className="mt-4 max-w-md text-base leading-7 text-slate-400">
                            Real-time messaging, live notifications, and a connected team — all in one beautiful platform.
                        </p>
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-3">
                        {[
                            { icon: Lightning, label: 'Real-time', sub: 'Live updates' },
                            { icon: ChartLine, label: 'Analytics', sub: 'Smart data' },
                            { icon: BellRinging, label: 'Alerts', sub: 'Instant ping' },
                        ].map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="stat-card text-center">
                                <Icon className="mx-auto h-5 w-5 text-violet-400" weight="duotone" />
                                <p className="mt-2 text-sm font-bold text-white">{label}</p>
                                <p className="text-xs text-slate-500">{sub}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="surface-glow p-6 sm:p-8">
                    <div className="mb-8 lg:hidden">
                        <div className="logo-ring mx-auto mb-4 h-14 w-14">
                            <div className="logo-ring-inner h-full w-full">
                                <img src="/storage/logo.jpeg" alt="Harmony" className="h-full w-full rounded-[12px] object-cover" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Welcome back</p>
                        <h2 className="mt-1 text-2xl font-bold text-white">Sign in to Harmony</h2>
                        <p className="mt-2 text-sm text-slate-400">Enter your credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
                            <div className="relative">
                                <EnvelopeSimple className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    className="input-minimal pl-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@harmony.app"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                            <div className="relative">
                                <LockSimple className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    className="input-minimal pl-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                                <WarningCircle className="h-5 w-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                            {loading ? <CircleNotch className="h-5 w-5 animate-spin" /> : 'Enter Harmony →'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        New here?{' '}
                        <Link to="/register" className="font-semibold text-gradient hover:opacity-80">
                            Create an account
                        </Link>
                    </p>
                </section>
            </div>
        </div>
    );
}

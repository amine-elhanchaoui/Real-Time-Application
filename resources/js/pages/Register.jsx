import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { User, EnvelopeSimple, LockSimple, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('/api/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_id', response.data.user.id);
            localStorage.setItem('user_name', response.data.user.name);
            localStorage.setItem('user_role', response.data.user.role);
            if (window.initEcho) window.initEcho();
            window.location.href = '/';
        } catch (requestError) {
            if (requestError.response?.status === 422) {
                setErrors(requestError.response.data.errors);
            } else {
                setErrors({ general: ['Something went wrong. Please try again.'] });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg items-center justify-center py-8">
            <section className="surface-glow w-full p-6 sm:p-8">
                <div className="mb-8 text-center">
                    <div className="logo-ring mx-auto mb-5 h-16 w-16">
                        <div className="logo-ring-inner h-full w-full">
                            <img src="/storage/logo.jpeg" alt="Harmony" className="h-full w-full rounded-[14px] object-cover" />
                        </div>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Join Harmony</p>
                    <h1 className="mt-1 text-2xl font-bold text-white">Create your account</h1>
                    <p className="mt-2 text-sm text-slate-400">Start connecting with your team today.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                                className={cn('input-minimal pl-11', errors.name && 'border-red-500/50')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                required
                                disabled={loading}
                            />
                        </div>
                        {errors.name && <p className="text-sm text-red-300">{errors.name[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
                        <div className="relative">
                            <EnvelopeSimple className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                className={cn('input-minimal pl-11', errors.email && 'border-red-500/50')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@harmony.app"
                                required
                                disabled={loading}
                            />
                        </div>
                        {errors.email && <p className="text-sm text-red-300">{errors.email[0]}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                            <div className="relative">
                                <LockSimple className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    className={cn('input-minimal pl-11', errors.password && 'border-red-500/50')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 8 chars"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm</label>
                            <div className="relative">
                                <LockSimple className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    className="input-minimal pl-11"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="Repeat"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {errors.password && <p className="text-sm text-red-300">{errors.password[0]}</p>}
                    {errors.general && (
                        <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                            <WarningCircle className="h-4 w-4" />
                            {errors.general[0]}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                        {loading ? <CircleNotch className="h-5 w-5 animate-spin" /> : 'Create account →'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-gradient">Sign in</Link>
                </p>
            </section>
        </div>
    );
}

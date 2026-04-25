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
        <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-3xl items-center justify-center">
            <section className="surface w-full p-6 sm:p-8">
                <div className="mb-8">
                    <div className="status-chip mb-4">Create account</div>
                    <h1 className="text-2xl font-semibold text-slate-100">Set up your profile</h1>
                    <p className="mt-2 text-sm text-slate-400">Keep it minimal. You can update your info later from the profile page.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-300">Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                                className={cn("input-minimal pl-11", errors.name && "border-red-500/50")}
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Your name"
                                required
                                disabled={loading}
                            />
                        </div>
                        {errors.name && <p className="text-sm text-red-300">{errors.name[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-300">Email</label>
                        <div className="relative">
                            <EnvelopeSimple className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                className={cn("input-minimal pl-11", errors.email && "border-red-500/50")}
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="name@example.com"
                                required
                                disabled={loading}
                            />
                        </div>
                        {errors.email && <p className="text-sm text-red-300">{errors.email[0]}</p>}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-300">Password</label>
                            <div className="relative">
                                <LockSimple className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    className={cn("input-minimal pl-11", errors.password && "border-red-500/50")}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Minimum 8 characters"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-slate-300">Confirm password</label>
                            <div className="relative">
                                <LockSimple className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    className="input-minimal pl-11"
                                    value={passwordConfirmation}
                                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                                    placeholder="Repeat password"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {errors.password && <p className="text-sm text-red-300">{errors.password[0]}</p>}

                    {errors.general && (
                        <div className="surface-muted flex items-center gap-2 p-3 text-sm text-red-300">
                            <WarningCircle className="h-4 w-4" />
                            {errors.general[0]}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                        {loading ? <CircleNotch className="h-5 w-5 animate-spin" /> : 'Create account'}
                    </button>
                </form>

                <p className="mt-6 text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
                        Sign in
                    </Link>
                </p>
            </section>
        </div>
    );
}

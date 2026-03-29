import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('username', username);
        formData.append('bio', bio);
        if (image) {
            formData.append('profile_image', image);
        }

        try {
            const response = await axios.post('/api/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_id', response.data.user.id);
            window.dispatchEvent(new Event('auth-change'));
            if (window.initEcho) window.initEcho();
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.username?.[0] || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center py-20 px-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm bg-opacity-80">
                <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Create Account
                </h2>
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            placeholder="Full Name"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            placeholder="Unique Username"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            placeholder="Email Address"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            placeholder="Tell us a bit about yourself! (Bio)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Profile Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 transition-all cursor-pointer"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 transform transition-all active:scale-95"
                    >
                        Get Started
                    </button>
                </form>
                <p className="mt-8 text-center text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

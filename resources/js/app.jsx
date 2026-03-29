import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import PostDetails from './pages/PostDetails';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-950 text-slate-100 font-['Outfit']">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile/:id" element={<Profile />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/post/:id" element={<PostDetails />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}

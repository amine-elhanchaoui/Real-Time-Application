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
import Chat from './pages/Chat';

function App() {
    return (
        <Router>
            <div className="app-shell">
                <Navbar />
                <main className="page-wrap">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile/:id" element={<Profile />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/post/:id" element={<PostDetails />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/chat/:userId" element={<Chat />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(<App />);
}

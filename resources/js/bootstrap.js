import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { resetEchoChannels } from './lib/echoManager';

window.axios = axios;
window.Pusher = Pusher;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

window.initEcho = () => {
    const token = localStorage.getItem('token');

    if (token) {
        window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete window.axios.defaults.headers.common['Authorization'];
        if (window.Echo) {
            window.Echo.disconnect();
            window.Echo = null;
            resetEchoChannels();
        }
        return;
    }

    const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';
    const port = Number(import.meta.env.VITE_REVERB_PORT ?? 8080);

    if (window.Echo) {
        window.Echo.disconnect();
        resetEchoChannels();
    }

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
        wsPort: port,
        wssPort: port,
        forceTLS: scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });

    Pusher.logToConsole = import.meta.env.DEV;
};

if (localStorage.getItem('token')) {
    window.initEcho();
}

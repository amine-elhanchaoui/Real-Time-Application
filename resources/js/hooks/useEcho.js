import { useEffect, useRef } from 'react';
import { subscribePrivate } from '../lib/echoManager';

export function useEchoPrivate(channelName, eventName, handler, enabled = true) {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        if (!enabled || !channelName || !eventName) return;

        return subscribePrivate(channelName, eventName, (event) => handlerRef.current(event));
    }, [channelName, eventName, enabled]);
}

export function useEchoChannel(channelName, listeners, enabled = true) {
    const listenersRef = useRef(listeners);
    listenersRef.current = listeners;

    useEffect(() => {
        if (!enabled || !channelName) return;

        const cleanups = Object.entries(listenersRef.current).map(([eventName, fn]) =>
            subscribePrivate(channelName, eventName, fn)
        );

        return () => cleanups.forEach((cleanup) => cleanup());
    }, [channelName, enabled]);
}

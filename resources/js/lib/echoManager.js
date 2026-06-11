/**
 * One Echo subscription per channel — multiple components can listen safely.
 */
const privateChannels = new Map();

function getPrivateChannel(channelName) {
    if (!window.Echo) return null;

    if (!privateChannels.has(channelName)) {
        privateChannels.set(channelName, {
            channel: window.Echo.private(channelName),
            subscriptions: new Map(),
            nextId: 0,
        });
    }

    return privateChannels.get(channelName);
}

export function subscribePrivate(channelName, eventName, handler) {
    const entry = getPrivateChannel(channelName);
    if (!entry) return () => {};

    const id = ++entry.nextId;
    const listener = (event) => handler(event);
    entry.channel.listen(eventName, listener);
    entry.subscriptions.set(id, { eventName, listener });

    return () => {
        const current = privateChannels.get(channelName);
        if (!current) return;

        const sub = current.subscriptions.get(id);
        if (sub) {
            current.channel.stopListening(sub.eventName, sub.listener);
            current.subscriptions.delete(id);
        }
    };
}

export function resetEchoChannels() {
    privateChannels.clear();
}

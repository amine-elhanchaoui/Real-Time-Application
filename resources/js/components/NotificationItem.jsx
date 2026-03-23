import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export default function NotificationItem({ notification, onRead }) {
    const { sender, type, data, created_at, is_read } = notification;
    
    // Parse data safely if it's a string (though Laravel should cast it)
    const notificationData = typeof data === 'string' ? JSON.parse(data) : data;
    const message = notificationData?.message || 'New activity on your post';

    return (
        <div 
            onClick={() => !is_read && onRead(notification.id)}
            className={`p-4 flex items-start gap-4 transition-all cursor-pointer hover:bg-slate-800/50 ${!is_read ? 'bg-cyan-500/5' : ''}`}
        >
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                {sender?.profile?.profile_image ? (
                    <img 
                        src={sender.profile.profile_image.startsWith('http') ? sender.profile.profile_image : `/storage/${sender.profile.profile_image}`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <span className="text-slate-400 font-bold">{sender?.name?.charAt(0)}</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <Link to={notificationData?.post_id ? `/post/${notificationData.post_id}` : '#'} className="block group">
                    <p className={`text-sm ${is_read ? 'text-slate-400' : 'text-slate-200'} transition-colors group-hover:text-cyan-400`}>
                        <span className="font-bold text-slate-100">{sender?.name}</span> {message}
                    </p>
                </Link>
                <p className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                </p>
            </div>
            {!is_read && (
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 mt-2"></div>
            )}
        </div>
    );
}

<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Return the list of unique conversation partners with the last message and unread count.
     */
    public function conversations(Request $request)
    {
        $userId = Auth::id();

        // Get the distinct conversation partners
        $partners = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($m) => $m->sender_id === $userId ? $m->receiver_id : $m->sender_id)
            ->unique()
            ->values();

        $conversations = $partners->map(function ($partnerId) use ($userId) {
            $partner = User::with('profile')->find($partnerId);

            $lastMessage = Message::where(function ($q) use ($userId, $partnerId) {
                    $q->where('sender_id', $userId)->where('receiver_id', $partnerId);
                })->orWhere(function ($q) use ($userId, $partnerId) {
                    $q->where('sender_id', $partnerId)->where('receiver_id', $userId);
                })
                ->latest()
                ->first();

            $unread = Message::where('sender_id', $partnerId)
                ->where('receiver_id', $userId)
                ->whereNull('read_at')
                ->count();

            return [
                'partner'      => $partner,
                'last_message' => $lastMessage,
                'unread_count' => $unread,
            ];
        })->sortByDesc(fn($c) => optional($c['last_message'])->created_at)->values();

        return response()->json($conversations);
    }

    /**
     * Return all messages between the authenticated user and {userId}. Marks incoming as read.
     */
    public function history(Request $request, $userId)
    {
        $authId = Auth::id();

        // Mark messages from this partner as read
        Message::where('sender_id', $userId)
            ->where('receiver_id', $authId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = Message::with('sender.profile')
            ->where(function ($q) use ($authId, $userId) {
                $q->where('sender_id', $authId)->where('receiver_id', $userId);
            })->orWhere(function ($q) use ($authId, $userId) {
                $q->where('sender_id', $userId)->where('receiver_id', $authId);
            })
            ->orderBy('created_at')
            ->get();

        $partner = User::with('profile')->findOrFail($userId);

        return response()->json([
            'messages' => $messages,
            'partner'  => $partner,
        ]);
    }

    /**
     * Send a new message.
     */
    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'body'        => 'required|string|max:5000',
        ]);

        $message = Message::create([
            'sender_id'   => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'body'        => $request->body,
        ]);

        broadcast(new MessageSent($message));

        return response()->json($message->load('sender.profile'), 201);
    }

    /**
     * Total unread messages count for the authenticated user (for Navbar badge).
     */
    public function unreadCount(Request $request)
    {
        $count = Message::where('receiver_id', Auth::id())
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }
}

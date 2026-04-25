<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Notification;
use App\Events\GotNewNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    public function toggle(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $authenticatedUser = Auth::user();
        $targetUser = User::findOrFail($request->user_id);

        if ($authenticatedUser->id === $targetUser->id) {
            return response()->json(['message' => 'You cannot follow yourself'], 400);
        }

        $isFollowing = $authenticatedUser->following()->where(function($query) use ($targetUser) {
            $query->where('following_id', $targetUser->id);
        })->exists();

        if ($isFollowing) {
            $authenticatedUser->following()->detach($targetUser->id);
            return response()->json(['message' => 'Unfollowed', 'is_following' => false]);
        } else {
            $authenticatedUser->following()->attach($targetUser->id);

            // Create notification
            $notification = Notification::create([
                'from_user_id' => $authenticatedUser->id,
                'to_user_id' => $targetUser->id,
                'type' => 'follow',
                'data' => [
                    'message' => "{$authenticatedUser->name} started following you.",
                    'follower_name' => $authenticatedUser->name,
                    'follower_id' => $authenticatedUser->id
                ]
            ]);

            // Broadcast real-time notification
            broadcast(new GotNewNotification($targetUser->id, $notification));

            return response()->json(['message' => 'Followed', 'is_following' => true]);
        }
    }

    public function check(User $user)
    {
        $isFollowing = Auth::user()->following()->where(function($query) use ($user) {
            $query->where('following_id', $user->id);
        })->exists();
        return response()->json(['is_following' => $isFollowing]);
    }

    public function counts(User $user)
    {
        return response()->json([
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count()
        ]);
    }
}

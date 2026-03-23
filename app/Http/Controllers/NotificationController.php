<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $notifications = Notification::with('sender.profile','receiver.profile')
            ->where('to_user_id', Auth::id())
            ->latest()
            ->get();
        return response()->json($notifications);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function unreadCount()
    {
        $count = Notification::where('to_user_id', Auth::id()) // Changed receiver_id to to_user_id to match existing code
            ->where('is_read', false)
            ->count();
        return response()->json(['count' => $count]);
    }

    public function markAsRead(string $id)
    {
        $notifiation=Notification::findOrFail($id);
        if($notifiation->to_user_id != Auth::id()){
            return response()->json(['error'=>'Unauthorized'],403);
        }
        $notifiation->update(['is_read'=>true]);
        return response()->json(['message'=>'Notification marked as read']);
    }
}

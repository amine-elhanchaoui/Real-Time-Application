<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        $profile = User::with(['profile', 'posts.user.profile', 'comments.user.profile', 'likes.user'])
            ->findOrFail($id);
        return response()->json($profile);
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
        $user = User::findOrFail($id);
        
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($user->profile) {
            $user->profile->update([
                'bio' => $request->bio,
                'profile_image' => $request->profile_image,
            ]);
        } else {
            $user->profile()->create([
                'username' => strtolower(str_replace(' ', '', $user->name)), // simple default
                'bio' => $request->bio,
                'profile_image' => $request->profile_image,
            ]);
        }

        return response()->json($user->load('profile'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

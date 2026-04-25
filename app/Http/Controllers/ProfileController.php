<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $profile = User::with(['profile', 'posts.user.profile', 'comments.user.profile', 'likes.user'])
            ->findOrFail($id);
        return response()->json($profile);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $user->update([
            'name'  => $request->name,
            'email' => $request->email,
        ]);

        $profileData = [
            'bio' => $request->bio,
        ];

        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            // Delete old image if it exists and is stored locally
            if ($user->profile && $user->profile->profile_image && !str_starts_with($user->profile->profile_image, 'http')) {
                Storage::disk('public')->delete($user->profile->profile_image);
            }
            $path = $request->file('profile_image')->store('profile-images', 'public');
            $profileData['profile_image'] = $path;
        }

        if ($user->profile) {
            $user->profile->update($profileData);
        } else {
            $user->profile()->create(array_merge($profileData, [
                'username' => strtolower(str_replace(' ', '', $user->name)),
            ]));
        }

        return response()->json($user->load('profile'));
    }
}

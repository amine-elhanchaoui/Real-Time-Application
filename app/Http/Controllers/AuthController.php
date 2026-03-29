<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class AuthController extends Controller
{
    //
    public function login(Request $request)
{
    
    if (!Auth::attempt([
        'email' => $request->email,
        'password' => $request->password
    ])) {
        return response()->json(['message' => 'Login failed'], 401);
    }

    
    $user = Auth::user();

    
    $token = $user->createToken('token')->plainTextToken;

    // response
    return response()->json([
        'user' => $user,
        'token' => $token
    ]);
}

public function register(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8',
        'username' => 'required|string|max:255|unique:profils',
        'profile_image' => 'nullable|image|max:2048',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => bcrypt($request->password),
    ]);

    $imagePath = null;
    if ($request->hasFile('profile_image')) {
        $imagePath = $request->file('profile_image')->store('profiles', 'public');
    } else {
        $imagePath = 'https://ui-avatars.com/api/?name='.urlencode($user->name);
    }

    \App\Models\Profil::create([
        'user_id' => $user->id,
        'username' => $request->username,
        'bio' => $request->bio,
        'profile_image' => $imagePath,
    ]);

    $token = $user->createToken('token')->plainTextToken;

    return response()->json([
        'user' => $user->load('profile'),
        'token' => $token
    ]);
}
}

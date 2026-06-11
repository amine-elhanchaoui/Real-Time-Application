<?php

namespace App\Http\Controllers;

use App\Models\Profil;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        if (! Auth::attempt([
            'email' => $request->email,
            'password' => $request->password,
        ])) {
            return response()->json(['message' => 'Login failed'], 401);
        }

        $user = Auth::user()->load('profile');
        $token = $user->createToken('token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'username' => 'nullable|string|max:255|unique:profils',
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

        Profil::create([
            'user_id' => $user->id,
            'username' => $request->filled('username')
                ? $request->username
                : $this->generateUsername($request->name, $request->email),
            'bio' => $request->bio,
            'profile_image' => $imagePath,
        ]);

        $token = $user->createToken('token')->plainTextToken;

        return response()->json([
            'user' => $user->load('profile'),
            'token' => $token,
        ]);
    }

    private function generateUsername(string $name, string $email): string
    {
        $base = Str::slug($name, '_') ?: Str::before($email, '@');
        $base = Str::limit($base ?: 'user', 240, '');
        $username = $base;
        $suffix = 1;

        while (Profil::where('username', $username)->exists()) {
            $username = Str::limit($base, 240 - strlen((string) $suffix) - 1, '').'_'.$suffix;
            $suffix++;
        }

        return $username;
    }
}

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
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => bcrypt($request->password),
    ]);

    $token = $user->createToken('token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token
    ]);
}
}

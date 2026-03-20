<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;
    //
   protected $fillable = ['name', 'email', 'password'];
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    // 💬 comments
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // ❤️ likes
    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    // notifications received
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'to_user_id');
    }

    // notifications sent
    public function sentNotifications()
    {
        return $this->hasMany(Notification::class, 'from_user_id');
    }
    public function profile()
{
    return $this->hasOne(Profil::class);
}
}

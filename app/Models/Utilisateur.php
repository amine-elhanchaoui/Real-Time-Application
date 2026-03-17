<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Utilisateur extends Model
{
    //
    // 🔥 user عندو بزاف ديال posts
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

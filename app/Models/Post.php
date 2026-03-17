<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    // 👤 owner
    public function user()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    // 💬 comments
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // ❤️ likes (polymorphic)
    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = ['user_id', 'title', 'content'];
    // 👤 owner
    public function user()
    {
        return $this->belongsTo(User::class);
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
}
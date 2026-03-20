<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = ['user_id', 'post_id', 'content'];
    // 👤 owner
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 📝 post
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    // ❤️ likes
    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }
}

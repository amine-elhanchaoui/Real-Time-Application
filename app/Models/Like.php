<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    // 👤 user
    public function user()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    // 🎯 target (post or comment)
    public function likeable()
    {
        return $this->morphTo();
    }
}

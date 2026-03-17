<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    public function sender()
{
    return $this->belongsTo(Utilisateur::class, 'from_user_id');
}

public function receiver()
{
    return $this->belongsTo(Utilisateur::class, 'to_user_id');
}
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;
    protected $fillable = ['to_user_id', 'from_user_id', 'type', 'data', 'is_read'];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
    ];
    public function sender()
{
    return $this->belongsTo(User::class, 'from_user_id');
}

public function receiver()
{
    return $this->belongsTo(User::class, 'to_user_id');
}
}

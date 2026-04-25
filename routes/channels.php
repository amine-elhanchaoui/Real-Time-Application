<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
Broadcast::channel('presence-online', function ($user) {
    return ['id' => $user->id, 'name' => $user->name, 'profile_image' => $user->profile?->profile_image];
}, ['guards' => ['sanctum']]);
Broadcast::channel('chat.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

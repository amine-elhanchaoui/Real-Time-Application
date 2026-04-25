<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/test', function () {
    return "API works";
});


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function() {
    Route::get('/dashboard', function() {
        return "You are logged in!";
    });

    // Posts
    Route::apiResource('posts', \App\Http\Controllers\PostController::class);
    
    // Profile
    Route::get('/profile/{id}', [\App\Http\Controllers\ProfileController::class, 'show']);
    Route::post('/profile/{id}', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::put('/profile/{id}', [\App\Http\Controllers\ProfileController::class, 'update']);

    // Comments
    Route::post('comments', [\App\Http\Controllers\CommentController::class, 'store']);
    Route::get('posts/{id}/comments', [\App\Http\Controllers\CommentController::class, 'getByPostId']);

    // Likes
    Route::post('likes/toggle', [\App\Http\Controllers\LikeController::class, 'toggle']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);

    // Follows
    Route::post('/follows/toggle', [\App\Http\Controllers\FollowController::class, 'toggle']);
    Route::get('/follows/{user}/check', [\App\Http\Controllers\FollowController::class, 'check']);
    Route::get('/follows/{user}/counts', [\App\Http\Controllers\FollowController::class, 'counts']);

    // Chat
    Route::get('/conversations', [\App\Http\Controllers\ChatController::class, 'conversations']);
    Route::get('/messages/unread-count', [\App\Http\Controllers\ChatController::class, 'unreadCount']);
    Route::get('/messages/{userId}', [\App\Http\Controllers\ChatController::class, 'history']);
    Route::post('/messages', [\App\Http\Controllers\ChatController::class, 'send']);
});
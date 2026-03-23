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
    
    // Comments
    Route::post('comments', [\App\Http\Controllers\CommentController::class, 'store']);
    Route::get('posts/{id}/comments', [\App\Http\Controllers\CommentController::class, 'getByPostId']);

    // Likes
    Route::post('likes/toggle', [\App\Http\Controllers\LikeController::class, 'toggle']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
});
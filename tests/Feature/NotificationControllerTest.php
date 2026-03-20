<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;
use App\Models\User;
use App\Models\Notification;
use App\Http\Controllers\NotificationController;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        Route::middleware('web')->group(function () {
            Route::get('/notifications', [NotificationController::class, 'index']);
            Route::put('/notifications/{id}/mark-read', [NotificationController::class, 'MarkAsRead']);
        });
    }

    public function test_user_can_get_notifications()
    {
        $user = User::factory()->create();
        
        // Ensure Notification model has 'to_user_id' appropriately.
        // If there are other required fields, this might fail, but let's assume standard usage.
        Notification::create([
            'to_user_id' => $user->id,
            'from_user_id' => $user->id,
            'type' => 'test',
            'data' => json_encode(['foo' => 'bar'])
        ]);

        $response = $this->actingAs($user)->getJson('/notifications');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }

    public function test_user_can_mark_notification_as_read()
    {
        $user = User::factory()->create();
        
        $notification = Notification::create([
            'to_user_id' => $user->id,
            'from_user_id' => $user->id,
            'type' => 'test',
            'data' => json_encode(['foo' => 'bar']),
            'is_read' => false
        ]);

        $response = $this->actingAs($user)->putJson('/notifications/' . $notification->id . '/mark-read');

        $response->assertStatus(200);
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => 1
        ]);
    }

    public function test_user_cannot_mark_others_notification_as_read()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        
        $notification = Notification::create([
            'to_user_id' => $owner->id,
            'from_user_id' => $otherUser->id,
            'type' => 'test',
            'data' => json_encode(['foo' => 'bar']),
            'is_read' => false
        ]);

        $response = $this->actingAs($otherUser)->putJson('/notifications/' . $notification->id . '/mark-read');

        $response->assertStatus(403);
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => 0
        ]);
    }
}

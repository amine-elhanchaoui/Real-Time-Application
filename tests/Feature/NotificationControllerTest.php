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

    public function test_user_can_get_notifications()
    {
        $user = User::factory()->create();
        
        Notification::create([
            'to_user_id' => $user->id,
            'from_user_id' => $user->id,
            'type' => 'test',
            'data' => ['foo' => 'bar']
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/notifications');

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
            'data' => ['foo' => 'bar'],
            'is_read' => false
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/notifications/' . $notification->id . '/read');

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
            'data' => ['foo' => 'bar'],
            'is_read' => false
        ]);

        $response = $this->actingAs($otherUser, 'sanctum')->postJson('/api/notifications/' . $notification->id . '/read');

        $response->assertStatus(403);
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => 0
        ]);
    }
}

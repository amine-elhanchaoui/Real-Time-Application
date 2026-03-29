<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Post;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_comment_triggers_notification()
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($visitor);

        $response = $this->postJson('/api/comments', [
            'post_id' => $post->id,
            'content' => 'Nice post!',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('notifications', [
            'from_user_id' => $visitor->id,
            'to_user_id' => $owner->id,
            'type' => 'comment',
        ]);
    }

    public function test_like_triggers_notification()
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($visitor);

        $response = $this->postJson('/api/likes/toggle', [
            'post_id' => $post->id,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('notifications', [
            'from_user_id' => $visitor->id,
            'to_user_id' => $owner->id,
            'type' => 'like',
        ]);
    }

    public function test_unread_count_endpoint()
    {
        $user = User::factory()->create();
        Notification::factory()->count(3)->create([
            'to_user_id' => $user->id,
            'is_read' => false,
            'data' => ['message' => 'Test'],
            'from_user_id' => User::factory()->create()->id,
            'type' => 'like'
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/notifications/unread-count');

        $response->assertStatus(200)
                 ->assertJson(['count' => 3]);
    }
}

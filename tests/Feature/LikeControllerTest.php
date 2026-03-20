<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use App\Models\Like;
use App\Http\Controllers\LikeController;

class LikeControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        Route::middleware('web')->group(function () {
            Route::post('/likes/toggle', [LikeController::class, 'toggle']);
        });
    }

    public function test_user_can_toggle_like()
    {
        $user = User::factory()->create();
        $post = Post::create([
            'user_id' => $user->id,
            'title' => 'Test Post',
            'content' => 'Post Content'
        ]);

        // Like the post
        $response = $this->actingAs($user)->postJson('/likes/toggle', [
            'post_id' => $post->id,
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Like created successfully']);
        $this->assertDatabaseHas('likes', [
            'post_id' => $post->id,
            'user_id' => $user->id
        ]);

        // Unlike the post (toggle again)
        $response2 = $this->actingAs($user)->postJson('/likes/toggle', [
            'post_id' => $post->id,
        ]);

        $response2->assertStatus(200);
        $response2->assertJsonFragment(['message' => 'Like deleted successfully']);
        $this->assertDatabaseMissing('likes', [
            'post_id' => $post->id,
            'user_id' => $user->id
        ]);
    }
}

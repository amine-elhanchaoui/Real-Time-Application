<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use App\Http\Controllers\PostController;

class PostControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Dynamically register routes for testing
        Route::middleware('web')->group(function () {
            Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
            Route::post('/posts', [PostController::class, 'store']);
            Route::get('/posts/{post}', [PostController::class, 'show']);
            Route::put('/posts/{post}', [PostController::class, 'update']);
            Route::delete('/posts/{post}', [PostController::class, 'destroy']);
        });
    }

    public function test_index_returns_view_with_posts()
    {
        $user = User::factory()->create();
        Post::create([
            'user_id' => $user->id,
            'title' => 'Test Post',
            'content' => 'This is a test content'
        ]);

        $response = $this->actingAs($user)->get('/posts');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'title', 'content', 'user_id']
            ],
            'current_page',
            'last_page'
        ]);
    }

    public function test_user_can_create_post()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/posts', [
            'title' => 'New Title',
            'content' => 'New Content'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('posts', [
            'title' => 'New Title',
            'content' => 'New Content',
            'user_id' => $user->id
        ]);
    }

    public function test_user_can_view_post()
    {
        $user = User::factory()->create();
        $post = Post::create([
            'user_id' => $user->id,
            'title' => 'Test',
            'content' => 'Content'
        ]);

        $response = $this->actingAs($user)->getJson('/posts/' . $post->id);

        $response->assertStatus(200);
        $response->assertJsonFragment(['title' => 'Test']);
    }

    public function test_user_can_update_post()
    {
        $user = User::factory()->create();
        $post = Post::create([
            'user_id' => $user->id,
            'title' => 'Old Title',
            'content' => 'Old Content'
        ]);

        $response = $this->actingAs($user)->putJson('/posts/' . $post->id, [
            'title' => 'Updated Title',
            'content' => 'Updated Content'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'title' => 'Updated Title',
            'content' => 'Updated Content'
        ]);
    }

    public function test_user_can_delete_own_post()
    {
        $user = User::factory()->create();
        $post = Post::create([
            'user_id' => $user->id,
            'title' => 'To Delete',
            'content' => 'Content'
        ]);

        $response = $this->actingAs($user)->deleteJson('/posts/' . $post->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    public function test_user_cannot_delete_others_post()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        
        $post = Post::create([
            'user_id' => $owner->id,
            'title' => 'Others Post',
            'content' => 'Content'
        ]);

        $response = $this->actingAs($otherUser)->deleteJson('/posts/' . $post->id);

        $response->assertStatus(403);
        $this->assertDatabaseHas('posts', ['id' => $post->id]);
    }
}

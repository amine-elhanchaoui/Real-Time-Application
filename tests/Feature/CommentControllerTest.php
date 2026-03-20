<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Http\Controllers\CommentController;

class CommentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        Route::middleware('web')->group(function () {
            Route::post('/comments', [CommentController::class, 'store']);
            Route::get('/posts/{post}/comments', [CommentController::class, 'getByPostId']);
        });
    }

    public function test_user_can_add_comment_to_post()
    {
        $user = User::factory()->create();
        $post = Post::create([
            'user_id' => $user->id,
            'title' => 'Test Post',
            'content' => 'Post Content'
        ]);

        $response = $this->actingAs($user)->postJson('/comments', [
            'post_id' => $post->id,
            'content' => 'This is a comment'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('comments', [
            'post_id' => $post->id,
            'content' => 'This is a comment',
            'user_id' => $user->id
        ]);
    }

    public function test_can_get_comments_by_post_id()
    {
        $user = User::factory()->create();
        $post = Post::create([
            'user_id' => $user->id,
            'title' => 'Test Post',
            'content' => 'Post Content'
        ]);
        
        Comment::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'content' => 'Comment 1'
        ]);

        $response = $this->getJson('/posts/' . $post->id . '/comments');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['content' => 'Comment 1']);
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create a main test user
        $mainUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('123456'), // predictable password
        ]);
        
        \App\Models\Profil::create([
            'user_id' => $mainUser->id,
            'username' => 'testuser',
            'bio' => 'Main Test User Bio',
            'profile_image' => 'https://ui-avatars.com/api/?name=Test+User',
        ]);

        // 2. Create 10 more users
        $users = User::factory()->count(10)->create();

        foreach ($users as $user) {
            \App\Models\Profil::create([
                'user_id' => $user->id,
                'username' => strtolower(str_replace(' ', '', $user->name)),
                'bio' => 'Hello I am ' . $user->name,
                'profile_image' => 'https://ui-avatars.com/api/?name=' . urlencode($user->name),
            ]);
        }

        // 3. Create posts
        $users->push($mainUser);
        foreach ($users as $user) {
            \App\Models\Post::factory()->count(3)->create([
                'user_id' => $user->id,
            ]);
        }

        $allPosts = \App\Models\Post::all();

        // 4. Create comments and likes
        foreach ($allPosts as $post) {
            $commenters = $users->random(rand(1, 3));
            foreach ($commenters as $commenter) {
                \App\Models\Comment::create([
                    'user_id' => $commenter->id,
                    'post_id' => $post->id,
                    'content' => 'Great post!',
                ]);

                if ($commenter->id !== $post->user_id) {
                    \App\Models\Notification::create([
                        'from_user_id' => $commenter->id,
                        'to_user_id' => $post->user_id,
                        'type' => 'comment',
                        'data' => [
                            'post_id' => $post->id,
                            'message' => $commenter->name . ' commented on your post.',
                        ],
                        'is_read' => false,
                    ]);
                }
            }

            $likers = $users->random(rand(1, 5));
            foreach ($likers as $liker) {
                \App\Models\Like::create([
                    'user_id' => $liker->id,
                    'post_id' => $post->id,
                ]);

                if ($liker->id !== $post->user_id) {
                    \App\Models\Notification::create([
                        'from_user_id' => $liker->id,
                        'to_user_id' => $post->user_id,
                        'type' => 'like',
                        'data' => [
                            'post_id' => $post->id,
                            'message' => $liker->name . ' liked your post.',
                        ],
                        'is_read' => false,
                    ]);
                }
            }
        }
    }
}

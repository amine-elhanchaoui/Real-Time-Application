<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Profil;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ExternalDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Fetch Users
        $this->command->info('Fetching users from randomuser.me...');
        $userResponse = Http::get('https://randomuser.me/api/?results=50');
        $randomUsers = $userResponse->json()['results'];

        foreach ($randomUsers as $index => $u) {
            $user = User::create([
                'name' => $u['name']['first'] . ' ' . $u['name']['last'],
                'email' => $u['email'],
                'password' => Hash::make('password'),
            ]);

            Profil::create([
                'user_id' => $user->id,
                'username' => $u['login']['username'],
                'profile_image' => $u['picture']['large'], // using external URL as image for simplicity in seed
                'bio' => "Hi, I'm {$u['name']['first']}! I love exploring new technologies and connecting with people.",
            ]);
        }

        // 2. Fetch Posts
        $this->command->info('Fetching posts from jsonplaceholder...');
        $postResponse = Http::get('https://jsonplaceholder.typicode.com/posts');
        $externalPosts = $postResponse->json();

        $userIds = User::pluck('id')->toArray();

        foreach ($externalPosts as $index => $p) {
            Post::create([
                'user_id' => $userIds[array_rand($userIds)],
                'title' => Str::title($p['title']),
                'content' => $p['body'],
                'image' => "https://picsum.photos/600/400?random={$index}", // Using external URL
            ]);
        }

        // 3. Fetch Comments
        $this->command->info('Fetching comments from jsonplaceholder...');
        $commentResponse = Http::get('https://jsonplaceholder.typicode.com/comments');
        $externalComments = $commentResponse->json();

        $postIds = Post::pluck('id')->toArray();

        foreach (array_slice($externalComments, 0, 200) as $c) {
            $userId = $userIds[array_rand($userIds)];
            $postId = $postIds[array_rand($postIds)];
            
            Comment::create([
                'user_id' => $userId,
                'post_id' => $postId,
                'content' => $c['body'],
            ]);

            // Notify post owner
            $post = Post::find($postId);
            if ($post && $post->user_id !== $userId) {
                Notification::create([
                    'from_user_id' => $userId,
                    'to_user_id' => $post->user_id,
                    'type' => 'comment',
                    'data' => [
                        'post_id' => $post->id,
                        'message' => 'Someone commented on your post.',
                    ],
                ]);
            }
        }

        $this->command->info('Seeding complete!');
    }
}

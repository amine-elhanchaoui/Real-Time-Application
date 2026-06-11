<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use App\Models\Profil;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FakeFeedSeeder extends Seeder
{
    /**
     * Seed fake users and many posts with images (picsum URLs).
     * Works offline — no external API required.
     */
    public function run(): void
    {
        $this->command?->info('Creating fake users and posts…');

        $users = collect();

        for ($i = 1; $i <= 30; $i++) {
            $name = fake()->name();
            $user = User::create([
                'name' => $name,
                'email' => fake()->unique()->safeEmail(),
                'password' => Hash::make('password'),
            ]);

            Profil::create([
                'user_id' => $user->id,
                'username' => Str::slug($name) . $i,
                'bio' => fake()->sentence(12),
                'profile_image' => 'https://i.pravatar.cc/150?u=' . urlencode($name . $i),
            ]);

            $users->push($user);
        }

        $testUser = User::where('email', 'test@example.com')->first();
        if ($testUser) {
            $users->push($testUser);
        }

        $titles = [
            'Solar output peaked today',
            'Grid load balancing update',
            'Wind farm efficiency report',
            'Smart meter rollout progress',
            'Energy savings this quarter',
            'Battery storage status',
            'Team standup notes',
            'New Harmony dashboard feature',
            'Real-time alerts working',
            'Community energy challenge',
        ];

        for ($i = 1; $i <= 120; $i++) {
            $author = $users->random();
            Post::create([
                'user_id' => $author->id,
                'title' => $titles[$i % count($titles)] . ' #' . $i,
                'content' => fake()->paragraphs(rand(2, 4), true),
                'image' => 'https://picsum.photos/seed/harmony' . $i . '/800/500',
            ]);
        }

        $posts = Post::all();

        foreach ($posts->random(min(60, $posts->count())) as $post) {
            $commenters = $users->random(rand(1, 3));
            foreach ($commenters as $commenter) {
                Comment::create([
                    'user_id' => $commenter->id,
                    'post_id' => $post->id,
                    'content' => fake()->sentence(),
                ]);
            }

            $likers = $users->random(rand(2, 8));
            foreach ($likers->unique('id') as $liker) {
                Like::firstOrCreate([
                    'user_id' => $liker->id,
                    'post_id' => $post->id,
                ]);
            }
        }

        $this->command?->info('Done: ' . User::count() . ' users, ' . Post::count() . ' posts.');
    }
}

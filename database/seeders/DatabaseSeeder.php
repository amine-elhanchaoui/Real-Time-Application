<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $mainUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('123456'),
        ]);

        \App\Models\Profil::create([
            'user_id' => $mainUser->id,
            'username' => 'testuser',
            'bio' => 'Main test account — password: 123456',
            'profile_image' => 'https://i.pravatar.cc/150?u=testuser',
        ]);

        $this->call(FakeFeedSeeder::class);
    }
}

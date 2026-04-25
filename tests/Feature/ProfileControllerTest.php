<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class ProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_profile()
    {
        $user = User::factory()->create();
        
        $profileUser = User::factory()->create([
            'name' => 'Jane Doe',
        ]);
        
        // Sanctum authentication
        Sanctum::actingAs($user);

        // Fetch the profile
        $response = $this->getJson('/api/profile/' . $profileUser->id);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => $profileUser->id,
            'name' => 'Jane Doe',
        ]);
    }
}

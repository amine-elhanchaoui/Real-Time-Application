<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;
use App\Events\MessageSent;

class ChatControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_message()
    {
        Event::fake();

        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $response = $this->actingAs($sender, 'sanctum')
            ->postJson('/api/messages', [
                'receiver_id' => $receiver->id,
                'body' => 'Hello there!',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('messages', [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'body' => 'Hello there!',
        ]);

        Event::assertDispatched(MessageSent::class);
    }

    public function test_user_can_get_conversations()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'body' => 'Last message',
        ]);

        $response = $this->actingAs($sender, 'sanctum')
            ->getJson('/api/conversations');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.partner.id', $receiver->id);
        $response->assertJsonPath('0.last_message.body', 'Last message');
    }

    public function test_user_can_get_message_history()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        Message::create([
            'sender_id' => $receiver->id,
            'receiver_id' => $sender->id,
            'body' => 'Incoming message',
        ]);

        $response = $this->actingAs($sender, 'sanctum')
            ->getJson("/api/messages/{$receiver->id}");

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'messages');
        
        // Use a less strict check for read_at
        $message = Message::first();
        $this->assertNotNull($message->read_at);
        $this->assertEquals('Incoming message', $message->body);
    }
}

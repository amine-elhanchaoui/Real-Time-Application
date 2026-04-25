<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GotNewComment implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $postId;
    public $comment;

    public function __construct($postId, $comment)
    {
        $this->postId = $postId;
        $this->comment = $comment;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('post.' . $this->postId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'GotNewComment';
    }
}

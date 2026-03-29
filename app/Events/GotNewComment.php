<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GotNewComment implements ShouldBroadcastNow
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
}

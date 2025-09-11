<?php

namespace App\Events;

use App\Models\Friend;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendRequestSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $friendRequest;

    public function __construct(Friend $friendRequest)
    {
        $this->friendRequest = $friendRequest->load(['requester', 'friend']);
    }

    public function broadcastOn()
    {
        return [
            new PrivateChannel("App.Models.User.{$this->friendRequest->friend_id}"),
        ];
    }

    public function broadcastAs()
    {
        return 'friend.request.sent';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->friendRequest->id,
            'user_id' => $this->friendRequest->user_id,
            'friend_id' => $this->friendRequest->friend_id,
            'status' => $this->friendRequest->status,
            'created_at' => $this->friendRequest->created_at,
            'requester' => $this->friendRequest->requester,
            'friend' => $this->friendRequest->friend,
        ];
    }
}

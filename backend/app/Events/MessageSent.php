<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message->load(['fromUser', 'toUser', 'task']);
    }

    public function broadcastOn()
    {
        $channels = [];
        
        $userId1 = $this->message->from_user_id;
        $userId2 = $this->message->to_user_id;
        
        if ($userId1 < $userId2) {
            $channels[] = new PrivateChannel("private-chat.{$userId1}.{$userId2}");
        } else {
            $channels[] = new PrivateChannel("private-chat.{$userId2}.{$userId1}");
        }
        
        if ($this->message->task_id) {
            $channels[] = new PrivateChannel("task.{$this->message->task_id}");
        }
        
        return $channels;
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->message->id,
            'from_user_id' => $this->message->from_user_id,
            'to_user_id' => $this->message->to_user_id,
            'message' => $this->message->message,
            'task_id' => $this->message->task_id,
            'created_at' => $this->message->created_at,
            'from_user' => $this->message->fromUser,
            'to_user' => $this->message->toUser,
            'task' => $this->message->task,
        ];
    }
}

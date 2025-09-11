<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;

    public function __construct(Task $task)
    {
        $this->task = $task->load(['owner', 'assignedUser']);
    }

    public function broadcastOn()
    {
        $channels = [];
        
        if ($this->task->id) {
            $channels[] = new PrivateChannel("task.{$this->task->id}");
        }
        
        if ($this->task->owner_id) {
            $channels[] = new PrivateChannel("App.Models.User.{$this->task->owner_id}");
        }
        
        if ($this->task->assigned_to && $this->task->assigned_to !== $this->task->owner_id) {
            $channels[] = new PrivateChannel("App.Models.User.{$this->task->assigned_to}");
        }
        
        return $channels;
    }

    public function broadcastAs()
    {
        return 'task.updated';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->task->id,
            'title' => $this->task->title,
            'description' => $this->task->description,
            'status' => $this->task->status,
            'priority' => $this->task->priority,
            'due_date' => $this->task->due_date,
            'owner_id' => $this->task->owner_id,
            'assigned_to' => $this->task->assigned_to,
            'created_at' => $this->task->created_at,
            'updated_at' => $this->task->updated_at,
            'owner' => $this->task->owner,
            'assigned_user' => $this->task->assignedUser,
        ];
    }
}

<?php

namespace App\Repositories;

use App\Models\Message;
use Illuminate\Database\Eloquent\Collection;

class MessageRepository
{
    public function getAll(): Collection
    {
        return Message::all();
    }

    public function findById(int $id): ?Message
    {
        return Message::find($id);
    }

    public function create(array $data): Message
    {
        return Message::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Message::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return Message::destroy($id) > 0;
    }

    public function getMessagesByFromUserId(int $fromUserId): Collection
    {
        return Message::where('from_user_id', $fromUserId)
                     ->with(['fromUser', 'toUser', 'task'])
                     ->orderBy('created_at', 'desc')
                     ->get();
    }

    public function getMessagesByToUserId(int $toUserId): Collection
    {
        return Message::where('to_user_id', $toUserId)
                     ->with(['fromUser', 'toUser', 'task'])
                     ->orderBy('created_at', 'desc')
                     ->get();
    }

    public function getConversationBetweenUsers(int $userId1, int $userId2): Collection
    {
        return Message::where(function ($query) use ($userId1, $userId2) {
                        $query->where('from_user_id', $userId1)
                              ->where('to_user_id', $userId2);
                    })
                    ->orWhere(function ($query) use ($userId1, $userId2) {
                        $query->where('from_user_id', $userId2)
                              ->where('to_user_id', $userId1);
                    })
                    ->with(['fromUser', 'toUser'])
                    ->orderBy('created_at', 'asc')
                    ->get();
    }

    public function getMessagesByTaskId(int $taskId): Collection
    {
        return Message::where('task_id', $taskId)
                     ->with(['fromUser', 'toUser', 'task'])
                     ->orderBy('created_at', 'asc')
                     ->get();
    }

    public function getUserMessages(int $userId): Collection
    {
        return Message::where('from_user_id', $userId)
                     ->orWhere('to_user_id', $userId)
                     ->with(['fromUser', 'toUser', 'task'])
                     ->orderBy('created_at', 'desc')
                     ->get();
    }

    public function sendMessage(int $fromUserId, int $toUserId, string $message, int $taskId = null): Message
    {
        return Message::create([
            'from_user_id' => $fromUserId,
            'to_user_id' => $toUserId,
            'message' => $message,
            'task_id' => $taskId,
        ]);
    }
}

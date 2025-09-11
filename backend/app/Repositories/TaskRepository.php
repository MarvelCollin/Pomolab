<?php

namespace App\Repositories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;

class TaskRepository
{
    public function getAll(): Collection
    {
        return Task::all();
    }

    public function findById(int $id): ?Task
    {
        return Task::find($id);
    }

    public function create(array $data): Task
    {
        return Task::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Task::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return Task::destroy($id) > 0;
    }

    public function getTasksByOwnerId(int $ownerId): Collection
    {
        return Task::where('owner_id', $ownerId)
                  ->with(['owner', 'assignedTo'])
                  ->get();
    }

    public function getTasksByAssignedId(int $assignedId): Collection
    {
        return Task::where('assigned_to_id', $assignedId)
                  ->with(['owner', 'assignedTo'])
                  ->get();
    }

    public function getTasksByStatus(string $status): Collection
    {
        return Task::where('status', $status)
                  ->with(['owner', 'assignedTo'])
                  ->get();
    }

    public function getTaskWithMessages(int $id): ?Task
    {
        return Task::with(['messages.fromUser', 'messages.toUser'])
                  ->find($id);
    }

    public function getUserTasks(int $userId): Collection
    {
        return Task::where('owner_id', $userId)
                  ->orWhere('assigned_to_id', $userId)
                  ->with(['owner', 'assignedTo'])
                  ->get();
    }

    public function updateTaskStatus(int $id, string $status): bool
    {
        return Task::where('id', $id)->update(['status' => $status]);
    }

    public function assignTask(int $id, int $userId): bool
    {
        return Task::where('id', $id)->update(['assigned_to_id' => $userId]);
    }
}

<?php

namespace App\Repositories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class TaskRepository
{
    private const CACHE_TTL = 3600; // 1 hour
    private const CACHE_PREFIX = 'tasks:';

    private function getCacheKey(string $key): string
    {
        return self::CACHE_PREFIX . $key;
    }

    private function clearTaskCache(int $taskId = null): void
    {
        // Clear general caches
        Cache::forget($this->getCacheKey('all'));

        // Clear specific task cache if ID provided
        if ($taskId) {
            Cache::forget($this->getCacheKey("task:{$taskId}"));
            Cache::forget($this->getCacheKey("task_with_messages:{$taskId}"));
        }

        // Clear pattern-based caches (owner, assigned, status, user tasks)
        $patterns = [
            'owner:*',
            'assigned:*',
            'status:*',
            'user:*'
        ];

        foreach ($patterns as $pattern) {
            $this->clearCachePattern($pattern);
        }
    }

    private function clearCachePattern(string $pattern): void
    {
        $fullPattern = $this->getCacheKey($pattern);
        $keys = Cache::getRedis()->keys($fullPattern);

        if (!empty($keys)) {
            Cache::getRedis()->del($keys);
        }
    }
    public function getAll(): Collection
    {
        return Cache::remember(
            $this->getCacheKey('all'),
            self::CACHE_TTL,
            fn() => Task::all()
        );
    }

    public function findById(int $id): ?Task
    {
        return Cache::remember(
            $this->getCacheKey("task:{$id}"),
            self::CACHE_TTL,
            fn() => Task::find($id)
        );
    }

    public function create(array $data): Task
    {
        $task = Task::create($data);

        // Clear relevant caches
        $this->clearTaskCache();

        return $task;
    }

    public function update(int $id, array $data): bool
    {
        $result = Task::where('id', $id)->update($data);

        if ($result) {
            // Clear relevant caches
            $this->clearTaskCache($id);
        }

        return $result;
    }

    public function delete(int $id): bool
    {
        $result = Task::destroy($id) > 0;

        if ($result) {
            // Clear relevant caches
            $this->clearTaskCache($id);
        }

        return $result;
    }

    public function getTasksByOwnerId(int $ownerId): Collection
    {
        return Cache::remember(
            $this->getCacheKey("owner:{$ownerId}"),
            self::CACHE_TTL,
            fn() => Task::where('owner_id', $ownerId)
                ->with(['owner', 'assignedTo'])
                ->get()
        );
    }

    public function getTasksByAssignedId(int $assignedId): Collection
    {
        return Cache::remember(
            $this->getCacheKey("assigned:{$assignedId}"),
            self::CACHE_TTL,
            fn() => Task::where('assigned_to_id', $assignedId)
                ->with(['owner', 'assignedTo'])
                ->get()
        );
    }

    public function getTasksByStatus(string $status): Collection
    {
        return Cache::remember(
            $this->getCacheKey("status:{$status}"),
            self::CACHE_TTL,
            fn() => Task::where('status', $status)
                ->with(['owner', 'assignedTo'])
                ->get()
        );
    }

    public function getTaskWithMessages(int $id): ?Task
    {
        return Cache::remember(
            $this->getCacheKey("task_with_messages:{$id}"),
            self::CACHE_TTL,
            fn() => Task::with(['messages.fromUser', 'messages.toUser'])
                ->find($id)
        );
    }

    public function getUserTasks(int $userId): Collection
    {
        return Cache::remember(
            $this->getCacheKey("user:{$userId}"),
            self::CACHE_TTL,
            fn() => Task::where('owner_id', $userId)
                ->orWhere('assigned_to_id', $userId)
                ->with(['owner', 'assignedTo'])
                ->get()
        );
    }

    public function updateTaskStatus(int $id, string $status): bool
    {
        $result = Task::where('id', $id)->update(['status' => $status]);

        if ($result) {
            // Clear relevant caches
            $this->clearTaskCache($id);
        }

        return $result;
    }

    public function assignTask(int $id, int $userId): bool
    {
        $result = Task::where('id', $id)->update(['assigned_to_id' => $userId]);

        if ($result) {
            // Clear relevant caches
            $this->clearTaskCache($id);
        }

        return $result;
    }
}

<?php

namespace App\Repositories;

use App\Models\Friend;
use Illuminate\Database\Eloquent\Collection;

class FriendRepository
{
    public function getAll(): Collection
    {
        return Friend::all();
    }

    public function findById(int $id): ?Friend
    {
        return Friend::find($id);
    }

    public function create(array $data): Friend
    {
        return Friend::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Friend::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return Friend::destroy($id) > 0;
    }

    public function getFriendsByUserId(int $userId): Collection
    {
        return Friend::where(function ($query) use ($userId) {
                        $query->where('user_id', $userId)->orWhere('friend_id', $userId);
                    })
                    ->where('status', 'accepted')
                    ->with(['user', 'friend'])
                    ->get();
    }

    public function getFriendRequestsByUserId(int $userId): Collection
    {
        return Friend::where('friend_id', $userId)
                    ->where('status', 'pending')
                    ->with('user')
                    ->get();
    }

    public function getSentFriendRequestsByUserId(int $userId): Collection
    {
        return Friend::where('user_id', $userId)
                    ->where('status', 'pending')
                    ->with('friend')
                    ->get();
    }

    public function updateFriendshipStatus(int $userId, int $friendId, string $status): bool
    {
        return Friend::where(function ($query) use ($userId, $friendId) {
                        $query->where('user_id', $userId)->where('friend_id', $friendId);
                    })
                    ->orWhere(function ($query) use ($userId, $friendId) {
                        $query->where('user_id', $friendId)->where('friend_id', $userId);
                    })
                    ->update(['status' => $status]);
    }

    public function findFriendship(int $userId, int $friendId): ?Friend
    {
        return Friend::where(function ($query) use ($userId, $friendId) {
                        $query->where('user_id', $userId)->where('friend_id', $friendId);
                    })
                    ->orWhere(function ($query) use ($userId, $friendId) {
                        $query->where('user_id', $friendId)->where('friend_id', $userId);
                    })
                    ->first();
    }

    public function findActiveFriendship(int $userId, int $friendId): ?Friend
    {
        return Friend::where(function ($query) use ($userId, $friendId) {
                        $query->where('user_id', $userId)->where('friend_id', $friendId);
                    })
                    ->orWhere(function ($query) use ($userId, $friendId) {
                        $query->where('user_id', $friendId)->where('friend_id', $userId);
                    })
                    ->whereIn('status', ['pending', 'accepted'])
                    ->first();
    }
}

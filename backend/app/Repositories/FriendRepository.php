<?php

namespace App\Repositories;

use App\Models\Friend;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\DB;

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

    public function getFriendsByUserId(int $userId): SupportCollection
    {
        $friendships = Friend::where('status', 'accepted')
                    ->where(function ($query) use ($userId) {
                        $query->where('user_id', $userId)->orWhere('friend_id', $userId);
                    })
                    ->with(['user:id,username,email,avatar', 'friend:id,username,email,avatar'])
                    ->get();

        $results = $friendships->map(function ($friendship) use ($userId) {
            $friendUser = null;
            
            if ($friendship->user_id === $userId) {
                $friendUser = $friendship->friend;
            } elseif ($friendship->friend_id === $userId) {
                $friendUser = $friendship->user;
            }
            
            if (!$friendUser || $friendUser->id === $userId) {
                return null;
            }
            
            return (object)[
                'id' => $friendship->id,
                'user_id' => $friendship->user_id,
                'friend_id' => $friendship->friend_id,
                'status' => $friendship->status,
                'created_at' => $friendship->created_at,
                'updated_at' => $friendship->updated_at,
                'friend' => (object)[
                    'id' => $friendUser->id,
                    'username' => $friendUser->username,
                    'email' => $friendUser->email,
                    'avatar' => $friendUser->avatar,
                ]
            ];
        })->filter()->values();

        return collect($results);
    }

    public function getFriendRequestsByUserId(int $userId): Collection
    {
        return Friend::where('friend_id', $userId)
                    ->where('status', 'pending')
                    ->with('user:id,username,email,avatar')
                    ->get();
    }

    public function getSentFriendRequestsByUserId(int $userId): Collection
    {
        return Friend::where('user_id', $userId)
                    ->where('status', 'pending')
                    ->with('friend:id,username,email,avatar')
                    ->get();
    }

    public function updateFriendshipStatus(int $userId, int $friendId, string $status): bool
    {
        if ($userId === $friendId) {
            return false;
        }

        $friendship = $this->findFriendship($userId, $friendId);
        
        if (!$friendship) {
            return false;
        }

        return $friendship->update(['status' => $status]);
    }

    public function findFriendship(int $userId, int $friendId): ?Friend
    {
        if ($userId === $friendId) {
            return null;
        }

        return Friend::where(function ($query) use ($userId, $friendId) {
                        $query->where(function ($subQuery) use ($userId, $friendId) {
                            $subQuery->where('user_id', $userId)->where('friend_id', $friendId);
                        })->orWhere(function ($subQuery) use ($userId, $friendId) {
                            $subQuery->where('user_id', $friendId)->where('friend_id', $userId);
                        });
                    })
                    ->first();
    }

    public function findActiveFriendship(int $userId, int $friendId): ?Friend
    {
        if ($userId === $friendId) {
            return null;
        }

        return Friend::where(function ($query) use ($userId, $friendId) {
                        $query->where(function ($subQuery) use ($userId, $friendId) {
                            $subQuery->where('user_id', $userId)->where('friend_id', $friendId);
                        })->orWhere(function ($subQuery) use ($userId, $friendId) {
                            $subQuery->where('user_id', $friendId)->where('friend_id', $userId);
                        });
                    })
                    ->whereIn('status', ['pending', 'accepted'])
                    ->first();
    }
}

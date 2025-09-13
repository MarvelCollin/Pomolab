<?php

namespace App\Repositories;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GroupRepository
{
    public function getAll(): Collection
    {
        return Group::with('creator')->get();
    }

    public function findById(int $id): ?Group
    {
        return Group::find($id);
    }

    public function create(array $data): Group
    {
        return Group::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Group::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return Group::destroy($id) > 0;
    }

    public function getGroupWithMembers(int $id): ?Group
    {
        return Group::with(['creator', 'members'])->find($id);
    }

    public function getGroupWithTasks(int $id): ?Group
    {
        return Group::with(['creator', 'tasks.owner', 'tasks.assignedTo'])->find($id);
    }

    public function getGroupWithMessages(int $id): ?Group
    {
        return Group::with(['creator', 'messages.fromUser'])->find($id);
    }

    public function getGroupsByCreator(int $creatorId): Collection
    {
        return Group::where('creator_id', $creatorId)
            ->with('creator')
            ->get();
    }

    public function getGroupsByStatus(string $status): Collection
    {
        return Group::where('status', $status)
            ->with('creator')
            ->get();
    }

    public function getPublicGroups(): Collection
    {
        return Group::where('is_private', false)
            ->where('status', 'active')
            ->with('creator')
            ->get();
    }

    public function getUserGroups(int $userId): Collection
    {
        return Group::whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->orWhere('creator_id', $userId)
            ->with(['creator', 'members'])
            ->get();
    }

    public function addMember(int $groupId, int $userId, string $role = 'member'): bool
    {
        $group = $this->findById($groupId);
        if (!$group) return false;

        return $group->members()->syncWithoutDetaching([
            $userId => [
                'role' => $role,
                'joined_at' => now()
            ]
        ]) !== false;
    }

    public function removeMember(int $groupId, int $userId): bool
    {
        $group = $this->findById($groupId);
        if (!$group) return false;

        return $group->members()->detach($userId) > 0;
    }

    public function updateMemberRole(int $groupId, int $userId, string $role): bool
    {
        $group = $this->findById($groupId);
        if (!$group) return false;

        return $group->members()->updateExistingPivot($userId, ['role' => $role]) > 0;
    }

    public function isMember(int $groupId, int $userId): bool
    {
        $group = $this->findById($groupId);
        if (!$group) return false;

        return $group->members()->where('user_id', $userId)->exists();
    }

    public function updateStatus(int $id, string $status): bool
    {
        return Group::where('id', $id)->update(['status' => $status]);
    }

    public function searchGroups(string $searchTerm): Collection
    {
        return Group::where('name', 'LIKE', "%{$searchTerm}%")
            ->orWhere('description', 'LIKE', "%{$searchTerm}%")
            ->where('is_private', false)
            ->where('status', 'active')
            ->with('creator')
            ->get();
    }
}

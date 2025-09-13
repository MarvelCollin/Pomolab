<?php

namespace App\Repositories;

use App\Models\GroupMember;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GroupMemberRepository
{
    public function getAll(): Collection
    {
        return GroupMember::with(['user', 'group'])->get();
    }


    public function findById(int $id): ?GroupMember
    {
        return GroupMember::with(['user', 'group'])->find($id);
    }


    public function create(array $data): GroupMember
    {
        $data['joined_at'] = now();

        return GroupMember::create($data);
    }


    public function update(int $id, array $data): bool
    {
        return GroupMember::where('id', $id)->update($data) > 0;
    }


    public function delete(int $id): bool
    {
        return GroupMember::destroy($id) > 0;
    }


    public function isMember(int $groupId, int $userId): bool
    {
        return GroupMember::where('group_id', $groupId)
            ->where('user_id', $userId)
            ->exists();
    }


    public function getUserMemberships(int $userId): Collection
    {
        return GroupMember::with(['group'])
            ->where('user_id', $userId)
            ->get();
    }


    public function getGroupMembers(int $groupId): Collection
    {
        return GroupMember::with(['user'])
            ->where('group_id', $groupId)
            ->get();
    }


    public function updateRole(int $id, string $role): bool
    {
        return GroupMember::where('id', $id)->update(['role' => $role]) > 0;
    }


    public function removeMemberByGroupAndUser(int $groupId, int $userId): bool
    {
        return GroupMember::where('group_id', $groupId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }


    public function addMemberToGroup(int $groupId, int $userId, string $role = 'member'): GroupMember
    {
        return GroupMember::create([
            'group_id' => $groupId,
            'user_id' => $userId,
            'role' => $role,
            'joined_at' => now()
        ]);
    }


    public function updateRoleByGroupAndUser(int $groupId, int $userId, string $role): bool
    {
        return GroupMember::where('group_id', $groupId)
            ->where('user_id', $userId)
            ->update(['role' => $role]) > 0;
    }
}

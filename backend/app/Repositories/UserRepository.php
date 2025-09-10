<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserRepository
{
    public function getAll(): Collection
    {
        return User::all();
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return User::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return User::destroy($id) > 0;
    }

    public function getUserWithFriends(int $id): ?User
    {
        return User::with('friends')->find($id);
    }

    public function getUserWithTasks(int $id): ?User
    {
        return User::with(['ownedTasks', 'assignedTasks'])->find($id);
    }

    public function getUserWithMessages(int $id): ?User
    {
        return User::with(['sentMessages', 'receivedMessages'])->find($id);
    }
}

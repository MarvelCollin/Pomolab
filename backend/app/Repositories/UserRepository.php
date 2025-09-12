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

    public function findByGoogleId(string $googleId): ?User
    {
        return User::where('google_id', $googleId)->first();
    }

    public function findOrCreateGoogleUser(array $googleData): User
    {
        $user = $this->findByGoogleId($googleData['id']);
        
        if ($user) {
            $user->update([
                'avatar' => $googleData['picture'] ?? $user->avatar,
                'email_verified_at' => now(),
            ]);
            return $user;
        }

        $existingUser = $this->findByEmail($googleData['email']);
        if ($existingUser) {
            $existingUser->update([
                'google_id' => $googleData['id'],
                'avatar' => $googleData['picture'] ?? $existingUser->avatar,
                'email_verified_at' => now(),
            ]);
            return $existingUser;
        }

        return $this->create([
            'username' => $googleData['name'] ?? explode('@', $googleData['email'])[0],
            'email' => $googleData['email'],
            'google_id' => $googleData['id'],
            'avatar' => $googleData['picture'] ?? null,
            'email_verified_at' => now(),
        ]);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'creator_id',
        'status',
        'is_private',
    ];

    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
        ];
    }


    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get all members of this group (many-to-many relationship)
     * Note: This will require a group_members pivot table in the future
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_members', 'group_id', 'user_id')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Get all tasks associated with this group
     * Note: This will require adding group_id to tasks table in the future
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'group_id');
    }

    /**
     * Get all messages sent to this group
     * Note: This will require adding group_id to messages table in the future
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'group_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPrivate(): bool
    {
        return $this->is_private;
    }

    public function isCreator(User $user): bool
    {
        return $this->creator_id === $user->id;
    }

    public function hasMember(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }
}

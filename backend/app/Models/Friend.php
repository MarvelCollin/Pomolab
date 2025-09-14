<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friend extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'friend_id',
        'status',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($friend) {
            if ($friend->user_id === $friend->friend_id) {
                throw new \InvalidArgumentException('A user cannot be friends with themselves.');
            }
        });

        static::updating(function ($friend) {
            if ($friend->user_id === $friend->friend_id) {
                throw new \InvalidArgumentException('A user cannot be friends with themselves.');
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function friend(): BelongsTo
    {
        return $this->belongsTo(User::class, 'friend_id');
    }
}

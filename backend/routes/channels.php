<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('private-chat.{userId1}.{userId2}', function ($user, $userId1, $userId2) {
    return (int) $user->id === (int) $userId1 || (int) $user->id === (int) $userId2;
});

Broadcast::channel('task.{taskId}', function ($user, $taskId) {
    return true;
});

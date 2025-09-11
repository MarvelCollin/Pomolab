<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('test-channel', function () {
    return true;
});

Broadcast::channel('task-updates', function () {
    return true;
});

Broadcast::channel('message-channel', function () {
    return true;
});
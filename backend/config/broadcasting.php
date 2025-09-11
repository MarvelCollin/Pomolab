<?php

return [
    'default' => env('BROADCAST_CONNECTION', 'log'),
    'connections' => [
        'log' => [
            'driver' => 'log',
        ],
    ],
];
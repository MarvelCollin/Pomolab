<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\MessageController;

/**
 * @OA\Info(
 *     title="Pomolab API",
 *     version="1.0.0",
 *     description="API documentation for Pomolab backend - Task management and messaging system"
 * )
 */

/**
 * @OA\Get(
 *     path="/api/test",
 *     summary="Test endpoint",
 *     tags={"System"},
 *     @OA\Response(
 *         response=200,
 *         description="Successful operation",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Hello World")
 *         )
 *     )
 * )
 */
Route::get('/test', function () {
    return response()->json(['message' => 'Hello World']);
});

Route::get('/websocket-config', function () {
    return response()->json([
        'pusher' => [
            'key' => env('PUSHER_APP_KEY', 'local-key'),
            'cluster' => env('PUSHER_APP_CLUSTER', 'mt1'),
            'wsHost' => env('PUSHER_HOST', '127.0.0.1'),
            'wsPort' => env('PUSHER_PORT', 6001),
            'wssPort' => env('PUSHER_PORT', 6001),
            'enabledTransports' => ['ws', 'wss'],
            'forceTLS' => env('PUSHER_SCHEME', 'http') === 'https',
        ],
        'reverb' => [
            'key' => env('REVERB_APP_KEY', 'local-key'),
            'host' => env('REVERB_HOST', '127.0.0.1'),
            'port' => env('REVERB_PORT', 8080),
            'scheme' => env('REVERB_SCHEME', 'http'),
        ]
    ]);
});

Route::post('/test-broadcast', function () {
    broadcast(new \App\Events\MessageSent(\App\Models\Message::first()));
    return response()->json(['message' => 'Broadcast sent']);
});

Route::apiResource('users', UserController::class);
Route::get('/users/{id}/friends', [UserController::class, 'getUserWithFriends']);
Route::get('/users/{id}/tasks', [UserController::class, 'getUserWithTasks']);

Route::apiResource('friends', FriendController::class);
Route::get('/users/{userId}/friends', [FriendController::class, 'getUserFriends']);
Route::get('/users/{userId}/friend-requests', [FriendController::class, 'getFriendRequests']);
Route::get('/users/{userId}/sent-requests', [FriendController::class, 'getSentRequests']);
Route::put('/friendship/status', [FriendController::class, 'updateFriendshipStatus']);

Route::apiResource('tasks', TaskController::class);
Route::get('/users/{ownerId}/owned-tasks', [TaskController::class, 'getTasksByOwner']);
Route::get('/users/{assignedId}/assigned-tasks', [TaskController::class, 'getTasksByAssigned']);
Route::get('/tasks/status/{status}', [TaskController::class, 'getTasksByStatus']);
Route::get('/users/{userId}/all-tasks', [TaskController::class, 'getUserTasks']);
Route::get('/tasks/{id}/messages', [TaskController::class, 'getTaskWithMessages']);
Route::put('/tasks/{id}/status', [TaskController::class, 'updateTaskStatus']);
Route::put('/tasks/{id}/assign', [TaskController::class, 'assignTask']);

Route::apiResource('messages', MessageController::class);
Route::get('/users/{fromUserId}/sent-messages', [MessageController::class, 'getMessagesByFromUser']);
Route::get('/users/{toUserId}/received-messages', [MessageController::class, 'getMessagesByToUser']);
Route::get('/conversation/{userId1}/{userId2}', [MessageController::class, 'getConversation']);
Route::get('/tasks/{taskId}/messages', [MessageController::class, 'getTaskMessages']);
Route::get('/users/{userId}/messages', [MessageController::class, 'getUserMessages']);
Route::post('/messages/send', [MessageController::class, 'sendMessage']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
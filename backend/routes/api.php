<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\TaskController;

Route::get('/test', function () {
    return response()->json(['message' => 'Hello World']);
});

Route::post('/auth/login', [UserController::class, 'login']);
Route::post('/auth/register', [UserController::class, 'register']);
Route::middleware('auth:sanctum')->post('/auth/logout', [UserController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/auth/user', [UserController::class, 'getCurrentUser']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('users', UserController::class);
Route::get('/users/{id}/friends', [UserController::class, 'getUserWithFriends']);
Route::get('/users/{id}/tasks', [UserController::class, 'getUserWithTasks']);

Route::apiResource('friends', FriendController::class);
Route::get('/users/{userId}/friends', [FriendController::class, 'getUserFriends']);
Route::get('/users/{userId}/friend-requests', [FriendController::class, 'getFriendRequests']);
Route::get('/users/{userId}/sent-requests', [FriendController::class, 'getSentRequests']);
Route::put('/friendship/status', [FriendController::class, 'updateFriendshipStatus']);

Route::apiResource('messages', MessageController::class);
Route::get('/messages/from/{fromUserId}', [MessageController::class, 'getMessagesByFromUser']);
Route::get('/messages/to/{toUserId}', [MessageController::class, 'getMessagesByToUser']);
Route::get('/conversation/{userId1}/{userId2}', [MessageController::class, 'getConversation']);
Route::get('/tasks/{taskId}/messages', [MessageController::class, 'getTaskMessages']);
Route::get('/users/{userId}/messages', [MessageController::class, 'getUserMessages']);
Route::post('/messages/send', [MessageController::class, 'sendMessage']);

Route::apiResource('tasks', TaskController::class);
Route::get('/tasks/owner/{ownerId}', [TaskController::class, 'getTasksByOwner']);
Route::get('/tasks/assigned/{assignedId}', [TaskController::class, 'getTasksByAssigned']);
Route::get('/tasks/status/{status}', [TaskController::class, 'getTasksByStatus']);
Route::get('/users/{userId}/all-tasks', [TaskController::class, 'getUserTasks']);
Route::get('/tasks/{id}/with-messages', [TaskController::class, 'getTaskWithMessages']);
Route::put('/tasks/{id}/status', [TaskController::class, 'updateTaskStatus']);
Route::put('/tasks/{id}/assign', [TaskController::class, 'assignTask']);
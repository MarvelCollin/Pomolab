<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\MessageController;

Route::get('/test', function () {
    return response()->json(['message' => 'Hello World']);
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
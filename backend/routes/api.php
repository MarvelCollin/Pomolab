<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupMemberController;

Route::get('/test', function () {
    return response()->json(['message' => 'Hello World']);
});

Route::post('/auth/login', [UserController::class, 'login']);
Route::post('/auth/register', [UserController::class, 'register']);
Route::post('/auth/google', [UserController::class, 'googleAuth']);
Route::middleware('auth:sanctum')->post('/auth/logout', [UserController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/auth/user', [UserController::class, 'getCurrentUser']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('users', UserController::class);
Route::middleware('auth:sanctum')->get('/users/{id}/tasks', [UserController::class, 'getUserWithTasks']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('friends', FriendController::class);
    Route::get('/users/{userId}/friends', [FriendController::class, 'getUserFriends']);
    Route::get('/users/{userId}/friend-requests', [FriendController::class, 'getFriendRequests']);
    Route::get('/users/{userId}/sent-requests', [FriendController::class, 'getSentRequests']);
    Route::put('/friendship/status', [FriendController::class, 'updateFriendshipStatus']);
});

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

Route::apiResource('groups', GroupController::class);
Route::get('/groups/{id}/members', [GroupMemberController::class, 'getGroupMembersByGroupId']);
Route::get('/groups/{id}/with-members', [GroupController::class, 'getGroupWithMembers']);
Route::get('/groups/{id}/tasks', [GroupController::class, 'getGroupWithTasks']);
Route::get('/groups/{id}/messages', [GroupController::class, 'getGroupWithMessages']);
Route::get('/users/{userId}/groups', [GroupController::class, 'getUserGroups']);
Route::get('/groups-public', [GroupController::class, 'getPublicGroups']);
Route::get('/groups-search', [GroupController::class, 'searchGroups']);
Route::post('/groups/{id}/join', [GroupController::class, 'joinGroup']);
Route::post('/groups/{id}/leave', [GroupController::class, 'leaveGroup']);

Route::apiResource('group-members', GroupMemberController::class);
Route::get('/users/{userId}/group-memberships', [GroupMemberController::class, 'getUserGroupMemberships']);
Route::put('/group-members/{id}/role', [GroupMemberController::class, 'updateMemberRole']);

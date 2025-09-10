<?php

namespace App\Http\Controllers;

use App\Repositories\FriendRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class FriendController extends Controller
{
    private FriendRepository $friendRepository;

    public function __construct(FriendRepository $friendRepository)
    {
        $this->friendRepository = $friendRepository;
    }

    public function index(): JsonResponse
    {
        $friends = $this->friendRepository->getAll();
        return response()->json($friends);
    }

    public function show(int $id): JsonResponse
    {
        $friend = $this->friendRepository->findById($id);
        
        if (!$friend) {
            return response()->json(['message' => 'Friend relationship not found'], 404);
        }

        return response()->json($friend);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'friend_id' => 'required|integer|exists:users,id|different:user_id',
                'status' => 'required|string|in:pending,accepted,rejected',
            ]);

            $existingFriendship = $this->friendRepository->findFriendship(
                $validated['user_id'], 
                $validated['friend_id']
            );

            if ($existingFriendship) {
                return response()->json(['message' => 'Friendship already exists'], 409);
            }

            $friend = $this->friendRepository->create($validated);
            return response()->json($friend, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $friend = $this->friendRepository->findById($id);
            
            if (!$friend) {
                return response()->json(['message' => 'Friend relationship not found'], 404);
            }

            $validated = $request->validate([
                'status' => 'required|string|in:pending,accepted,rejected',
            ]);

            $this->friendRepository->update($id, $validated);
            return response()->json(['message' => 'Friendship status updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $friend = $this->friendRepository->findById($id);
        
        if (!$friend) {
            return response()->json(['message' => 'Friend relationship not found'], 404);
        }

        $this->friendRepository->delete($id);
        return response()->json(['message' => 'Friendship deleted successfully']);
    }

    public function getUserFriends(int $userId): JsonResponse
    {
        $friends = $this->friendRepository->getFriendsByUserId($userId);
        return response()->json($friends);
    }

    public function getFriendRequests(int $userId): JsonResponse
    {
        $requests = $this->friendRepository->getFriendRequestsByUserId($userId);
        return response()->json($requests);
    }

    public function getSentRequests(int $userId): JsonResponse
    {
        $sentRequests = $this->friendRepository->getSentFriendRequestsByUserId($userId);
        return response()->json($sentRequests);
    }

    public function updateFriendshipStatus(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'friend_id' => 'required|integer|exists:users,id',
                'status' => 'required|string|in:accepted,rejected',
            ]);

            $updated = $this->friendRepository->updateFriendshipStatus(
                $validated['user_id'],
                $validated['friend_id'],
                $validated['status']
            );

            if (!$updated) {
                return response()->json(['message' => 'Friendship not found'], 404);
            }

            return response()->json(['message' => 'Friendship status updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}

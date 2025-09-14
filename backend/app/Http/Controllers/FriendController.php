<?php

namespace App\Http\Controllers;

use App\Repositories\FriendRepository;
use App\Repositories\UserRepository;
use App\Services\WebSocketService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class FriendController extends Controller
{
    private FriendRepository $friendRepository;
    private UserRepository $userRepository;
    private WebSocketService $webSocketService;

    public function __construct(
        FriendRepository $friendRepository,
        UserRepository $userRepository,
        WebSocketService $webSocketService
    ) {
        $this->friendRepository = $friendRepository;
        $this->userRepository = $userRepository;
        $this->webSocketService = $webSocketService;
    }

    /**
     * @OA\Get(
     *     path="/api/friends",
     *     summary="Get all friend relationships",
     *     tags={"Friends"},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="user_id", type="integer"),
     *             @OA\Property(property="friend_id", type="integer"),
     *             @OA\Property(property="status", type="string", enum={"pending", "accepted", "rejected"})
     *         ))
     *     )
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/friends",
     *     summary="Create a friend request",
     *     tags={"Friends"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id","friend_id","status"},
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="friend_id", type="integer", example=2),
     *             @OA\Property(property="status", type="string", enum={"pending", "accepted", "rejected"}, example="pending")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Friend request created"),
     *     @OA\Response(response=409, description="Friendship already exists"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'friend_id' => 'required|integer|exists:users,id|different:user_id',
                'status' => 'required|string|in:pending,accepted,rejected',
            ]);

            $existingActiveFriendship = $this->friendRepository->findActiveFriendship(
                $validated['user_id'], 
                $validated['friend_id']
            );

            if ($existingActiveFriendship) {
                return response()->json(['message' => 'Friendship already exists'], 409);
            }

            $existingRejectedFriendship = $this->friendRepository->findFriendship(
                $validated['user_id'], 
                $validated['friend_id']
            );

            if ($existingRejectedFriendship && $existingRejectedFriendship->status === 'rejected') {
                $this->friendRepository->update($existingRejectedFriendship->id, [
                    'user_id' => $validated['user_id'],
                    'friend_id' => $validated['friend_id'],
                    'status' => 'pending'
                ]);
                $friend = $this->friendRepository->findById($existingRejectedFriendship->id);
            } else {
                $friend = $this->friendRepository->create($validated);
            }
            
            $userData = $this->userRepository->findById($validated['user_id']);
            $friendData = $this->userRepository->findById($validated['friend_id']);
            
            $this->webSocketService->broadcastFriendNotification(
                'request_sent',
                $validated['user_id'],
                $validated['friend_id'],
                $friend ? $friend->toArray() : null,
                $userData ? $userData->toArray() : null,
                $friendData ? $friendData->toArray() : null
            );
            
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
            
            $userData = $this->userRepository->findById($friend['user_id']);
            $friendData = $this->userRepository->findById($friend['friend_id']);
            
            $action = $validated['status'] === 'accepted' ? 'request_accepted' : 'request_rejected';
            $this->webSocketService->broadcastFriendNotification(
                $action,
                $friend['user_id'],
                $friend['friend_id'],
                array_merge($friend, $validated),
                $userData ? $userData->toArray() : null,
                $friendData ? $friendData->toArray() : null
            );
            
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

        $userData = $this->userRepository->findById($friend['user_id']);
        $friendData = $this->userRepository->findById($friend['friend_id']);
        
        $this->friendRepository->delete($id);
        
        $this->webSocketService->broadcastFriendNotification(
            'friend_removed',
            $friend['user_id'],
            $friend['friend_id'],
            $friend,
            $userData ? $userData->toArray() : null,
            $friendData ? $friendData->toArray() : null
        );
        
        return response()->json(['message' => 'Friendship deleted successfully']);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{userId}/friends",
     *     summary="Get user's friends",
     *     tags={"Friends"},
     *     @OA\Parameter(
     *         name="userId",
     *         in="path",
     *         description="User ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(type="object"))
     *     )
     * )
     */
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

            $userData = $this->userRepository->findById($validated['user_id']);
            $friendData = $this->userRepository->findById($validated['friend_id']);
            
            $action = $validated['status'] === 'accepted' ? 'request_accepted' : 'request_rejected';
            $this->webSocketService->broadcastFriendNotification(
                $action,
                $validated['user_id'],
                $validated['friend_id'],
                $validated,
                $userData ? $userData->toArray() : null,
                $friendData ? $friendData->toArray() : null
            );

            return response()->json(['message' => 'Friendship status updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Repositories\GroupRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class GroupController extends Controller
{
    private GroupRepository $groupRepository;

    public function __construct(GroupRepository $groupRepository)
    {
        $this->groupRepository = $groupRepository;
    }

    /**
     * @OA\Get(
     *     path="/api/groups",
     *     summary="Get all groups",
     *     tags={"Groups"},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="creator_id", type="integer"),
     *             @OA\Property(property="status", type="string", enum={"active", "inactive", "archived"}),
     *             @OA\Property(property="is_private", type="boolean"),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time"),
     *             @OA\Property(property="creator", type="object")
     *         ))
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        $groups = $this->groupRepository->getAll();
        return response()->json($groups);
    }

    /**
     * @OA\Get(
     *     path="/api/groups/{id}",
     *     summary="Get group by ID",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="creator_id", type="integer"),
     *             @OA\Property(property="status", type="string"),
     *             @OA\Property(property="is_private", type="boolean"),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Group not found")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $group = $this->groupRepository->findById($id);

        if (!$group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        return response()->json($group);
    }

    /**
     * @OA\Post(
     *     path="/api/groups",
     *     summary="Create a new group",
     *     tags={"Groups"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","creator_id"},
     *             @OA\Property(property="name", type="string", example="Study Group"),
     *             @OA\Property(property="description", type="string", example="A group for studying together"),
     *             @OA\Property(property="creator_id", type="integer", example=1),
     *             @OA\Property(property="status", type="string", enum={"active", "inactive", "archived"}, example="active"),
     *             @OA\Property(property="is_private", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Group created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="creator_id", type="integer"),
     *             @OA\Property(property="status", type="string"),
     *             @OA\Property(property="is_private", type="boolean"),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'creator_id' => 'required|integer|exists:users,id',
                'status' => 'nullable|string|in:active,inactive,archived',
                'is_private' => 'nullable|boolean',
            ]);

            $validated['status'] = $validated['status'] ?? 'active';
            $validated['is_private'] = $validated['is_private'] ?? false;

            $group = $this->groupRepository->create($validated);
            return response()->json($group, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/groups/{id}",
     *     summary="Update group",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Updated Study Group"),
     *             @OA\Property(property="description", type="string", example="Updated description"),
     *             @OA\Property(property="status", type="string", enum={"active", "inactive", "archived"}),
     *             @OA\Property(property="is_private", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Group updated successfully"),
     *     @OA\Response(response=404, description="Group not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $group = $this->groupRepository->findById($id);

            if (!$group) {
                return response()->json(['message' => 'Group not found'], 404);
            }

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|string|in:active,inactive,archived',
                'is_private' => 'sometimes|boolean',
            ]);

            $this->groupRepository->update($id, $validated);
            return response()->json(['message' => 'Group updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/groups/{id}",
     *     summary="Delete group",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Group deleted successfully"),
     *     @OA\Response(response=404, description="Group not found")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $group = $this->groupRepository->findById($id);

        if (!$group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        $this->groupRepository->delete($id);
        return response()->json(['message' => 'Group deleted successfully']);
    }

    /**
     * @OA\Get(
     *     path="/api/groups/{id}/members",
     *     summary="Get group with members",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="creator", type="object"),
     *             @OA\Property(property="members", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(response=404, description="Group not found")
     * )
     */
    public function getGroupWithMembers(int $id): JsonResponse
    {
        $group = $this->groupRepository->getGroupWithMembers($id);

        if (!$group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        return response()->json($group);
    }

    /**
     * @OA\Get(
     *     path="/api/groups/{id}/tasks",
     *     summary="Get group with tasks",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="creator", type="object"),
     *             @OA\Property(property="tasks", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(response=404, description="Group not found")
     * )
     */
    public function getGroupWithTasks(int $id): JsonResponse
    {
        $group = $this->groupRepository->getGroupWithTasks($id);

        if (!$group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        return response()->json($group);
    }

    /**
     * @OA\Get(
     *     path="/api/groups/{id}/messages",
     *     summary="Get group with messages",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="creator", type="object"),
     *             @OA\Property(property="messages", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(response=404, description="Group not found")
     * )
     */
    public function getGroupWithMessages(int $id): JsonResponse
    {
        $group = $this->groupRepository->getGroupWithMessages($id);

        if (!$group) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        return response()->json($group);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{userId}/groups",
     *     summary="Get user's groups",
     *     tags={"Groups"},
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
    public function getUserGroups(int $userId): JsonResponse
    {
        $groups = $this->groupRepository->getUserGroups($userId);
        return response()->json($groups);
    }

    /**
     * @OA\Get(
     *     path="/api/groups-public",
     *     summary="Get public groups",
     *     tags={"Groups"},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(type="object"))
     *     )
     * )
     */
    public function getPublicGroups(): JsonResponse
    {
        $groups = $this->groupRepository->getPublicGroups();
        return response()->json($groups);
    }

    /**
     * @OA\Get(
     *     path="/api/groups-search",
     *     summary="Search groups by name or description",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="q",
     *         in="query",
     *         description="Search term for group name or description",
     *         required=true,
     *         @OA\Schema(type="string", minLength=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="creator_id", type="integer"),
     *             @OA\Property(property="status", type="string"),
     *             @OA\Property(property="is_private", type="boolean"),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time"),
     *             @OA\Property(property="creator", type="object")
     *         ))
     *     ),
     *     @OA\Response(response=400, description="Search term is required"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function searchGroups(Request $request): JsonResponse
    {
        try {
            $searchTerm = $request->query('q');

            if (empty($searchTerm)) {
                return response()->json(['error' => 'Search term is required'], 400);
            }

            $validated = $request->validate([
                'q' => 'required|string|min:1|max:255',
            ]);

            $groups = $this->groupRepository->searchGroups($validated['q']);
            return response()->json($groups);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while searching groups'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/groups/{id}/join",
     *     summary="Join a group",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id"},
     *             @OA\Property(property="user_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Successfully joined group"),
     *     @OA\Response(response=404, description="Group not found"),
     *     @OA\Response(response=409, description="Already a member of this group"),
     *     @OA\Response(response=403, description="Cannot join private group"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function joinGroup(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
            ]);

            $group = $this->groupRepository->findById($id);
            if (!$group) {
                return response()->json(['error' => 'Group not found'], 404);
            }

            if ($group->is_private) {
                return response()->json(['error' => 'Cannot join private group'], 403);
            }

            if ($this->groupRepository->isMember($id, $validated['user_id'])) {
                return response()->json(['error' => 'User is already a member of this group'], 409);
            }

            $success = $this->groupRepository->addMember($id, $validated['user_id'], 'member');

            if ($success) {
                return response()->json(['message' => 'Successfully joined group']);
            } else {
                return response()->json(['error' => 'Failed to join group'], 500);
            }
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/groups/{id}/leave",
     *     summary="Leave a group",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id"},
     *             @OA\Property(property="user_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Successfully left group"),
     *     @OA\Response(response=404, description="Group not found"),
     *     @OA\Response(response=409, description="Not a member of this group"),
     *     @OA\Response(response=403, description="Creator cannot leave group"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function leaveGroup(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
            ]);

            $group = $this->groupRepository->findById($id);
            if (!$group) {
                return response()->json(['error' => 'Group not found'], 404);
            }

            if ($group->creator_id == $validated['user_id']) {
                return response()->json(['error' => 'Creator cannot leave their own group'], 403);
            }

            if (!$this->groupRepository->isMember($id, $validated['user_id'])) {
                return response()->json(['error' => 'User is not a member of this group'], 409);
            }

            $success = $this->groupRepository->removeMember($id, $validated['user_id']);

            if ($success) {
                return response()->json(['message' => 'Successfully left group']);
            } else {
                return response()->json(['error' => 'Failed to leave group'], 500);
            }
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}

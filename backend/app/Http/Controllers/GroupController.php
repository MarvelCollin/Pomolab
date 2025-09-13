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
     *     path="/api/groups/public",
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
     * @OA\Post(
     *     path="/api/groups/{groupId}/members/{userId}",
     *     summary="Add member to group",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="groupId",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="userId",
     *         in="path",
     *         description="User ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="role", type="string", enum={"member", "admin", "moderator"}, example="member")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Member added successfully"),
     *     @OA\Response(response=404, description="Group not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function addMember(Request $request, int $groupId, int $userId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'role' => 'nullable|string|in:member,admin,moderator',
            ]);

            $role = $validated['role'] ?? 'member';

            $success = $this->groupRepository->addMember($groupId, $userId, $role);

            if (!$success) {
                return response()->json(['message' => 'Group not found'], 404);
            }

            return response()->json(['message' => 'Member added successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/groups/{groupId}/members/{userId}",
     *     summary="Remove member from group",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="groupId",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="userId",
     *         in="path",
     *         description="User ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Member removed successfully"),
     *     @OA\Response(response=404, description="Group or member not found")
     * )
     */
    public function removeMember(int $groupId, int $userId): JsonResponse
    {
        $success = $this->groupRepository->removeMember($groupId, $userId);

        if (!$success) {
            return response()->json(['message' => 'Group or member not found'], 404);
        }

        return response()->json(['message' => 'Member removed successfully']);
    }

    /**
     * @OA\Put(
     *     path="/api/groups/{groupId}/members/{userId}/role",
     *     summary="Update member role",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="groupId",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="userId",
     *         in="path",
     *         description="User ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"role"},
     *             @OA\Property(property="role", type="string", enum={"member", "admin", "moderator"}, example="admin")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Member role updated successfully"),
     *     @OA\Response(response=404, description="Group or member not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function updateMemberRole(Request $request, int $groupId, int $userId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'role' => 'required|string|in:member,admin,moderator',
            ]);

            $success = $this->groupRepository->updateMemberRole($groupId, $userId, $validated['role']);

            if (!$success) {
                return response()->json(['message' => 'Group or member not found'], 404);
            }

            return response()->json(['message' => 'Member role updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/groups/search",
     *     summary="Search groups",
     *     tags={"Groups"},
     *     @OA\Parameter(
     *         name="q",
     *         in="query",
     *         description="Search term",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(type="object"))
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function searchGroups(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'q' => 'required|string|min:1',
            ]);

            $groups = $this->groupRepository->searchGroups($validated['q']);
            return response()->json($groups);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/groups/{id}/status",
     *     summary="Update group status",
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
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"active", "inactive", "archived"}, example="archived")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Group status updated successfully"),
     *     @OA\Response(response=404, description="Group not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        try {
            $group = $this->groupRepository->findById($id);

            if (!$group) {
                return response()->json(['message' => 'Group not found'], 404);
            }

            $validated = $request->validate([
                'status' => 'required|string|in:active,inactive,archived',
            ]);

            $this->groupRepository->updateStatus($id, $validated['status']);
            return response()->json(['message' => 'Group status updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}

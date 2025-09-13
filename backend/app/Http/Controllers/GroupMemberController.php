<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Repositories\GroupMemberRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class GroupMemberController extends Controller
{
    private GroupMemberRepository $groupMemberRepository;

    public function __construct(GroupMemberRepository $groupMemberRepository)
    {
        $this->groupMemberRepository = $groupMemberRepository;
    }

    /**
     * @OA\Get(
     *     path="/api/group-members",
     *     summary="Get all group members",
     *     tags={"Group Members"},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="user_id", type="integer"),
     *             @OA\Property(property="group_id", type="integer"),
     *             @OA\Property(property="role", type="string"),
     *             @OA\Property(property="joined_at", type="string", format="date-time"),
     *             @OA\Property(property="user", type="object"),
     *             @OA\Property(property="group", type="object")
     *         ))
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        $groupMembers = $this->groupMemberRepository->getAll();
        return response()->json($groupMembers);
    }

    /**
     * @OA\Get(
     *     path="/api/group-members/{id}",
     *     summary="Get group member by ID",
     *     tags={"Group Members"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="user_id", type="integer"),
     *             @OA\Property(property="group_id", type="integer"),
     *             @OA\Property(property="role", type="string"),
     *             @OA\Property(property="joined_at", type="string", format="date-time"),
     *             @OA\Property(property="user", type="object"),
     *             @OA\Property(property="group", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Group member not found")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $groupMember = $this->groupMemberRepository->findById($id);

        if (!$groupMember) {
            return response()->json(['error' => 'Group member not found'], 404);
        }

        return response()->json($groupMember);
    }

    /**
     * @OA\Post(
     *     path="/api/group-members",
     *     summary="Add a new group member",
     *     tags={"Group Members"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id","group_id"},
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="group_id", type="integer", example=1),
     *             @OA\Property(property="role", type="string", enum={"member", "admin", "moderator"}, example="member")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Group member added successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="user_id", type="integer"),
     *             @OA\Property(property="group_id", type="integer"),
     *             @OA\Property(property="role", type="string"),
     *             @OA\Property(property="joined_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=409, description="User is already a member")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'group_id' => 'required|integer|exists:groups,id',
                'role' => 'nullable|string|in:member,admin,moderator',
            ]);

            $validated['role'] = $validated['role'] ?? 'member';

            // Check if user is already a member
            if ($this->groupMemberRepository->isMember($validated['group_id'], $validated['user_id'])) {
                return response()->json(['error' => 'User is already a member of this group'], 409);
            }

            $groupMember = $this->groupMemberRepository->create($validated);

            // Load relationships for the response
            $groupMember->load(['user', 'group']);

            return response()->json($groupMember, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/group-members/{id}",
     *     summary="Update group member",
     *     tags={"Group Members"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="role", type="string", enum={"member", "admin", "moderator"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Group member updated successfully"),
     *     @OA\Response(response=404, description="Group member not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'role' => 'nullable|string|in:member,admin,moderator',
            ]);

            $groupMember = $this->groupMemberRepository->findById($id);
            if (!$groupMember) {
                return response()->json(['error' => 'Group member not found'], 404);
            }

            $this->groupMemberRepository->update($id, $validated);
            return response()->json(['message' => 'Group member updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/group-members/{id}",
     *     summary="Remove group member",
     *     tags={"Group Members"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Group member removed successfully"),
     *     @OA\Response(response=404, description="Group member not found")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $groupMember = $this->groupMemberRepository->findById($id);

        if (!$groupMember) {
            return response()->json(['error' => 'Group member not found'], 404);
        }

        $this->groupMemberRepository->delete($id);
        return response()->json(['message' => 'Group member removed successfully']);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{userId}/group-memberships",
     *     summary="Get user's group memberships",
     *     tags={"Group Members"},
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
    public function getUserGroupMemberships(int $userId): JsonResponse
    {
        $memberships = $this->groupMemberRepository->getUserMemberships($userId);
        return response()->json($memberships);
    }

    /**
     * @OA\Get(
     *     path="/api/groups/{groupId}/members",
     *     summary="Get group members by group ID",
     *     tags={"Group Members"},
     *     @OA\Parameter(
     *         name="groupId",
     *         in="path",
     *         description="Group ID",
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
    public function getGroupMembersByGroupId(int $groupId): JsonResponse
    {
        $members = $this->groupMemberRepository->getGroupMembers($groupId);
        return response()->json($members);
    }

    /**
     * @OA\Put(
     *     path="/api/group-members/{id}/role",
     *     summary="Update member role",
     *     tags={"Group Members"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group Member ID",
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
     *     @OA\Response(response=404, description="Group member not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function updateMemberRole(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'role' => 'required|string|in:member,admin,moderator',
            ]);

            $groupMember = $this->groupMemberRepository->findById($id);
            if (!$groupMember) {
                return response()->json(['error' => 'Group member not found'], 404);
            }

            $this->groupMemberRepository->updateRole($id, $validated['role']);
            return response()->json(['message' => 'Member role updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}

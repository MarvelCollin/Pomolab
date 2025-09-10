<?php

namespace App\Http\Controllers;

use App\Repositories\TaskRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class TaskController extends Controller
{
    private TaskRepository $taskRepository;

    public function __construct(TaskRepository $taskRepository)
    {
        $this->taskRepository = $taskRepository;
    }

    /**
     * @OA\Get(
     *     path="/api/tasks",
     *     summary="Get all tasks",
     *     tags={"Tasks"},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="owner_id", type="integer"),
     *             @OA\Property(property="assigned_to_id", type="integer"),
     *             @OA\Property(property="status", type="string", enum={"pending", "in_progress", "completed", "cancelled"})
     *         ))
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        $tasks = $this->taskRepository->getAll();
        return response()->json($tasks);
    }

    public function show(int $id): JsonResponse
    {
        $task = $this->taskRepository->findById($id);
        
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        return response()->json($task);
    }

    /**
     * @OA\Post(
     *     path="/api/tasks",
     *     summary="Create a new task",
     *     tags={"Tasks"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title","owner_id","status"},
     *             @OA\Property(property="title", type="string", example="Complete project documentation"),
     *             @OA\Property(property="description", type="string", example="Write comprehensive docs for the API"),
     *             @OA\Property(property="owner_id", type="integer", example=1),
     *             @OA\Property(property="assigned_to_id", type="integer", example=2),
     *             @OA\Property(property="status", type="string", enum={"pending", "in_progress", "completed", "cancelled"}, example="pending")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Task created successfully"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'owner_id' => 'required|integer|exists:users,id',
                'assigned_to_id' => 'nullable|integer|exists:users,id',
                'status' => 'required|string|in:pending,in_progress,completed,cancelled',
            ]);

            $task = $this->taskRepository->create($validated);
            return response()->json($task, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $task = $this->taskRepository->findById($id);
            
            if (!$task) {
                return response()->json(['message' => 'Task not found'], 404);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|nullable|string',
                'assigned_to_id' => 'sometimes|nullable|integer|exists:users,id',
                'status' => 'sometimes|string|in:pending,in_progress,completed,cancelled',
            ]);

            $this->taskRepository->update($id, $validated);
            return response()->json(['message' => 'Task updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $task = $this->taskRepository->findById($id);
        
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $this->taskRepository->delete($id);
        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function getTasksByOwner(int $ownerId): JsonResponse
    {
        $tasks = $this->taskRepository->getTasksByOwnerId($ownerId);
        return response()->json($tasks);
    }

    public function getTasksByAssigned(int $assignedId): JsonResponse
    {
        $tasks = $this->taskRepository->getTasksByAssignedId($assignedId);
        return response()->json($tasks);
    }

    public function getTasksByStatus(string $status): JsonResponse
    {
        $tasks = $this->taskRepository->getTasksByStatus($status);
        return response()->json($tasks);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{userId}/all-tasks",
     *     summary="Get all tasks for a user (owned and assigned)",
     *     tags={"Tasks"},
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
    public function getUserTasks(int $userId): JsonResponse
    {
        $tasks = $this->taskRepository->getUserTasks($userId);
        return response()->json($tasks);
    }

    public function getTaskWithMessages(int $id): JsonResponse
    {
        $task = $this->taskRepository->getTaskWithMessages($id);
        
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        return response()->json($task);
    }

    public function updateTaskStatus(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:pending,in_progress,completed,cancelled',
            ]);

            $task = $this->taskRepository->findById($id);
            
            if (!$task) {
                return response()->json(['message' => 'Task not found'], 404);
            }

            $this->taskRepository->updateTaskStatus($id, $validated['status']);
            return response()->json(['message' => 'Task status updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function assignTask(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
            ]);

            $task = $this->taskRepository->findById($id);
            
            if (!$task) {
                return response()->json(['message' => 'Task not found'], 404);
            }

            $this->taskRepository->assignTask($id, $validated['user_id']);
            return response()->json(['message' => 'Task assigned successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}

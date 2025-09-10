<?php

namespace App\Http\Controllers;

use App\Repositories\MessageRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class MessageController extends Controller
{
    private MessageRepository $messageRepository;

    public function __construct(MessageRepository $messageRepository)
    {
        $this->messageRepository = $messageRepository;
    }

    /**
     * @OA\Get(
     *     path="/api/messages",
     *     summary="Get all messages",
     *     tags={"Messages"},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="from_user_id", type="integer"),
     *             @OA\Property(property="to_user_id", type="integer"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="task_id", type="integer"),
     *             @OA\Property(property="created_at", type="string", format="date-time")
     *         ))
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        $messages = $this->messageRepository->getAll();
        return response()->json($messages);
    }

    public function show(int $id): JsonResponse
    {
        $message = $this->messageRepository->findById($id);
        
        if (!$message) {
            return response()->json(['message' => 'Message not found'], 404);
        }

        return response()->json($message);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'from_user_id' => 'required|integer|exists:users,id',
                'to_user_id' => 'required|integer|exists:users,id|different:from_user_id',
                'message' => 'required|string',
                'task_id' => 'nullable|integer|exists:tasks,id',
            ]);

            $message = $this->messageRepository->create($validated);
            return response()->json($message, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $message = $this->messageRepository->findById($id);
            
            if (!$message) {
                return response()->json(['message' => 'Message not found'], 404);
            }

            $validated = $request->validate([
                'message' => 'required|string',
            ]);

            $this->messageRepository->update($id, $validated);
            return response()->json(['message' => 'Message updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $message = $this->messageRepository->findById($id);
        
        if (!$message) {
            return response()->json(['message' => 'Message not found'], 404);
        }

        $this->messageRepository->delete($id);
        return response()->json(['message' => 'Message deleted successfully']);
    }

    public function getMessagesByFromUser(int $fromUserId): JsonResponse
    {
        $messages = $this->messageRepository->getMessagesByFromUserId($fromUserId);
        return response()->json($messages);
    }

    public function getMessagesByToUser(int $toUserId): JsonResponse
    {
        $messages = $this->messageRepository->getMessagesByToUserId($toUserId);
        return response()->json($messages);
    }

    /**
     * @OA\Get(
     *     path="/api/conversation/{userId1}/{userId2}",
     *     summary="Get conversation between two users",
     *     tags={"Messages"},
     *     @OA\Parameter(
     *         name="userId1",
     *         in="path",
     *         description="First user ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="userId2",
     *         in="path",
     *         description="Second user ID",
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
    public function getConversation(int $userId1, int $userId2): JsonResponse
    {
        $messages = $this->messageRepository->getConversationBetweenUsers($userId1, $userId2);
        return response()->json($messages);
    }

    public function getTaskMessages(int $taskId): JsonResponse
    {
        $messages = $this->messageRepository->getMessagesByTaskId($taskId);
        return response()->json($messages);
    }

    public function getUserMessages(int $userId): JsonResponse
    {
        $messages = $this->messageRepository->getUserMessages($userId);
        return response()->json($messages);
    }

    /**
     * @OA\Post(
     *     path="/api/messages/send",
     *     summary="Send a message",
     *     tags={"Messages"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"from_user_id","to_user_id","message"},
     *             @OA\Property(property="from_user_id", type="integer", example=1),
     *             @OA\Property(property="to_user_id", type="integer", example=2),
     *             @OA\Property(property="message", type="string", example="Hello, how are you?"),
     *             @OA\Property(property="task_id", type="integer", example=1, description="Optional task ID")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Message sent successfully"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function sendMessage(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'from_user_id' => 'required|integer|exists:users,id',
                'to_user_id' => 'required|integer|exists:users,id|different:from_user_id',
                'message' => 'required|string',
                'task_id' => 'nullable|integer|exists:tasks,id',
            ]);

            $message = $this->messageRepository->sendMessage(
                $validated['from_user_id'],
                $validated['to_user_id'],
                $validated['message'],
                $validated['task_id'] ?? null
            );

            return response()->json($message, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}

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

<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function index(): JsonResponse
    {
        $users = $this->userRepository->getAll();
        return response()->json($users);
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'username' => 'required|string|max:255|unique:users',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
            ]);

            $validated['password_hash'] = Hash::make($validated['password']);
            unset($validated['password']);

            $user = $this->userRepository->create($validated);
            return response()->json($user, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $user = $this->userRepository->findById($id);
            
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $validated = $request->validate([
                'username' => 'sometimes|string|max:255|unique:users,username,' . $id,
                'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
                'password' => 'sometimes|string|min:8',
            ]);

            if (isset($validated['password'])) {
                $validated['password_hash'] = Hash::make($validated['password']);
                unset($validated['password']);
            }

            $this->userRepository->update($id, $validated);
            return response()->json(['message' => 'User updated successfully']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $this->userRepository->delete($id);
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function getUserWithFriends(int $id): JsonResponse
    {
        $user = $this->userRepository->getUserWithFriends($id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function getUserWithTasks(int $id): JsonResponse
    {
        $user = $this->userRepository->getUserWithTasks($id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }
}

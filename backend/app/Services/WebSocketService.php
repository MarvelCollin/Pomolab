<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class WebSocketService
{
    private Client $httpClient;
    private string $websocketServerUrl;

    public function __construct()
    {
        $this->httpClient = new Client();
        $this->websocketServerUrl = env('WEBSOCKET_SERVER_URL', 'http://localhost:8080');
    }

    public function broadcastFriendNotification(
        string $action,
        int $userId,
        int $friendId,
        array $friendshipData = null,
        array $userData = null,
        array $friendData = null
    ): bool {
        try {
            $response = $this->httpClient->post("{$this->websocketServerUrl}/broadcast/friend-notification", [
                'json' => [
                    'action' => $action,
                    'user_id' => $userId,
                    'friend_id' => $friendId,
                    'friendship_data' => $friendshipData,
                    'user_data' => $userData,
                    'friend_data' => $friendData,
                    'channel' => 'friend-notifications'
                ],
                'timeout' => 5
            ]);

            $statusCode = $response->getStatusCode();
            Log::info("WebSocket notification sent", [
                'action' => $action,
                'status_code' => $statusCode,
                'user_id' => $userId,
                'friend_id' => $friendId
            ]);

            return $statusCode >= 200 && $statusCode < 300;
        } catch (GuzzleException $e) {
            Log::warning("Failed to send WebSocket notification", [
                'action' => $action,
                'user_id' => $userId,
                'friend_id' => $friendId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function broadcastMessage(string $message, string $channel = 'message-channel'): bool
    {
        try {
            $response = $this->httpClient->post("{$this->websocketServerUrl}/broadcast/message", [
                'json' => [
                    'message' => $message,
                    'channel' => $channel
                ],
                'timeout' => 5
            ]);

            return $response->getStatusCode() >= 200 && $response->getStatusCode() < 300;
        } catch (GuzzleException $e) {
            Log::warning("Failed to broadcast message", [
                'message' => $message,
                'channel' => $channel,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function broadcastTaskUpdate(array $taskData, string $channel = 'task-updates'): bool
    {
        try {
            $response = $this->httpClient->post("{$this->websocketServerUrl}/broadcast/task-update", [
                'json' => [
                    'task' => $taskData,
                    'channel' => $channel
                ],
                'timeout' => 5
            ]);

            return $response->getStatusCode() >= 200 && $response->getStatusCode() < 300;
        } catch (GuzzleException $e) {
            Log::warning("Failed to broadcast task update", [
                'task' => $taskData,
                'channel' => $channel,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}

class SocketService {
    private ws: WebSocket | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private currentUserId: number | null = null;

    constructor() {
        this.initializeWebSocket();
    }

    private initializeWebSocket(): void {
        try {
            const socketUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8080';
            this.ws = new WebSocket(socketUrl);

            this.ws.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.resubscribeToChannels();
                
                if (this.currentUserId) {
                    this.sendUserConnect(this.currentUserId);
                }
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                this.handleReconnect();
            };

            this.ws.onerror = () => {
                
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    
                }
            };

        } catch (error) {
            
        }
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                this.initializeWebSocket();
            }, 2000 * this.reconnectAttempts);
        }
    }

    private messageCallbacks: { [key: string]: ((data: any) => void)[] } = {};

    private handleMessage(data: any): void {
        console.log('📨 Received WebSocket message:', data);
        
        if (data.event && data.channel && data.data) {
            const { event, channel, data: messageData } = data;
            console.log(`📢 Processing message for channel ${channel} with event ${event}:`, messageData);
            
            if (this.messageCallbacks[channel]) {
                console.log(`📞 Calling ${this.messageCallbacks[channel].length} callbacks for channel ${channel}`);
                this.messageCallbacks[channel].forEach(callback => {
                    callback({ event, data: messageData });
                });
            } else {
                console.log(`❌ No callbacks registered for channel: ${channel}`);
            }
        } else if (data.channel && data.data) {
            const { channel, data: messageData } = data;
            console.log(`📢 Processing direct message for channel ${channel}:`, messageData);
            
            if (this.messageCallbacks[channel]) {
                console.log(`📞 Calling ${this.messageCallbacks[channel].length} callbacks for channel ${channel}`);
                this.messageCallbacks[channel].forEach(callback => {
                    callback(messageData);
                });
            } else {
                console.log(`❌ No callbacks registered for channel: ${channel}`);
            }
        } else {
            console.log('⚠️ Unrecognized message format:', data);
        }
    }

    private subscribedChannels: Set<string> = new Set();

    public subscribeToChannel(channel: string, callback: (data: any) => void): () => void {
        console.log(`🔔 Subscribing to channel: ${channel}`);
        
        if (!this.messageCallbacks[channel]) {
            this.messageCallbacks[channel] = [];
        }
        
        const existingIndex = this.messageCallbacks[channel].findIndex(cb => cb === callback);
        if (existingIndex !== -1) {
            console.log(`⚠️ Callback already registered for channel ${channel}, skipping duplicate`);
            return () => this.unsubscribeCallback(channel, callback);
        }
        
        this.messageCallbacks[channel].push(callback);
        console.log(`📝 Added callback for channel ${channel}, total callbacks: ${this.messageCallbacks[channel].length}`);

        if (!this.subscribedChannels.has(channel) && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.subscribedChannels.add(channel);
            console.log(`📡 Sending subscription message for channel: ${channel}`);
            this.ws.send(JSON.stringify({
                type: 'subscribe',
                channel: channel
            }));
        } else {
            console.log(`⚠️ Channel ${channel} already subscribed or WebSocket not ready. Subscribed: ${this.subscribedChannels.has(channel)}, WS Ready: ${this.ws?.readyState === WebSocket.OPEN}`);
        }

        return () => this.unsubscribeCallback(channel, callback);
    }

    private unsubscribeCallback(channel: string, callback: (data: any) => void): void {
        if (this.messageCallbacks[channel]) {
            this.messageCallbacks[channel] = this.messageCallbacks[channel].filter(cb => cb !== callback);
            
            if (this.messageCallbacks[channel].length === 0) {
                delete this.messageCallbacks[channel];
                this.subscribedChannels.delete(channel);
            }
        }
    }

    private resubscribeToChannels(): void {
        this.subscribedChannels.forEach(channel => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'subscribe',
                    channel: channel
                }));
            }
        });
    }

    public listenToTestChannel(callback: (data: any) => void): () => void {
        return this.subscribeToChannel('test-channel', callback);
    }

    public listenToMessageChannel(callback: (data: any) => void): () => void {
        return this.subscribeToChannel('message-channel', callback);
    }

    public listenToTaskUpdates(callback: (data: any) => void): () => void {
        return this.subscribeToChannel('task-updates', callback);
    }

    public listenToFriendNotifications(callback: (data: any) => void): () => void {
        return this.subscribeToChannel('friend-notifications', callback);
    }

    public listenToVideoCallNotifications(callback: (data: any) => void): () => void {
        return this.subscribeToChannel('video-calls', callback);
    }

    public listenToCanvasNotifications(callback: (data: any) => void): () => void {
        return this.subscribeToChannel('canvas-sessions', callback);
    }

    public listenToUserChannel(userId: number, callback: (data: any) => void): () => void {
        return this.subscribeToChannel(`user-${userId}`, callback);
    }

    public broadcastFriendNotification(
        action: string,
        userId: number,
        friendId: number,
        friendshipData?: any,
        userData?: any,
        friendData?: any
    ): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const notificationData = {
                action,
                user_id: userId,
                friend_id: friendId,
                friendship_data: friendshipData,
                user_data: userData,
                friend_data: friendData,
                timestamp: new Date().toISOString()
            };

            this.ws.send(JSON.stringify({
                type: 'broadcast',
                channel: 'friend-notifications',
                data: notificationData
            }));
        }
    }

    public broadcastVideoCallNotification(notificationData: any, targetUserId: number): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const payload = {
                type: 'broadcast',
                channel: 'video-calls',
                data: {
                    ...notificationData,
                    target_user_id: targetUserId
                }
            };
            
            this.ws.send(JSON.stringify(payload));
        }
    }

    public sendCanvasAction(canvasActionData: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'canvas_action',
                data: canvasActionData
            }));
        }
    }

    public broadcastCanvasNotification(notificationData: any): void {
        console.log('🔌 broadcastCanvasNotification called:', notificationData);
        console.log('WebSocket state:', this.ws?.readyState, 'OPEN:', WebSocket.OPEN);
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const payload = {
                type: 'broadcast',
                channel: 'canvas-sessions',
                data: notificationData
            };
            console.log('📡 Sending WebSocket message:', payload);
            this.ws.send(JSON.stringify(payload));
        } else {
            console.error('❌ WebSocket not ready for broadcast. State:', this.ws?.readyState);
        }
    }

    public sendMessage(messageData: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'send_message',
                data: messageData
            }));
        }
    }

    public sendDirectMessage(data: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'direct_message',
                data: data
            }));
        }
    }

    public broadcastMessageNotification(messageData: any, fromUserId: number, toUserId: number, fromUser?: any, toUser?: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const notificationData = {
                type: 'message_received',
                message: messageData,
                from_user_id: fromUserId,
                to_user_id: toUserId,
                from_user: fromUser,
                to_user: toUser,
                timestamp: new Date().toISOString()
            };

            this.ws.send(JSON.stringify({
                type: 'broadcast',
                channel: 'message-channel',
                data: notificationData
            }));
        }
    }

    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.isConnected = false;
        }
    }

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    public setCurrentUser(userId: number | null): void {
        console.log('🔌 Socket service setting current user:', userId);
        this.currentUserId = userId;
        if (userId && this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('📡 Sending user_connect for user:', userId);
            this.sendUserConnect(userId);
        } else {
            console.log('⚠️ Cannot send user_connect - WebSocket not ready or no userId');
        }
    }

    private sendUserConnect(userId: number): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('📤 Sending user_connect message:', userId);
            this.ws.send(JSON.stringify({
                type: 'user_connect',
                userId: userId
            }));
        }
    }
}

export const socketService = new SocketService();
export default socketService;

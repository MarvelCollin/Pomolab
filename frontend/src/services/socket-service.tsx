class SocketService {
    private ws: WebSocket | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor() {
        this.initializeWebSocket();
    }

    private initializeWebSocket(): void {
        try {
            this.ws = new WebSocket('ws://localhost:8080');

            this.ws.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('WebSocket connected successfully');
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                console.log('WebSocket disconnected');
                this.handleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.initializeWebSocket();
            }, 2000 * this.reconnectAttempts);
        }
    }

    private messageCallbacks: { [key: string]: ((data: any) => void)[] } = {};

    private handleMessage(data: any): void {
        const { channel, data: messageData } = data;
        
        if (this.messageCallbacks[channel]) {
            this.messageCallbacks[channel].forEach(callback => {
                callback(messageData);
            });
        }
    }

    public subscribeToChannel(channel: string, callback: (data: any) => void): void {
        if (!this.messageCallbacks[channel]) {
            this.messageCallbacks[channel] = [];
        }
        
        this.messageCallbacks[channel].push(callback);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'subscribe',
                channel: channel
            }));
        }
    }

    public listenToTestChannel(callback: (data: any) => void): void {
        this.subscribeToChannel('test-channel', callback);
    }

    public listenToMessageChannel(callback: (data: any) => void): void {
        this.subscribeToChannel('message-channel', callback);
    }

    public listenToTaskUpdates(callback: (data: any) => void): void {
        this.subscribeToChannel('task-updates', callback);
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
}

export const socketService = new SocketService();
export default socketService;

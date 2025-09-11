import { useState, useEffect } from 'react';
import socketService from '../../services/socket-service';

const SocketTest = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [taskUpdates, setTaskUpdates] = useState<any[]>([]);

    useEffect(() => {
        setIsConnected(socketService.getConnectionStatus());

        socketService.listenToMessageChannel((data) => {
            setMessages(prev => [...prev, data]);
        });

        socketService.listenToTaskUpdates((data) => {
            setTaskUpdates(prev => [...prev, data]);
        });

        const checkConnection = setInterval(() => {
            setIsConnected(socketService.getConnectionStatus());
        }, 1000);

        return () => {
            clearInterval(checkConnection);
        };
    }, []);

    const testSocketMessage = async () => {
        try {
            const response = await fetch('http://localhost:8080/broadcast/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Test socket message from frontend',
                    channel: 'message-channel'
                })
            });
            const result = await response.json();
            console.log('Test message sent:', result);
        } catch (error) {
            console.error('Error sending test message:', error);
        }
    };

    const testTaskUpdate = async () => {
        try {
            const response = await fetch('http://localhost:8080/broadcast/task-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task: {
                        id: 1,
                        title: 'Test Task from Frontend',
                        status: 'completed'
                    },
                    channel: 'task-updates'
                })
            });
            const result = await response.json();
            console.log('Test task update sent:', result);
        } catch (error) {
            console.error('Error sending test task update:', error);
        }
    };

    const clearMessages = () => {
        setMessages([]);
        setTaskUpdates([]);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Socket Connection Test</h2>
            
            <div className="mb-6">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    isConnected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    Status: {isConnected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <button
                    onClick={testSocketMessage}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Send Test Message
                </button>
                
                <button
                    onClick={testTaskUpdate}
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors ml-4"
                >
                    Send Test Task Update
                </button>
                
                <button
                    onClick={clearMessages}
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors ml-4"
                >
                    Clear Messages
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Messages Received</h3>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        {messages.length === 0 ? (
                            <p className="text-gray-500">No messages received yet</p>
                        ) : (
                            messages.map((message, index) => (
                                <div key={index} className="mb-2 p-2 bg-blue-100 rounded">
                                    <div className="font-medium">{message.message}</div>
                                    <div className="text-sm text-gray-600">{message.timestamp}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Task Updates Received</h3>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        {taskUpdates.length === 0 ? (
                            <p className="text-gray-500">No task updates received yet</p>
                        ) : (
                            taskUpdates.map((update, index) => (
                                <div key={index} className="mb-2 p-2 bg-green-100 rounded">
                                    <div className="font-medium">Task: {update.task.title}</div>
                                    <div className="text-sm">Status: {update.task.status}</div>
                                    <div className="text-sm text-gray-600">{update.timestamp}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocketTest;

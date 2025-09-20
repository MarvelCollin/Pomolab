import { WebSocketServer } from 'ws';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const server = app.listen(8080, () => {
  console.log('HTTP server listening on port 8080');
});

const wss = new WebSocketServer({ server });

const clients = new Set();
const userClients = new Map();

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  clients.add(ws);

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'subscribe') {
        ws.channel = data.channel;
        console.log(`Client subscribed to channel: ${data.channel}`);
      } else if (data.type === 'user_connect') {
        ws.userId = data.userId;
        if (!userClients.has(data.userId)) {
          userClients.set(data.userId, new Set());
        }
        userClients.get(data.userId).add(ws);
        console.log(`User ${data.userId} connected, total clients for user: ${userClients.get(data.userId).size}`);
      } else if (data.type === 'send_message') {
        const { data: messageData } = data;
        
        const broadcastData = {
          event: 'MessageSent',
          channel: 'message-channel',
          data: {
            type: 'message_received',
            message: {
              id: messageData.tempId || Date.now().toString(),
              from_user_id: messageData.from_user_id,
              to_user_id: messageData.to_user_id,
              message: messageData.message,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              isTemporary: true
            },
            timestamp: new Date().toISOString()
          }
        };

        let broadcastCount = 0;
        userClients.forEach((clientSet, userId) => {
          clientSet.forEach(client => {
            if (client.readyState === client.OPEN) {
              client.send(JSON.stringify(broadcastData));
              broadcastCount++;
            }
          });
        });
        
        console.log(`Broadcasted message from ${messageData.from_user_id} to ${messageData.to_user_id} to ${broadcastCount} clients across ${userClients.size} users`);
      } else if (data.type === 'direct_message') {
        const { data: messageData } = data;
        
        const broadcastData = {
          event: 'MessageUpdate',
          channel: 'message-channel',
          data: messageData
        };

        let broadcastCount = 0;
        userClients.forEach((clientSet, userId) => {
          clientSet.forEach(client => {
            if (client.readyState === client.OPEN) {
              client.send(JSON.stringify(broadcastData));
              broadcastCount++;
            }
          });
        });
        
        console.log(`Broadcasted message update (${messageData.type}) to ${broadcastCount} clients across ${userClients.size} users`);
      } else if (data.type === 'broadcast') {
        const { channel, data: messageData } = data;
        
        let broadcastData;
        if (channel === 'video-calls') {
          broadcastData = {
            event: 'VideoCallNotification',
            channel,
            data: messageData
          };
          
          let broadcastCount = 0;
          userClients.forEach((clientSet, userId) => {
            clientSet.forEach(client => {
              if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(broadcastData));
                broadcastCount++;
              }
            });
          });
          console.log(`Broadcasted video call notification to ${broadcastCount} clients across ${userClients.size} users`);
        } else {
          broadcastData = {
            event: 'FriendNotification',
            channel,
            data: messageData
          };
          
          clients.forEach(client => {
            if (client.readyState === client.OPEN && 
                (client.channel === channel || client.channel === undefined)) {
              client.send(JSON.stringify(broadcastData));
            }
          });
          console.log(`Broadcasted message from client to ${clients.size} clients on channel ${channel}`);
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(ws);
    
    if (ws.userId && userClients.has(ws.userId)) {
      userClients.get(ws.userId).delete(ws);
      if (userClients.get(ws.userId).size === 0) {
        userClients.delete(ws.userId);
        console.log(`User ${ws.userId} disconnected completely`);
      } else {
        console.log(`User ${ws.userId} still has ${userClients.get(ws.userId).size} connections`);
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
    
    if (ws.userId && userClients.has(ws.userId)) {
      userClients.get(ws.userId).delete(ws);
      if (userClients.get(ws.userId).size === 0) {
        userClients.delete(ws.userId);
      }
    }
  });
});

app.post('/broadcast/message', (req, res) => {
  const { message, channel = 'message-channel' } = req.body;
  
  const broadcastData = {
    event: 'MessageSent',
    channel,
    data: message
  };

  let broadcastCount = 0;
  userClients.forEach((clientSet, userId) => {
    clientSet.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(broadcastData));
        broadcastCount++;
      }
    });
  });

  console.log(`Broadcasted message to ${broadcastCount} clients across ${userClients.size} users on channel ${channel}`);
  res.json({ 
    status: 'Message broadcasted', 
    clients: broadcastCount,
    users: userClients.size,
    message: message
  });
});

app.post('/broadcast/task-update', (req, res) => {
  const { task, channel = 'task-updates' } = req.body;
  
  const broadcastData = {
    event: 'TaskUpdated',
    channel,
    data: {
      task,
      timestamp: new Date().toISOString()
    }
  };

  let broadcastCount = 0;
  userClients.forEach((clientSet, userId) => {
    clientSet.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(broadcastData));
        broadcastCount++;
      }
    });
  });

  console.log(`Broadcasted task update to ${broadcastCount} clients across ${userClients.size} users on channel ${channel}`);
  res.json({ status: 'Task update broadcasted', clients: broadcastCount, users: userClients.size });
});

app.post('/broadcast/friend-notification', (req, res) => {
  const { 
    action, 
    user_id, 
    friend_id, 
    friendship_data,
    user_data,
    friend_data,
    channel = 'friend-notifications' 
  } = req.body;
  
  const broadcastData = {
    event: 'FriendNotification',
    channel,
    data: {
      action,
      user_id,
      friend_id,
      friendship_data,
      user_data,
      friend_data,
      timestamp: new Date().toISOString()
    }
  };

  let broadcastCount = 0;
  userClients.forEach((clientSet, userId) => {
    clientSet.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(broadcastData));
        broadcastCount++;
      }
    });
  });

  console.log(`Broadcasted friend notification (${action}) to ${broadcastCount} clients across ${userClients.size} users on channel ${channel}`);
  res.json({ status: 'Friend notification broadcasted', clients: broadcastCount, users: userClients.size, action });
});

app.post('/broadcast/video-call-test', (req, res) => {
  const { notification, channel = 'video-calls' } = req.body;
  
  const broadcastData = {
    event: 'VideoCallNotification',
    channel,
    data: notification
  };

  let broadcastCount = 0;
  
  userClients.forEach((clientSet, userId) => {
    clientSet.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(broadcastData));
        broadcastCount++;
      }
    });
  });

  console.log(`Broadcasted test video call notification to ${broadcastCount} clients across ${userClients.size} users`);
  res.json({ 
    status: 'Test video call notification broadcasted', 
    clients: broadcastCount,
    users: userClients.size,
    notification: notification.type
  });
});

app.get('/status', (req, res) => {
  const connectedUsers = Array.from(userClients.keys());
  const userConnectionCounts = {};
  userClients.forEach((clients, userId) => {
    userConnectionCounts[userId] = clients.size;
  });
  
  res.json({ 
    status: 'WebSocket server running',
    totalClients: clients.size,
    connectedUsers: connectedUsers.length,
    userConnections: userConnectionCounts,
    port: 8080
  });
});

console.log('WebSocket server starting on port 8080...');

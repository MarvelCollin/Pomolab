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

        clients.forEach(client => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(broadcastData));
          }
        });
        
        console.log(`Direct message sent from ${messageData.from_user_id} to ${messageData.to_user_id}`);
      } else if (data.type === 'direct_message') {
        const { data: messageData } = data;
        
        const broadcastData = {
          event: 'MessageUpdate',
          channel: 'message-channel',
          data: messageData
        };

        clients.forEach(client => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(broadcastData));
          }
        });
        
        console.log(`Direct message update:`, messageData.type);
      } else if (data.type === 'broadcast') {
        const { channel, data: messageData } = data;
        
        const broadcastData = {
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
      } else if (data.type === 'video_call_notification') {
        const { channel = 'video-calls', data: notificationData } = data;
        
        const broadcastData = {
          event: 'VideoCallNotification',
          channel,
          data: notificationData
        };

        clients.forEach(client => {
          if (client.readyState === client.OPEN && 
              (client.channel === channel || client.channel === undefined)) {
            client.send(JSON.stringify(broadcastData));
          }
        });
        
        console.log(`Broadcasted video call notification to ${clients.size} clients on channel ${channel}`);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
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
  clients.forEach(client => {
    if (client.readyState === client.OPEN && 
        (client.channel === channel || client.channel === undefined)) {
      client.send(JSON.stringify(broadcastData));
      broadcastCount++;
    }
  });

  console.log(`Broadcasted message to ${broadcastCount} clients on channel ${channel}`);
  res.json({ 
    status: 'Message broadcasted', 
    clients: broadcastCount,
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

  clients.forEach(client => {
    if (client.readyState === client.OPEN && 
        (client.channel === channel || client.channel === undefined)) {
      client.send(JSON.stringify(broadcastData));
    }
  });

  console.log(`Broadcasted task update to ${clients.size} clients on channel ${channel}`);
  res.json({ status: 'Task update broadcasted', clients: clients.size });
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
  clients.forEach(client => {
    if (client.readyState === client.OPEN && 
        (client.channel === channel || client.channel === undefined)) {
      client.send(JSON.stringify(broadcastData));
      broadcastCount++;
    }
  });

  console.log(`Broadcasted friend notification (${action}) to ${broadcastCount} clients on channel ${channel}`);
  res.json({ status: 'Friend notification broadcasted', clients: broadcastCount, action });
});

app.post('/broadcast/video-call-notification', (req, res) => {
  const { 
    type,
    callId,
    meetingId,
    token,
    from_user,
    to_user,
    target_user_id,
    channel = 'video-calls' 
  } = req.body;
  
  const broadcastData = {
    event: 'VideoCallNotification',
    channel,
    data: {
      type,
      callId,
      meetingId,
      token,
      from_user,
      to_user,
      target_user_id,
      timestamp: new Date().toISOString()
    }
  };

  let broadcastCount = 0;
  clients.forEach(client => {
    if (client.readyState === client.OPEN && 
        (client.channel === channel || client.channel === undefined)) {
      client.send(JSON.stringify(broadcastData));
      broadcastCount++;
    }
  });

  console.log(`Broadcasted video call notification (${type}) to ${broadcastCount} clients on channel ${channel}`);
  res.json({ status: 'Video call notification broadcasted', clients: broadcastCount, type });
});

app.get('/status', (req, res) => {
  res.json({ 
    status: 'WebSocket server running',
    clients: clients.size,
    port: 8080
  });
});

console.log('WebSocket server starting on port 8080...');

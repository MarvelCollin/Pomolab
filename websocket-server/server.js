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
    data: {
      message,
      timestamp: new Date().toISOString()
    }
  };

  clients.forEach(client => {
    if (client.readyState === client.OPEN && 
        (client.channel === channel || client.channel === undefined)) {
      client.send(JSON.stringify(broadcastData));
    }
  });

  console.log(`Broadcasted message to ${clients.size} clients on channel ${channel}`);
  res.json({ status: 'Message broadcasted', clients: clients.size });
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

  clients.forEach(client => {
    if (client.readyState === client.OPEN && 
        (client.channel === channel || client.channel === undefined)) {
      client.send(JSON.stringify(broadcastData));
    }
  });

  console.log(`Broadcasted friend notification (${action}) to ${clients.size} clients on channel ${channel}`);
  res.json({ status: 'Friend notification broadcasted', clients: clients.size, action });
});

app.get('/status', (req, res) => {
  res.json({ 
    status: 'WebSocket server running',
    clients: clients.size,
    port: 8080
  });
});

console.log('WebSocket server starting on port 8080...');

// Simple test to verify WebSocket server is working
const http = require('http');

// Test status endpoint
const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/status',
  method: 'GET'
};

console.log('Testing WebSocket server status...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Server Response:', data);
    
    // Test message-notification endpoint
    testMessageNotification();
  });
});

req.on('error', (error) => {
  console.error('Error testing status:', error.message);
});

req.end();

function testMessageNotification() {
  console.log('\nTesting message-notification endpoint...');
  
  const testMessage = {
    message_data: {
      id: 1,
      from_user_id: 1,
      to_user_id: 2,
      message: 'Test message',
      created_at: new Date().toISOString()
    },
    from_user_id: 1,
    to_user_id: 2,
    channel: 'message-notifications'
  };
  
  const postData = JSON.stringify(testMessage);
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/broadcast/message-notification',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`Message notification status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Broadcast Response:', data);
      console.log('✅ Real-time messaging system test completed!');
    });
  });
  
  req.on('error', (error) => {
    console.error('Error testing message notification:', error.message);
  });
  
  req.write(postData);
  req.end();
}
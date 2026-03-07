/**
 * OpenMouth Test Client
 * Simple WebSocket client for testing the server
 */

import WebSocket from 'ws';

const WS_URL = process.env.WS_URL || 'ws://127.0.0.1:8765';

console.log(`🔌 Connecting to ${WS_URL}...`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✅ Connected!');
  
  // Send a text message
  setTimeout(() => {
    console.log('📤 Sending text message...');
    ws.send(JSON.stringify({
      type: 'text',
      content: '你好，OpenMouth! 这是一个测试消息。'
    }));
  }, 500);
  
  // Send a ping
  setTimeout(() => {
    console.log('📤 Sending ping...');
    ws.send(JSON.stringify({ type: 'ping' }));
  }, 1500);
  
  // Close after tests
  setTimeout(() => {
    console.log('👋 Closing connection...');
    ws.close();
    process.exit(0);
  }, 3000);
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('📥 Received:', JSON.stringify(message, null, 2));
});

ws.on('error', (error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log('🔌 Connection closed');
});

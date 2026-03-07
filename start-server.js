/**
 * OpenMouth Standalone Server
 * Start the WebSocket server for testing
 */

import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT || 8765;
const HOST = process.env.HOST || '127.0.0.1';

console.log(`🚀 Starting OpenMouth server on ws://${HOST}:${PORT}...`);

const wss = new WebSocketServer({
  port: PORT,
  host: HOST,
});

const sessions = new Map();

wss.on('listening', () => {
  console.log(`✅ Server listening on ws://${HOST}:${PORT}`);
  console.log('📡 Waiting for connections...\n');
});

wss.on('connection', (ws, req) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  sessions.set(sessionId, { ws, connectedAt: Date.now() });
  
  console.log(`🔌 New connection: ${sessionId} from ${req.socket.remoteAddress}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    sessionId,
    timestamp: Date.now(),
    message: 'Connected to OpenMouth. Send text or voice messages.',
  }));
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📥 Received from ${sessionId}:`, message.type, message.content?.slice(0, 50));
      
      // Echo response
      ws.send(JSON.stringify({
        type: 'ack',
        message: `Received ${message.type} message`,
        timestamp: Date.now(),
        echo: message.content,
      }));
      
      // Handle ping
      if (message.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      console.error('Failed to parse message:', error.message);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }));
    }
  });
  
  ws.on('close', () => {
    sessions.delete(sessionId);
    console.log(`❌ Session closed: ${sessionId}`);
  });
  
  ws.on('error', (error) => {
    console.error(`Session error ${sessionId}:`, error.message);
    sessions.delete(sessionId);
  });
});

wss.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  wss.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

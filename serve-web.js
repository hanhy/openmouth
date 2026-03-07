/**
 * OpenMouth Web Server
 * Serves the web client and WebSocket server together
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 8765;
const HOST = process.env.HOST || '0.0.0.0';

// HTTP server for serving static files
const server = createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const html = readFileSync(join(__dirname, 'public', 'index.html'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (error) {
      res.writeHead(500);
      res.end('Error loading index.html');
    }
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', sessions: sessions.size }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

const sessions = new Map();

wss.on('connection', (ws, req) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  sessions.set(sessionId, { ws, connectedAt: Date.now(), type: 'web' });
  
  console.log(`🔌 Web client connected: ${sessionId} from ${req.socket.remoteAddress}`);
  
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

server.listen(PORT, HOST, () => {
  console.log(`🚀 OpenMouth server started`);
  console.log(`📡 Web client: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`🔌 WebSocket: ws://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/ws`);
  console.log(`💚 Health check: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/health\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  wss.close(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

/**
 * WebSocket Server for OpenMouth
 * 
 * Handles incoming connections and messages from clients.
 */

import { WebSocketServer, WebSocket } from "ws";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import {
  createSession,
  getSession,
  removeSession,
  touchSession,
  broadcastToAll,
} from "./session.js";

let wss: WebSocketServer | null = null;
let serverConfig: any = null;

export interface ServerConfig {
  port: number;
  host: string;
  authToken?: string;
  stt?: { provider: string; apiKey?: string; language: string };
  tts?: { provider: string; apiKey?: string; voice: string; speed: number };
}

/**
 * Start the WebSocket server
 */
export async function startServer(config: ServerConfig, api: OpenClawPluginApi): Promise<void> {
  if (wss) {
    api.log.warn("[openmouth] Server already running, stopping first...");
    await stopServer();
  }

  serverConfig = config;

  return new Promise((resolve, reject) => {
    try {
      wss = new WebSocketServer({
        port: config.port,
        host: config.host,
      });

      wss.on("listening", () => {
        api.log.info(`[openmouth] Server listening on ws://${config.host}:${config.port}`);
        resolve();
      });

      wss.on("error", (error) => {
        api.log.error(`[openmouth] Server error:`, error);
        reject(error);
      });

      wss.on("connection", (ws: WebSocket, req) => {
        handleConnection(ws, req, api);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Stop the WebSocket server
 */
export async function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!wss) {
      resolve();
      return;
    }

    wss.close(() => {
      wss = null;
      serverConfig = null;
      resolve();
    });

    // Close all connections
    wss.clients.forEach((client) => {
      client.close();
    });
  });
}

/**
 * Broadcast a message to all connected clients
 */
export async function broadcastMessage(message: string, type: "text" | "voice" = "text"): Promise<number> {
  return await broadcastToAll(message, type);
}

/**
 * Handle a new WebSocket connection
 */
function handleConnection(ws: WebSocket, req: any, api: OpenClawPluginApi): void {
  const sessionId = createSession().id;
  api.log.info(`[openmouth] New connection: ${sessionId} from ${req.socket.remoteAddress}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: "welcome",
    sessionId,
    timestamp: Date.now(),
    message: "Connected to OpenMouth. Send text or voice messages.",
  }));

  // Handle incoming messages
  ws.on("message", async (data: any) => {
    touchSession(sessionId);
    
    try {
      const message = JSON.parse(data.toString());
      await handleIncomingMessage(sessionId, message, ws, api);
    } catch (error) {
      api.log.error(`[openmouth] Failed to parse message:`, error);
      ws.send(JSON.stringify({
        type: "error",
        message: "Invalid message format",
      }));
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    removeSession(sessionId);
    api.log.info(`[openmouth] Session closed: ${sessionId}`);
  });

  // Handle errors
  ws.on("error", (error) => {
    api.log.error(`[openmouth] Session error ${sessionId}:`, error);
    removeSession(sessionId);
  });

  // Heartbeat to detect stale connections
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
      removeSession(sessionId);
    }
  }, 30000);

  ws.on("close", () => clearInterval(pingInterval));
}

/**
 * Handle an incoming message from a client
 */
async function handleIncomingMessage(
  sessionId: string,
  message: any,
  ws: WebSocket,
  api: OpenClawPluginApi
): Promise<void> {
  const { type, content } = message;

  api.log.info(`[openmouth] Received ${type} from ${sessionId}:`, content?.slice(0, 50));

  switch (type) {
    case "text":
      // Process text message - forward to OpenClaw
      await processTextMessage(sessionId, content, api);
      break;

    case "voice":
      // Process voice message - STT then forward
      await processVoiceMessage(sessionId, content, api);
      break;

    case "ping":
      ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      break;

    default:
      ws.send(JSON.stringify({
        type: "error",
        message: `Unknown message type: ${type}`,
      }));
  }
}

/**
 * Process a text message
 */
async function processTextMessage(
  sessionId: string,
  content: string,
  api: OpenClawPluginApi
): Promise<void> {
  // TODO: Forward to OpenClaw agent for processing
  // For now, just acknowledge
  const session = getSession(sessionId);
  if (session?.ws) {
    session.ws.send(JSON.stringify({
      type: "ack",
      message: "Message received",
      timestamp: Date.now(),
    }));
  }
}

/**
 * Process a voice message (STT)
 */
async function processVoiceMessage(
  sessionId: string,
  audioData: string, // Base64 encoded audio
  api: OpenClawPluginApi
): Promise<void> {
  // TODO: Implement STT conversion
  // For now, just acknowledge
  const session = getSession(sessionId);
  if (session?.ws) {
    session.ws.send(JSON.stringify({
      type: "ack",
      message: "Voice message received (STT not yet implemented)",
      timestamp: Date.now(),
    }));
  }
}

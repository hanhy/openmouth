/**
 * Session Management for OpenMouth
 * 
 * Tracks active WebSocket connections and their state.
 */

export interface Session {
  id: string;
  name?: string;
  connectedAt: number;
  lastActivity: number;
  ws?: any; // WebSocket reference
  metadata?: Record<string, any>;
}

const sessions = new Map<string, Session>();

/**
 * Create a new session
 */
export function createSession(id?: string): Session {
  const sessionId = id || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const session: Session = {
    id: sessionId,
    connectedAt: Date.now(),
    lastActivity: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
}

/**
 * Get a session by ID
 */
export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

/**
 * Update session activity timestamp
 */
export function touchSession(id: string): void {
  const session = sessions.get(id);
  if (session) {
    session.lastActivity = Date.now();
  }
}

/**
 * Remove a session
 */
export function removeSession(id: string): void {
  sessions.delete(id);
}

/**
 * Get all active sessions
 */
export function getActiveSessions(): Session[] {
  return Array.from(sessions.values());
}

/**
 * Send a message to a specific session
 */
export async function sendMessageToSession(
  sessionId: string,
  message: string
): Promise<boolean> {
  const session = sessions.get(sessionId);
  if (!session || !session.ws) {
    return false;
  }

  try {
    session.ws.send(JSON.stringify({
      type: "message",
      content: message,
      timestamp: Date.now(),
    }));
    return true;
  } catch (error) {
    console.error(`[openmouth] Failed to send to session ${sessionId}:`, error);
    return false;
  }
}

/**
 * Broadcast a message to all sessions
 */
export async function broadcastToAll(message: string, type: "text" | "voice" = "text"): Promise<number> {
  let sentCount = 0;
  for (const session of sessions.values()) {
    if (session.ws) {
      try {
        session.ws.send(JSON.stringify({
          type,
          content: message,
          timestamp: Date.now(),
        }));
        sentCount++;
      } catch (error) {
        console.error(`[openmouth] Failed to broadcast to session ${session.id}:`, error);
      }
    }
  }
  return sentCount;
}

/**
 * Clean up stale sessions (no activity for > maxDuration)
 */
export function cleanupStaleSessions(maxDurationMs: number): number {
  const now = Date.now();
  let removed = 0;
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > maxDurationMs) {
      sessions.delete(id);
      removed++;
    }
  }
  return removed;
}

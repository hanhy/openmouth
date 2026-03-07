/**
 * OpenMouth Channel Implementation
 * 
 * Implements the OpenClaw channel interface for WebSocket-based
 * real-time communication.
 */

import type {
  ChannelPlugin,
  ChannelAccount,
  ChannelMessage,
  ChannelCapabilities,
} from "openclaw/plugin-sdk";
import { getActiveSessions, sendMessageToSession } from "./session.js";

export interface OpenMouthAccount extends ChannelAccount {
  id: string;
  name: string;
  type: "websocket";
}

export interface OpenMouthMessage extends ChannelMessage {
  sessionId: string;
  type: "text" | "voice" | "system";
  content: string;
  audioUrl?: string;
  timestamp: number;
}

const capabilities: ChannelCapabilities = {
  chatTypes: ["direct"],
  media: true,
  threads: false,
  reactions: false,
  readReceipts: false,
  typing: true,
  voice: true,
};

export const openmouthPlugin: ChannelPlugin<OpenMouthAccount> = {
  id: "openmouth",
  name: "OpenMouth",
  meta: {
    label: "OpenMouth",
    selectionLabel: "OpenMouth (Voice & Text)",
    blurb: "Real-time WebSocket channel with voice support",
    order: 100,
  },
  capabilities,

  config: {
    listAccountIds: (cfg) => {
      // Return configured account IDs (for now, just one default)
      return ["openmouth-default"];
    },

    getAccount: async (accountId, cfg) => {
      return {
        id: accountId,
        name: "OpenMouth Channel",
        type: "websocket" as const,
      };
    },

    getAvatar: async (accountId, cfg) => {
      return null; // No avatar for now
    },
  },

  messaging: {
    sendMessage: async (accountId, conversationId, message, cfg) => {
      // Send message to the specific session
      const result = await sendMessageToSession(conversationId, message);
      return {
        messageId: `om_${Date.now()}`,
        conversationId,
        timestamp: Date.now(),
      };
    },

    sendTyping: async (accountId, conversationId, cfg) => {
      // TODO: Implement typing indicator
      return;
    },
  },

  conversations: {
    list: async (accountId, cfg) => {
      // Return active sessions as conversations
      const sessions = getActiveSessions();
      return sessions.map((s) => ({
        id: s.id,
        name: s.name || `Session ${s.id.slice(0, 8)}`,
        type: "direct" as const,
        lastActivity: s.lastActivity,
      }));
    },

    get: async (accountId, conversationId, cfg) => {
      const sessions = getActiveSessions();
      const session = sessions.find((s) => s.id === conversationId);
      if (!session) {
        throw new Error(`Session ${conversationId} not found`);
      }
      return {
        id: session.id,
        name: session.name || `Session ${session.id.slice(0, 8)}`,
        type: "direct" as const,
        lastActivity: session.lastActivity,
      };
    },
  },
};

/**
 * OpenMouth - Voice & Text conversation channel for OpenClaw
 * 
 * Provides real-time WebSocket-based communication with optional
 * speech-to-text (STT) and text-to-speech (TTS) capabilities.
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { openmouthPlugin } from "./src/channel.js";
import { startServer, stopServer } from "./src/server.js";

const plugin = {
  id: "openmouth",
  name: "OpenMouth",
  description: "Voice & Text conversation channel for OpenClaw",
  version: "0.1.0",
  
  configSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      port: { type: "number", default: 8765 },
      host: { type: "string", default: "127.0.0.1" },
      authToken: { type: "string" },
      stt: {
        type: "object",
        properties: {
          provider: { type: "string", enum: ["whisper", "google", "azure", "none"], default: "whisper" },
          apiKey: { type: "string" },
          language: { type: "string", default: "zh-CN" }
        }
      },
      tts: {
        type: "object",
        properties: {
          provider: { type: "string", enum: ["openai", "elevenlabs", "edge", "none"], default: "edge" },
          apiKey: { type: "string" },
          voice: { type: "string", default: "alloy" },
          speed: { type: "number", default: 1.0 }
        }
      }
    }
  },

  register(api: OpenClawPluginApi) {
    // Register the channel
    api.registerChannel({ plugin: openmouthPlugin });

    // Register agent tools
    api.registerTool({
      name: "openmouth_broadcast",
      description: "Broadcast a message to all connected OpenMouth clients",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "Message to broadcast" },
          type: { type: "string", enum: ["text", "voice"], default: "text" }
        },
        required: ["message"]
      },
      execute: async (params) => {
        const { broadcastMessage } = await import("./src/server.js");
        await broadcastMessage(params.message, params.type || "text");
        return { success: true, message: "Broadcast sent" };
      }
    });

  },
};

export default plugin;

# OpenMouth 🎤

**Voice & Text conversation channel for OpenClaw**

OpenMouth 是一个 OpenClaw 插件，提供基于 WebSocket 的实时通信渠道，支持文字和语音对话。

OpenMouth is an OpenClaw plugin that provides a WebSocket-based real-time communication channel with support for text and voice conversations.

---

## 功能特性 / Features

- 📝 **文字对话** - 实时文字消息收发 / Real-time text messaging
- 🎤 **语音对话** - 集成 STT/TTS 支持语音交互 / Voice interaction with STT/TTS support
- 🔌 **WebSocket** - 简单的 WebSocket API / Simple WebSocket API
- 🛡️ **认证支持** - 可选的 Token 认证 / Optional token authentication
- 📊 **会话管理** - 自动追踪活跃会话 / Automatic session tracking
- 🌐 **Web 客户端** - 美观的浏览器界面 / Beautiful web interface

---

## 安装 / Installation

### 方法一：作为 OpenClaw 插件安装 / Method 1: Install as OpenClaw Plugin

```bash
# 克隆仓库到 OpenClaw 扩展目录 / Clone to OpenClaw extensions directory
cd ~/.openclaw/extensions
git clone https://github.com/hanhy/openmouth.git

# 安装依赖 / Install dependencies
cd openmouth
npm install

# 重启 OpenClaw Gateway / Restart OpenClaw Gateway
openclaw gateway restart
```

### 方法二：独立运行 / Method 2: Run Standalone

```bash
# 克隆仓库 / Clone repository
git clone https://github.com/hanhy/openmouth.git
cd openmouth

# 安装依赖 / Install dependencies
npm install
```

---

## 启动 / Startup

### 作为 OpenClaw 插件 / As OpenClaw Plugin

1. **配置插件 / Configure Plugin**

在 OpenClaw 配置文件 (`~/.openclaw/openclaw.json`) 中添加：

```json
{
  "plugins": {
    "entries": {
      "openmouth": {
        "enabled": true
      }
    }
  }
}
```

2. **重启 Gateway / Restart Gateway**

```bash
openclaw gateway restart
```

3. **插件会自动加载 / Plugin will load automatically**

### 独立运行 / Standalone Mode

#### 方式 A：Web 服务器（推荐）/ Option A: Web Server (Recommended)

```bash
# 启动 HTTP + WebSocket 服务器 / Start HTTP + WebSocket server
node serve-web.js

# 访问 Web 客户端 / Open web client
# http://localhost:8765
```

#### 方式 B：仅 WebSocket 服务器 / Option B: WebSocket Only

```bash
# 启动 WebSocket 服务器 / Start WebSocket server
node start-server.js

# 使用测试客户端 / Use test client
node test-client.js
```

#### 方式 C：使用 npm 脚本 / Option C: Using npm Scripts

```bash
# 启动 Web 服务器 / Start web server
npm run serve
```

---

## 配置 / Configuration

在 OpenClaw 配置中 (`~/.openclaw/openclaw.json`)：

```json
{
  "plugins": {
    "entries": {
      "openmouth": {
        "enabled": true,
        "config": {
          "port": 8765,
          "host": "127.0.0.1",
          "authToken": "your-secret-token",
          "stt": {
            "provider": "whisper",
            "apiKey": "your-whisper-api-key",
            "language": "zh-CN"
          },
          "tts": {
            "provider": "edge",
            "voice": "alloy",
            "speed": 1.0
          }
        }
      }
    }
  }
}
```

### 配置选项 / Config Options

| 选项 / Option | 类型 / Type | 默认值 / Default | 说明 / Description |
|--------------|------------|-----------------|-------------------|
| `port` | number | 8765 | WebSocket 服务器端口 / WebSocket server port |
| `host` | string | 127.0.0.1 | 绑定地址 / Bind address |
| `authToken` | string | - | 认证 Token（可选）/ Auth token (optional) |
| `stt.provider` | string | whisper | STT 提供商 / STT provider |
| `tts.provider` | string | edge | TTS 提供商 / TTS provider |

---

## 使用 / Usage

### 🌐 Web 客户端 / Web Client

启动服务器后，在浏览器中打开：

After starting the server, open in browser:

```
http://localhost:8765
```

**功能 / Features:**
- 💬 文字消息 / Text messaging
- 🎤 语音录制 / Voice recording
- 📊 连接状态显示 / Connection status
- 🎨 美观的 UI / Beautiful interface

### JavaScript/Node.js 客户端

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:8765/ws');

ws.on('open', () => {
  console.log('Connected!');
  
  // 发送文字消息 / Send text message
  ws.send(JSON.stringify({
    type: 'text',
    content: '你好，OpenMouth!'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Received:', message);
});
```

### Python 客户端

```python
import websocket
import json

def on_message(ws, message):
    print("Received:", message)

def on_open(ws):
    print("Connected!")
    ws.send(json.dumps({
        "type": "text",
        "content": "你好，OpenMouth!"
    }))

ws = websocket.WebSocketApp("ws://127.0.0.1:8765/ws",
                            on_message=on_message,
                            on_open=on_open)
ws.run_forever()
```

---

## 消息格式 / Message Format

### 客户端 → 服务器 / Client → Server

**文字消息 / Text Message:**
```json
{
  "type": "text",
  "content": "你的消息内容"
}
```

**语音消息 / Voice Message:**
```json
{
  "type": "voice",
  "content": "base64 编码的音频数据"
}
```

**心跳 / Ping:**
```json
{
  "type": "ping"
}
```

### 服务器 → 客户端 / Server → Client

**欢迎消息 / Welcome:**
```json
{
  "type": "welcome",
  "sessionId": "session_xxx",
  "timestamp": 1234567890,
  "message": "Connected to OpenMouth..."
}
```

**确认 / Ack:**
```json
{
  "type": "ack",
  "message": "Message received",
  "timestamp": 1234567890
}
```

**错误 / Error:**
```json
{
  "type": "error",
  "message": "错误描述"
}
```

---

## 开发 / Development

```bash
# 安装依赖 / Install dependencies
npm install

# 开发模式（TypeScript 编译）/ Dev mode (TypeScript compile)
npm run dev

# 构建 / Build
npm run build

# 启动 Web 服务器 / Start web server
npm run serve
```

---

## 项目结构 / Project Structure

```
openmouth/
├── index.ts                 # OpenClaw 插件入口 / Plugin entry
├── openclaw.plugin.json     # 插件清单 / Plugin manifest
├── package.json             # NPM 配置 / NPM config
├── serve-web.js             # Web 服务器 / Web server
├── start-server.js          # 独立 WS 服务器 / Standalone WS server
├── test-client.js           # 测试客户端 / Test client
├── public/
│   └── index.html           # Web 客户端 / Web client
├── src/
│   ├── channel.ts           # OpenClaw Channel 实现
│   ├── server.ts            # WebSocket 服务器
│   ├── session.ts           # 会话管理
│   └── voice/
│       ├── stt.ts           # 语音识别
│       └── tts.ts           # 语音合成
└── README.md                # 文档 / Documentation
```

---

## 待办事项 / TODO

- [ ] 实现 Whisper STT 集成 / Implement Whisper STT integration
- [ ] 实现 Edge TTS 集成 / Implement Edge TTS integration
- [x] 添加 Web 界面客户端 / Add web client ✅
- [ ] 实现会话持久化 / Implement session persistence
- [ ] 添加更多认证选项 / Add more authentication options

---

## License

MIT

---

## 链接 / Links

- **GitHub:** https://github.com/hanhy/openmouth
- **OpenClaw:** https://github.com/openclaw/openclaw
- **Docs:** https://docs.openclaw.ai

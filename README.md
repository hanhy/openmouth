# OpenMouth 🎤

**Voice & Text conversation channel for OpenClaw**

OpenMouth 是一个 OpenClaw 插件，提供基于 WebSocket 的实时通信渠道，支持文字和语音对话。

## 功能特性

- 📝 **文字对话** - 实时文字消息收发
- 🎤 **语音对话** - 集成 STT/TTS 支持语音交互
- 🔌 **WebSocket** - 简单的 WebSocket API
- 🛡️ **认证支持** - 可选的 Token 认证
- 📊 **会话管理** - 自动追踪活跃会话

## 安装

```bash
# 在 OpenClaw 插件目录安装
cd ~/.openclaw/extensions
git clone <your-repo-url> openmouth
cd openmouth
npm install
```

## 配置

在 OpenClaw 配置中添加：

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

## 客户端示例

### JavaScript/Node.js

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:8765');

ws.on('open', () => {
  console.log('Connected!');
  
  // 发送文字消息
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

### Python

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

ws = websocket.WebSocketApp("ws://127.0.0.1:8765",
                            on_message=on_message,
                            on_open=on_open)
ws.run_forever()
```

## 消息格式

### 客户端 → 服务器

**文字消息：**
```json
{
  "type": "text",
  "content": "你的消息内容"
}
```

**语音消息：**
```json
{
  "type": "voice",
  "content": "base64 编码的音频数据"
}
```

**心跳：**
```json
{
  "type": "ping"
}
```

### 服务器 → 客户端

**欢迎消息：**
```json
{
  "type": "welcome",
  "sessionId": "session_xxx",
  "timestamp": 1234567890,
  "message": "Connected to OpenMouth..."
}
```

**确认：**
```json
{
  "type": "ack",
  "message": "Message received",
  "timestamp": 1234567890
}
```

**错误：**
```json
{
  "type": "error",
  "message": "错误描述"
}
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 待办事项

- [ ] 实现 Whisper STT 集成
- [ ] 实现 Edge TTS 集成
- [ ] 添加 Web 界面客户端
- [ ] 实现会话持久化
- [ ] 添加更多认证选项

## License

MIT

# 监控上报 Java 服务接入（必要项）

## 接口

| 项 | 值 |
|----|-----|
| 方法 / 路径 | `POST /api/error-report` |
| Content-Type | `application/json`（必须，前端 sendBeacon 用 Blob 指定） |
| 鉴权 | 无 |
| 响应 | HTTP 2xx，`{ "accepted": true, "count": N }`（SDK 不解析 body） |

## 请求 Body

JSON **数组**或**单条对象**，需归一化为数组后校验；空数组 → 400。

```json
[
  {
    "type": "manual-error",
    "message": "错误摘要",
    "appId": "survey-admin"
  }
]
```

### 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `type` | 是 | 见下方枚举 |
| `message` | 是 | 非空，≤ 2000 |
| `appId` | 是 | 非空，≤ 128 |
| `timestamp` | 否 | 毫秒（SDK 自动补齐） |
| `url` | 否 | ≤ 2048（SDK 自动补齐） |
| `stack` | 否 | 由 `error.stack` 解析，≤ 10000，入库可截断 10KB |
| `tags` | 否 | `Record<string, string>` |
| `extra` | 否 | JSON 对象 |
| `release` | 否 | ≤ 128 |
| `context` | 否 | 简单 JSON 值 |

**`type` 枚举：**

`runtime-error` · `promise-error` · `resource-error` · `request-error` · `vue-error` · `react-error` · `sdk-error` · `caught-error` · `manual-error`

**服务端补齐（前端不传）：**

- `userAgent` ← `User-Agent` 头，截断 512
- `ip` ← `RemoteAddr` 或 `X-Forwarded-For`

Body 含未声明字段时忽略，不要因此 400。

## 入库（若要落库）

1. 按 `appId` 查 `monitor_biz_systems` 且 `enabled=true` → 填 `systemId`；查不到仍返回 `accepted: true`，`systemId` 可为空
2. 表：`monitor_biz_systems`（id, appId, name, enabled）、`client_errors`（payload 字段 + systemId + userAgent + ip + createdAt）

## 部署注意

- 开发 CORS 放行前端 Origin（如 `http://localhost:5173`）
- 上报接口不要走 JWT 过滤器
- 前端 `.env`：`VITE_MONITOR_URL=/api/error-report`，代理到 Java 地址

## 自测

```bash
curl -X POST http://localhost:8080/api/error-report \
  -H "Content-Type: application/json" \
  -d '[{"type":"manual-error","message":"test","appId":"survey-admin"}]'
```

# 📋 Slack 任务管理器集成指南

本指南将帮助你将任务编辑页面完全集成到 Slack 中，让用户可以直接在 Slack 中创建、编辑和管理任务。

## 🚀 功能特性

- **斜杠命令**: 使用 `/task` 或 `/任务` 命令快速操作
- **交互式模态框**: 在 Slack 中直接编辑任务
- **实时同步**: 任务数据在 Slack 和 Web 应用间同步
- **多语言支持**: 支持中英文命令
- **团队协作**: 按频道和团队隔离任务数据

## 📋 部署步骤

### 1. 创建 Slack 应用

1. 访问 [Slack API 控制台](https://api.slack.com/apps)
2. 点击 "Create New App" → "From an app manifest"
3. 选择你的工作区
4. 复制 `slack-app-manifest.json` 的内容并粘贴
5. 将 `your-domain.com` 替换为你的实际域名
6. 点击 "Create" 创建应用

### 2. 配置环境变量

创建 `.env` 文件并添加以下配置：

```bash
# Slack 应用配置
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_VERIFICATION_TOKEN=your-verification-token-here

# 应用配置
APP_URL=https://your-domain.com
PORT=8000
```

### 3. 获取 Slack 令牌

在 Slack 应用设置页面：

1. **Bot Token**: 
   - 进入 "OAuth & Permissions"
   - 复制 "Bot User OAuth Token" (以 `xoxb-` 开头)
   - 设置为 `SLACK_BOT_TOKEN`

2. **Signing Secret**:
   - 进入 "Basic Information"
   - 在 "App Credentials" 部分找到 "Signing Secret"
   - 设置为 `SLACK_SIGNING_SECRET`

3. **Verification Token** (可选):
   - 在 "Basic Information" 中找到
   - 设置为 `SLACK_VERIFICATION_TOKEN`

### 4. 部署应用

#### 使用 Deno Deploy

1. 推送代码到 GitHub
2. 访问 [Deno Deploy](https://dash.deno.com/)
3. 创建新项目并连接 GitHub 仓库
4. 设置环境变量
5. 部署完成后获取域名

#### 本地开发

```bash
# 启动开发服务器
deno task start

# 使用 ngrok 暴露本地服务（用于测试）
ngrok http 8000
```

### 5. 更新 Slack 应用配置

1. 在 Slack 应用设置中更新以下 URL：
   - **Slash Commands**: `https://your-domain.com/api/slack-commands`
   - **Interactivity**: `https://your-domain.com/api/slack-interactive`
   - **Event Subscriptions**: `https://your-domain.com/api/slack-events`

2. 保存配置并重新安装应用到工作区

## 🎯 使用方法

### 斜杠命令

```bash
# 显示帮助
/task help

# 打开任务创建器
/task create

# 快速创建任务
/task 完成项目文档

# 查看任务列表
/task list

# 打开完整仪表板
/task dashboard
```

### 中文命令

```bash
# 中文命令支持
/任务 新建
/任务 列表
/任务 仪表板
```

## 🔧 API 接口

### 任务管理 API

- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建新任务
- `PUT /api/tasks` - 更新任务
- `DELETE /api/tasks` - 删除任务

### Slack 集成 API

- `POST /api/slack-commands` - 处理斜杠命令
- `POST /api/slack-interactive` - 处理交互式组件
- `POST /api/slack-webhook` - 发送消息到 Slack

## 📊 数据流程

1. **用户在 Slack 中输入命令** → 
2. **Slack 发送请求到 `/api/slack-commands`** → 
3. **服务器处理命令并返回响应或打开模态框** → 
4. **用户在模态框中编辑任务** → 
5. **数据保存到服务器** → 
6. **确认消息发送回 Slack**

## 🔒 安全考虑

1. **验证请求来源**: 使用 Signing Secret 验证请求
2. **权限控制**: 按团队和频道隔离数据
3. **输入验证**: 验证所有用户输入
4. **HTTPS**: 确保所有通信使用 HTTPS

## 🐛 故障排除

### 常见问题

1. **命令不响应**
   - 检查 URL 配置是否正确
   - 确认环境变量设置正确
   - 查看服务器日志

2. **模态框不显示**
   - 检查 Bot Token 权限
   - 确认 Interactivity URL 配置

3. **数据不同步**
   - 检查 API 接口是否正常
   - 确认数据存储逻辑

### 调试技巧

```bash
# 查看请求日志
console.log("收到 Slack 请求:", payload);

# 测试 API 接口
curl -X POST https://your-domain.com/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"task":{"name":"测试任务"}}'
```

## 🚀 高级功能

### 1. 数据库集成

替换内存存储为真实数据库：

```typescript
// 使用 Deno KV 或其他数据库
const kv = await Deno.openKv();

async function saveTasks(key: string, tasks: Task[]) {
  await kv.set(["tasks", key], tasks);
}

async function getTasks(key: string): Promise<Task[]> {
  const result = await kv.get(["tasks", key]);
  return result.value || [];
}
```

### 2. 用户权限管理

```typescript
// 检查用户权限
function hasPermission(userId: string, action: string): boolean {
  // 实现权限检查逻辑
  return true;
}
```

### 3. 通知系统

```typescript
// 发送任务提醒
async function sendTaskReminder(task: Task) {
  // 实现提醒逻辑
}
```

## 📈 监控和分析

1. **使用情况统计**: 记录命令使用频率
2. **错误监控**: 集成错误追踪服务
3. **性能监控**: 监控 API 响应时间

## 🎉 完成！

现在你的任务管理器已经完全集成到 Slack 中了！用户可以：

- 在 Slack 中直接创建和编辑任务
- 使用斜杠命令快速操作
- 在 Web 界面中查看完整的任务仪表板
- 享受无缝的团队协作体验

如有问题，请查看故障排除部分或联系技术支持。 
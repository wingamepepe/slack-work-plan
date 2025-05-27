# 📋 Slack 工作计划生成器 (Deno Fresh 版本)

一个基于 Deno Fresh 框架的现代化 Slack 工作计划生成器，帮助你创建漂亮的工作计划消息并一键分享到 Slack。

## ✨ 特性

- 🚀 **现代化技术栈**: 基于 Deno Fresh 框架，使用 TypeScript 和 Preact
- 📱 **响应式设计**: 完美适配桌面和移动设备
- ⚡ **实时预览**: 即时查看 Slack 消息格式
- 🎯 **任务管理**: 支持优先级、时长、备注等详细信息
- 🔄 **拖拽排序**: 支持拖拽任务卡片调整执行顺序
- ⏰ **智能时间计算**: 自动计算任务开始和结束时间
- 📤 **一键发送**: 直接发送到 Slack 频道
- 🎨 **多种格式**: 支持 Slack 格式和 Block Kit 格式

## 🛠️ 技术栈

- **框架**: Deno Fresh
- **运行时**: Deno
- **前端**: Preact + TypeScript
- **样式**: 内联 CSS

## 🚀 快速开始

### 前置要求

确保你已经安装了 Deno:

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh
```

### 安装和运行

1. **启动开发服务器**
```bash
deno task start
```

2. **访问应用**
打开浏览器访问: http://localhost:8000

## 📖 使用指南

### 1. 添加任务
- 在左侧面板输入任务名称和预估时长
- 选择任务优先级（高/中/低）
- 可选择添加备注信息

### 2. 调整任务顺序
- 拖拽任务卡片左侧的拖拽手柄（⋮⋮）
- 将任务拖拽到目标位置调整执行顺序
- 排序结果自动保存

### 3. 预览和导出
- 右侧面板实时显示 Slack 消息预览
- 选择输出格式（Slack 格式或 Block Kit）
- 点击"📋 复制"按钮复制到剪贴板

### 4. 发送到 Slack
- 输入你的 Slack Webhook URL
- 点击"📤 发送"按钮直接发送到 Slack

## 📁 项目结构

```
slack-job-table/
├── routes/                 # 路由文件
│   ├── index.tsx          # 主页面
│   └── api/               # API 路由
│       └── slack-webhook.ts
├── islands/               # 客户端交互组件
│   └── TaskManager.tsx    # 任务管理器
├── static/                # 静态资源
├── deno.json             # Deno 配置
├── fresh.config.ts       # Fresh 配置
├── main.ts               # 生产入口
├── dev.ts                # 开发入口
└── fresh.gen.ts          # 自动生成的 manifest
```

## 🚀 部署到 Deno Deploy

1. 推送代码到 GitHub
2. 访问 Deno Deploy 连接仓库
3. 选择 `main.ts` 作为入口文件
4. 自动部署完成

---

🎉 享受使用 Deno Fresh 版本的 Slack 工作计划生成器！ 
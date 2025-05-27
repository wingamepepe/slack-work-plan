#!/bin/bash

echo "🚀 启动 Slack 任务管理器集成测试"
echo "=================================="

# 检查 Deno 是否安装
if ! command -v deno &> /dev/null; then
    echo "❌ Deno 未安装，请先安装 Deno:"
    echo "curl -fsSL https://deno.land/install.sh | sh"
    exit 1
fi

echo "✅ Deno 已安装"

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，创建示例配置..."
    cat > .env << EOF
# Slack 应用配置
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_VERIFICATION_TOKEN=your-verification-token-here

# 应用配置
APP_URL=http://localhost:8000
PORT=8000
EOF
    echo "📝 已创建 .env 文件，请填入你的 Slack 应用配置"
fi

# 启动开发服务器
echo "🔄 启动开发服务器..."
echo "📱 访问 http://localhost:8000 查看应用"
echo "🧪 访问 http://localhost:8000/slack-test 进行集成测试"
echo ""
echo "💡 提示："
echo "   - 使用 Ctrl+C 停止服务器"
echo "   - 如需外网访问，请使用 ngrok: ngrok http 8000"
echo ""

deno task start 
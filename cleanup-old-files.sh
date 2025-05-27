#!/bin/bash

# 清理旧的 Node.js 文件，保留 Deno/Fresh 应用文件

echo "🧹 开始清理旧的 Node.js 文件..."

# 备份重要文件到临时目录
mkdir -p .backup
echo "📦 备份重要文件..."

# 移除旧的静态文件
echo "🗑️  移除旧的静态 HTML 文件..."
if [ -f "index.html" ]; then
    mv index.html .backup/
    echo "   ✅ index.html 已备份并移除"
fi

# 移除旧的 JavaScript 文件
echo "🗑️  移除旧的 JavaScript 文件..."
for file in script.js utils.js preview.js proxy-server.js; do
    if [ -f "$file" ]; then
        mv "$file" .backup/
        echo "   ✅ $file 已备份并移除"
    fi
done

# 移除旧的 CSS 文件
echo "🗑️  移除旧的 CSS 文件..."
if [ -f "style.css" ]; then
    mv style.css .backup/
    echo "   ✅ style.css 已备份并移除"
fi

# 移除旧的测试文件
echo "🗑️  移除旧的测试文件..."
if [ -f "test-cors.html" ]; then
    mv test-cors.html .backup/
    echo "   ✅ test-cors.html 已备份并移除"
fi

# 移除 Node.js 相关文件
echo "🗑️  移除 Node.js 配置文件..."
if [ -f "package.json" ]; then
    mv package.json .backup/
    echo "   ✅ package.json 已备份并移除"
fi

if [ -f "server.js" ]; then
    mv server.js .backup/
    echo "   ✅ server.js 已备份并移除"
fi

echo ""
echo "✨ 清理完成！"
echo "📁 旧文件已备份到 .backup/ 目录"
echo "🚀 现在可以重新启动 Deno 应用了"
echo ""
echo "运行以下命令启动应用："
echo "deno task start" 
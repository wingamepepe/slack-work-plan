const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = 8001;
const PROXY_PATH = '/slack-webhook';

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// 获取文件的MIME类型
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

// 处理静态文件请求
function serveStaticFile(req, res, filePath) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - 文件未找到</h1>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - 服务器错误</h1>');
            }
        } else {
            const mimeType = getMimeType(filePath);
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content);
        }
    });
}

// 处理Slack代理请求
function handleSlackProxy(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const webhookUrl = data.webhookUrl;
            const payload = data.payload;

            if (!webhookUrl || !payload) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false,
                    error: '缺少webhookUrl或payload参数' 
                }));
                return;
            }

            // 验证是否为Slack Webhook URL
            if (!webhookUrl.includes('hooks.slack.com')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false,
                    error: '无效的Slack Webhook URL' 
                }));
                return;
            }

            // 转发请求到Slack
            const parsedUrl = url.parse(webhookUrl);
            const postData = JSON.stringify(payload);

            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const proxyReq = https.request(options, (proxyRes) => {
                let responseBody = '';
                
                proxyRes.on('data', chunk => {
                    responseBody += chunk;
                });

                proxyRes.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: proxyRes.statusCode === 200,
                        status: proxyRes.statusCode,
                        message: responseBody || 'ok'
                    }));
                });
            });

            proxyReq.on('error', (error) => {
                console.error('代理请求错误:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: '代理请求失败: ' + error.message 
                }));
            });

            proxyReq.write(postData);
            proxyReq.end();

        } catch (error) {
            console.error('解析请求错误:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                error: '请求格式错误' 
            }));
        }
    });
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 处理Slack代理请求
    if (req.method === 'POST' && pathname === PROXY_PATH) {
        handleSlackProxy(req, res);
        return;
    }

    // 处理静态文件请求
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);

    // 安全检查：防止目录遍历攻击
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 - 禁止访问</h1>');
        return;
    }

    // 检查文件是否存在
    fs.access(normalizedPath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - 文件未找到</h1>');
        } else {
            serveStaticFile(req, res, normalizedPath);
        }
    });
});

// 启动服务器
server.listen(PORT, () => {
    console.log('🚀 Slack工作计划生成器已启动！');
    console.log('================================');
    console.log(`📱 Web应用: http://localhost:${PORT}`);
    console.log(`🔧 测试页面: http://localhost:${PORT}/test-cors.html`);
    console.log(`📡 代理服务: http://localhost:${PORT}${PROXY_PATH}`);
    console.log('================================');
    console.log('💡 提示: 按 Ctrl+C 停止服务器');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    process.exit(1);
}); 
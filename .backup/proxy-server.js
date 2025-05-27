const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;

// 创建代理服务器
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

    // 只处理POST请求到/slack-webhook
    if (req.method === 'POST' && req.url === '/slack-webhook') {
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
                    res.end(JSON.stringify({ error: '缺少webhookUrl或payload参数' }));
                    return;
                }

                // 验证是否为Slack Webhook URL
                if (!webhookUrl.includes('hooks.slack.com')) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '无效的Slack Webhook URL' }));
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
                        res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
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
                res.end(JSON.stringify({ error: '请求格式错误' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '未找到路径' }));
    }
});

server.listen(PORT, () => {
    console.log(`🚀 代理服务器运行在 http://localhost:${PORT}`);
    console.log(`📡 用于解决Slack Webhook跨域问题`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭代理服务器...');
    server.close(() => {
        console.log('✅ 代理服务器已关闭');
        process.exit(0);
    });
}); 
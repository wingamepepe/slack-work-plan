import { Head } from "$fresh/runtime.ts";

export default function SlackTest() {
  return (
    <>
      <Head>
        <title>Slack 集成测试</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 2rem;
              color: #333;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border-radius: 1rem;
              padding: 2rem;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .test-section {
              margin-bottom: 2rem;
              padding: 1.5rem;
              border: 1px solid #e2e8f0;
              border-radius: 0.5rem;
              background: #f8fafc;
            }
            
            .btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 0.5rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
              margin: 0.5rem;
              text-decoration: none;
              display: inline-block;
            }
            
            .btn-primary {
              background: #4299e1;
              color: white;
            }
            
            .btn-primary:hover {
              background: #3182ce;
            }
            
            .btn-success {
              background: #48bb78;
              color: white;
            }
            
            .btn-success:hover {
              background: #38a169;
            }
            
            .url-example {
              background: #edf2f7;
              padding: 0.5rem;
              border-radius: 0.25rem;
              font-family: monospace;
              word-break: break-all;
              margin: 0.5rem 0;
            }
          `,
          }}
        />
      </Head>

      <div class="container">
        <h1>🔗 Slack 集成测试页面</h1>
        <p>这个页面用于测试 Slack 任务管理器的集成功能。</p>

        <div class="test-section">
          <h2>📋 1. 基本功能测试</h2>
          <p>测试基本的任务管理功能：</p>
          <a href="/" class="btn btn-primary">
            🚀 打开任务管理器
          </a>
        </div>

        <div class="test-section">
          <h2>🔗 2. Slack 集成测试</h2>
          <p>测试从 Slack 跳转到任务管理器的功能：</p>

          <h3>模拟 Slack 参数</h3>
          <div class="url-example">
            /?channel=C1234567890&team=T1234567890&user=U1234567890
          </div>

          <a
            href="/?channel=C1234567890&team=T1234567890&user=U1234567890"
            class="btn btn-success"
          >
            🔗 测试 Slack 集成模式
          </a>
        </div>

        <div class="test-section">
          <h2>📱 3. Slack 应用配置</h2>
          <p>配置 Slack 应用时需要的信息：</p>

          <h3>斜杠命令 URL</h3>
          <div class="url-example">
            https://your-domain.com/api/slack-commands
          </div>

          <h3>交互式组件 URL</h3>
          <div class="url-example">
            https://your-domain.com/api/slack-interactive
          </div>

          <h3>事件订阅 URL</h3>
          <div class="url-example">
            https://your-domain.com/api/slack-events
          </div>
        </div>

        <div class="test-section">
          <h2>🎯 4. 使用场景测试</h2>
          <p>测试不同的使用场景：</p>

          <h3>场景 1: 从 Slack 命令创建任务</h3>
          <ol>
            <li>在 Slack 中输入 /task create</li>
            <li>填写任务信息并提交</li>
            <li>检查任务是否创建成功</li>
          </ol>

          <h3>场景 2: 快速创建任务</h3>
          <ol>
            <li>在 Slack 中输入 /task 完成项目文档</li>
            <li>检查任务是否快速创建</li>
          </ol>

          <h3>场景 3: 查看任务列表</h3>
          <ol>
            <li>在 Slack 中输入 /task list</li>
            <li>检查是否显示任务列表</li>
          </ol>

          <h3>场景 4: 打开仪表板</h3>
          <ol>
            <li>在 Slack 中输入 /task dashboard</li>
            <li>点击链接打开完整仪表板</li>
            <li>检查是否正确加载 Slack 集成模式</li>
          </ol>
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <a href="/" class="btn btn-primary">
            ← 返回主页
          </a>
        </div>
      </div>
    </>
  );
}

import { Head } from "$fresh/runtime.ts";
import TaskManager from "../islands/TaskManager.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>📋 Slack 工作计划生成器</title>
        <meta
          name="description"
          content="创建漂亮的工作计划消息，一键分享到Slack"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📋</text></svg>"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              color: #333;
            }
            
            .app-container {
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            
            .app-header {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid rgba(0, 0, 0, 0.1);
              padding: 1rem 0;
              position: sticky;
              top: 0;
              z-index: 100;
            }
            
            .header-content {
              max-width: 1200px;
              margin: 0 auto;
              padding: 0 2rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .header-content h1 {
              font-size: 1.8rem;
              font-weight: 700;
              color: #2d3748;
            }
            
            .header-content p {
              color: #718096;
              margin-top: 0.25rem;
            }
            
            .header-actions {
              display: flex;
              gap: 0.5rem;
            }
            
            .main-content {
              flex: 1;
              max-width: 1200px;
              margin: 0 auto;
              padding: 2rem;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2rem;
            }
            
            .section-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 1.5rem;
            }
            
            .section-header h2 {
              font-size: 1.5rem;
              font-weight: 600;
              color: #2d3748;
            }
            
            .tasks-section, .preview-section {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border-radius: 1rem;
              padding: 1.5rem;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .btn {
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 0.5rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
              font-size: 0.875rem;
            }
            
            .btn-primary {
              background: #4299e1;
              color: white;
            }
            
            .btn-primary:hover {
              background: #3182ce;
            }
            
            .btn-secondary {
              background: #e2e8f0;
              color: #4a5568;
            }
            
            .btn-secondary:hover {
              background: #cbd5e0;
            }
            
            .btn-success {
              background: #48bb78;
              color: white;
            }
            
            .btn-success:hover {
              background: #38a169;
            }
            
            .btn-danger {
              background: #f56565;
              color: white;
            }
            
            .btn-danger:hover {
              background: #e53e3e;
            }
            
            @media (max-width: 768px) {
              .main-content {
                grid-template-columns: 1fr;
                padding: 1rem;
              }
              
              .header-content {
                padding: 0 1rem;
                flex-direction: column;
                gap: 1rem;
                text-align: center;
              }
            }
          `,
          }}
        />
      </Head>

      <div class="app-container">
        <header class="app-header">
          <div class="header-content">
            <div>
              <h1>📋 Slack 工作计划生成器</h1>
              <p>创建漂亮的工作计划消息，一键分享到Slack</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary" title="切换主题">
                🌙
              </button>
              <button class="btn btn-secondary" title="设置">
                ⚙️
              </button>
            </div>
          </div>
        </header>

        <main class="main-content">
          <TaskManager />
        </main>
      </div>
    </>
  );
}

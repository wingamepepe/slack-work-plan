import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { webhookUrl, payload } = await req.json();

      if (!webhookUrl || !payload) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "缺少webhookUrl或payload参数",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // 验证是否为Slack Webhook URL
      if (!webhookUrl.includes("hooks.slack.com")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "无效的Slack Webhook URL",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // 转发请求到Slack
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const success = response.status === 200;
      const responseText = await response.text();

      return new Response(
        JSON.stringify({
          success,
          status: response.status,
          message: responseText || "ok",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    } catch (error) {
      console.error("代理请求错误:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "代理请求失败: " + (error as Error).message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },

  OPTIONS() {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  },
};

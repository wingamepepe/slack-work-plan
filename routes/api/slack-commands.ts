import { Handlers } from "$fresh/server.ts";

interface SlackCommandPayload {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const formData = await req.formData();
      const payload: SlackCommandPayload = {
        token: formData.get("token") as string,
        team_id: formData.get("team_id") as string,
        team_domain: formData.get("team_domain") as string,
        channel_id: formData.get("channel_id") as string,
        channel_name: formData.get("channel_name") as string,
        user_id: formData.get("user_id") as string,
        user_name: formData.get("user_name") as string,
        command: formData.get("command") as string,
        text: formData.get("text") as string,
        response_url: formData.get("response_url") as string,
        trigger_id: formData.get("trigger_id") as string,
      };

      console.log("收到 Slack 命令:", payload);

      // 验证请求来源（可选，建议在生产环境中启用）
      // if (payload.token !== Deno.env.get("SLACK_VERIFICATION_TOKEN")) {
      //   return new Response("Unauthorized", { status: 401 });
      // }

      return await handleSlashCommand(payload);
    } catch (error) {
      console.error("处理 Slack 命令时出错:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

async function handleSlashCommand(payload: SlackCommandPayload) {
  const command = payload.command;
  const args = payload.text.trim().split(/\s+/);
  const subCommand = args[0]?.toLowerCase() || "help";

  switch (command) {
    case "/task":
    case "/任务":
      return await handleTaskCommand(payload, subCommand, args.slice(1));
    default:
      return createResponse("未知命令");
  }
}

async function handleTaskCommand(
  payload: SlackCommandPayload,
  subCommand: string,
  args: string[]
) {
  switch (subCommand) {
    case "create":
    case "新建":
    case "add":
    case "添加":
      return await createTaskModal(payload);

    case "list":
    case "列表":
    case "ls":
      return await listTasks(payload);

    case "help":
    case "帮助":
    case "":
      return createHelpResponse();

    case "dashboard":
    case "仪表板":
      return await createDashboard(payload);

    default:
      // 如果没有子命令，尝试直接创建任务
      if (subCommand && subCommand !== "help") {
        return await quickCreateTask(payload, [subCommand, ...args].join(" "));
      }
      return createHelpResponse();
  }
}

async function createTaskModal(payload: SlackCommandPayload) {
  const modal = {
    type: "modal",
    callback_id: "task_editor_modal",
    title: {
      type: "plain_text",
      text: "📋 创建新任务",
    },
    submit: {
      type: "plain_text",
      text: "创建任务",
    },
    close: {
      type: "plain_text",
      text: "取消",
    },
    blocks: [
      {
        type: "input",
        block_id: "task_name",
        element: {
          type: "plain_text_input",
          action_id: "task_name_input",
          placeholder: {
            type: "plain_text",
            text: "例如：完成项目文档",
          },
        },
        label: {
          type: "plain_text",
          text: "任务名称",
        },
      },
      {
        type: "input",
        block_id: "task_duration",
        element: {
          type: "number_input",
          action_id: "task_duration_input",
          is_decimal_allowed: false,
          min_value: "5",
          max_value: "480",
          initial_value: "60",
        },
        label: {
          type: "plain_text",
          text: "预估时长（分钟）",
        },
      },
      {
        type: "input",
        block_id: "task_priority",
        element: {
          type: "static_select",
          action_id: "task_priority_select",
          placeholder: {
            type: "plain_text",
            text: "选择优先级",
          },
          initial_option: {
            text: {
              type: "plain_text",
              text: "🟡 中优先级",
            },
            value: "medium",
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "🔴 高优先级",
              },
              value: "high",
            },
            {
              text: {
                type: "plain_text",
                text: "🟡 中优先级",
              },
              value: "medium",
            },
            {
              text: {
                type: "plain_text",
                text: "🟢 低优先级",
              },
              value: "low",
            },
          ],
        },
        label: {
          type: "plain_text",
          text: "优先级",
        },
      },
      {
        type: "input",
        block_id: "task_notes",
        element: {
          type: "plain_text_input",
          action_id: "task_notes_input",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "添加任务描述或备注（可选）",
          },
        },
        label: {
          type: "plain_text",
          text: "备注",
        },
        optional: true,
      },
    ],
  };

  // 调用 Slack API 打开模态框
  const response = await fetch("https://slack.com/api/views.open", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SLACK_BOT_TOKEN")}`,
    },
    body: JSON.stringify({
      trigger_id: payload.trigger_id,
      view: modal,
    }),
  });

  if (!response.ok) {
    console.error("打开任务创建模态框失败:", await response.text());
    return createResponse("❌ 打开任务编辑器失败，请稍后重试");
  }

  return new Response("", { status: 200 });
}

async function quickCreateTask(payload: SlackCommandPayload, taskName: string) {
  if (!taskName.trim()) {
    return createResponse(
      "❌ 请提供任务名称\n使用方法: `/task 任务名称` 或 `/task create`"
    );
  }

  const task = {
    id: crypto.randomUUID(),
    name: taskName.trim(),
    duration: 60, // 默认1小时
    priority: "medium" as const,
    progress: 0,
    createdBy: payload.user_id,
    createdAt: new Date().toISOString(),
    channelId: payload.channel_id,
  };

  // 这里可以保存到数据库
  console.log("快速创建任务:", task);

  return createResponse(
    `✅ 任务创建成功！\n\n*${task.name}*\n⏱️ 预估时长: ${task.duration}分钟\n📊 优先级: 🟡 中\n📈 进度: 0%\n\n💡 使用 \`/task list\` 查看所有任务`
  );
}

async function listTasks(payload: SlackCommandPayload) {
  // 这里应该从数据库获取任务列表
  // 暂时返回示例数据
  const tasks = [
    {
      id: "1",
      name: "完成项目文档",
      duration: 120,
      priority: "high",
      progress: 50,
    },
    {
      id: "2",
      name: "代码审查",
      duration: 60,
      priority: "medium",
      progress: 0,
    },
    {
      id: "3",
      name: "测试用例编写",
      duration: 90,
      priority: "low",
      progress: 100,
    },
  ];

  if (tasks.length === 0) {
    return createResponse("📝 暂无任务\n\n使用 `/task create` 创建新任务");
  }

  const taskList = tasks
    .map((task, index) => {
      const priorityEmoji =
        task.priority === "high"
          ? "🔴"
          : task.priority === "medium"
          ? "🟡"
          : "🟢";
      const progressEmoji =
        task.progress === 100 ? "✅" : task.progress > 0 ? "🔵" : "⚪";
      return `${index + 1}. ${progressEmoji} *${
        task.name
      }*\n   ${priorityEmoji} ${task.priority} | ⏱️ ${task.duration}分钟 | 📈 ${
        task.progress
      }%`;
    })
    .join("\n\n");

  return createResponse(
    `📋 *任务列表*\n\n${taskList}\n\n💡 使用 \`/task create\` 创建新任务`
  );
}

async function createDashboard(payload: SlackCommandPayload) {
  const dashboardUrl = `${
    Deno.env.get("APP_URL") || "http://localhost:8000"
  }?channel=${payload.channel_id}&user=${payload.user_id}`;

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "📊 *任务管理仪表板*\n\n点击下方按钮打开完整的任务管理界面，你可以在那里：",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "• 📝 创建和编辑任务\n• 🔄 拖拽调整任务顺序\n• ⏰ 设置任务时间\n• 📊 查看进度统计\n• 📤 一键发送到 Slack",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "🚀 打开仪表板",
          },
          url: dashboardUrl,
          action_id: "open_dashboard",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "➕ 快速创建任务",
          },
          action_id: "open_task_editor",
        },
      ],
    },
  ];

  return new Response(
    JSON.stringify({
      response_type: "ephemeral",
      blocks: blocks,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

function createHelpResponse() {
  const helpText = `📋 *任务管理命令帮助*

*基本命令:*
• \`/task create\` - 打开任务创建器
• \`/task 任务名称\` - 快速创建任务
• \`/task list\` - 查看任务列表
• \`/task dashboard\` - 打开完整仪表板

*示例:*
• \`/task create\` - 打开详细的任务创建表单
• \`/task 完成项目文档\` - 快速创建名为"完成项目文档"的任务
• \`/task list\` - 查看当前所有任务

💡 *提示:* 使用 \`/task dashboard\` 获得最佳体验！`;

  return createResponse(helpText);
}

function createResponse(
  text: string,
  responseType: "ephemeral" | "in_channel" = "ephemeral"
) {
  return new Response(
    JSON.stringify({
      response_type: responseType,
      text: text,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

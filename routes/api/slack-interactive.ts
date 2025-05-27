import { Handlers } from "$fresh/server.ts";

interface SlackInteractivePayload {
  type: string;
  user: {
    id: string;
    name: string;
  };
  channel: {
    id: string;
    name: string;
  };
  trigger_id?: string;
  actions?: Array<{
    action_id: string;
    value?: string;
    selected_option?: {
      value: string;
    };
  }>;
  view?: {
    state: {
      values: Record<string, Record<string, any>>;
    };
  };
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const formData = await req.formData();
      const payload = JSON.parse(
        formData.get("payload") as string
      ) as SlackInteractivePayload;

      console.log("收到 Slack 交互:", payload);

      // 处理不同类型的交互
      switch (payload.type) {
        case "block_actions":
          return await handleBlockActions(payload);
        case "view_submission":
          return await handleViewSubmission(payload);
        case "view_closed":
          return await handleViewClosed(payload);
        default:
          return new Response("OK", { status: 200 });
      }
    } catch (error) {
      console.error("处理 Slack 交互时出错:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

async function handleBlockActions(payload: SlackInteractivePayload) {
  const action = payload.actions?.[0];
  if (!action) return new Response("OK", { status: 200 });

  switch (action.action_id) {
    case "open_task_editor":
      return await openTaskEditor(payload);
    case "edit_task":
      return await editTask(payload, action.value || "");
    case "delete_task":
      return await deleteTask(payload, action.value || "");
    case "update_task_progress":
      return await updateTaskProgress(
        payload,
        action.selected_option?.value || ""
      );
    default:
      return new Response("OK", { status: 200 });
  }
}

async function openTaskEditor(payload: SlackInteractivePayload) {
  if (!payload.trigger_id) {
    return new Response("Missing trigger_id", { status: 400 });
  }

  const modal = {
    type: "modal",
    callback_id: "task_editor_modal",
    title: {
      type: "plain_text",
      text: "📋 任务编辑器",
    },
    submit: {
      type: "plain_text",
      text: "保存",
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
            text: "输入任务名称",
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
          min_value: "1",
          max_value: "480",
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
        block_id: "task_progress",
        element: {
          type: "static_select",
          action_id: "task_progress_select",
          placeholder: {
            type: "plain_text",
            text: "选择进度",
          },
          options: [
            {
              text: { type: "plain_text", text: "⚪ 未开始 (0%)" },
              value: "0",
            },
            {
              text: { type: "plain_text", text: "🔵 进行中 (25%)" },
              value: "25",
            },
            {
              text: { type: "plain_text", text: "🔵 进行中 (50%)" },
              value: "50",
            },
            {
              text: { type: "plain_text", text: "🔵 进行中 (75%)" },
              value: "75",
            },
            {
              text: { type: "plain_text", text: "✅ 已完成 (100%)" },
              value: "100",
            },
          ],
        },
        label: {
          type: "plain_text",
          text: "完成进度",
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
            text: "添加任务备注（可选）",
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
    console.error("打开模态框失败:", await response.text());
  }

  return new Response("", { status: 200 });
}

async function handleViewSubmission(payload: SlackInteractivePayload) {
  if (!payload.view) return new Response("OK", { status: 200 });

  const values = payload.view.state.values;

  // 提取表单数据
  const taskName = values.task_name?.task_name_input?.value || "";
  const taskDuration = parseInt(
    values.task_duration?.task_duration_input?.value || "60"
  );
  const taskPriority =
    values.task_priority?.task_priority_select?.selected_option?.value ||
    "medium";
  const taskProgress = parseInt(
    values.task_progress?.task_progress_select?.selected_option?.value || "0"
  );
  const taskNotes = values.task_notes?.task_notes_input?.value || "";

  // 创建新任务
  const newTask = {
    id: crypto.randomUUID(),
    name: taskName,
    duration: taskDuration,
    priority: taskPriority as "high" | "medium" | "low",
    progress: taskProgress,
    notes: taskNotes,
    createdBy: payload.user.id,
    createdAt: new Date().toISOString(),
  };

  // 这里可以保存到数据库或发送到其他服务
  console.log("创建新任务:", newTask);

  // 发送确认消息到频道
  await sendTaskCreatedMessage(payload.user.id, payload.channel.id, newTask);

  return new Response("", { status: 200 });
}

async function handleViewClosed(payload: SlackInteractivePayload) {
  // 处理模态框关闭事件
  return new Response("OK", { status: 200 });
}

async function editTask(payload: SlackInteractivePayload, taskId: string) {
  // 实现编辑任务逻辑
  return new Response("OK", { status: 200 });
}

async function deleteTask(payload: SlackInteractivePayload, taskId: string) {
  // 实现删除任务逻辑
  return new Response("OK", { status: 200 });
}

async function updateTaskProgress(
  payload: SlackInteractivePayload,
  progress: string
) {
  // 实现更新任务进度逻辑
  return new Response("OK", { status: 200 });
}

async function sendTaskCreatedMessage(
  userId: string,
  channelId: string,
  task: any
) {
  const message = {
    channel: channelId,
    text: `✅ 任务创建成功！`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `✅ *任务创建成功！*\n\n*${task.name}*\n⏱️ 预估时长: ${
            task.duration
          }分钟\n📊 优先级: ${getPriorityEmoji(task.priority)}\n📈 进度: ${
            task.progress
          }%${task.notes ? `\n📝 备注: ${task.notes}` : ""}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "编辑任务",
            },
            action_id: "edit_task",
            value: task.id,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "删除任务",
            },
            action_id: "delete_task",
            value: task.id,
            style: "danger",
          },
        ],
      },
    ],
  };

  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SLACK_BOT_TOKEN")}`,
    },
    body: JSON.stringify(message),
  });
}

function getPriorityEmoji(priority: string): string {
  switch (priority) {
    case "high":
      return "🔴 高";
    case "medium":
      return "🟡 中";
    case "low":
      return "🟢 低";
    default:
      return "🟡 中";
  }
}

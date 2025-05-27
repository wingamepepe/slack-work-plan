import { useState, useEffect } from "preact/hooks";

interface Member {
  id: string;
  name: string;
  slackId?: string; // Slack用户ID，用于@功能
}

interface Task {
  id: string;
  name: string;
  duration: number;
  priority: "high" | "medium" | "low";
  progress: number; // 进度百分比 0-100
  notes?: string;
  startTime?: string;
  endTime?: string;
  startDateTime?: string; // 完整的开始日期时间
  endDateTime?: string; // 完整的结束日期时间
  mentionedMembers?: string[]; // 需要提醒的成员ID列表
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [taskDuration, setTaskDuration] = useState(1);
  const [taskPriority, setTaskPriority] = useState<"high" | "medium" | "low">(
    "medium"
  );
  const [taskNotes, setTaskNotes] = useState("");
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskMentionedMembers, setTaskMentionedMembers] = useState<string[]>(
    []
  );
  const [startTime, setStartTime] = useState("09:00");
  const [outputFormat, setOutputFormat] = useState("slack");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [webhooks, setWebhooks] = useState<
    { id: string; name: string; url: string }[]
  >([]);
  const [selectedWebhookId, setSelectedWebhookId] = useState("");
  const [newWebhookName, setNewWebhookName] = useState("");

  // 成员管理相关状态
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberSlackId, setNewMemberSlackId] = useState("");
  const [showMemberForm, setShowMemberForm] = useState(false);

  // Slack 集成相关状态
  const [slackChannelId, setSlackChannelId] = useState("");
  const [slackTeamId, setSlackTeamId] = useState("");
  const [isSlackIntegrated, setIsSlackIntegrated] = useState(false);

  // 检测 Slack 集成参数并加载任务
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const channelId = urlParams.get("channel");
    const teamId = urlParams.get("team");
    const userId = urlParams.get("user");

    if (channelId) {
      setSlackChannelId(channelId);
      setIsSlackIntegrated(true);

      // 从服务器加载任务
      loadTasksFromServer(channelId, teamId, userId);
    }
    if (teamId) {
      setSlackTeamId(teamId);
    }
    if (userId && !userName) {
      // 如果从 Slack 传来用户ID，可以设置默认用户名
      setUserName(`User_${userId.slice(-4)}`);
    }
  }, []);

  // 从服务器加载任务
  const loadTasksFromServer = async (
    channelId: string,
    teamId?: string | null,
    userId?: string | null
  ) => {
    try {
      const params = new URLSearchParams();
      if (channelId) params.append("channel", channelId);
      if (teamId) params.append("team", teamId);
      if (userId) params.append("user", userId);

      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.tasks) {
          setTasks(data.tasks);
        }
      }
    } catch (error) {
      console.error("加载任务失败:", error);
    }
  };

  // 从 localStorage 加载数据
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("slack-job-table-tasks");
      const savedWebhookUrl = localStorage.getItem("slack-job-table-webhook");
      const savedStartTime = localStorage.getItem("slack-job-table-start-time");
      const savedOutputFormat = localStorage.getItem(
        "slack-job-table-output-format"
      );
      const savedTaskDuration = localStorage.getItem(
        "slack-job-table-task-duration"
      );
      const savedTaskPriority = localStorage.getItem(
        "slack-job-table-task-priority"
      );
      const savedTaskProgress = localStorage.getItem(
        "slack-job-table-task-progress"
      );
      const savedUserName = localStorage.getItem("slack-job-table-user-name");
      const savedWebhooks = localStorage.getItem("slack-job-table-webhooks");
      const savedSelectedWebhookId = localStorage.getItem(
        "slack-job-table-selected-webhook"
      );
      const savedMembers = localStorage.getItem("slack-job-table-members");

      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      if (savedStartTime) {
        setStartTime(savedStartTime);
      }
      if (savedOutputFormat) {
        setOutputFormat(savedOutputFormat);
      }
      if (savedTaskDuration) {
        setTaskDuration(Number(savedTaskDuration));
      }
      if (savedTaskPriority) {
        setTaskPriority(savedTaskPriority as "high" | "medium" | "low");
      }
      if (savedTaskProgress) {
        setTaskProgress(Number(savedTaskProgress));
      }
      if (savedUserName) {
        setUserName(savedUserName);
      }
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }

      // 优先加载新的 webhook 系统数据
      if (savedWebhooks) {
        const parsedWebhooks = JSON.parse(savedWebhooks);
        setWebhooks(parsedWebhooks);

        // 如果有选中的 webhook，设置对应的 URL
        if (savedSelectedWebhookId) {
          setSelectedWebhookId(savedSelectedWebhookId);
          const selectedWebhook = parsedWebhooks.find(
            (w: any) => w.id === savedSelectedWebhookId
          );
          if (selectedWebhook) {
            setWebhookUrl(selectedWebhook.url);
          }
        }
      } else if (savedWebhookUrl) {
        // 如果没有新的 webhook 系统数据，则使用旧的单个 webhook
        setWebhookUrl(savedWebhookUrl);
      }
    } catch (error) {
      console.error("加载保存的数据时出错:", error);
    }
  }, []);

  // 保存任务到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem("slack-job-table-tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("保存任务数据时出错:", error);
    }
  }, [tasks]);

  // 保存其他设置到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem("slack-job-table-webhook", webhookUrl);
    } catch (error) {
      console.error("保存 webhook URL 时出错:", error);
    }
  }, [webhookUrl]);

  useEffect(() => {
    try {
      localStorage.setItem("slack-job-table-start-time", startTime);
    } catch (error) {
      console.error("保存开始时间时出错:", error);
    }
  }, [startTime]);

  useEffect(() => {
    try {
      localStorage.setItem("slack-job-table-output-format", outputFormat);
    } catch (error) {
      console.error("保存输出格式时出错:", error);
    }
  }, [outputFormat]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "slack-job-table-task-duration",
        taskDuration.toString()
      );
    } catch (error) {
      console.error("保存任务时长时出错:", error);
    }
  }, [taskDuration]);

  useEffect(() => {
    try {
      localStorage.setItem("slack-job-table-task-priority", taskPriority);
    } catch (error) {
      console.error("保存任务优先级时出错:", error);
    }
  }, [taskPriority]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "slack-job-table-task-progress",
        taskProgress.toString()
      );
    } catch (error) {
      console.error("保存任务进度时出错:", error);
    }
  }, [taskProgress]);

  useEffect(() => {
    try {
      localStorage.setItem("slack-job-table-user-name", userName);
    } catch (error) {
      console.error("保存用户名时出错:", error);
    }
  }, [userName]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "slack-job-table-webhooks",
        JSON.stringify(webhooks)
      );
    } catch (error) {
      console.error("保存 webhooks 时出错:", error);
    }
  }, [webhooks]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "slack-job-table-selected-webhook",
        selectedWebhookId
      );
    } catch (error) {
      console.error("保存选中的 webhook 时出错:", error);
    }
  }, [selectedWebhookId]);

  useEffect(() => {
    try {
      localStorage.setItem("slack-job-table-members", JSON.stringify(members));
    } catch (error) {
      console.error("保存成员数据时出错:", error);
    }
  }, [members]);

  const priorityEmojis = {
    high: "🔴",
    medium: "🟡",
    low: "🟢",
  };

  // 获取进度显示
  const getProgressDisplay = (progress: number) => {
    if (progress === 0) return "⚪ 未开始";
    if (progress === 100) return "✅ 已完成";
    if (progress < 25) return "🔴 进行中";
    if (progress < 75) return "🟡 进行中";
    return "🟢 接近完成";
  };

  // 获取进度条显示
  const getProgressBar = (progress: number) => {
    const filled = Math.floor(progress / 10);
    const empty = 10 - filled;
    return "█".repeat(filled) + "░".repeat(empty) + ` ${progress}%`;
  };

  // 将 Slack/Markdown 格式转换为 HTML 用于预览
  const convertMarkdownToHtml = (text: string) => {
    let html = text
      .replace(
        /^# (.+)$/gm,
        '<h1 style="font-size: 1.5rem; font-weight: bold; margin: 1rem 0; color: #2d3748;">$1</h1>'
      ) // # 标题
      .replace(
        /\*\*([^*]+)\*\*/g,
        '<strong style="color: #2d3748;">$1</strong>'
      ) // **粗体**
      .replace(/\*([^*]+)\*/g, '<strong style="color: #2d3748;">$1</strong>') // *粗体*
      .replace(
        /`([^`]+)`/g,
        '<code style="background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: Monaco, Consolas, monospace;">$1</code>'
      ) // `代码`
      .replace(
        /^---$/gm,
        '<hr style="margin: 1rem 0; border: none; border-top: 1px solid #e2e8f0;">'
      ) // 分隔线
      .replace(/\n/g, "<br>"); // 换行

    // 包装在段落中
    return `<div style="line-height: 1.6; color: #4a5568;">${html}</div>`;
  };

  // 渲染 Block Kit 预览
  const renderBlockKitPreview = () => {
    if (tasks.length === 0) return "添加任务后这里会显示预览...";

    try {
      const blockData = JSON.parse(generateSlackMessage());
      const tasksWithTimes = calculateTimes();
      const totalHours = tasks.reduce(
        (sum, task) => (task.progress < 100 ? sum + task.duration : sum),
        0
      );

      return (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "0.5rem",
            padding: "1rem",
          }}
        >
          {/* Header Block */}
          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "#2d3748",
            }}
          >
            📋 {userName ? `${userName}的` : ""}工作计划
          </div>

          {/* Info Section */}
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              background: "#f7fafc",
              borderRadius: "0.5rem",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>📅 计划日期:</strong>{" "}
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>🕐 开始时间:</strong>{" "}
              {(() => {
                const planStartDateTime = new Date();
                const [hours, minutes] = startTime.split(":").map(Number);
                planStartDateTime.setHours(hours, minutes, 0, 0);
                return planStartDateTime.toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              })()}
            </div>
            <div>
              <strong>⏰ 待完成时长:</strong> {totalHours}小时
            </div>
          </div>

          {/* Divider */}
          <hr
            style={{
              margin: "1rem 0",
              border: "none",
              borderTop: "1px solid #e2e8f0",
            }}
          />

          {/* Tasks */}
          {tasksWithTimes.map((task, index) => (
            <div
              key={task.id}
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                background: "#f8f9fa",
                borderRadius: "0.5rem",
                borderLeft: "4px solid #4299e1",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                {index + 1}. {priorityEmojis[task.priority]} {task.name}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#718096" }}>
                ⏱️ {task.startDateTime} - {task.endDateTime} ({task.duration}
                小时)
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#4a5568",
                  marginTop: "0.25rem",
                }}
              >
                📊 {getProgressDisplay(task.progress)} -{" "}
                {getProgressBar(task.progress)}
              </div>
              {task.mentionedMembers && task.mentionedMembers.length > 0 && (
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#4a5568",
                    marginTop: "0.25rem",
                  }}
                >
                  👥 提醒:{" "}
                  {task.mentionedMembers
                    .map((id) => getMemberName(id))
                    .join(", ")}
                </div>
              )}
              {task.notes && (
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#4a5568",
                    marginTop: "0.25rem",
                  }}
                >
                  📝 {task.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    } catch (error) {
      return "Block Kit 数据解析错误";
    }
  };

  // 成员管理函数
  const addMember = () => {
    if (!newMemberName.trim()) {
      alert("请输入成员名称");
      return;
    }

    const newMember: Member = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      slackId: newMemberSlackId.trim() || undefined,
    };

    setMembers([...members, newMember]);
    setNewMemberName("");
    setNewMemberSlackId("");
    setShowMemberForm(false);
  };

  const removeMember = (memberId: string) => {
    if (confirm("确定要删除这个成员吗？")) {
      setMembers(members.filter((m) => m.id !== memberId));
      // 同时从所有任务中移除这个成员
      setTasks(
        tasks.map((task) => ({
          ...task,
          mentionedMembers: task.mentionedMembers?.filter(
            (id: string) => id !== memberId
          ),
        }))
      );
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : "未知成员";
  };

  const getMemberSlackMention = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member?.slackId) {
      return `<@${member.slackId}>`;
    }
    return member ? `@${member.name}` : "@未知成员";
  };

  const addTask = async () => {
    if (!taskName.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      name: taskName.trim(),
      duration: taskDuration,
      priority: taskPriority,
      progress: taskProgress,
      notes: taskNotes.trim() || undefined,
      mentionedMembers:
        taskMentionedMembers.length > 0 ? [...taskMentionedMembers] : undefined,
    };

    // 如果是 Slack 集成模式，同步到服务器
    if (isSlackIntegrated) {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task: newTask,
            channelId: slackChannelId,
            teamId: slackTeamId,
          }),
        });

        if (!response.ok) {
          console.error("同步任务到服务器失败");
        }
      } catch (error) {
        console.error("同步任务失败:", error);
      }
    }

    setTasks([...tasks, newTask]);
    setTaskName("");
    setTaskNotes("");
    setTaskMentionedMembers([]);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const updateTaskProgress = (id: string, progress: number) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, progress } : task))
    );
  };

  // 拖拽排序相关函数
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", taskId);
    }
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedTaskId) return;

    const draggedIndex = tasks.findIndex((task) => task.id === draggedTaskId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    const newTasks = [...tasks];
    const draggedTask = newTasks[draggedIndex];

    // 移除被拖拽的任务
    newTasks.splice(draggedIndex, 1);
    // 在新位置插入任务
    newTasks.splice(dropIndex, 0, draggedTask);

    setTasks(newTasks);
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverIndex(null);
  };

  // Webhook 管理功能
  const addWebhook = () => {
    if (!newWebhookName.trim() || !webhookUrl.trim()) {
      alert("请输入 Webhook 名称和 URL");
      return;
    }

    const newWebhook = {
      id: Date.now().toString(),
      name: newWebhookName.trim(),
      url: webhookUrl.trim(),
    };

    setWebhooks([...webhooks, newWebhook]);
    setSelectedWebhookId(newWebhook.id);
    setNewWebhookName("");
    alert("✅ Webhook 已添加！");
  };

  const selectWebhook = (webhookId: string) => {
    const webhook = webhooks.find((w) => w.id === webhookId);
    if (webhook) {
      setSelectedWebhookId(webhookId);
      setWebhookUrl(webhook.url);
    }
  };

  const removeWebhook = (webhookId: string) => {
    if (confirm("确定要删除这个 Webhook 吗？")) {
      setWebhooks(webhooks.filter((w) => w.id !== webhookId));
      if (selectedWebhookId === webhookId) {
        setSelectedWebhookId("");
        setWebhookUrl("");
      }
    }
  };

  const updateWebhookUrl = (url: string) => {
    setWebhookUrl(url);
    // 如果用户手动编辑 URL，清除选中状态
    // 因为当前 URL 可能不再匹配任何已保存的 webhook
    const matchingWebhook = webhooks.find((w) => w.url === url);
    if (matchingWebhook) {
      setSelectedWebhookId(matchingWebhook.id);
    } else {
      setSelectedWebhookId("");
    }
  };

  const clearAllTasks = () => {
    setTasks([]);
    // 清除 localStorage 中的任务数据
    try {
      localStorage.removeItem("slack-job-table-tasks");
    } catch (error) {
      console.error("清除任务数据时出错:", error);
    }
  };

  // 清除所有保存的数据
  const clearAllData = () => {
    if (
      confirm(
        "确定要清除所有保存的数据吗？这将删除任务、设置、成员和 Webhook URL。"
      )
    ) {
      setTasks([]);
      setTaskName("");
      setTaskDuration(1);
      setTaskPriority("medium");
      setTaskProgress(0);
      setTaskNotes("");
      setTaskMentionedMembers([]);
      setStartTime("09:00");
      setOutputFormat("slack");
      setWebhookUrl("");
      setUserName("");
      setWebhooks([]);
      setSelectedWebhookId("");
      setNewWebhookName("");
      setMembers([]);
      setNewMemberName("");
      setNewMemberSlackId("");
      setShowMemberForm(false);

      // 清除 localStorage
      try {
        localStorage.removeItem("slack-job-table-tasks");
        localStorage.removeItem("slack-job-table-webhook");
        localStorage.removeItem("slack-job-table-start-time");
        localStorage.removeItem("slack-job-table-output-format");
        localStorage.removeItem("slack-job-table-task-duration");
        localStorage.removeItem("slack-job-table-task-priority");
        localStorage.removeItem("slack-job-table-task-progress");
        localStorage.removeItem("slack-job-table-user-name");
        localStorage.removeItem("slack-job-table-webhooks");
        localStorage.removeItem("slack-job-table-selected-webhook");
        localStorage.removeItem("slack-job-table-members");
        alert("✅ 所有数据已清除！");
      } catch (error) {
        console.error("清除数据时出错:", error);
        alert("❌ 清除数据时出错");
      }
    }
  };

  const calculateTimes = () => {
    const [hours, minutes] = startTime.split(":").map(Number);
    let currentTime = new Date();
    currentTime.setHours(hours, minutes, 0, 0);

    return tasks.map((task) => {
      // 已完成的任务显示为已完成状态，不占用时间段
      if (task.progress === 100) {
        return {
          ...task,
          startTime: "已完成",
          endTime: "已完成",
          startDateTime: "已完成",
          endDateTime: "已完成",
        };
      }

      const start = new Date(currentTime);
      currentTime.setHours(currentTime.getHours() + Math.floor(task.duration));
      currentTime.setMinutes(
        currentTime.getMinutes() + (task.duration % 1) * 60
      );
      const end = new Date(currentTime);

      return {
        ...task,
        startTime: start.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: end.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        startDateTime: start.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        endDateTime: end.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
  };

  const generateSlackMessage = () => {
    const tasksWithTimes = calculateTimes();
    const totalHours = tasks.reduce(
      (sum, task) => (task.progress < 100 ? sum + task.duration : sum),
      0
    );

    if (outputFormat === "slack") {
      const currentDate = new Date();
      const planStartDateTime = new Date();
      const [hours, minutes] = startTime.split(":").map(Number);
      planStartDateTime.setHours(hours, minutes, 0, 0);

      let message = `📋 *${userName ? `${userName}的` : ""}工作计划*\n\n`;
      message += `📅 *计划日期:* ${currentDate.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })}\n`;
      message += `🕐 *开始时间:* ${planStartDateTime.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })}\n`;
      message += `⏰ *待完成时长:* ${totalHours}小时\n\n`;

      tasksWithTimes.forEach((task, index) => {
        message += `${index + 1}. ${priorityEmojis[task.priority]} *${
          task.name
        }*\n`;
        message += `   ⏱️ ${task.startDateTime} - ${task.endDateTime} (${task.duration}小时)\n`;
        message += `   📊 ${getProgressDisplay(
          task.progress
        )} - \`${getProgressBar(task.progress)}\`\n`;
        if (task.mentionedMembers && task.mentionedMembers.length > 0) {
          const mentions = task.mentionedMembers
            .map((id: string) => getMemberSlackMention(id))
            .join(" ");
          message += `   👥 ${mentions}\n`;
        }
        if (task.notes) {
          message += `   📝 ${task.notes}\n`;
        }
        message += "\n";
      });

      return message;
    }

    if (outputFormat === "markdown") {
      const currentDate = new Date();
      const planStartDateTime = new Date();
      const [hours, minutes] = startTime.split(":").map(Number);
      planStartDateTime.setHours(hours, minutes, 0, 0);

      let message = `# 📋 ${userName ? `${userName}的` : ""}工作计划\n\n`;
      message += `**📅 计划日期:** ${currentDate.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })}  \n`;
      message += `**🕐 开始时间:** ${planStartDateTime.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })}  \n`;
      message += `**⏰ 待完成时长:** ${totalHours}小时  \n\n`;

      tasksWithTimes.forEach((task, index) => {
        message += `${index + 1}. ${priorityEmojis[task.priority]} **${
          task.name
        }**\n`;
        message += `   ⏱️ ${task.startDateTime} - ${task.endDateTime} (${task.duration}小时)\n`;
        message += `   📊 ${getProgressDisplay(
          task.progress
        )} - \`${getProgressBar(task.progress)}\`\n`;
        if (task.mentionedMembers && task.mentionedMembers.length > 0) {
          const mentions = task.mentionedMembers
            .map((id: string) => getMemberSlackMention(id))
            .join(" ");
          message += `   👥 ${mentions}\n`;
        }
        if (task.notes) {
          message += `   📝 ${task.notes}\n`;
        }
        message += "\n";
      });

      return message;
    }

    const currentDate = new Date();
    const planStartDateTime = new Date();
    const [hours, minutes] = startTime.split(":").map(Number);
    planStartDateTime.setHours(hours, minutes, 0, 0);

    return JSON.stringify(
      {
        text: `${userName ? `${userName}的` : ""}工作计划`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `📋 ${userName ? `${userName}的` : ""}工作计划`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `📅 *计划日期:* ${currentDate.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}\n🕐 *开始时间:* ${planStartDateTime.toLocaleString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}\n⏰ *待完成时长:* ${totalHours}小时`,
            },
          },
          {
            type: "divider",
          },
          ...tasksWithTimes.map((task, index) => ({
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${index + 1}. ${priorityEmojis[task.priority]} *${
                task.name
              }*\n⏱️ ${task.startDateTime} - ${task.endDateTime} (${
                task.duration
              }小时)\n📊 ${getProgressDisplay(
                task.progress
              )} - \`${getProgressBar(task.progress)}\`${
                task.mentionedMembers && task.mentionedMembers.length > 0
                  ? `\n👥 ${task.mentionedMembers
                      .map((id: string) => getMemberSlackMention(id))
                      .join(" ")}`
                  : ""
              }${task.notes ? `\n📝 ${task.notes}` : ""}`,
            },
          })),
        ],
      },
      null,
      2
    );
  };

  const sendToSlack = async () => {
    if (!webhookUrl) {
      alert("请输入 Slack Webhook URL");
      return;
    }

    try {
      const payload =
        outputFormat === "slack"
          ? { text: generateSlackMessage() }
          : JSON.parse(generateSlackMessage());

      const response = await fetch("/api/slack-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl,
          payload,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ 消息发送成功！");
      } else {
        alert("❌ 发送失败: " + result.error);
      }
    } catch (error) {
      alert("❌ 发送失败: " + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSlackMessage()).then(() => {
      alert("📋 已复制到剪贴板！");
    });
  };

  const totalHours = tasks.reduce((sum, task) => sum + task.duration, 0);
  const pendingHours = tasks.reduce(
    (sum, task) => (task.progress < 100 ? sum + task.duration : sum),
    0
  );
  const completedTasks = tasks.filter((task) => task.progress === 100).length;

  return (
    <>
      {/* 左侧：任务管理 */}
      <section class="tasks-section">
        <div class="section-header">
          <h2>📝 今日任务</h2>
          <div class="task-stats">
            <span>{tasks.length} 个任务</span>
            <span>待完成: {pendingHours}小时</span>
            {completedTasks > 0 && <span>已完成: {completedTasks}个</span>}
            {tasks.length > 1 && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#4299e1",
                  background: "#f0f9ff",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                }}
                title="拖拽任务卡片可以调整顺序"
              >
                🔄 可排序
              </span>
            )}
            <span
              style={{
                fontSize: "0.75rem",
                color: "#10b981",
                background: "#ecfdf5",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
              }}
              title="数据已自动保存到浏览器本地存储"
            >
              💾 已保存
            </span>
            {isSlackIntegrated && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#8b5cf6",
                  background: "#f3e8ff",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                }}
                title={`已连接到 Slack 频道: ${slackChannelId}`}
              >
                🔗 Slack 集成
              </span>
            )}
          </div>
        </div>

        {/* 工作计划设置 */}
        <div class="plan-settings" style={{ marginBottom: "1.5rem" }}>
          <div
            class="form-row"
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <label style={{ minWidth: "80px" }}>👤 用户名:</label>
            <input
              type="text"
              placeholder="输入你的名字..."
              value={userName}
              onChange={(e) =>
                setUserName((e.target as HTMLInputElement).value)
              }
              style={{
                flex: 1,
                padding: "0.5rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
              }}
            />
          </div>
          <div
            class="form-row"
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <label style={{ minWidth: "80px" }}>🕐 开始时间:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) =>
                setStartTime((e.target as HTMLInputElement).value)
              }
              style={{
                padding: "0.5rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
              }}
            />
            <button
              onClick={() => setStartTime("09:00")}
              class="btn btn-secondary"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
            >
              重置
            </button>
          </div>
        </div>

        {/* 成员管理 */}
        <div class="member-management" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1rem", color: "#2d3748" }}>
              👥 团队成员
            </h3>
            <button
              onClick={() => setShowMemberForm(!showMemberForm)}
              class="btn btn-secondary"
              style={{ fontSize: "0.875rem", padding: "0.5rem 0.75rem" }}
            >
              {showMemberForm ? "取消" : "➕ 添加成员"}
            </button>
          </div>

          {/* 添加成员表单 */}
          {showMemberForm && (
            <div
              style={{
                padding: "1rem",
                background: "#f7fafc",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <input
                  type="text"
                  placeholder="成员姓名..."
                  value={newMemberName}
                  onChange={(e) =>
                    setNewMemberName((e.target as HTMLInputElement).value)
                  }
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                  }}
                />
                <input
                  type="text"
                  placeholder="Slack用户ID (可选)"
                  value={newMemberSlackId}
                  onChange={(e) =>
                    setNewMemberSlackId((e.target as HTMLInputElement).value)
                  }
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                  }}
                />
                <button onClick={addMember} class="btn btn-primary">
                  添加
                </button>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                💡 Slack用户ID用于@提醒功能，格式如：U1234567890
                (可在Slack中查看用户资料获取)
              </div>
            </div>
          )}

          {/* 成员列表 */}
          {members.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {members.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <span>👤 {member.name}</span>
                  {member.slackId && (
                    <span style={{ color: "#718096", fontSize: "0.75rem" }}>
                      (@{member.slackId})
                    </span>
                  )}
                  <button
                    onClick={() => removeMember(member.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f56565",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      padding: "0.125rem",
                    }}
                    title="删除成员"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                color: "#718096",
                fontSize: "0.875rem",
              }}
            >
              还没有添加团队成员，点击上方按钮添加成员以便在任务中@提醒他们
            </div>
          )}
        </div>

        {/* 添加任务表单 */}
        <div
          class="add-task-form"
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            background: "#f7fafc",
            borderRadius: "0.5rem",
          }}
        >
          <div
            class="form-row"
            style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <input
              type="text"
              placeholder="输入任务名称..."
              value={taskName}
              onChange={(e) =>
                setTaskName((e.target as HTMLInputElement).value)
              }
              style={{
                flex: 1,
                padding: "0.5rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
              }}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
            />
            <input
              type="number"
              placeholder="时长(小时)"
              min="0.5"
              max="24"
              step="0.5"
              value={taskDuration}
              onChange={(e) =>
                setTaskDuration(Number((e.target as HTMLInputElement).value))
              }
              style={{
                width: "120px",
                padding: "0.5rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
              }}
            />
          </div>
          <div
            class="form-row"
            style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <select
              value={taskPriority}
              onChange={(e) =>
                setTaskPriority(
                  (e.target as HTMLSelectElement).value as
                    | "high"
                    | "medium"
                    | "low"
                )
              }
              style={{
                flex: 1,
                padding: "0.5rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
              }}
            >
              <option value="high">🔴 高优先级</option>
              <option value="medium">🟡 中优先级</option>
              <option value="low">🟢 低优先级</option>
            </select>
            <input
              type="number"
              placeholder="进度%"
              min="0"
              max="100"
              step="5"
              value={taskProgress}
              onChange={(e) =>
                setTaskProgress(Number((e.target as HTMLInputElement).value))
              }
              style={{
                width: "100px",
                padding: "0.5rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
              }}
            />
            <button onClick={addTask} class="btn btn-primary">
              ➕ 添加任务
            </button>
          </div>
          <textarea
            placeholder="备注 (可选)"
            rows={2}
            value={taskNotes}
            onChange={(e) => setTaskNotes(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              resize: "vertical",
              marginBottom: "0.5rem",
            }}
          />

          {/* 成员选择 */}
          {members.length > 0 && (
            <div style={{ marginBottom: "0.5rem" }}>
              <label
                style={{
                  fontSize: "0.875rem",
                  color: "#4a5568",
                  marginBottom: "0.25rem",
                  display: "block",
                }}
              >
                👥 提醒成员查看 (可多选):
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {members.map((member) => (
                  <label
                    key={member.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={taskMentionedMembers.includes(member.id)}
                      onChange={(e) => {
                        if ((e.target as HTMLInputElement).checked) {
                          setTaskMentionedMembers([
                            ...taskMentionedMembers,
                            member.id,
                          ]);
                        } else {
                          setTaskMentionedMembers(
                            taskMentionedMembers.filter(
                              (id) => id !== member.id
                            )
                          );
                        }
                      }}
                    />
                    {member.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 任务列表 */}
        <div class="tasks-container">
          {tasks.length === 0 ? (
            <div
              class="empty-state"
              style={{ textAlign: "center", padding: "2rem", color: "#718096" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
              <h3>还没有任务</h3>
              <p>添加你的第一个工作任务开始规划今天的工作吧！</p>
            </div>
          ) : (
            <div class="tasks-list">
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#718096",
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  background: "#f7fafc",
                  borderRadius: "0.5rem",
                  textAlign: "center",
                }}
              >
                💡 提示：拖拽任务卡片可以调整任务顺序
              </div>
              {calculateTimes().map((task, index) => (
                <div
                  key={task.id}
                  class="task-item"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    background: draggedTaskId === task.id ? "#f0f9ff" : "white",
                    border:
                      dragOverIndex === index
                        ? "2px dashed #4299e1"
                        : draggedTaskId === task.id
                        ? "2px solid #4299e1"
                        : "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    marginBottom: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    cursor: draggedTaskId === task.id ? "grabbing" : "grab",
                    opacity: draggedTaskId === task.id ? 0.7 : 1,
                    transform:
                      draggedTaskId === task.id
                        ? "rotate(2deg) scale(1.02)"
                        : "none",
                    transition:
                      draggedTaskId === task.id ? "none" : "all 0.2s ease",
                    position: "relative",
                    boxShadow:
                      draggedTaskId === task.id
                        ? "0 8px 25px rgba(0, 0, 0, 0.15)"
                        : dragOverIndex === index
                        ? "0 4px 12px rgba(66, 153, 225, 0.3)"
                        : "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1rem",
                          color:
                            draggedTaskId === task.id ? "#4299e1" : "#a0aec0",
                          cursor:
                            draggedTaskId === task.id ? "grabbing" : "grab",
                          padding: "0.25rem",
                          borderRadius: "0.25rem",
                          background:
                            draggedTaskId === task.id
                              ? "#e2e8f0"
                              : "transparent",
                          transition: "all 0.2s ease",
                        }}
                        title="拖拽排序"
                        onMouseEnter={(e) => {
                          if (draggedTaskId !== task.id) {
                            (e.target as HTMLElement).style.color = "#4299e1";
                            (e.target as HTMLElement).style.background =
                              "#f7fafc";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (draggedTaskId !== task.id) {
                            (e.target as HTMLElement).style.color = "#a0aec0";
                            (e.target as HTMLElement).style.background =
                              "transparent";
                          }
                        }}
                      >
                        ⋮⋮
                      </span>
                      <span style={{ fontSize: "1.2rem" }}>
                        {priorityEmojis[task.priority]}
                      </span>
                      <strong>{task.name}</strong>
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#718096" }}>
                      ⏱️ {task.startTime} - {task.endTime} ({task.duration}小时)
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#4a5568",
                        marginTop: "0.25rem",
                      }}
                    >
                      📊 {getProgressDisplay(task.progress)} -{" "}
                      {getProgressBar(task.progress)}
                    </div>
                    {task.mentionedMembers &&
                      task.mentionedMembers.length > 0 && (
                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: "#4a5568",
                            marginTop: "0.25rem",
                          }}
                        >
                          👥 提醒:{" "}
                          {task.mentionedMembers
                            .map((id) => getMemberName(id))
                            .join(", ")}
                        </div>
                      )}
                    {task.notes && (
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#4a5568",
                          marginTop: "0.25rem",
                        }}
                      >
                        📝 {task.notes}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      alignItems: "flex-end",
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="5"
                      value={task.progress}
                      onChange={(e) =>
                        updateTaskProgress(task.id, Number(e.target.value))
                      }
                      style={{
                        width: "70px",
                        padding: "0.25rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.25rem",
                        fontSize: "0.875rem",
                      }}
                      title="更新进度"
                    />
                    <button
                      onClick={() => removeTask(task.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f56565",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        padding: "0.25rem",
                      }}
                      title="删除任务"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <div
          class="quick-actions"
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          {tasks.length > 0 && (
            <button onClick={clearAllTasks} class="btn btn-danger">
              🗑️ 清空任务
            </button>
          )}
          <button
            onClick={clearAllData}
            class="btn btn-secondary"
            style={{ fontSize: "0.875rem" }}
            title="清除所有保存的数据，包括任务、设置和 Webhook URL"
          >
            🧹 清除所有数据
          </button>
        </div>
      </section>

      {/* 右侧：预览和输出 */}
      <section class="preview-section">
        <div class="section-header">
          <h2>👀 消息预览</h2>
          <div class="preview-controls">
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
              }}
            >
              <option value="blocks">Block Kit</option>
              <option value="slack">Slack格式 (推荐)</option>
              <option value="markdown">Markdown格式</option>
            </select>
          </div>
        </div>

        {/* Slack消息预览 */}
        <div
          class="slack-preview"
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "0.5rem",
            padding: "1rem",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
          }}
        >
          <div class="slack-message">
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: "1.5rem" }}>👤</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong>{userName || "工作助手"}</strong>
                  <span style={{ color: "#718096", fontSize: "0.75rem" }}>
                    刚刚
                  </span>
                </div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                  {tasks.length > 0 ? (
                    outputFormat === "blocks" ? (
                      renderBlockKitPreview()
                    ) : outputFormat === "slack" ||
                      outputFormat === "markdown" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: convertMarkdownToHtml(generateSlackMessage()),
                        }}
                      />
                    ) : (
                      generateSlackMessage()
                    )
                  ) : (
                    "添加任务后这里会显示预览..."
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 输出代码 */}
        <div class="output-section" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <h3>📋 输出代码</h3>
            <button onClick={copyToClipboard} class="btn btn-primary">
              📋 复制
            </button>
          </div>
          <textarea
            readOnly
            value={
              tasks.length > 0
                ? generateSlackMessage()
                : "添加任务后这里会显示格式化代码..."
            }
            style={{
              width: "100%",
              height: "200px",
              padding: "1rem",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              fontFamily: "Monaco, Consolas, monospace",
              fontSize: "0.875rem",
              background: "#f8f9fa",
              resize: "vertical",
            }}
          />
        </div>

        {/* Webhook 管理 */}
        <div class="webhook-management-section">
          <h3 style={{ marginBottom: "1rem" }}>🚀 Webhook 管理</h3>

          {/* 已保存的 Webhooks */}
          {webhooks.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <h4
                style={{
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                  color: "#4a5568",
                }}
              >
                📚 已保存的 Webhooks
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem",
                      border:
                        selectedWebhookId === webhook.id
                          ? "2px solid #4299e1"
                          : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      background:
                        selectedWebhookId === webhook.id
                          ? "#f0f9ff"
                          : "#ffffff",
                    }}
                  >
                    <button
                      onClick={() => selectWebhook(webhook.id)}
                      style={{
                        flex: 1,
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0.25rem",
                      }}
                    >
                      <div style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                        {webhook.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#718096",
                          wordBreak: "break-all",
                        }}
                      >
                        {webhook.url.substring(0, 50)}...
                      </div>
                    </button>
                    <button
                      onClick={() => removeWebhook(webhook.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f56565",
                        cursor: "pointer",
                        fontSize: "1rem",
                        padding: "0.25rem",
                      }}
                      title="删除 Webhook"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 添加新 Webhook */}
          <div style={{ marginBottom: "1rem" }}>
            <h4
              style={{
                fontSize: "0.875rem",
                marginBottom: "0.5rem",
                color: "#4a5568",
              }}
            >
              ➕ 添加新 Webhook
            </h4>
            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
            >
              <input
                type="text"
                placeholder="Webhook 名称 (如: 开发团队)"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                }}
              />
              <button
                onClick={addWebhook}
                class="btn btn-primary"
                disabled={!newWebhookName.trim() || !webhookUrl.trim()}
                style={{ fontSize: "0.875rem" }}
              >
                💾 保存
              </button>
            </div>
          </div>

          {/* 当前 Webhook URL */}
          <div style={{ marginBottom: "1rem" }}>
            <h4
              style={{
                fontSize: "0.875rem",
                marginBottom: "0.5rem",
                color: "#4a5568",
              }}
            >
              🔗 当前 Webhook URL
            </h4>
            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
            >
              <input
                type="url"
                placeholder="输入或选择 Slack Webhook URL..."
                value={webhookUrl}
                onChange={(e) =>
                  updateWebhookUrl((e.target as HTMLInputElement).value)
                }
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                }}
              />
              <button
                onClick={sendToSlack}
                class="btn btn-success"
                disabled={!webhookUrl || tasks.length === 0}
              >
                📤 发送
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#718096" }}>
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                style={{ color: "#4299e1" }}
              >
                如何获取 Webhook URL？
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

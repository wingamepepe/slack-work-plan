import { Handlers } from "$fresh/server.ts";

interface Task {
  id: string;
  name: string;
  duration: number;
  priority: "high" | "medium" | "low";
  progress: number;
  notes?: string;
  startTime?: string;
  endTime?: string;
  startDateTime?: string;
  endDateTime?: string;
  mentionedMembers?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  channelId?: string;
  teamId?: string;
}

// 简单的内存存储（生产环境应该使用数据库）
const tasksStore = new Map<string, Task[]>();

export const handler: Handlers = {
  // 获取任务列表
  async GET(req) {
    try {
      const url = new URL(req.url);
      const channelId = url.searchParams.get("channel");
      const userId = url.searchParams.get("user");
      const teamId = url.searchParams.get("team");

      const key = `${teamId || "default"}_${channelId || "default"}`;
      const tasks = tasksStore.get(key) || [];

      return new Response(
        JSON.stringify({
          success: true,
          tasks: tasks,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      console.error("获取任务列表失败:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "获取任务列表失败",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },

  // 创建新任务
  async POST(req) {
    try {
      const body = await req.json();
      const { task, channelId, teamId } = body;

      if (!task || !task.name) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "任务名称不能为空",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const newTask: Task = {
        id: crypto.randomUUID(),
        name: task.name,
        duration: task.duration || 60,
        priority: task.priority || "medium",
        progress: task.progress || 0,
        notes: task.notes || "",
        mentionedMembers: task.mentionedMembers || [],
        createdBy: task.createdBy || "unknown",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channelId: channelId,
        teamId: teamId,
      };

      const key = `${teamId || "default"}_${channelId || "default"}`;
      const tasks = tasksStore.get(key) || [];
      tasks.push(newTask);
      tasksStore.set(key, tasks);

      return new Response(
        JSON.stringify({
          success: true,
          task: newTask,
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      console.error("创建任务失败:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "创建任务失败",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },

  // 更新任务
  async PUT(req) {
    try {
      const body = await req.json();
      const { taskId, updates, channelId, teamId } = body;

      if (!taskId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "任务ID不能为空",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const key = `${teamId || "default"}_${channelId || "default"}`;
      const tasks = tasksStore.get(key) || [];
      const taskIndex = tasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "任务不存在",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // 更新任务
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      tasksStore.set(key, tasks);

      return new Response(
        JSON.stringify({
          success: true,
          task: tasks[taskIndex],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      console.error("更新任务失败:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "更新任务失败",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },

  // 删除任务
  async DELETE(req) {
    try {
      const url = new URL(req.url);
      const taskId = url.searchParams.get("id");
      const channelId = url.searchParams.get("channel");
      const teamId = url.searchParams.get("team");

      if (!taskId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "任务ID不能为空",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const key = `${teamId || "default"}_${channelId || "default"}`;
      const tasks = tasksStore.get(key) || [];
      const filteredTasks = tasks.filter((t) => t.id !== taskId);

      if (tasks.length === filteredTasks.length) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "任务不存在",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      tasksStore.set(key, filteredTasks);

      return new Response(
        JSON.stringify({
          success: true,
          message: "任务删除成功",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      console.error("删除任务失败:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "删除任务失败",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },

  // 处理 CORS 预检请求
  OPTIONS() {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  },
};

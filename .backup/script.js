// 主应用逻辑

/**
 * 任务管理器
 */
class TaskManager {
    constructor() {
        this.tasks = [];
        this.settings = {
            defaultDuration: 1,
            defaultStartTime: '09:00',
            timeFormat: 'decimal',
            autoSave: true,
            webhookUrl: ''
        };
        this.nextId = 1;
        this.startTime = '09:00';
    }

    /**
     * 初始化任务管理器
     */
    init() {
        this.loadData();
        this.bindEvents();
        this.updateUI();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 添加任务
        const addBtn = document.getElementById('add-task-btn');
        const taskNameInput = document.getElementById('task-name');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addTask());
        }
        
        if (taskNameInput) {
            taskNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTask();
                }
            });
        }

        // 清空所有任务
        const clearBtn = document.getElementById('clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllTasks());
        }

        // 导出数据
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // 导入数据
        const importBtn = document.getElementById('import-btn');
        const importFile = document.getElementById('import-file');
        
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', (e) => this.importData(e.target.files[0]));
        }

        // 复制输出
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyOutput());
        }

        // 发送到Slack
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendToSlack());
        }

        // 测试Webhook连接
        const testWebhookBtn = document.getElementById('test-webhook-btn');
        if (testWebhookBtn) {
            testWebhookBtn.addEventListener('click', () => this.testWebhookConnection());
        }

        // 主题切换
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // 设置
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }

        // 开始时间相关
        const startTimeInput = document.getElementById('start-time');
        const resetStartTimeBtn = document.getElementById('reset-start-time');
        
        if (startTimeInput) {
            startTimeInput.addEventListener('change', (e) => {
                this.startTime = e.target.value;
                this.updatePreview();
                this.saveData();
            });
        }
        
        if (resetStartTimeBtn) {
            resetStartTimeBtn.addEventListener('click', () => this.resetStartTime());
        }

        // 通知关闭
        const notificationClose = document.getElementById('notification-close');
        if (notificationClose) {
            notificationClose.addEventListener('click', () => NotificationUtils.hide());
        }
    }

    /**
     * 添加任务
     */
    addTask() {
        const nameInput = document.getElementById('task-name');
        const durationInput = document.getElementById('task-duration');
        const prioritySelect = document.getElementById('task-priority');
        const notesInput = document.getElementById('task-notes');

        if (!nameInput || !durationInput || !prioritySelect) return;

        // 验证输入
        const nameValidation = ValidationUtils.validateTaskName(nameInput.value);
        if (!nameValidation.valid) {
            NotificationUtils.error(nameValidation.message);
            nameInput.focus();
            return;
        }

        const durationValidation = ValidationUtils.validateDuration(durationInput.value);
        if (!durationValidation.valid) {
            NotificationUtils.error(durationValidation.message);
            durationInput.focus();
            return;
        }

        const priorityValidation = ValidationUtils.validatePriority(prioritySelect.value);
        if (!priorityValidation.valid) {
            NotificationUtils.error(priorityValidation.message);
            return;
        }

        // 创建任务对象
        const task = {
            id: this.nextId++,
            name: nameValidation.value,
            duration: durationValidation.value,
            priority: priorityValidation.value,
            notes: notesInput ? notesInput.value.trim() : '',
            completed: false,
            createdAt: new Date().toISOString()
        };

        // 添加到任务列表
        this.tasks.push(task);

        // 清空表单
        nameInput.value = '';
        durationInput.value = this.settings.defaultDuration;
        prioritySelect.value = 'medium';
        if (notesInput) notesInput.value = '';

        // 更新UI
        this.updateUI();
        this.saveData();

        // 聚焦到名称输入框
        nameInput.focus();

        NotificationUtils.success('任务添加成功！');
    }

    /**
     * 删除任务
     * @param {number} taskId - 任务ID
     */
    deleteTask(taskId) {
        const index = this.tasks.findIndex(task => task.id === taskId);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            this.updateUI();
            this.saveData();
            NotificationUtils.success('任务已删除');
        }
    }

    /**
     * 编辑任务
     * @param {number} taskId - 任务ID
     */
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (!task) return;

        // 简单的编辑实现：填充表单
        const nameInput = document.getElementById('task-name');
        const durationInput = document.getElementById('task-duration');
        const prioritySelect = document.getElementById('task-priority');
        const notesInput = document.getElementById('task-notes');

        if (nameInput) nameInput.value = task.name;
        if (durationInput) durationInput.value = task.duration;
        if (prioritySelect) prioritySelect.value = task.priority;
        if (notesInput) notesInput.value = task.notes;

        // 删除原任务
        this.deleteTask(taskId);

        // 聚焦到名称输入框
        if (nameInput) nameInput.focus();
    }

    /**
     * 切换任务完成状态
     * @param {number} taskId - 任务ID
     */
    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.updateUI();
            this.saveData();
        }
    }

    /**
     * 移动任务位置
     * @param {number} fromIndex - 源位置
     * @param {number} toIndex - 目标位置
     */
    moveTask(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.tasks.length || 
            toIndex < 0 || toIndex >= this.tasks.length) {
            return;
        }

        const task = this.tasks.splice(fromIndex, 1)[0];
        this.tasks.splice(toIndex, 0, task);
        
        this.updateUI();
        this.saveData();
    }

    /**
     * 清空所有任务
     */
    clearAllTasks() {
        if (this.tasks.length === 0) {
            NotificationUtils.warning('没有任务需要清空');
            return;
        }

        if (confirm('确定要清空所有任务吗？此操作不可撤销。')) {
            this.tasks = [];
            this.updateUI();
            this.saveData();
            NotificationUtils.success('所有任务已清空');
        }
    }

    /**
     * 重置开始时间为默认上班时间
     */
    resetStartTime() {
        this.startTime = this.settings.defaultStartTime;
        const startTimeInput = document.getElementById('start-time');
        if (startTimeInput) {
            startTimeInput.value = this.startTime;
        }
        this.updatePreview();
        this.saveData();
        NotificationUtils.success('开始时间已重置为默认上班时间');
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        this.updateTasksList();
        this.updateStats();
        this.updatePreview();
        this.updateEmptyState();
    }

    /**
     * 更新任务列表显示
     */
    updateTasksList() {
        const tasksList = document.getElementById('tasks-list');
        if (!tasksList) return;

        tasksList.innerHTML = '';

        this.tasks.forEach((task, index) => {
            const taskElement = this.createTaskElement(task, index);
            tasksList.appendChild(taskElement);
        });
    }

    /**
     * 创建任务元素
     * @param {Object} task - 任务对象
     * @param {number} index - 索引
     * @returns {Element} 任务DOM元素
     */
    createTaskElement(task, index) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        taskDiv.draggable = true;
        taskDiv.dataset.taskId = task.id;
        taskDiv.dataset.index = index;

        // 任务头部
        const taskHeader = document.createElement('div');
        taskHeader.className = 'task-header';

        const taskTitle = document.createElement('div');
        taskTitle.className = 'task-title';
        taskTitle.textContent = task.name;
        if (task.completed) {
            taskTitle.style.textDecoration = 'line-through';
            taskTitle.style.opacity = '0.6';
        }

        const priorityBadge = document.createElement('span');
        priorityBadge.className = `task-priority ${task.priority}`;
        const priorityText = {
            high: '🔴 高',
            medium: '🟡 中',
            low: '🟢 低'
        };
        priorityBadge.textContent = priorityText[task.priority];

        taskHeader.appendChild(taskTitle);
        taskHeader.appendChild(priorityBadge);

        // 任务元信息
        const taskMeta = document.createElement('div');
        taskMeta.className = 'task-meta';

        const taskDuration = document.createElement('span');
        taskDuration.className = 'task-duration';
        taskDuration.textContent = TimeUtils.formatDuration(task.duration, this.settings.timeFormat);

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        // 完成按钮
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn btn-secondary';
        toggleBtn.innerHTML = task.completed ? '↩️' : '✅';
        toggleBtn.title = task.completed ? '标记为未完成' : '标记为完成';
        toggleBtn.addEventListener('click', () => this.toggleTask(task.id));

        // 编辑按钮
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary';
        editBtn.innerHTML = '✏️';
        editBtn.title = '编辑任务';
        editBtn.addEventListener('click', () => this.editTask(task.id));

        // 删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = '删除任务';
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        taskActions.appendChild(toggleBtn);
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);

        taskMeta.appendChild(taskDuration);
        taskMeta.appendChild(taskActions);

        // 组装任务元素
        taskDiv.appendChild(taskHeader);
        taskDiv.appendChild(taskMeta);

        // 备注
        if (task.notes && task.notes.trim()) {
            const notesDiv = document.createElement('div');
            notesDiv.className = 'task-notes';
            notesDiv.textContent = task.notes;
            taskDiv.appendChild(notesDiv);
        }

        // 拖拽事件
        this.addDragEvents(taskDiv);

        return taskDiv;
    }

    /**
     * 添加拖拽事件
     * @param {Element} element - 任务元素
     */
    addDragEvents(element) {
        element.addEventListener('dragstart', (e) => {
            element.classList.add('dragging');
            e.dataTransfer.setData('text/plain', element.dataset.index);
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(element.dataset.index);
            
            if (fromIndex !== toIndex) {
                this.moveTask(fromIndex, toIndex);
            }
        });
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const taskCount = document.getElementById('task-count');
        const totalTime = document.getElementById('total-time');

        if (taskCount) {
            taskCount.textContent = `${this.tasks.length} 个任务`;
        }

        if (totalTime) {
            const total = this.tasks.reduce((sum, task) => sum + task.duration, 0);
            totalTime.textContent = `总计: ${TimeUtils.formatDuration(total, this.settings.timeFormat)}`;
        }
    }

    /**
     * 更新预览
     */
    updatePreview() {
        if (typeof PreviewManager !== 'undefined') {
            PreviewManager.updatePreview(this.tasks, { startTime: this.startTime });
        }
    }

    /**
     * 更新空状态显示
     */
    updateEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const tasksList = document.getElementById('tasks-list');

        if (emptyState && tasksList) {
            if (this.tasks.length === 0) {
                emptyState.style.display = 'block';
                tasksList.style.display = 'none';
            } else {
                emptyState.style.display = 'none';
                tasksList.style.display = 'flex';
            }
        }
    }

    /**
     * 保存数据到本地存储
     */
    saveData() {
        if (this.settings.autoSave) {
            StorageUtils.save('tasks', this.tasks);
            StorageUtils.save('settings', this.settings);
            StorageUtils.save('nextId', this.nextId);
            StorageUtils.save('startTime', this.startTime);
        }
    }

    /**
     * 从本地存储加载数据
     */
    loadData() {
        this.tasks = StorageUtils.load('tasks', []);
        this.settings = { ...this.settings, ...StorageUtils.load('settings', {}) };
        this.nextId = StorageUtils.load('nextId', 1);
        this.startTime = StorageUtils.load('startTime', this.settings.defaultStartTime);

        // 应用设置到UI
        this.applySettings();
    }

    /**
     * 应用设置到UI
     */
    applySettings() {
        const durationInput = document.getElementById('task-duration');
        if (durationInput) {
            durationInput.value = this.settings.defaultDuration;
        }

        const startTimeInput = document.getElementById('start-time');
        if (startTimeInput) {
            startTimeInput.value = this.startTime;
        }

        const webhookInput = document.getElementById('webhook-url');
        if (webhookInput && this.settings.webhookUrl) {
            webhookInput.value = this.settings.webhookUrl;
        }
    }

    /**
     * 导出数据
     */
    exportData() {
        const data = {
            tasks: this.tasks,
            settings: this.settings,
            startTime: this.startTime,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const filename = `slack-tasks-${new Date().toISOString().split('T')[0]}.json`;
        
        if (FileUtils.downloadJSON(data, filename)) {
            NotificationUtils.success('数据导出成功！');
        } else {
            NotificationUtils.error('数据导出失败');
        }
    }

    /**
     * 导入数据
     * @param {File} file - 文件对象
     */
    async importData(file) {
        if (!file) return;

        try {
            const data = await FileUtils.readJSON(file);
            
            if (data.tasks && Array.isArray(data.tasks)) {
                if (confirm('导入数据将覆盖当前所有任务，确定继续吗？')) {
                    this.tasks = data.tasks;
                    
                    if (data.settings) {
                        this.settings = { ...this.settings, ...data.settings };
                    }
                    
                    if (data.startTime) {
                        this.startTime = data.startTime;
                    }
                    
                    // 重新计算nextId
                    this.nextId = Math.max(...this.tasks.map(t => t.id), 0) + 1;
                    
                    this.updateUI();
                    this.saveData();
                    this.applySettings();
                    
                    NotificationUtils.success(`成功导入 ${this.tasks.length} 个任务！`);
                }
            } else {
                NotificationUtils.error('无效的数据格式');
            }
        } catch (error) {
            NotificationUtils.error(error.message);
        }
    }

    /**
     * 复制输出到剪贴板
     */
    async copyOutput() {
        const output = PreviewManager.getCurrentOutput();
        
        if (!output) {
            NotificationUtils.warning('没有内容可复制');
            return;
        }

        const success = await ClipboardUtils.copy(output);
        
        if (success) {
            NotificationUtils.success('内容已复制到剪贴板！');
        } else {
            NotificationUtils.error('复制失败，请手动复制');
        }
    }

    /**
     * 测试Webhook连接
     */
    async testWebhookConnection() {
        const webhookInput = document.getElementById('webhook-url');
        const webhookUrl = webhookInput ? webhookInput.value.trim() : '';

        if (!webhookUrl) {
            NotificationUtils.error('请输入Slack Webhook URL');
            return;
        }

        const validation = ValidationUtils.validateWebhookURL(webhookUrl);
        if (!validation.valid) {
            NotificationUtils.error(validation.message);
            return;
        }

        try {
            // 发送测试消息
            const testPayload = {
                text: "🔍 Webhook连接测试成功！\n这是来自Slack工作计划生成器的测试消息。"
            };
            
            console.log('测试Webhook连接:', validation.value);
            const result = await NetworkUtils.sendToSlack(validation.value, testPayload);
            
            if (result.success) {
                NotificationUtils.success('✅ Webhook连接测试成功！');
                // 保存有效的Webhook URL
                this.settings.webhookUrl = validation.value;
                this.saveData();
            } else {
                let errorMsg = '❌ Webhook连接测试失败';
                if (result.status === 404) {
                    errorMsg = '❌ Webhook URL不存在或已失效';
                } else if (result.status === 400) {
                    errorMsg = '❌ Webhook URL格式错误';
                } else if (result.status === 403) {
                    errorMsg = '❌ 没有权限访问此Webhook';
                } else if (result.error) {
                    errorMsg = `❌ 连接失败：${result.error}`;
                }
                
                NotificationUtils.error(errorMsg);
                console.error('Webhook测试失败:', result);
            }
        } catch (error) {
            NotificationUtils.error('❌ 连接测试失败：' + error.message);
            console.error('Webhook测试异常:', error);
        }
    }

    /**
     * 发送到Slack
     */
    async sendToSlack() {
        const webhookInput = document.getElementById('webhook-url');
        const webhookUrl = webhookInput ? webhookInput.value.trim() : '';

        if (!webhookUrl) {
            NotificationUtils.error('请输入Slack Webhook URL');
            return;
        }

        const validation = ValidationUtils.validateWebhookURL(webhookUrl);
        if (!validation.valid) {
            NotificationUtils.error(validation.message);
            return;
        }

        if (this.tasks.length === 0) {
            NotificationUtils.warning('没有任务可发送');
            return;
        }

        try {
            const payload = PreviewManager.getSlackPayload(this.tasks, { startTime: this.startTime });
            console.log('准备发送载荷:', payload);
            
            const result = await NetworkUtils.sendToSlack(validation.value, payload);
            
            if (result.success) {
                NotificationUtils.success('消息已发送到Slack！');
                // 保存Webhook URL
                this.settings.webhookUrl = validation.value;
                this.saveData();
            } else {
                let errorMsg = '发送失败';
                if (result.status === 404) {
                    errorMsg = '发送失败：Webhook URL不存在或已失效';
                } else if (result.status === 400) {
                    errorMsg = '发送失败：消息格式错误';
                } else if (result.status === 403) {
                    errorMsg = '发送失败：没有权限访问此Webhook';
                } else if (result.error) {
                    errorMsg = `发送失败：${result.error}`;
                }
                
                NotificationUtils.error(errorMsg);
                console.error('详细错误信息:', result);
            }
        } catch (error) {
            NotificationUtils.error('发送失败：' + error.message);
            console.error('发送异常:', error);
        }
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const newTheme = ThemeUtils.toggleTheme();
        const themeToggle = document.getElementById('theme-toggle');
        
        if (themeToggle) {
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        NotificationUtils.success(`已切换到${newTheme === 'dark' ? '深色' : '浅色'}主题`);
    }

    /**
     * 打开设置模态框
     */
    openSettings() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        // 填充当前设置
        const defaultDurationInput = document.getElementById('default-duration');
        const defaultStartTimeInput = document.getElementById('default-start-time');
        const timeFormatSelect = document.getElementById('time-format');
        const autoSaveCheckbox = document.getElementById('auto-save');
        const settingsWebhookInput = document.getElementById('settings-webhook');

        if (defaultDurationInput) defaultDurationInput.value = this.settings.defaultDuration;
        if (defaultStartTimeInput) defaultStartTimeInput.value = this.settings.defaultStartTime;
        if (timeFormatSelect) timeFormatSelect.value = this.settings.timeFormat;
        if (autoSaveCheckbox) autoSaveCheckbox.checked = this.settings.autoSave;
        if (settingsWebhookInput) settingsWebhookInput.value = this.settings.webhookUrl;

        // 显示模态框
        modal.classList.add('show');

        // 绑定事件
        this.bindModalEvents();
    }

    /**
     * 绑定模态框事件
     */
    bindModalEvents() {
        const modal = document.getElementById('settings-modal');
        const saveBtn = document.getElementById('save-settings');
        const closeButtons = modal.querySelectorAll('.modal-close');

        // 保存设置
        if (saveBtn) {
            saveBtn.onclick = () => this.saveSettings();
        }

        // 关闭模态框
        closeButtons.forEach(btn => {
            btn.onclick = () => this.closeModal();
        });

        // 点击背景关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        };

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }

    /**
     * 保存设置
     */
    saveSettings() {
        const defaultDurationInput = document.getElementById('default-duration');
        const defaultStartTimeInput = document.getElementById('default-start-time');
        const timeFormatSelect = document.getElementById('time-format');
        const autoSaveCheckbox = document.getElementById('auto-save');
        const settingsWebhookInput = document.getElementById('settings-webhook');

        // 验证并保存设置
        if (defaultDurationInput) {
            const duration = parseFloat(defaultDurationInput.value);
            if (!isNaN(duration) && duration > 0 && duration <= 8) {
                this.settings.defaultDuration = duration;
            }
        }

        if (defaultStartTimeInput) {
            this.settings.defaultStartTime = defaultStartTimeInput.value;
        }

        if (timeFormatSelect) {
            this.settings.timeFormat = timeFormatSelect.value;
        }

        if (autoSaveCheckbox) {
            this.settings.autoSave = autoSaveCheckbox.checked;
        }

        if (settingsWebhookInput) {
            const url = settingsWebhookInput.value.trim();
            if (!url || ValidationUtils.validateWebhookURL(url).valid) {
                this.settings.webhookUrl = url;
            }
        }

        // 应用设置
        this.applySettings();
        this.saveData();
        this.updateUI();
        this.closeModal();

        NotificationUtils.success('设置已保存！');
    }

    /**
     * 关闭模态框
     */
    closeModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
}

/**
 * 应用初始化
 */
class App {
    constructor() {
        this.taskManager = new TaskManager();
    }

    /**
     * 初始化应用
     */
    init() {
        // 初始化主题
        ThemeUtils.initTheme();
        this.updateThemeToggle();

        // 初始化预览管理器
        if (typeof PreviewManager !== 'undefined') {
            PreviewManager.init();
        }

        // 初始化任务管理器
        this.taskManager.init();

        // 显示欢迎信息
        this.showWelcomeMessage();

        console.log('📋 Slack工作计划生成器已启动');
    }

    /**
     * 更新主题切换按钮
     */
    updateThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const currentTheme = ThemeUtils.getCurrentTheme();
            themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    /**
     * 显示欢迎信息
     */
    showWelcomeMessage() {
        // 检查是否是首次访问
        const isFirstVisit = !StorageUtils.load('hasVisited', false);
        
        if (isFirstVisit) {
            setTimeout(() => {
                NotificationUtils.success('欢迎使用Slack工作计划生成器！🎉');
                StorageUtils.save('hasVisited', true);
            }, 1000);
        }
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// 导出（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TaskManager,
        App
    };
} 
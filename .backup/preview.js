// Slack预览和格式化功能

/**
 * Slack格式化工具
 */
const SlackFormatter = {
    /**
     * 生成Block Kit格式的消息
     * @param {Array} tasks - 任务列表
     * @param {Object} options - 选项
     * @returns {Object} Block Kit消息对象
     */
    generateBlockKit(tasks, options = {}) {
        const {
            title = '📅 今日工作计划',
            showStats = true,
            showTime = true,
            startTime = '09:00'
        } = options;

        const blocks = [];

        // 标题块
        blocks.push({
            type: 'header',
            text: {
                type: 'plain_text',
                text: title
            }
        });

        // 开始时间信息
        if (startTime) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `🕐 *开始时间:* ${startTime}`
                }
            });
        }

        // 如果没有任务
        if (!tasks || tasks.length === 0) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '暂无工作任务安排 🎉'
                }
            });
            return { blocks };
        }

        // 按优先级分组任务
        const groupedTasks = this.groupTasksByPriority(tasks);
        
        // 高优先级任务
        if (groupedTasks.high.length > 0) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*🔴 高优先级任务*'
                }
            });
            
            groupedTasks.high.forEach(task => {
                blocks.push(this.createTaskBlock(task));
            });
        }

        // 中优先级任务
        if (groupedTasks.medium.length > 0) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*🟡 中优先级任务*'
                }
            });
            
            groupedTasks.medium.forEach(task => {
                blocks.push(this.createTaskBlock(task));
            });
        }

        // 低优先级任务
        if (groupedTasks.low.length > 0) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*🟢 低优先级任务*'
                }
            });
            
            groupedTasks.low.forEach(task => {
                blocks.push(this.createTaskBlock(task));
            });
        }

        // 分隔线
        blocks.push({
            type: 'divider'
        });

        // 统计信息
        if (showStats) {
            const totalTime = tasks.reduce((sum, task) => sum + task.duration, 0);
            const completedTasks = tasks.filter(task => task.completed).length;
            
            let statsText = `📊 *总计:* ${tasks.length} 个任务 | ⏱️ *预计时长:* ${TimeUtils.formatDuration(totalTime)}`;
            
            if (completedTasks > 0) {
                statsText += ` | ✅ *已完成:* ${completedTasks} 个`;
            }

            if (showTime) {
                statsText += ` | 🕐 *更新时间:* ${TimeUtils.getCurrentTime()}`;
            }

            blocks.push({
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: statsText
                    }
                ]
            });
        }

        return { blocks };
    },

    /**
     * 创建单个任务的Block
     * @param {Object} task - 任务对象
     * @returns {Object} 任务Block
     */
    createTaskBlock(task) {
        const statusIcon = task.completed ? '✅' : '⏳';
        const taskText = task.completed ? `~${task.name}~` : task.name;
        
        const block = {
            type: 'section',
            fields: [
                {
                    type: 'mrkdwn',
                    text: `${statusIcon} *${taskText}*`
                },
                {
                    type: 'mrkdwn',
                    text: `⏱️ ${TimeUtils.formatDuration(task.duration)}`
                }
            ]
        };

        // 如果有备注，添加到block中
        if (task.notes && task.notes.trim()) {
            block.accessory = {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: '💬 备注'
                },
                value: task.notes
            };
        }

        return block;
    },

    /**
     * 按优先级分组任务
     * @param {Array} tasks - 任务列表
     * @returns {Object} 分组后的任务
     */
    groupTasksByPriority(tasks) {
        return {
            high: tasks.filter(task => task.priority === 'high'),
            medium: tasks.filter(task => task.priority === 'medium'),
            low: tasks.filter(task => task.priority === 'low')
        };
    },

    /**
     * 生成专门为Slack优化的格式化消息
     * @param {Array} tasks - 任务列表
     * @param {Object} options - 选项
     * @returns {string} Slack优化格式的消息
     */
    generateSlackOptimized(tasks, options = {}) {
        const {
            title = '📅 今日工作计划',
            showStats = true,
            showTime = true,
            startTime = '09:00'
        } = options;

        let text = `*${title}*\n\n`;

        // 添加开始时间信息
        if (startTime) {
            text += `:clock9: *开始时间:* ${startTime}\n\n`;
        }

        if (!tasks || tasks.length === 0) {
            return text + '暂无工作任务安排 🎉';
        }

        const groupedTasks = this.groupTasksByPriority(tasks);

        // 高优先级任务
        if (groupedTasks.high.length > 0) {
            text += ':red_circle: *高优先级任务*\n';
            groupedTasks.high.forEach((task, index) => {
                text += this.formatTaskSlackOptimized(task, index + 1);
            });
            text += '\n';
        }

        // 中优先级任务
        if (groupedTasks.medium.length > 0) {
            text += ':yellow_circle: *中优先级任务*\n';
            groupedTasks.medium.forEach((task, index) => {
                text += this.formatTaskSlackOptimized(task, index + 1);
            });
            text += '\n';
        }

        // 低优先级任务
        if (groupedTasks.low.length > 0) {
            text += ':green_circle: *低优先级任务*\n';
            groupedTasks.low.forEach((task, index) => {
                text += this.formatTaskSlackOptimized(task, index + 1);
            });
            text += '\n';
        }

        // 统计信息
        if (showStats) {
            const totalTime = tasks.reduce((sum, task) => sum + task.duration, 0);
            const completedTasks = tasks.filter(task => task.completed).length;
            
            text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            text += `:bar_chart: *总计:* ${tasks.length} 个任务 | :clock1: *预计时长:* ${TimeUtils.formatDuration(totalTime)}`;
            
            if (completedTasks > 0) {
                text += ` | :white_check_mark: *已完成:* ${completedTasks} 个`;
            }

            if (showTime) {
                text += `\n:clock3: *更新时间:* ${TimeUtils.getCurrentTime()}`;
            }
        }

        return text;
    },

    /**
     * 格式化单个任务的Slack优化版本
     * @param {Object} task - 任务对象
     * @param {number} index - 序号
     * @returns {string} 格式化后的任务文本
     */
    formatTaskSlackOptimized(task, index) {
        const statusIcon = task.completed ? ':white_check_mark:' : ':hourglass_flowing_sand:';
        const taskText = task.completed ? `~${task.name}~` : `*${task.name}*`;
        let text = `${index}. ${statusIcon} ${taskText} - \`${TimeUtils.formatDuration(task.duration)}\`\n`;
        
        if (task.notes && task.notes.trim()) {
            text += `    _${task.notes}_\n`;
        }
        
        return text;
    },

    /**
     * 生成Slack mrkdwn格式的消息
     * @param {Array} tasks - 任务列表
     * @param {Object} options - 选项
     * @returns {string} Slack mrkdwn格式的消息
     */
    generateMarkdown(tasks, options = {}) {
        const {
            title = '📅 今日工作计划',
            showStats = true,
            showTime = true,
            startTime = '09:00'
        } = options;

        let markdown = `*${title}*\n\n`;

        // 添加开始时间信息
        if (startTime) {
            markdown += `🕐 *开始时间:* ${startTime}\n\n`;
        }

        if (!tasks || tasks.length === 0) {
            return markdown + '暂无工作任务安排 🎉';
        }

        const groupedTasks = this.groupTasksByPriority(tasks);

        // 高优先级任务
        if (groupedTasks.high.length > 0) {
            markdown += '*🔴 高优先级任务*\n';
            groupedTasks.high.forEach(task => {
                markdown += this.formatTaskMarkdown(task);
            });
            markdown += '\n';
        }

        // 中优先级任务
        if (groupedTasks.medium.length > 0) {
            markdown += '*🟡 中优先级任务*\n';
            groupedTasks.medium.forEach(task => {
                markdown += this.formatTaskMarkdown(task);
            });
            markdown += '\n';
        }

        // 低优先级任务
        if (groupedTasks.low.length > 0) {
            markdown += '*🟢 低优先级任务*\n';
            groupedTasks.low.forEach(task => {
                markdown += this.formatTaskMarkdown(task);
            });
            markdown += '\n';
        }

        // 统计信息
        if (showStats) {
            const totalTime = tasks.reduce((sum, task) => sum + task.duration, 0);
            const completedTasks = tasks.filter(task => task.completed).length;
            
            markdown += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            markdown += `📊 *总计:* ${tasks.length} 个任务 | ⏱️ *预计时长:* ${TimeUtils.formatDuration(totalTime)}`;
            
            if (completedTasks > 0) {
                markdown += ` | ✅ *已完成:* ${completedTasks} 个`;
            }

            if (showTime) {
                markdown += `\n🕐 *更新时间:* ${TimeUtils.getCurrentTime()}`;
            }
        }

        return markdown;
    },

    /**
     * 格式化单个任务的Slack mrkdwn
     * @param {Object} task - 任务对象
     * @returns {string} 格式化后的任务文本
     */
    formatTaskMarkdown(task) {
        const statusIcon = task.completed ? '✅' : '⏳';
        const taskText = task.completed ? `~${task.name}~` : `*${task.name}*`;
        let markdown = `• ${statusIcon} ${taskText} - \`${TimeUtils.formatDuration(task.duration)}\`\n`;
        
        if (task.notes && task.notes.trim()) {
            markdown += `    _${task.notes}_\n`;
        }
        
        return markdown;
    },

    /**
     * 生成纯文本格式的消息
     * @param {Array} tasks - 任务列表
     * @param {Object} options - 选项
     * @returns {string} 纯文本格式的消息
     */
    generatePlainText(tasks, options = {}) {
        const {
            title = '📅 今日工作计划',
            showStats = true,
            showTime = true,
            startTime = '09:00'
        } = options;

        let text = `${title}\n${'='.repeat(title.length)}\n\n`;

        // 添加开始时间信息
        if (startTime) {
            text += `🕐 开始时间: ${startTime}\n\n`;
        }

        if (!tasks || tasks.length === 0) {
            return text + '暂无工作任务安排 🎉';
        }

        const groupedTasks = this.groupTasksByPriority(tasks);

        // 高优先级任务
        if (groupedTasks.high.length > 0) {
            text += '🔴 高优先级任务\n';
            text += '-'.repeat(15) + '\n';
            groupedTasks.high.forEach((task, index) => {
                text += this.formatTaskPlainText(task, index + 1);
            });
            text += '\n';
        }

        // 中优先级任务
        if (groupedTasks.medium.length > 0) {
            text += '🟡 中优先级任务\n';
            text += '-'.repeat(15) + '\n';
            groupedTasks.medium.forEach((task, index) => {
                text += this.formatTaskPlainText(task, index + 1);
            });
            text += '\n';
        }

        // 低优先级任务
        if (groupedTasks.low.length > 0) {
            text += '🟢 低优先级任务\n';
            text += '-'.repeat(15) + '\n';
            groupedTasks.low.forEach((task, index) => {
                text += this.formatTaskPlainText(task, index + 1);
            });
            text += '\n';
        }

        // 统计信息
        if (showStats) {
            const totalTime = tasks.reduce((sum, task) => sum + task.duration, 0);
            const completedTasks = tasks.filter(task => task.completed).length;
            
            text += '='.repeat(30) + '\n';
            text += `📊 总计: ${tasks.length} 个任务\n`;
            text += `⏱️ 预计时长: ${TimeUtils.formatDuration(totalTime)}\n`;
            
            if (completedTasks > 0) {
                text += `✅ 已完成: ${completedTasks} 个\n`;
            }

            if (showTime) {
                text += `🕐 更新时间: ${TimeUtils.getCurrentTime()}\n`;
            }
        }

        return text;
    },

    /**
     * 格式化单个任务的纯文本
     * @param {Object} task - 任务对象
     * @param {number} index - 序号
     * @returns {string} 格式化后的任务文本
     */
    formatTaskPlainText(task, index) {
        const statusIcon = task.completed ? '✅' : '⏳';
        let text = `${index}. ${statusIcon} ${task.name} (${TimeUtils.formatDuration(task.duration)})\n`;
        
        if (task.notes && task.notes.trim()) {
            text += `   备注: ${task.notes}\n`;
        }
        
        return text;
    }
};

/**
 * Slack预览渲染器
 */
const SlackPreviewRenderer = {
    /**
     * 渲染Block Kit预览
     * @param {Object} blockKit - Block Kit对象
     * @param {Element} container - 容器元素
     */
    renderBlockKit(blockKit, container) {
        if (!container) return;

        container.innerHTML = '';

        if (!blockKit || !blockKit.blocks || blockKit.blocks.length === 0) {
            container.innerHTML = '<div class="slack-empty">暂无内容</div>';
            return;
        }

        blockKit.blocks.forEach(block => {
            const blockElement = this.createBlockElement(block);
            if (blockElement) {
                container.appendChild(blockElement);
            }
        });
    },

    /**
     * 创建Block元素
     * @param {Object} block - Block对象
     * @returns {Element} DOM元素
     */
    createBlockElement(block) {
        switch (block.type) {
            case 'header':
                return this.createHeaderBlock(block);
            case 'section':
                return this.createSectionBlock(block);
            case 'divider':
                return this.createDividerBlock();
            case 'context':
                return this.createContextBlock(block);
            default:
                return null;
        }
    },

    /**
     * 创建标题块
     * @param {Object} block - 标题块对象
     * @returns {Element} DOM元素
     */
    createHeaderBlock(block) {
        const element = document.createElement('div');
        element.className = 'slack-block slack-header-block';
        element.textContent = block.text.text;
        return element;
    },

    /**
     * 创建内容块
     * @param {Object} block - 内容块对象
     * @returns {Element} DOM元素
     */
    createSectionBlock(block) {
        const element = document.createElement('div');
        element.className = 'slack-block slack-section';

        if (block.text) {
            const textElement = document.createElement('div');
            textElement.innerHTML = this.formatMarkdown(block.text.text);
            element.appendChild(textElement);
        }

        if (block.fields) {
            const fieldsElement = document.createElement('div');
            fieldsElement.className = 'slack-fields';
            
            block.fields.forEach(field => {
                const fieldElement = document.createElement('div');
                fieldElement.className = 'slack-field';
                fieldElement.innerHTML = this.formatMarkdown(field.text);
                fieldsElement.appendChild(fieldElement);
            });
            
            element.appendChild(fieldsElement);
        }

        return element;
    },

    /**
     * 创建分隔线块
     * @returns {Element} DOM元素
     */
    createDividerBlock() {
        const element = document.createElement('div');
        element.className = 'slack-block slack-divider';
        return element;
    },

    /**
     * 创建上下文块
     * @param {Object} block - 上下文块对象
     * @returns {Element} DOM元素
     */
    createContextBlock(block) {
        const element = document.createElement('div');
        element.className = 'slack-block slack-context';
        
        if (block.elements) {
            const text = block.elements.map(el => el.text).join(' ');
            element.innerHTML = this.formatMarkdown(text);
        }
        
        return element;
    },

    /**
     * 格式化Markdown文本
     * @param {string} text - 原始文本
     * @returns {string} 格式化后的HTML
     */
    formatMarkdown(text) {
        if (!text) return '';

        return text
            // Slack表情符号转换为emoji
            .replace(/:red_circle:/g, '🔴')
            .replace(/:yellow_circle:/g, '🟡')
            .replace(/:green_circle:/g, '🟢')
            .replace(/:white_check_mark:/g, '✅')
            .replace(/:hourglass_flowing_sand:/g, '⏳')
            .replace(/:bar_chart:/g, '📊')
            .replace(/:clock1:/g, '⏱️')
            .replace(/:clock3:/g, '🕐')
            .replace(/:clock9:/g, '🕘')
            // 粗体
            .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
            // 斜体
            .replace(/_([^_]+)_/g, '<em>$1</em>')
            // 删除线
            .replace(/~([^~]+)~/g, '<del>$1</del>')
            // 代码
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // 换行
            .replace(/\n/g, '<br>');
    },

    /**
     * 渲染Markdown预览
     * @param {string} markdown - Markdown文本
     * @param {Element} container - 容器元素
     */
    renderMarkdown(markdown, container) {
        if (!container) return;

        if (!markdown) {
            container.innerHTML = '<div class="slack-empty">暂无内容</div>';
            return;
        }

        const formattedText = this.formatMarkdown(markdown);
        container.innerHTML = `<div class="slack-markdown">${formattedText}</div>`;
    },

    /**
     * 渲染纯文本预览
     * @param {string} text - 纯文本
     * @param {Element} container - 容器元素
     */
    renderPlainText(text, container) {
        if (!container) return;

        if (!text) {
            container.innerHTML = '<div class="slack-empty">暂无内容</div>';
            return;
        }

        const element = document.createElement('pre');
        element.className = 'slack-plain-text';
        element.textContent = text;
        
        container.innerHTML = '';
        container.appendChild(element);
    }
};

/**
 * 预览管理器
 */
const PreviewManager = {
    currentFormat: 'slack',
    
    /**
     * 初始化预览管理器
     */
    init() {
        this.bindEvents();
        this.loadSettings();
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        const formatSelect = document.getElementById('output-format');
        if (formatSelect) {
            formatSelect.addEventListener('change', (e) => {
                this.currentFormat = e.target.value;
                this.updatePreview();
                this.saveSettings();
            });
        }
    },

    /**
     * 更新预览
     * @param {Array} tasks - 任务列表
     * @param {Object} options - 选项
     */
    updatePreview(tasks = [], options = {}) {
        const container = document.getElementById('slack-message-content');
        const outputCode = document.getElementById('output-code');
        
        if (!container || !outputCode) return;

        let output = '';
        
        switch (this.currentFormat) {
            case 'blocks':
                const blockKit = SlackFormatter.generateBlockKit(tasks, options);
                SlackPreviewRenderer.renderBlockKit(blockKit, container);
                output = JSON.stringify(blockKit, null, 2);
                break;
                
            case 'slack':
                const slackOptimized = SlackFormatter.generateSlackOptimized(tasks, options);
                SlackPreviewRenderer.renderMarkdown(slackOptimized, container);
                output = slackOptimized;
                break;
                
            case 'mrkdwn':
                const markdown = SlackFormatter.generateMarkdown(tasks, options);
                SlackPreviewRenderer.renderMarkdown(markdown, container);
                output = markdown;
                break;
                
            case 'plain':
                const plainText = SlackFormatter.generatePlainText(tasks, options);
                SlackPreviewRenderer.renderPlainText(plainText, container);
                output = plainText;
                break;
        }
        
        outputCode.value = output;
    },

    /**
     * 获取当前输出内容
     * @returns {string} 输出内容
     */
    getCurrentOutput() {
        const outputCode = document.getElementById('output-code');
        return outputCode ? outputCode.value : '';
    },

    /**
     * 获取当前格式的Slack载荷
     * @param {Array} tasks - 任务列表
     * @param {Object} options - 选项
     * @returns {Object} Slack消息载荷
     */
    getSlackPayload(tasks = [], options = {}) {
        switch (this.currentFormat) {
            case 'blocks':
                return SlackFormatter.generateBlockKit(tasks, options);
                
            case 'slack':
                return { text: SlackFormatter.generateSlackOptimized(tasks, options) };
                
            case 'mrkdwn':
                return { text: SlackFormatter.generateMarkdown(tasks, options) };
                
            case 'plain':
                return { text: SlackFormatter.generatePlainText(tasks, options) };
                
            default:
                return { text: SlackFormatter.generateSlackOptimized(tasks, options) };
        }
    },

    /**
     * 保存设置
     */
    saveSettings() {
        StorageUtils.save('preview-settings', {
            format: this.currentFormat
        });
    },

    /**
     * 加载设置
     */
    loadSettings() {
        const settings = StorageUtils.load('preview-settings', {});
        if (settings.format) {
            this.currentFormat = settings.format;
            const formatSelect = document.getElementById('output-format');
            if (formatSelect) {
                formatSelect.value = this.currentFormat;
            }
        }
    }
};

// 导出（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SlackFormatter,
        SlackPreviewRenderer,
        PreviewManager
    };
} 
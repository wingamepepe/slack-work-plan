// 工具函数集合

/**
 * 时间格式化工具
 */
const TimeUtils = {
    /**
     * 格式化时长显示
     * @param {number} hours - 小时数
     * @param {string} format - 格式类型 ('decimal', 'minutes', 'mixed')
     * @returns {string} 格式化后的时间字符串
     */
    formatDuration(hours, format = 'decimal') {
        if (!hours || hours <= 0) return '0小时';
        
        switch (format) {
            case 'minutes':
                const totalMinutes = Math.round(hours * 60);
                return `${totalMinutes}分钟`;
                
            case 'mixed':
                const wholeHours = Math.floor(hours);
                const minutes = Math.round((hours - wholeHours) * 60);
                if (wholeHours === 0) {
                    return `${minutes}分钟`;
                } else if (minutes === 0) {
                    return `${wholeHours}小时`;
                } else {
                    return `${wholeHours}小时${minutes}分钟`;
                }
                
            case 'decimal':
            default:
                return `${hours}小时`;
        }
    },

    /**
     * 获取当前时间字符串
     * @returns {string} 格式化的当前时间
     */
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },

    /**
     * 获取当前日期字符串
     * @returns {string} 格式化的当前日期
     */
    getCurrentDate() {
        const now = new Date();
        return now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }
};

/**
 * 本地存储工具
 */
const StorageUtils = {
    /**
     * 保存数据到本地存储
     * @param {string} key - 存储键名
     * @param {any} data - 要存储的数据
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    },

    /**
     * 从本地存储读取数据
     * @param {string} key - 存储键名
     * @param {any} defaultValue - 默认值
     * @returns {any} 读取的数据或默认值
     */
    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    },

    /**
     * 删除本地存储数据
     * @param {string} key - 存储键名
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    },

    /**
     * 清空所有本地存储数据
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }
};

/**
 * 通知工具
 */
const NotificationUtils = {
    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 ('success', 'error', 'warning')
     * @param {number} duration - 显示时长(毫秒)
     */
    show(message, type = 'success', duration = 3000) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        if (!notification || !notificationText) return;

        // 清除之前的类名
        notification.className = 'notification';
        
        // 设置消息和类型
        notificationText.textContent = message;
        notification.classList.add('show', type);

        // 自动隐藏
        setTimeout(() => {
            this.hide();
        }, duration);
    },

    /**
     * 隐藏通知
     */
    hide() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.classList.remove('show');
        }
    },

    /**
     * 显示成功通知
     * @param {string} message - 消息内容
     */
    success(message) {
        this.show(message, 'success');
    },

    /**
     * 显示错误通知
     * @param {string} message - 消息内容
     */
    error(message) {
        this.show(message, 'error');
    },

    /**
     * 显示警告通知
     * @param {string} message - 消息内容
     */
    warning(message) {
        this.show(message, 'warning');
    }
};

/**
 * 文件操作工具
 */
const FileUtils = {
    /**
     * 下载JSON文件
     * @param {any} data - 要下载的数据
     * @param {string} filename - 文件名
     */
    downloadJSON(data, filename = 'tasks.json') {
        try {
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('下载文件失败:', error);
            return false;
        }
    },

    /**
     * 下载文本文件
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     * @param {string} mimeType - MIME类型
     */
    downloadText(content, filename = 'output.txt', mimeType = 'text/plain') {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('下载文件失败:', error);
            return false;
        }
    },

    /**
     * 读取JSON文件
     * @param {File} file - 文件对象
     * @returns {Promise<any>} 解析后的JSON数据
     */
    readJSON(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('没有选择文件'));
                return;
            }

            if (!file.name.endsWith('.json')) {
                reject(new Error('请选择JSON文件'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('JSON文件格式错误'));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }
};

/**
 * 剪贴板工具
 */
const ClipboardUtils = {
    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<boolean>} 是否成功
     */
    async copy(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                // 使用现代API
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // 降级方案
                return this.fallbackCopy(text);
            }
        } catch (error) {
            console.error('复制失败:', error);
            return this.fallbackCopy(text);
        }
    },

    /**
     * 降级复制方案
     * @param {string} text - 要复制的文本
     * @returns {boolean} 是否成功
     */
    fallbackCopy(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch (error) {
            console.error('降级复制失败:', error);
            return false;
        }
    }
};

/**
 * DOM操作工具
 */
const DOMUtils = {
    /**
     * 安全地获取DOM元素
     * @param {string} selector - CSS选择器
     * @returns {Element|null} DOM元素或null
     */
    $(selector) {
        return document.querySelector(selector);
    },

    /**
     * 获取多个DOM元素
     * @param {string} selector - CSS选择器
     * @returns {NodeList} DOM元素列表
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * 创建DOM元素
     * @param {string} tag - 标签名
     * @param {Object} attributes - 属性对象
     * @param {string} content - 内容
     * @returns {Element} 创建的DOM元素
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        if (content) {
            element.innerHTML = content;
        }

        return element;
    },

    /**
     * 添加事件监听器
     * @param {Element} element - DOM元素
     * @param {string} event - 事件名
     * @param {Function} handler - 事件处理函数
     * @param {Object} options - 选项
     */
    on(element, event, handler, options = {}) {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler, options);
        }
    },

    /**
     * 移除事件监听器
     * @param {Element} element - DOM元素
     * @param {string} event - 事件名
     * @param {Function} handler - 事件处理函数
     */
    off(element, event, handler) {
        if (element && typeof handler === 'function') {
            element.removeEventListener(event, handler);
        }
    }
};

/**
 * 验证工具
 */
const ValidationUtils = {
    /**
     * 验证任务名称
     * @param {string} name - 任务名称
     * @returns {Object} 验证结果
     */
    validateTaskName(name) {
        if (!name || typeof name !== 'string') {
            return { valid: false, message: '任务名称不能为空' };
        }
        
        const trimmed = name.trim();
        if (trimmed.length === 0) {
            return { valid: false, message: '任务名称不能为空' };
        }
        
        if (trimmed.length > 100) {
            return { valid: false, message: '任务名称不能超过100个字符' };
        }
        
        return { valid: true, value: trimmed };
    },

    /**
     * 验证时长
     * @param {number} duration - 时长
     * @returns {Object} 验证结果
     */
    validateDuration(duration) {
        const num = parseFloat(duration);
        
        if (isNaN(num)) {
            return { valid: false, message: '请输入有效的时长' };
        }
        
        if (num <= 0) {
            return { valid: false, message: '时长必须大于0' };
        }
        
        if (num > 24) {
            return { valid: false, message: '时长不能超过24小时' };
        }
        
        return { valid: true, value: num };
    },

    /**
     * 验证优先级
     * @param {string} priority - 优先级
     * @returns {Object} 验证结果
     */
    validatePriority(priority) {
        const validPriorities = ['high', 'medium', 'low'];
        
        if (!validPriorities.includes(priority)) {
            return { valid: false, message: '无效的优先级' };
        }
        
        return { valid: true, value: priority };
    },

    /**
     * 验证Webhook URL
     * @param {string} url - URL地址
     * @returns {Object} 验证结果
     */
    validateWebhookURL(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, message: 'URL不能为空' };
        }
        
        // 清理URL：移除前后空格和可能的@符号
        let cleanedUrl = url.trim();
        if (cleanedUrl.startsWith('@')) {
            cleanedUrl = cleanedUrl.substring(1);
        }
        
        if (cleanedUrl.length === 0) {
            return { valid: false, message: 'URL不能为空' };
        }
        
        try {
            const urlObj = new URL(cleanedUrl);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return { valid: false, message: 'URL必须使用HTTP或HTTPS协议' };
            }
            
            if (!cleanedUrl.includes('hooks.slack.com')) {
                return { valid: false, message: '请输入有效的Slack Webhook URL' };
            }
            
            return { valid: true, value: cleanedUrl };
        } catch (error) {
            return { valid: false, message: `请输入有效的URL格式: ${error.message}` };
        }
    }
};

/**
 * 主题工具
 */
const ThemeUtils = {
    /**
     * 获取当前主题
     * @returns {string} 主题名称
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    },

    /**
     * 设置主题
     * @param {string} theme - 主题名称 ('light' 或 'dark')
     */
    setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        StorageUtils.save('theme', theme);
    },

    /**
     * 切换主题
     */
    toggleTheme() {
        const current = this.getCurrentTheme();
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    },

    /**
     * 初始化主题
     */
    initTheme() {
        const savedTheme = StorageUtils.load('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // 检测系统主题偏好
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }
    }
};

/**
 * 网络请求工具
 */
const NetworkUtils = {
    /**
     * 发送POST请求
     * @param {string} url - 请求URL
     * @param {any} data - 请求数据
     * @param {Object} options - 请求选项
     * @returns {Promise<Response>} 响应对象
     */
    async post(url, data, options = {}) {
        const defaultOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);
            return response;
        } catch (error) {
            console.error('网络请求失败:', error);
            throw error;
        }
    },

    /**
     * 发送到Slack Webhook
     * @param {string} webhookUrl - Webhook URL
     * @param {Object} payload - 消息载荷
     * @returns {Promise<{success: boolean, error?: string, status?: number}>} 发送结果
     */
    async sendToSlack(webhookUrl, payload) {
        try {
            console.log('发送到Slack:', { webhookUrl, payload });
            
            // 检查是否有代理服务器可用
            const proxyUrl = '/slack-webhook';
            let response;
            
            try {
                // 尝试使用代理服务器
                response = await this.post(proxyUrl, {
                    webhookUrl: webhookUrl,
                    payload: payload
                });
                
                if (response.ok) {
                    const result = await response.json();
                    return result;
                } else {
                    throw new Error('代理服务器响应错误');
                }
            } catch (proxyError) {
                console.warn('代理服务器不可用，尝试直接发送:', proxyError.message);
                
                // 如果代理服务器不可用，尝试直接发送（可能会遇到CORS错误）
                response = await this.post(webhookUrl, payload);
                
                if (response.ok) {
                    return { success: true };
                } else {
                    const errorText = await response.text();
                    console.error('Slack响应错误:', response.status, errorText);
                    return { 
                        success: false, 
                        error: `HTTP ${response.status}: ${errorText}`,
                        status: response.status
                    };
                }
            }
        } catch (error) {
            console.error('发送到Slack失败:', error);
            
            // 如果是CORS错误，提供更友好的错误信息
            if (error.message.includes('CORS') || error.message.includes('fetch')) {
                return { 
                    success: false, 
                    error: '跨域请求被阻止。请启动服务器：node server.js'
                };
            }
            
            return { 
                success: false, 
                error: error.message || '网络请求失败'
            };
        }
    }
};

// 导出所有工具（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TimeUtils,
        StorageUtils,
        NotificationUtils,
        FileUtils,
        ClipboardUtils,
        DOMUtils,
        ValidationUtils,
        ThemeUtils,
        NetworkUtils
    };
} 
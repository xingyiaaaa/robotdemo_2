/**
 * 前端应用主逻辑文件
 * 
 * 功能描述:
 * - 实现农业机器人控制系统的前端核心逻辑
 * - 管理应用状态、DOM元素、数据刷新、用户交互等
 * - 模块化设计，分为状态管理、DOM管理、数据服务、控制服务等
 * 
 * 模块结构:
 * 1. State - 状态管理，存储应用全局状态
 * 2. DOM - DOM管理，处理页面元素的引用和操作
 * 3. DataService - 数据服务，负责数据的定时刷新和渲染
 * 4. ControlService - 控制服务，处理用户控制指令
 * 5. LogService - 日志服务，管理系统日志显示
 * 6. EventService - 事件服务，处理用户交互事件
 * 7. App - 应用入口，初始化和销毁
 * 
 * 文件路径: frontend/js/app.js
 */

'use strict';  // 启用严格模式

/* ==========================================================================
   状态管理模块 (State Management)
   ========================================================================== */

/**
 * 全局状态对象
 * 存储应用的所有动态数据
 */
const State = {
    // 连接状态
    isConnected: false,           // 是否与后端服务连接成功
    
    // 机器人状态数据
    robot: { 
        battery: 0,               // 电量百分比
        speed: 0,                 // 速度 m/s
        temperature: 0,           // 温度 °C
        coordinates: { 
            lat: 0,               // 纬度
            lon: 0                // 经度
        }
    },
    
    // 传感器数据
    sensors: { 
        soilHumidity: 0,          // 土壤湿度 %
        soilTemp: 0,             // 土壤温度 °C
        light: 0,                // 光照强度 Lux
        airHumidity: 0           // 空气湿度 %
    },
    
    // 作业统计数据
    statistics: { 
        completedArea: 0,        // 已完成面积(亩)
        totalArea: 0,            // 总面积(亩)
        progress: 0             // 完成进度 %
    },
    
    // 任务列表
    tasks: [],                   // 任务数组
    
    // 定时器集合 - 用于存储所有数据刷新的定时器ID
    timers: {}                  // 键值对形式: { robot: timerId, sensors: timerId, ... }
};

/* ==========================================================================
   DOM管理模块 (DOM Management)
   ========================================================================== */

/**
 * DOM元素管理对象
 * 负责页面元素的获取、缓存和操作
 */
const DOM = {
    // 存储所有DOM元素的引用
    elements: {},
    
    /**
     * 初始化DOM元素引用
     * 获取所有需要的DOM元素并缓存起来，避免重复查询
     */
    init() {
        // 获取并存储所有需要的DOM元素
        this.elements = {
            // ========== 系统时间相关 ==========
            systemTime: document.getElementById('systemTime'),           // 系统时间显示
            
            // ========== 连接状态相关 ==========
            statusIndicator: document.getElementById('statusIndicator'), // 连接状态指示器
            statusText: document.getElementById('statusText'),         // 连接状态文字
            
            // ========== 机器人状态相关 ==========
            batteryValue: document.getElementById('batteryValue'),     // 电量值
            speedValue: document.getElementById('speedValue'),         // 速度值
            temperatureValue: document.getElementById('temperatureValue'), // 温度值
            coordinatesValue: document.getElementById('coordinatesValue'), // 坐标值
            
            // ========== 传感器数据相关 ==========
            soilHumidityValue: document.getElementById('soilHumidityValue'), // 土壤湿度值
            soilTempValue: document.getElementById('soilTempValue'),         // 土壤温度值
            lightValue: document.getElementById('lightValue'),               // 光照强度值
            airHumidityValue: document.getElementById('airHumidityValue'),  // 空气湿度值
            
            // ========== 统计数据相关 ==========
            completedArea: document.getElementById('completedArea'),    // 已完成面积
            totalArea: document.getElementById('totalArea'),            // 总面积
            progressPercent: document.getElementById('progressPercent'), // 进度百分比
            
            // ========== 列表相关 ==========
            taskList: document.getElementById('taskList'),            // 任务列表容器
            logList: document.getElementById('logList'),              // 日志列表容器
            
            // ========== 按钮相关 ==========
            directionButtons: document.querySelectorAll('[data-direction]'), // 方向控制按钮
            actionButtons: document.querySelectorAll('[data-action]')         // 作业控制按钮
        };
        
        // 检查是否有缺少的DOM元素
        // 遍历所有元素，找出值为null的元素或空的NodeList
        const missingElements = Object.entries(this.elements)
            .filter(([key, value]) => {
                // NodeList类型：检查长度是否为0
                if (value instanceof NodeList) return value.length === 0;
                // 其他类型：检查是否为null
                return value === null;
            })
            .map(([key]) => key);  // 只保留元素名称
        
        // 如果有缺失的元素，在控制台输出警告
        if (missingElements.length > 0) {
            console.warn('[DOM] 缺少元素:', missingElements);
        }
    },
    
    /**
     * 获取元素的文本内容
     * @param {string} id - 元素在elements对象中的键名
     * @returns {string} 元素的文本内容
     */
    getText(id) {
        // 使用可选链操作符，防止元素不存在时报错
        return this.elements[id]?.textContent;
    },
    
    /**
     * 设置元素的文本内容
     * @param {string} id - 元素在elements对象中的键名
     * @param {string} text - 要设置的文本内容
     */
    setText(id, text) {
        // 先获取元素引用
        const element = this.elements[id];
        // 如果元素存在，设置其文本内容
        if (element) element.textContent = text;
    },
    
    /**
     * 设置连接状态的显示
     * @param {boolean} connected - 是否连接成功
     */
    setConnectionStatus(connected) {
        // 获取状态指示器和文字元素
        const { statusIndicator, statusText } = this.elements;
        
        // 更新状态指示器的样式类
        if (statusIndicator) {
            // 根据连接状态设置不同的样式类：online(在线) 或 offline(离线)
            statusIndicator.className = `status-dot status-dot--${connected ? 'online' : 'offline'}`;
        }
        
        // 更新状态文字
        if (statusText) {
            statusText.textContent = connected ? '已连接' : '未连接';
        }
    }
};

/* ==========================================================================
   数据服务模块 (Data Service)
   ========================================================================== */

/**
 * 数据服务对象
 * 负责从后端获取数据并更新界面
 * 实现数据的定时刷新和自动更新
 */
const DataService = {
    
    /**
     * 启动所有数据刷新任务
     * 依次启动各个数据源的定时刷新
     */
    startAll() {
        this.startTimeRefresh();           // 启动时间刷新
        this.startRobotStatusRefresh();     // 启动机器人状态刷新
        this.startSensorRefresh();          // 启动传感器数据刷新
        this.startStatisticsRefresh();      // 启动统计数据刷新
        this.startTasksRefresh();           // 启动任务列表刷新
    },
    
    /**
     * 创建通用的数据刷新处理器
     * 封装了数据获取、成功处理、错误处理的通用逻辑
     * 
     * @param {Function} apiMethod - API调用方法（如 API.getSensorData）
     * @param {Function} successCallback - 成功时的回调函数，接收数据作为参数
     * @param {string} errorMessage - 失败时的错误消息
     * @param {number} interval - 刷新间隔（毫秒）
     * @returns {number} 返回定时器ID，用于后续清除定时器
     */
    createRefreshHandler(apiMethod, successCallback, errorMessage, interval) {
        // 定义刷新函数
        const refresh = async () => {
            try {
                // 调用API方法获取数据
                const result = await apiMethod();
                
                // 如果请求成功，执行成功回调
                if (result.success) {
                    successCallback(result.data);
                }
            } catch (error) {
                // 如果请求失败，在控制台输出错误日志
                console.error(`[Data] ${errorMessage}`);
            }
        };
        
        // 立即执行一次刷新
        refresh();
        
        // 设置定时器，按指定间隔定期刷新
        return setInterval(refresh, interval);
    },
    
    /**
     * 启动系统时间刷新
     * 每秒更新一次系统时间显示
     */
    startTimeRefresh() {
        // 定义更新时间的函数
        const update = () => {
            // 获取当前时间并格式化为中文格式
            DOM.setText('systemTime', new Date().toLocaleString('zh-CN', {
                month: '2-digit',           // 月 (01-12)
                day: '2-digit',             // 日 (01-31)
                hour: '2-digit',            // 时 (00-23)
                minute: '2-digit',          // 分 (00-59)
                second: '2-digit',          // 秒 (00-59)
                hour12: false               // 使用24小时制
            }));
        };
        
        // 立即执行一次更新
        update();
        
        // 设置每秒更新一次的定时器，并保存定时器ID
        State.timers.time = setInterval(update, 1000);
    },
    
    /**
     * 启动机器人状态数据刷新
     * 每2秒刷新一次机器人状态（电量、速度、温度、坐标）
     */
    startRobotStatusRefresh() {
        // 定义成功时的处理函数
        const onSuccess = (data) => {
            // 更新状态对象中的机器人数据
            State.robot = data;
            
            // 更新界面显示
            DOM.setText('batteryValue', `${data.battery}%`);
            DOM.setText('speedValue', `${data.speed} m/s`);
            DOM.setText('temperatureValue', `${data.temperature}°C`);
            DOM.setText('coordinatesValue', `N${data.coordinates.lat}° E${data.coordinates.lon}°`);
            
            // 如果之前未连接，现在连接成功了
            if (!State.isConnected) {
                State.isConnected = true;
                DOM.setConnectionStatus(true);
                LogService.add('已连接到后端服务');
                
                // 通知告警服务连接恢复
                if (typeof AlertService !== 'undefined') {
                    AlertService.checkConnection(true);
                }
            }
            
            // 检查告警（机器人数据）
            if (typeof AlertService !== 'undefined') {
                AlertService.check(data, State.sensors);
            }
            
            // 更新图表（需要同时有机器人和传感器数据）
            if (typeof ChartService !== 'undefined' && State.sensors.soilHumidity) {
                ChartService.update(data, State.sensors);
            }
        };
        
        // 定义失败时的处理函数
        const onFailure = () => {
            // 如果之前已连接，现在连接失败了
            if (State.isConnected) {
                State.isConnected = false;
                DOM.setConnectionStatus(false);
                LogService.add('后端连接断开', 'error');
                
                // 通知告警服务连接断开
                if (typeof AlertService !== 'undefined') {
                    AlertService.checkConnection(false);
                }
            }
        };
        
        // 定义刷新函数
        const refresh = async () => {
            try {
                // 请求机器人状态数据
                const result = await API.getRobotStatus();
                
                // 如果请求成功，执行成功回调
                if (result.success) {
                    onSuccess(result.data);
                }
            } catch (error) {
                // 如果请求失败，执行失败回调
                onFailure();
            }
        };
        
        // 立即执行一次刷新
        refresh();
        
        // 设置定时器，按配置的间隔刷新
        State.timers.robot = setInterval(refresh, API_CONFIG.REFRESH_INTERVAL.ROBOT_STATUS);
    },
    
    /**
     * 启动传感器数据刷新
     * 每3秒刷新一次传感器数据
     */
    startSensorRefresh() {
        // 使用通用刷新处理器
        State.timers.sensors = this.createRefreshHandler(
            API.getSensorData,           // API方法
            (data) => {                  // 成功回调
                // 更新状态和界面
                State.sensors = data;
                DOM.setText('soilHumidityValue', `${data.soilHumidity}%`);
                DOM.setText('soilTempValue', `${data.soilTemp}°C`);
                DOM.setText('lightValue', `${data.light} Lux`);
                DOM.setText('airHumidityValue', `${data.airHumidity}%`);
                
                // 检查告警（传感器数据）
                if (typeof AlertService !== 'undefined') {
                    AlertService.check(State.robot, data);
                }
                
                // 更新告警计数显示
                if (typeof AlertService !== 'undefined') {
                    const count = AlertService.getActiveCount();
                    const countEl = document.getElementById('alertCount');
                    const badgeEl = document.querySelector('.alert-badge');
                    if (countEl) countEl.textContent = count;
                    if (badgeEl) badgeEl.textContent = count;
                }
            },
            '传感器数据获取失败',       // 错误消息
            API_CONFIG.REFRESH_INTERVAL.SENSORS  // 刷新间隔
        );
    },
    
    /**
     * 启动统计数据刷新
     * 每10秒刷新一次作业统计数据
     */
    startStatisticsRefresh() {
        // 使用通用刷新处理器
        State.timers.stats = this.createRefreshHandler(
            API.getStatistics,            // API方法
            (data) => {                   // 成功回调
                // 更新状态和界面
                State.statistics = data;
                DOM.setText('completedArea', data.completedArea);
                DOM.setText('totalArea', data.totalArea);
                DOM.setText('progressPercent', `${data.progress}%`);
            },
            '统计数据获取失败',          // 错误消息
            API_CONFIG.REFRESH_INTERVAL.STATISTICS  // 刷新间隔
        );
    },
    
    /**
     * 启动任务列表刷新
     * 每5秒刷新一次任务列表
     */
    startTasksRefresh() {
        // 使用通用刷新处理器
        State.timers.tasks = this.createRefreshHandler(
            API.getTasks,                // API方法
            (data) => {                  // 成功回调
                // 更新状态
                State.tasks = data;
                // 渲染任务列表到界面
                this.renderTasks(data);
            },
            '任务列表获取失败',          // 错误消息
            API_CONFIG.REFRESH_INTERVAL.TASKS  // 刷新间隔
        );
    },
    
    /**
     * 渲染任务列表到界面
     * @param {Array} tasks - 任务数组
     */
    renderTasks(tasks) {
        // 获取任务列表容器元素
        const { taskList } = DOM.elements;
        if (!taskList) return;
        
        // 状态映射表：状态代码 -> CSS类名
        const statusMap = { 
            active: 'active', 
            pending: 'pending', 
            done: 'done' 
        };
        
        // 状态文字映射表：状态代码 -> 中文描述
        const statusTextMap = { 
            active: '进行中', 
            pending: '等待中', 
            done: '已完成' 
        };
        
        // 使用map将任务数组转换为HTML字符串
        // 每个任务渲染为一个列表项
        taskList.innerHTML = tasks.map(task => `
            <li class="task-list__item" data-task-id="${task.id}" data-status="${task.status}">
                <span class="task-list__dot task-list__dot--${statusMap[task.status]}"></span>
                <div class="task-list__info">
                    <span class="task-list__name">${task.name}</span>
                    <span class="task-list__progress">${statusTextMap[task.status]}${task.progress ? ` - ${task.progress}%` : ''}</span>
                </div>
            </li>
        `).join('');  // 将数组拼接为字符串
    },
    
    /**
     * 停止所有数据刷新
     * 清除所有定时器，停止数据刷新
     */
    stopAll() {
        // 遍历所有定时器ID，逐个清除
        Object.values(State.timers).forEach(t => clearInterval(t));
        
        // 清空定时器集合
        State.timers = {};
    }
};

/* ==========================================================================
   控制服务模块 (Control Service)
   ========================================================================== */

/**
 * 控制服务对象
 * 负责处理用户的控制指令并发送到后端
 */
const ControlService = {
    
    /**
     * 发送移动方向控制指令
     * @param {string} direction - 方向指令 (forward/backward/left/right/stop)
     */
    async move(direction) {
        try {
            // 调用API发送控制指令
            const result = await API.sendControlCommand(direction);
            
            // 如果指令发送成功，在日志中显示
            if (result.success) {
                LogService.add(result.message);
            }
        } catch (error) {
            // 如果指令发送失败，在日志中显示错误
            LogService.add('指令发送失败', 'error');
        }
    },
    
    /**
     * 执行作业操作
     * @param {string} action - 操作代码 (irrigation/fertilize/scan/harvest)
     */
    async executeAction(action) {
        try {
            // 调用API执行作业操作
            const result = await API.executeAction(action);
            
            // 如果操作执行成功，在日志中显示
            if (result.success) {
                LogService.add(result.message);
            }
        } catch (error) {
            // 如果操作执行失败，在日志中显示错误
            LogService.add('操作执行失败', 'error');
        }
    }
};

/* ==========================================================================
   日志服务模块 (Log Service)
   ========================================================================== */

/**
 * 日志服务对象
 * 负责管理系统日志的显示和滚动
 */
const LogService = {
    // 日志列表最大显示条数 - 超过此数量会自动删除最早的日志
    maxItems: 10,
    
    /**
     * 添加一条日志
     * @param {string} message - 日志消息内容
     * @param {string} type - 日志类型 (info/error)，默认为info
     */
    add(message, type = 'info') {
        // 获取日志列表容器元素
        const { logList } = DOM.elements;
        if (!logList) return;
        
        // 获取当前时间并格式化
        const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        
        // 创建新的日志列表项
        const item = document.createElement('li');
        
        // 设置列表项的CSS类，包含类型信息
        item.className = `log-list__item log-list__item--${type}`;
        
        // 设置列表项的文本内容：时间 + 消息
        item.textContent = `${time} ${message}`;
        
        // 将新日志插入到列表最前面（最新的在最上面）
        logList.prepend(item);
        
        // 如果日志数量超过最大值，删除最旧的日志
        while (logList.children.length > this.maxItems) {
            logList.lastChild.remove();  // 删除最后一个子元素
        }
    },
    
    /**
     * 清空所有日志
     */
    clear() {
        // 获取日志列表容器元素
        const { logList } = DOM.elements;
        if (logList) {
            // 清空容器内容
            logList.innerHTML = '';
        }
    }
};

/* ==========================================================================
   事件服务模块 (Event Service)
   ========================================================================== */

/**
 * 事件服务对象
 * 负责处理用户的所有交互事件
 * 包括按钮点击事件和键盘事件
 */
const EventService = {
    // 键盘按键映射表
    // 将键盘按键映射为机器人控制指令
    keyMap: {
        'ArrowUp': 'forward',     // 上箭头 -> 前进
        'w': 'forward',            // W键 -> 前进
        'W': 'forward',            // Shift+W -> 前进
        
        'ArrowDown': 'backward',   // 下箭头 -> 后退
        's': 'backward',           // S键 -> 后退
        'S': 'backward',           // Shift+S -> 后退
        
        'ArrowLeft': 'left',        // 左箭头 -> 左转
        'a': 'left',               // A键 -> 左转
        'A': 'left',               // Shift+A -> 左转
        
        'ArrowRight': 'right',     // 右箭头 -> 右转
        'd': 'right',              // D键 -> 右转
        'D': 'right',              // Shift+D -> 右转
        
        ' ': 'stop'                // 空格键 -> 停止
    },
    
    /**
     * 处理方向控制按钮点击事件
     * @param {HTMLElement} btn - 被点击的按钮元素
     */
    handleDirectionButton(btn) {
        // 从按钮的data属性中获取方向指令
        const direction = btn.dataset.direction;
        
        // 如果方向指令存在，发送控制指令
        if (direction) {
            ControlService.move(direction);
        }
    },
    
    /**
     * 处理作业控制按钮点击事件
     * @param {HTMLElement} btn - 被点击的按钮元素
     */
    handleActionButton(btn) {
        // 从按钮的data属性中获取操作代码
        const action = btn.dataset.action;
        
        // 如果操作代码存在，执行作业操作
        if (action) {
            ControlService.executeAction(action);
        }
    },
    
    /**
     * 处理键盘按下事件
     * @param {KeyboardEvent} e - 键盘事件对象
     */
    handleKeyDown(e) {
        // 根据按键查找对应的方向指令
        const dir = this.keyMap[e.key];
        
        // 如果找到对应的指令
        if (dir) {
            // 如果是空格键，阻止默认行为（防止页面滚动）
            if (e.key === ' ') {
                e.preventDefault();
            }
            
            // 发送控制指令
            ControlService.move(dir);
        }
    },
    
    /**
     * 初始化事件监听器
     * 绑定所有按钮和键盘事件
     */
    init() {
        // 为所有方向控制按钮绑定点击事件
        DOM.elements.directionButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleDirectionButton(btn));
        });
        
        // 为所有作业控制按钮绑定点击事件
        DOM.elements.actionButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleActionButton(btn));
        });
        
        // 为文档绑定键盘按下事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
};

/* ==========================================================================
   应用入口模块 (Application Entry)
   ========================================================================== */

/**
 * 应用主对象
 * 负责应用的初始化和销毁
 */
const App = {
    
    /**
     * 初始化应用
     * 依次初始化各个模块，启动数据刷新
     */
    init() {
        // 在控制台输出启动信息
        console.log('🤖 农业机器人控制系统启动中...');
        console.log(`📡 后端地址: ${API_CONFIG.BASE_URL}`);
        
        try {
            // 初始化DOM元素引用
            DOM.init();
            console.log('✅ DOM初始化完成');
            
            // 初始化事件监听器
            EventService.init();
            console.log('✅ 事件监听器初始化完成');
            
            // 初始化图表服务
            if (typeof ChartService !== 'undefined') {
                ChartService.init();
                console.log('✅ 图表服务初始化完成');
            }
            
            // 初始化告警服务
            if (typeof AlertService !== 'undefined') {
                AlertService.init();
                console.log('✅ 告警服务初始化完成');
            }
            
            // 初始化视频服务
            if (typeof VideoService !== 'undefined') {
                VideoService.init();
                console.log('✅ 视频服务初始化完成');
            }
            
            // 启动所有数据刷新任务
            DataService.startAll();
            console.log('✅ 数据服务启动完成');
            
            // 在日志中显示启动成功消息
            LogService.add('系统启动成功');
            console.log('✅ 前端启动完成');
        } catch (error) {
            // 如果初始化过程中发生错误，在控制台输出错误信息
            console.error('❌ 初始化失败:', error);
        }
    },
    
    /**
     * 销毁应用
     * 停止所有定时器和刷新任务
     */
    destroy() {
        // 停止所有数据刷新
        DataService.stopAll();
        
        // 销毁图表
        if (typeof ChartService !== 'undefined') {
            ChartService.destroy();
        }
        
        // 销毁视频
        if (typeof VideoService !== 'undefined') {
            VideoService.destroy();
        }
    }
};

// ============================================================
// 事件监听
// ============================================================

/**
 * 当DOM加载完成时，初始化应用
 * 确保页面元素已经准备好后再执行初始化
 */
document.addEventListener('DOMContentLoaded', () => App.init());

/**
 * 当页面即将卸载时，销毁应用
 * 清理定时器，防止内存泄漏
 */
window.addEventListener('beforeunload', () => App.destroy());

// ============================================================
// 全局导出
// ============================================================

/**
 * 将应用模块导出到window对象
 * 方便在浏览器控制台进行调试和测试
 */
window.RobotApp = { 
    State,           // 状态对象
    DataService,     // 数据服务
    ControlService,  // 控制服务
    LogService,      // 日志服务
    ChartService: typeof ChartService !== 'undefined' ? ChartService : null,
    AlertService: typeof AlertService !== 'undefined' ? AlertService : null,
    VideoService: typeof VideoService !== 'undefined' ? VideoService : null
};

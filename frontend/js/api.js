/**
 * 前端API接口层
 * 
 * 功能描述:
 * - 封装所有与后端通信的HTTP请求
 * - 提供统一的请求方法，简化API调用
 * - 实现请求超时控制和错误处理
 * - 为每个API端点提供专门的调用方法
 * 
 * 使用方式:
 * API.getRobotStatus()      // 获取机器人状态
 * API.sendControlCommand('forward')  // 发送控制指令
 * API.getSensorData()        // 获取传感器数据
 * 
 * 文件路径: frontend/js/api.js
 */

'use strict';  // 启用严格模式 - 强制更严格的JavaScript语法

// ============================================================
// API对象定义
// ============================================================

const API = {
    
    // ============================================================
    // 基础请求方法
    // ============================================================
    
    /**
     * 基础HTTP请求方法
     * 所有API调用的底层实现
     * 
     * @param {string} endpoint - API端点路径（如 '/api/robot/status'）
     * @param {Object} options - 请求配置选项
     *   - method: HTTP方法（GET/POST/PUT/DELETE等）
     *   - headers: 请求头
     *   - body: 请求体（POST/PUT请求使用）
     * @returns {Promise<Object>} 返回Promise，解析为JSON响应数据
     * @throws {Error} 请求失败时抛出错误
     * 
     * 功能特性:
     * - 自动拼接完整URL（BASE_URL + endpoint）
     * - 自动设置Content-Type为application/json
     * - 实现请求超时控制（AbortController）
     * - 统一的错误处理和日志记录
     * 
     * 使用示例:
     * await API.request('/api/robot/status')
     * await API.request('/api/robot/control', {
     *   method: 'POST',
     *   body: JSON.stringify({ command: 'forward' })
     * })
     */
    async request(endpoint, options = {}) {
        // 拼接完整的API请求URL
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
        // 构建默认请求配置
        const config = {
            method: 'GET',                                    // 默认GET请求
            headers: {
                'Content-Type': 'application/json'           // 设置JSON内容类型
            },
            ...options                                       // 合并用户传入的配置
        };
        
        // 创建AbortController用于实现请求超时
        const controller = new AbortController();
        
        // 设置超时定时器 - 超时后取消请求
        const timeoutId = setTimeout(() => {
            controller.abort();  // 取消请求
        }, API_CONFIG.REQUEST.TIMEOUT);
        
        // 将Abort信号附加到请求配置中
        config.signal = controller.signal;
        
        try {
            // 发起HTTP请求
            const response = await fetch(url, config);
            
            // 请求成功（无论响应状态码），清除超时定时器
            clearTimeout(timeoutId);
            
            // 检查HTTP状态码
            // 2xx状态码表示成功，其他表示失败
            if (!response.ok) {
                // 抛出包含状态码的错误
                throw new Error(`HTTP ${response.status}`);
            }
            
            // 解析响应体为JSON并返回
            return await response.json();
            
        } catch (error) {
            // 发生错误，清除超时定时器
            clearTimeout(timeoutId);
            
            // 判断是否为超时错误
            if (error.name === 'AbortError') {
                // 抛出友好的超时错误
                throw new Error('请求超时');
            }
            
            // 在控制台输出错误日志（方便调试）
            console.error(`[API] 请求失败: ${endpoint}`, error);
            
            // 重新抛出错误，让调用方处理
            throw error;
        }
    },
    
    // ============================================================
    // 机器人状态相关接口
    // ============================================================
    
    /**
     * 获取机器人状态
     * 
     * @returns {Promise<Object>} 返回机器人状态对象
     * 
     * 状态包含:
     * - battery: 电量百分比
     * - speed: 速度 (m/s)
     * - temperature: 温度 (°C)
     * - coordinates: GPS坐标 {lat, lon}
     * 
     * 使用示例:
     * const result = await API.getRobotStatus();
     * if (result.success) {
     *   console.log('电量:', result.data.battery);
     * }
     */
    async getRobotStatus() {
        // 调用基础请求方法，GET方式请求机器人状态
        return await this.request(API_CONFIG.ENDPOINTS.ROBOT_STATUS);
    },
    
    /**
     * 发送方向控制指令
     * 
     * @param {string} command - 指令代码
     *   - 'forward': 前进
     *   - 'backward': 后退
     *   - 'left': 左转
     *   - 'right': 右转
     *   - 'stop': 停止
     * @returns {Promise<Object>} 返回执行结果
     * 
     * 使用示例:
     * const result = await API.sendControlCommand('forward');
     * if (result.success) {
     *   console.log('指令已发送');
     * }
     */
    async sendControlCommand(command) {
        // POST请求，发送JSON格式的command参数
        return await this.request(API_CONFIG.ENDPOINTS.ROBOT_CONTROL, {
            method: 'POST',
            body: JSON.stringify({ command })  // 将对象转为JSON字符串
        });
    },
    
    // ============================================================
    // 传感器数据相关接口
    // ============================================================
    
    /**
     * 获取传感器数据
     * 
     * @returns {Promise<Object>} 返回传感器数据对象
     * 
     * 数据包含:
     * - soilHumidity: 土壤湿度 (%)
     * - soilTemp: 土壤温度 (°C)
     * - light: 光照强度 (Lux)
     * - airHumidity: 空气湿度 (%)
     * 
     * 使用示例:
     * const result = await API.getSensorData();
     * if (result.success) {
     *   console.log('土壤湿度:', result.data.soilHumidity);
     * }
     */
    async getSensorData() {
        // GET请求传感器数据
        return await this.request(API_CONFIG.ENDPOINTS.SENSORS);
    },
    
    // ============================================================
    // 作业操作相关接口
    // ============================================================
    
    /**
     * 执行作业操作
     * 
     * @param {string} action - 操作代码
     *   - 'irrigation': 灌溉
     *   - 'fertilize': 施肥
     *   - 'scan': 扫描
     *   - 'harvest': 收割
     * @returns {Promise<Object>} 返回执行结果
     * 
     * 使用示例:
     * const result = await API.executeAction('irrigation');
     * if (result.success) {
     *   console.log('灌溉作业已启动');
     * }
     */
    async executeAction(action) {
        // POST请求，发送JSON格式的action参数
        return await this.request(API_CONFIG.ENDPOINTS.ROBOT_CONTROL, {
            method: 'POST',
            body: JSON.stringify({ action })  // 将对象转为JSON字符串
        });
    },
    
    // ============================================================
    // 任务管理相关接口
    // ============================================================
    
    /**
     * 获取任务列表
     * 
     * @returns {Promise<Object>} 返回任务数组
     * 
     * 任务对象包含:
     * - id: 任务ID
     * - name: 任务名称
     * - status: 状态 ('active'/'pending'/'done')
     * - progress: 进度 (%)
     * 
     * 使用示例:
     * const result = await API.getTasks();
     * if (result.success) {
     *   result.data.forEach(task => {
     *     console.log(task.name, task.status);
     *   });
     * }
     */
    async getTasks() {
        // GET请求任务列表
        return await this.request(API_CONFIG.ENDPOINTS.TASKS);
    },
    
    // ============================================================
    // 统计数据相关接口
    // ============================================================
    
    /**
     * 获取作业统计
     * 
     * @returns {Promise<Object>} 返回统计数据对象
     * 
     * 统计数据包含:
     * - completedArea: 已完成面积 (亩)
     * - totalArea: 总面积 (亩)
     * - progress: 完成进度 (%)
     * 
     * 使用示例:
     * const result = await API.getStatistics();
     * if (result.success) {
     *   console.log('进度:', result.data.progress + '%');
     * }
     */
    async getStatistics() {
        // GET请求统计数据
        return await this.request(API_CONFIG.ENDPOINTS.STATISTICS);
    },
    
    // ============================================================
    // 系统健康检查接口
    // ============================================================
    
    /**
     * 健康检查
     * 检测后端服务是否正常运行
     * 
     * @returns {Promise<Object>} 返回连接状态对象
     *   - connected: boolean (true表示连接正常，false表示连接失败)
     * 
     * 使用示例:
     * const { connected } = await API.checkHealth();
     * if (connected) {
     *   console.log('后端服务正常');
     * } else {
     *   console.log('后端服务不可用');
     * }
     */
    async checkHealth() {
        try {
            // 尝试请求健康检查接口
            const result = await this.request(API_CONFIG.ENDPOINTS.HEALTH);
            // 成功则返回connected=true
            return { connected: result.success };
        } catch {
            // 失败则返回connected=false
            return { connected: false };
        }
    }
};

// ============================================================
// 模块导出
// ============================================================

/**
 * 冻结API对象
 * 防止在运行时意外修改API方法
 * 确保API接口的稳定性
 */
Object.freeze(API);

/**
 * 将API对象导出到window对象
 * 使得其他模块可以通过window.API或全局API访问
 * 方便在浏览器控制台进行调试和手动测试
 */
window.API = API;
